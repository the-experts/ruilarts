import { neo4jService } from './neo4j.js';
import { Circle, CirclePerson } from '../models/index.js';
import { config } from '../config.js';
import { v4 as uuidv4 } from 'uuid';
import { cleanupService } from './cleanup.js';

// Internal interface for cycle node representation
interface CycleNode {
  personId: string;
  personName: string;
  currentPracticeId: number;
  desiredPracticeId: number;
  preferenceOrder: number;
}

// Internal interface for raw cycle data
interface RawCycle {
  nodes: CycleNode[];
  maxPreferenceOrder: number;
  totalPreferenceScore: number;
}

class MatcherService {
  /**
   * Main entry point: Find matches for a specific person
   * Searches for cycles of size 2 to maxCircleSize that include this person
   */
  async findMatchesForPerson(personId: string): Promise<Circle | null> {
    console.log(`\n[Matcher] Starting match search for person ${personId}`);
    console.log(`[Matcher] Max circle size: ${config.matching.maxCircleSize}`);

    const allCycles: RawCycle[] = [];

    // Search for cycles of each size from 2 to maxCircleSize
    for (let size = 2; size <= config.matching.maxCircleSize; size++) {
      console.log(`\n[Matcher] Searching for cycles of size ${size}...`);
      const cycles = await this.findCyclesOfSize(personId, size);
      console.log(`[Matcher] Found ${cycles.length} cycle(s) of size ${size}`);
      allCycles.push(...cycles);
    }

    console.log(`\n[Matcher] Total cycles found: ${allCycles.length}`);

    if (allCycles.length === 0) {
      console.log('[Matcher] No matches found');
      return null;
    }

    // Rank cycles: lower preference order is better
    const rankedCycles = this.rankCycles(allCycles);
    const bestCycle = rankedCycles[0];

    console.log(`[Matcher] Best cycle: size=${bestCycle.nodes.length}, maxPref=${bestCycle.maxPreferenceOrder}, totalScore=${bestCycle.totalPreferenceScore}`);

    // Create circle and mark people as matched
    const circle = await this.createCircleFromCycle(bestCycle);

    console.log(`[Matcher] Created circle with ${circle.people.length} people`);

    // Save to PostgreSQL and cleanup Neo4j
    await cleanupService.cleanupMatchedCircle(circle, {
      maxPreferenceOrder: bestCycle.maxPreferenceOrder,
      totalPreferenceScore: bestCycle.totalPreferenceScore,
    });

    return circle;
  }

  /**
   * Find all cycles of a specific size containing the anchor person
   */
  private async findCyclesOfSize(anchorPersonId: string, size: number): Promise<RawCycle[]> {
    const session = await neo4jService.getSession();
    const cycles: RawCycle[] = [];

    try {
      const query = this.buildCycleQuery(size);

      console.log(`[Matcher] Executing query for size ${size}:`);
      console.log(query);
      console.log(`[Matcher] Parameters: { personId: "${anchorPersonId}" }`);

      const result = await session.run(query, { personId: anchorPersonId });

      console.log(`[Matcher] Query returned ${result.records.length} record(s)`);

      // Process each record into a RawCycle
      for (const record of result.records) {
        const nodes: CycleNode[] = [];
        let totalPreferenceScore = 0;
        let maxPreferenceOrder = 0;

        for (let i = 0; i < size; i++) {
          const person = record.get(`p${i}`);
          const currentPractice = record.get(`pr${i}`);
          const desiredPractice = record.get(`pr${(i + 1) % size}`);
          const wantsRel = record.get(`w${i}`);

          const preferenceOrder = this.toNumber(wantsRel.properties.order);

          totalPreferenceScore += preferenceOrder;
          maxPreferenceOrder = Math.max(maxPreferenceOrder, preferenceOrder);

          nodes.push({
            personId: person.properties.id,
            personName: person.properties.name,
            currentPracticeId: this.toNumber(currentPractice.properties.id),
            desiredPracticeId: this.toNumber(desiredPractice.properties.id),
            preferenceOrder,
          });
        }

        cycles.push({ nodes, maxPreferenceOrder, totalPreferenceScore });

        console.log(`[Matcher] Cycle found: ${nodes.map(n => `${n.personName}(${n.currentPracticeId}→${n.desiredPracticeId}[${n.preferenceOrder}])`).join(' → ')}`);
      }
    } catch (error) {
      console.error(`[Matcher] Error finding cycles of size ${size}:`, error);
      throw error;
    } finally {
      await session.close();
    }

    return cycles;
  }

