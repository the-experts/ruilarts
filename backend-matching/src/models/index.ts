export interface Practice {
  id: number;
}

export interface Person {
  id: string;
  name: string;
  currentPractice: Practice;
  choices: Practice[];
  matchedInCircleId?: string | null;
}

export interface CirclePerson {
  person: Person;
  choiceIndex: number;
  getsSpotFrom: string; // Name of the person they get a spot from
}

export interface Circle {
  size: number;
  people: CirclePerson[];
  choiceIndex: number;
}

export interface MatchResult {
  circles: Circle[];
  unmatchedPeople: Person[];
  statistics: {
    totalPeople: number;
    totalMatched: number;
    matchRate: number;
    choiceCounts: number[];
    averageCircleSize: number;
    circleSizes: Record<number, number>;
  };
}

export interface PersonCreate {
  name: string;
  currentPracticeId: number;
  choices: number[];
}
