import { neo4jService } from './neo4j.js';
import { Person, Circle, CirclePerson, MatchResult } from '../models/index.js';

const PREFERENCE_RELATIONS = ['WANTS_FIRST', 'WANTS_SECOND'] as const;
type PreferenceRelation = typeof PREFERENCE_RELATIONS[number];

interface CycleNode {
  personId: string;
  personName: string;
  currentPracticeName: string;
  desiredPracticeName: string;
  desiredLocation: string;
}

interface RawCycle {
  nodes: CycleNode[];
  preferenceType: PreferenceRelation;
  preferenceIndex: number;
}

class MatcherService {
  private cachedResult: MatchResult | null = null;

  async findMatches(): Promise<MatchResult> {
    // Get all people
    const allPeople = await neo4jService.getAllPeople();

    if (allPeople.length === 0) {
      return this.emptyResult();
    }

    const matchedPersonIds = new Set<string>();
    const allSelectedCycles: RawCycle[] = [];

    for (const [preferenceIndex, preferenceType] of PREFERENCE_RELATIONS.entries()) {
      const rawCycles = await this.findCyclesWithPreference(preferenceType, preferenceIndex, 4);

      const availableCycles = rawCycles.filter(cycle =>
        cycle.nodes.every(node => !matchedPersonIds.has(node.personId))
      );

      const selectedCycles = this.selectNonOverlappingCycles(availableCycles);

      selectedCycles.forEach(cycle => {
        cycle.nodes.forEach(node => matchedPersonIds.add(node.personId));
      });

      allSelectedCycles.push(...selectedCycles);
    }

    // Build the result
    const result = await this.buildMatchResult(allPeople, allSelectedCycles, matchedPersonIds);

    // Cache the result
    this.cachedResult = result;

    return result;
  }

  getCachedResult(): MatchResult | null {
    return this.cachedResult;
  }

  private async findCyclesWithPreference(
    preferenceType: PreferenceRelation,
    preferenceIndex: number,
    maxCycleLength: number
  ): Promise<RawCycle[]> {
    const session = await neo4jService.getSession();
    const cycles: RawCycle[] = [];

    try {
      // Find cycles of different sizes (2, 3, 4)
      for (let size = 2; size <= maxCycleLength; size++) {
        const query = this.buildCycleQuery(size, preferenceType);
        const result = await session.run(query);

        for (const record of result.records) {
          const nodes: CycleNode[] = [];

          for (let i = 0; i < size; i++) {
            const person = record.get(`p${i}`);
            const currentPractice = record.get(`pr${i}`);
            const desiredPractice = record.get(`pr${(i + 1) % size}`);
            const wantsRel = record.get(`w${i}`);

            nodes.push({
              personId: person.properties.id,
              personName: person.properties.name,
              currentPracticeName: currentPractice.properties.name,
              desiredPracticeName: desiredPractice.properties.name,
              desiredLocation: wantsRel.properties.location,
            });
          }

          cycles.push({ nodes, preferenceType, preferenceIndex });
        }
      }
    } finally {
      await session.close();
    }

    return cycles;
  }

  private buildCycleQuery(size: number, preferenceType: string): string {
    const patterns: string[] = [];
    const conditions: string[] = [];

    for (let i = 0; i < size; i++) {
      const nextIdx = (i + 1) % size;
      patterns.push(`(p${i}:Person)-[:CURRENTLY_AT]->(pr${i}:Practice)`);
      patterns.push(`(p${i})-[w${i}:${preferenceType}]->(pr${nextIdx})`);
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
    // Sort by size (smaller circles first)
    const sortedCycles = [...cycles].sort((a, b) => a.nodes.length - b.nodes.length);

    const selected: RawCycle[] = [];
    const usedPersonIds = new Set<string>();

    for (const cycle of sortedCycles) {
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
      const choiceIndex = rawCycle.preferenceIndex;

      const people: CirclePerson[] = rawCycle.nodes.map((node, index) => {
        const person = personMap.get(node.personId)!;
        const prevIndex = (index - 1 + rawCycle.nodes.length) % rawCycle.nodes.length;
        const getsSpotFrom = rawCycle.nodes[prevIndex].personName;

        return {
          person,
          choiceIndex,
          getsSpotFrom,
        };
      });

      return {
        size: people.length,
        people,
        choiceIndex,
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
    const normalizedChoiceCounts = PREFERENCE_RELATIONS.map((_, index) => choiceCounts[index] || 0);

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
        choiceCounts: PREFERENCE_RELATIONS.map(() => 0),
        averageCircleSize: 0,
        circleSizes: {},
      },
    };
  }
}

export const matcherService = new MatcherService();