  /**
   * Build Cypher query to find cycles of given size
   * The query finds circular patterns where each person wants the next person's current practice
   */
  private buildCycleQuery(size: number): string {
    const matchClauses: string[] = [];
    const whereClauses: string[] = [];
    const returnItems: string[] = [];

    // Build MATCH patterns for each person in the cycle
    for (let i = 0; i < size; i++) {
      const nextIdx = (i + 1) % size;

      // Person i is currently at practice i
      matchClauses.push(`(p${i}:Person)-[:CURRENTLY_AT]->(pr${i}:Practice)`);

      // Person i wants practice of next person (closing the cycle)
      matchClauses.push(`(p${i})-[w${i}:WANTS]->(pr${nextIdx})`);

      // Return items
      returnItems.push(`p${i}`, `pr${i}`, `w${i}`);

      // WHERE conditions for people after p0
      if (i > 0) {
        // Exclude already matched people (except p0 who is the anchor)
        whereClauses.push(`(p${i}.matchedInCircleId IS NULL OR p${i}.matchedInCircleId = '')`);
      }
    }

    // Anchor first person to the specific ID
    whereClauses.push(`p0.id = $personId`);

    // Ensure all people are distinct
    for (let i = 0; i < size; i++) {
      for (let j = i + 1; j < size; j++) {
        whereClauses.push(`p${i} <> p${j}`);
      }
    }

    // Assemble the query
    const query = `
MATCH ${matchClauses.join(',\n      ')}
WHERE ${whereClauses.join('\n  AND ')}
RETURN ${returnItems.join(', ')}
    `.trim();

    return query;
  }

  /**
   * Rank cycles using weighted scoring (lower score = better match)
   * Score = (maxPref × preferenceWeight) + (totalScore × totalScoreWeight) + (distance × sizeWeight)
   */
  private rankCycles(cycles: RawCycle[]): RawCycle[] {
    const idealSize = config.matching.idealCircleSize;
    const w1 = config.matching.preferenceWeight;
    const w2 = config.matching.totalScoreWeight;
    const w3 = config.matching.sizeWeight;

    // Calculate score for each cycle
    const cyclesWithScores = cycles.map(cycle => {
      const distance = Math.abs(cycle.nodes.length - idealSize);
      const score = (cycle.maxPreferenceOrder * w1) +
                   (cycle.totalPreferenceScore * w2) +
                   (distance * w3);

      console.log(`[Matcher] Cycle size ${cycle.nodes.length}: maxPref=${cycle.maxPreferenceOrder}, total=${cycle.totalPreferenceScore}, distance=${distance}, score=${score.toFixed(2)}`);

      return { cycle, score };
    });

    // Sort by score (lower is better)
    cyclesWithScores.sort((a, b) => a.score - b.score);

    return cyclesWithScores.map(item => item.cycle);
  }

  /**
   * Convert a raw cycle into a Circle object and mark people as matched
   */
  private async createCircleFromCycle(cycle: RawCycle): Promise<Circle> {
    const circleId = uuidv4();
    const personIds = cycle.nodes.map(node => node.personId);

    // Mark all people in this cycle as matched
    await neo4jService.markPeopleAsMatched(personIds, circleId);

    // Fetch full person data
    const allPeople = await neo4jService.getAllPeople();
    const personMap = new Map(allPeople.map(p => [p.id, p]));

    // Build CirclePerson array
    const people: CirclePerson[] = cycle.nodes.map((node, index) => {
      const person = personMap.get(node.personId);
      if (!person) {
        throw new Error(`Person ${node.personId} not found`);
      }

      // The previous person in the cycle is who this person gets a spot from
      const prevIndex = (index - 1 + cycle.nodes.length) % cycle.nodes.length;
      const getsSpotFrom = cycle.nodes[prevIndex].personId;

      return {
        person,
        choiceIndex: node.preferenceOrder,
        getsSpotFrom,
      };
    });

    return {
      size: people.length,
      people,
      choiceIndex: cycle.maxPreferenceOrder,
    };
  }

  /**
   * Helper to convert Neo4j Integer/BigInt to JavaScript number
   */
  private toNumber(val: any): number {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'bigint') return Number(val);
    if (val.toNumber) return val.toNumber(); // neo4j Integer type
    return Number(val);
  }
}

export const matcherService = new MatcherService();
