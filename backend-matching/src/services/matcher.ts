import { neo4jService } from './neo4j.js';
import { Person, Circle, CirclePerson, MatchResult } from '../models/index.js';
import { config } from '../config.js';

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

  async findMatches(): Promise<MatchResult> {
    // Get all people
    const allPeople = await neo4jService.getAllPeople();

    if (allPeople.length === 0) {
      return this.emptyResult();
    }

    // Find all possible cycles (regardless of preference order)
    const allCycles = await this.findAllCycles(config.matching.maxCircleSize);

    console.log(`[Matcher] Found ${allCycles.length} total cycles`);

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

    console.log(`[Matcher] Sorted cycles by preference order (best first)`);

    // Select non-overlapping cycles
    const selectedCycles = this.selectNonOverlappingCycles(sortedCycles);
    const matchedPersonIds = new Set<string>();

    selectedCycles.forEach(cycle => {
      cycle.nodes.forEach(node => matchedPersonIds.add(node.personId));
    });

    console.log(`[Matcher] Selected ${selectedCycles.length} non-overlapping cycles, matched ${matchedPersonIds.size} people`);

    // Build the result
    const result = await this.buildMatchResult(allPeople, selectedCycles, matchedPersonIds);

    // Cache the result
    this.cachedResult = result;

    return result;
  }

  getCachedResult(): MatchResult | null {
    return this.cachedResult;
  }

  private async findAllCycles(
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
        const query = this.buildCycleQuery(size);
        const result = await session.run(query);

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

  private buildCycleQuery(size: number): string {
    const patterns: string[] = [];
    const conditions: string[] = [];

    for (let i = 0; i < size; i++) {
      const nextIdx = (i + 1) % size;
      patterns.push(`(p${i}:Person)-[:CURRENTLY_AT]->(pr${i}:Practice)`);
      patterns.push(`(p${i})-[w${i}:WANTS]->(pr${nextIdx})`); // No order filter
    }

    // Ensure all persons are distinct
    for (let i = 0; i < size; i++) {
      for (let j = i + 1; j < size; j++) {
        conditions.push(`id(p${i}) < id(p${j})`);
      }
    }

    const matchClause = `MATCH ${patterns.join(', ')}`;
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const returns: string[] = [];
    for (let i = 0; i < size; i++) {
      returns.push(`p${i}`, `pr${i}`, `w${i}`);
    }
    const returnClause = `RETURN ${returns.join(', ')}`;

    return `${matchClause} ${whereClause} ${returnClause}`;
  }

  private selectNonOverlappingCycles(cycles: RawCycle[]): RawCycle[] {
    // Cycles are already sorted by preference score (best first)
    // Select non-overlapping cycles in order

    const selected: RawCycle[] = [];
    const usedPersonIds = new Set<string>();

    for (const cycle of cycles) {
      // Check if any person in this cycle is already used
      const hasOverlap = cycle.nodes.some(node => usedPersonIds.has(node.personId));

      if (!hasOverlap) {
        selected.push(cycle);
        cycle.nodes.forEach(node => usedPersonIds.add(node.personId));
      }
    }

    return selected;
  }

  private async buildMatchResult(
    allPeople: Person[],
    selectedCycles: RawCycle[],
    matchedPersonIds: Set<string>
  ): Promise<MatchResult> {
    // Create a map for quick person lookup
    const personMap = new Map(allPeople.map(p => [p.id, p]));

    // Build circles
    const circles: Circle[] = selectedCycles.map(rawCycle => {
      console.log(`[Matcher] Building circle with maxPreferenceOrder: ${rawCycle.maxPreferenceOrder}, totalScore: ${rawCycle.totalPreferenceScore}, size: ${rawCycle.nodes.length}`);

      const people: CirclePerson[] = rawCycle.nodes.map((node, index) => {
        const person = personMap.get(node.personId)!;
        const prevIndex = (index - 1 + rawCycle.nodes.length) % rawCycle.nodes.length;
        const getsSpotFrom = rawCycle.nodes[prevIndex].personName;

        // Use the person's individual preference order
        return {
          person,
          choiceIndex: node.preferenceOrder,
          getsSpotFrom,
        };
      });

      return {
        size: people.length,
        people,
        choiceIndex: rawCycle.maxPreferenceOrder, // Circle's overall choice index is the worst preference
      };
    });

    // Find unmatched people
    const unmatchedPeople = allPeople.filter(p => !matchedPersonIds.has(p.id));

    // Calculate statistics
    const totalPeople = allPeople.length;
    const totalMatched = matchedPersonIds.size;
    const matchRate = totalPeople > 0 ? totalMatched / totalPeople : 0;

    const choiceCounts: number[] = [];
    const circleSizes: Record<number, number> = {};

    for (const circle of circles) {
      circleSizes[circle.size] = (circleSizes[circle.size] || 0) + 1;

      for (const circlePerson of circle.people) {
        const index = circlePerson.choiceIndex;
        choiceCounts[index] = (choiceCounts[index] || 0) + 1;
      }
    }

    const totalCircleSize = circles.reduce((sum, c) => sum + c.size, 0);
    const averageCircleSize = circles.length > 0 ? totalCircleSize / circles.length : 0;
    const normalizedChoiceCounts = Array.from({ length: MAX_PREFERENCE_INDEX }, (_, index) => choiceCounts[index] || 0);

    return {
      circles,
      unmatchedPeople,
      statistics: {
        totalPeople,
        totalMatched,
        matchRate,
        choiceCounts: normalizedChoiceCounts,
        averageCircleSize,
        circleSizes,
      },
    };
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
