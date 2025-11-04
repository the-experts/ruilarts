import { neo4jService } from './neo4j.js';
import { Person, Circle, CirclePerson, MatchResult, PreferenceLevel } from '../models/index.js';

interface CycleNode {
  personId: string;
  personName: string;
  currentPracticeName: string;
  desiredPracticeName: string;
  desiredLocation: string;
}

interface RawCycle {
  nodes: CycleNode[];
  preferenceType: 'WANTS_FIRST' | 'WANTS_SECOND';
}

class MatcherService {
  private cachedResult: MatchResult | null = null;

  async findMatches(): Promise<MatchResult> {
    // Get all people
    const allPeople = await neo4jService.getAllPeople();

    if (allPeople.length === 0) {
      return this.emptyResult();
    }

    // Find cycles with first preferences
    const firstChoiceCycles = await this.findCyclesWithPreference('WANTS_FIRST', 4);

    // Select non-overlapping cycles from first choices
    const selectedFirstChoices = this.selectNonOverlappingCycles(firstChoiceCycles);

    // Get people who are already matched
    const matchedPersonIds = new Set(
      selectedFirstChoices.flatMap(cycle => cycle.nodes.map(n => n.personId))
    );

    // Find cycles with second preferences for unmatched people
    const secondChoiceCycles = await this.findCyclesWithPreference('WANTS_SECOND', 4);

    // Filter out cycles that include already matched people
    const availableSecondChoices = secondChoiceCycles.filter(cycle =>
      !cycle.nodes.some(node => matchedPersonIds.has(node.personId))
    );

    // Select non-overlapping cycles from second choices
    const selectedSecondChoices = this.selectNonOverlappingCycles(availableSecondChoices);

    // Combine all selected cycles
    const allSelectedCycles = [...selectedFirstChoices, ...selectedSecondChoices];

    // Update matched person IDs
    allSelectedCycles.forEach(cycle => {
      cycle.nodes.forEach(node => matchedPersonIds.add(node.personId));
    });

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
    preferenceType: 'WANTS_FIRST' | 'WANTS_SECOND',
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

          cycles.push({ nodes, preferenceType });
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
      const people: CirclePerson[] = rawCycle.nodes.map((node, index) => {
        const person = personMap.get(node.personId)!;
        const prevIndex = (index - 1 + rawCycle.nodes.length) % rawCycle.nodes.length;
        const getsSpotFrom = rawCycle.nodes[prevIndex].personName;
        const preferenceLevel =
          rawCycle.preferenceType === 'WANTS_FIRST' ? PreferenceLevel.FIRST : PreferenceLevel.SECOND;

        return {
          person,
          preferenceLevel,
          getsSpotFrom,
        };
      });

      const isFirstChoiceOnly = rawCycle.preferenceType === 'WANTS_FIRST';
      const isSecondChoiceOnly = rawCycle.preferenceType === 'WANTS_SECOND';

      return {
        size: people.length,
        people,
        isFirstChoiceOnly,
        isSecondChoiceOnly,
      };
    });

    // Find unmatched people
    const unmatchedPeople = allPeople.filter(p => !matchedPersonIds.has(p.id));

    // Calculate statistics
    const totalPeople = allPeople.length;
    const totalMatched = matchedPersonIds.size;
    const matchRate = totalPeople > 0 ? totalMatched / totalPeople : 0;

    let firstChoiceCount = 0;
    let secondChoiceCount = 0;
    const circleSizes: Record<number, number> = {};

    for (const circle of circles) {
      circleSizes[circle.size] = (circleSizes[circle.size] || 0) + 1;

      for (const circlePerson of circle.people) {
        if (circlePerson.preferenceLevel === PreferenceLevel.FIRST) {
          firstChoiceCount++;
        } else {
          secondChoiceCount++;
        }
      }
    }

    const totalCircleSize = circles.reduce((sum, c) => sum + c.size, 0);
    const averageCircleSize = circles.length > 0 ? totalCircleSize / circles.length : 0;

    return {
      circles,
      unmatchedPeople,
      statistics: {
        totalPeople,
        totalMatched,
        matchRate,
        firstChoiceCount,
        secondChoiceCount,
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
        firstChoiceCount: 0,
        secondChoiceCount: 0,
        averageCircleSize: 0,
        circleSizes: {},
      },
    };
  }
}

export const matcherService = new MatcherService();
