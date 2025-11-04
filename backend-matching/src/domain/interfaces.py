"""
Interfaces for the Ruilarts matching system.

Defines contracts that infrastructure implementations must follow.
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from .models import Person, MatchResult


class PersonRepository(ABC):
    """Interface for person data storage."""

    @abstractmethod
    def add(self, person: Person) -> None:
        """Add a new person."""
        pass

    @abstractmethod
    def get_by_id(self, person_id: str) -> Optional[Person]:
        """Get a person by ID."""
        pass

    @abstractmethod
    def get_all(self) -> List[Person]:
        """Get all people."""
        pass

    @abstractmethod
    def delete(self, person_id: str) -> bool:
        """Delete a person. Returns True if deleted, False if not found."""
        pass

    @abstractmethod
    def save_all(self) -> None:
        """Persist all changes to storage."""
        pass


class MatchingAlgorithm(ABC):
    """Interface for matching algorithm implementations."""

    @abstractmethod
    def find_matches(self, people: List[Person]) -> MatchResult:
        """
        Find circular matches for the given list of people.

        Args:
            people: List of Person objects with their preferences

        Returns:
            MatchResult containing all circles and unmatched people
        """
        pass
