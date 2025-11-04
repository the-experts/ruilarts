import { neo4jService } from './neo4j.js';
import { Circle, CirclePerson, MatchResult } from '../models/index.js';
import { config } from '../config.js';
import { v4 as uuidv4 } from 'uuid';

const MAX_PREFERENCE_INDEX = config.matching.maxPracticeChoices;

interface CycleNode {
  personId: string;
  personName: string;
  currentPracticeId: number;
  desiredPracticeId: number;
  preferenceOrder: number; // Which preference this person uses (0-9)
}

interface RawCycle {
  nodes: CycleNode[];
  maxPreferenceOrder: number; // Highest preference used in this cycle
  totalPreferenceScore: number; // Sum of all preferences (for tie-breaking)
}

class MatcherService {
  private cachedResult: MatchResult | null = null;

  async findMatchesForPerson(personId: string): Promise<Circle | null> {
    console.log(`[Matcher] Finding matches for person ${personId}`);

    // Find all cycles that include this person
    const allCycles = await this.findAllCyclesForPerson(personId, config.matching.maxCircleSize);

    console.log(`[Matcher] Found ${allCycles.length} cycles for person ${personId}`);

    if (allCycles.length === 0) {
      console.log(`[Matcher] No matches found for person ${personId}`);
      return null;
    }

    // Sort cycles by preference score (best matches first)
    // Priority: maxPreferenceOrder (lower is better), totalPreferenceScore (lower is better), size (smaller is better)
    const sortedCycles = allCycles.sort((a, b) => {
      if (a.maxPreferenceOrder !== b.maxPreferenceOrder) {
        return a.maxPreferenceOrder - b.maxPreferenceOrder;
      }
      if (a.totalPreferenceScore !== b.totalPreferenceScore) {
        return a.totalPreferenceScore - b.totalPreferenceScore;
      }
      return a.nodes.length - b.nodes.length;
    });

    // Take the best cycle
    const bestCycle = sortedCycles[0];
    const circleId = uuidv4();

    console.log(`[Matcher] Best cycle: size=${bestCycle.nodes.length}, maxPref=${bestCycle.maxPreferenceOrder}, totalScore=${bestCycle.totalPreferenceScore}`);

    // Mark all people in this cycle as matched
    const personIds = bestCycle.nodes.map(node => node.personId);
    await neo4jService.markPeopleAsMatched(personIds, circleId);

    console.log(`[Matcher] Marked ${personIds.length} people as matched in circle ${circleId}`);

    // Build and return the Circle
    const allPeople = await neo4jService.getAllPeople();
    const personMap = new Map(allPeople.map(p => [p.id, p]));

    const people: CirclePerson[] = bestCycle.nodes.map((node, index) => {
      const person = personMap.get(node.personId)!;
      const prevIndex = (index - 1 + bestCycle.nodes.length) % bestCycle.nodes.length;
      const getsSpotFrom = bestCycle.nodes[prevIndex].personName;

      return {
        person,
        choiceIndex: node.preferenceOrder,
        getsSpotFrom,
      };
    });

    const circle: Circle = {
      size: people.length,
      people,
      choiceIndex: bestCycle.maxPreferenceOrder,
    };

    // Update cached result
    if (!this.cachedResult) {
      this.cachedResult = this.emptyResult();
    }
    this.cachedResult.circles.push(circle);

    return circle;
  }

  getCachedResult(): MatchResult | null {
    return this.cachedResult;
  }

  private async findAllCyclesForPerson(
    anchorPersonId: string,
    maxCycleLength: number
  ): Promise<RawCycle[]> {
    const session = await neo4jService.getSession();
    const cycles: RawCycle[] = [];

    // Helper to convert Neo4j Integer/BigInt to number
    const toNumber = (val: any): number => {
      if (val === null || val === undefined) return 0;
      if (typeof val === 'number') return val;
      if (typeof val === 'bigint') return Number(val);
      if (val.toNumber) return val.toNumber(); // neo4j Integer type
      return Number(val);
    };

    try {
      // Find cycles of different sizes (2, 3, 4, etc.)
      for (let size = 2; size <= maxCycleLength; size++) {
        const query = this.buildCycleQuery(size, anchorPersonId);
        const result = await session.run(query, { anchorPersonId });

        for (const record of result.records) {
          const nodes: CycleNode[] = [];
          let totalPreferenceScore = 0;
          let maxPreferenceOrder = 0;

          for (let i = 0; i < size; i++) {
            const person = record.get(`p${i}`);
            const currentPractice = record.get(`pr${i}`);
            const desiredPractice = record.get(`pr${(i + 1) % size}`);
            const wantsRel = record.get(`w${i}`);

            // Extract the order property from the WANTS relationship
            const preferenceOrder = toNumber(wantsRel.properties.order);

            totalPreferenceScore += preferenceOrder;
            maxPreferenceOrder = Math.max(maxPreferenceOrder, preferenceOrder);

            nodes.push({
              personId: person.properties.id,
              personName: person.properties.name,
              currentPracticeId: toNumber(currentPractice.properties.id),
              desiredPracticeId: toNumber(desiredPractice.properties.id),
              preferenceOrder,
            });
          }

          cycles.push({ nodes, maxPreferenceOrder, totalPreferenceScore });
        }
      }
    } finally {
      await session.close();
    }

    return cycles;
  }

  private buildCycleQuery(size: number, _anchorPersonId: string): string {
    const patterns: string[] = [];
    const conditions: string[] = [];

    // Anchor first person to the specific ID
    conditions.push(`p0.id = $anchorPersonId`);

    for (let i = 0; i < size; i++) {
      const nextIdx = (i + 1) % size;
      patterns.push(`(p${i}:Person)-[:CURRENTLY_AT]->(pr${i}:Practice)`);
      patterns.push(`(p${i})-[w${i}:WANTS]->(pr${nextIdx})`);

      // Exclude already matched people (except p0 who is the anchor)
      if (i > 0) {
        conditions.push(`(p${i}.matchedInCircleId IS NULL OR p${i}.matchedInCircleId = '')`);
      }
    }

    // Ensure all persons are distinct (but skip p0 comparisons since it's fixed)
    for (let i = 1; i < size; i++) {
      for (let j = i + 1; j < size; j++) {
        conditions.push(`id(p${i}) < id(p${j})`);
      }
    }

    const matchClause = `MATCH ${patterns.join(', ')}`;
    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const returns: string[] = [];
    for (let i = 0; i < size; i++) {
      returns.push(`p${i}`, `pr${i}`, `w${i}`);
    }
    const returnClause = `RETURN ${returns.join(', ')}`;

    return `${matchClause} ${whereClause} ${returnClause}`;
  }

  private emptyResult(): MatchResult {
    return {
      circles: [],
      unmatchedPeople: [],
      statistics: {
        totalPeople: 0,
        totalMatched: 0,
        matchRate: 0,
        choiceCounts: Array.from({ length: MAX_PREFERENCE_INDEX }, () => 0),
        averageCircleSize: 0,
        circleSizes: {},
      },
    };
  }
}

export const matcherService = new MatcherService();
