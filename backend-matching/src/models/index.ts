export enum PreferenceLevel {
  FIRST = 1,
  SECOND = 2,
}

export interface Practice {
  name: string;
  location: string;
}

export interface Person {
  id: string;
  name: string;
  currentPractice: Practice;
  desiredPracticeFirst: Practice;
  desiredPracticeSecond?: Practice;
}

export interface CirclePerson {
  person: Person;
  preferenceLevel: PreferenceLevel;
  getsSpotFrom: string; // Name of the person they get a spot from
}

export interface Circle {
  size: number;
  people: CirclePerson[];
  isFirstChoiceOnly: boolean;
  isSecondChoiceOnly: boolean;
}

export interface MatchResult {
  circles: Circle[];
  unmatchedPeople: Person[];
  statistics: {
    totalPeople: number;
    totalMatched: number;
    matchRate: number;
    firstChoiceCount: number;
    secondChoiceCount: number;
    averageCircleSize: number;
    circleSizes: Record<number, number>;
  };
}

export interface PersonCreate {
  name: string;
  currentPracticeName: string;
  currentLocation: string;
  desiredPracticeFirst: string;
  desiredLocationFirst: string;
  desiredPracticeSecond?: string;
  desiredLocationSecond?: string;
}

export interface Statistics {
  totalPeople: number;
  totalMatched: number;
  matchRate: number;
  firstChoiceCount: number;
  secondChoiceCount: number;
  averageCircleSize: number;
  circleSizes: Record<number, number>;
}
