"""
Domain models for the Ruilarts matching system.

These models represent the core business entities with no external dependencies.
"""

from dataclasses import dataclass
from typing import Optional, List
from enum import Enum


class PreferenceLevel(Enum):
    """Preference level for a desired practice."""
    FIRST = 1
    SECOND = 2


@dataclass
class Practice:
    """Represents a huisarts practice."""
    name: str
    location: str

    def __hash__(self):
        return hash(self.name)

    def __eq__(self, other):
        if not isinstance(other, Practice):
            return False
        return self.name == other.name


@dataclass
class Person:
    """Represents a person looking to swap huisarts practices."""
    id: str
    name: str
    current_practice: Practice
    desired_practice_first: Practice
    desired_practice_second: Optional[Practice] = None

    def get_preference_for_practice(self, practice: Practice) -> Optional[PreferenceLevel]:
        """Get the preference level for a given practice."""
        if practice == self.desired_practice_first:
            return PreferenceLevel.FIRST
        if self.desired_practice_second and practice == self.desired_practice_second:
            return PreferenceLevel.SECOND
        return None


@dataclass
class Circle:
    """
    Represents a circular match where people can swap practices.

    A circle is a group of people where:
    - Person A wants Practice B (currently held by Person B)
    - Person B wants Practice C (currently held by Person C)
    - ...
    - Last person wants Practice A (currently held by Person A)
    """
    people: List[Person]
    preference_levels: dict[str, PreferenceLevel]  # Maps person.name -> preference level

    @property
    def size(self) -> int:
        """Number of people in this circle."""
        return len(self.people)

    @property
    def is_first_choice_only(self) -> bool:
        """Check if all people got their first choice."""
        return all(
            level == PreferenceLevel.FIRST
            for level in self.preference_levels.values()
        )

    @property
    def is_second_choice_only(self) -> bool:
        """Check if all people got their second choice."""
        return all(
            level == PreferenceLevel.SECOND
            for level in self.preference_levels.values()
        )

    def get_next_person(self, person: Person) -> Person:
        """Get the next person in the circle."""
        current_index = self.people.index(person)
        next_index = (current_index + 1) % len(self.people)
        return self.people[next_index]


@dataclass
class MatchResult:
    """
    Result of running the matching algorithm.

    Contains all matches found, unmatched people, and statistics.
    """
    circles: List[Circle]
    unmatched_people: List[Person]

    @property
    def total_matched(self) -> int:
        """Total number of people matched."""
        return sum(circle.size for circle in self.circles)

    @property
    def total_people(self) -> int:
        """Total number of people."""
        return self.total_matched + len(self.unmatched_people)

    @property
    def match_rate(self) -> float:
        """Percentage of people matched."""
        if self.total_people == 0:
            return 0.0
        return (self.total_matched / self.total_people) * 100

    @property
    def first_choice_count(self) -> int:
        """Number of people who got their first choice."""
        count = 0
        for circle in self.circles:
            count += sum(
                1 for level in circle.preference_levels.values()
                if level == PreferenceLevel.FIRST
            )
        return count

    @property
    def second_choice_count(self) -> int:
        """Number of people who got their second choice."""
        count = 0
        for circle in self.circles:
            count += sum(
                1 for level in circle.preference_levels.values()
                if level == PreferenceLevel.SECOND
            )
        return count

    @property
    def average_circle_size(self) -> float:
        """Average size of circles."""
        if not self.circles:
            return 0.0
        return sum(c.size for c in self.circles) / len(self.circles)

    @property
    def circle_sizes(self) -> List[int]:
        """List of all circle sizes."""
        return [c.size for c in self.circles]
