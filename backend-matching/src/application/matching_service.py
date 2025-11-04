"""
Application service for managing matching operations.

Orchestrates between repositories and matching algorithms.
"""

from typing import Optional
from ..domain.models import Person, MatchResult
from ..domain.interfaces import PersonRepository, MatchingAlgorithm


class MatchingService:
    """Service for managing people and finding matches."""

    def __init__(
        self,
        person_repository: PersonRepository,
        matching_algorithm: MatchingAlgorithm
    ):
        self.person_repository = person_repository
        self.matching_algorithm = matching_algorithm
        self._cached_result: Optional[MatchResult] = None

    def add_person(self, person: Person) -> None:
        """Add a new person to the system."""
        self.person_repository.add(person)
        self.person_repository.save_all()
        # Invalidate cache
        self._cached_result = None

    def get_person(self, person_id: str) -> Optional[Person]:
        """Get a person by ID."""
        return self.person_repository.get_by_id(person_id)

    def find_matches(self, use_cache: bool = False) -> MatchResult:
        """
        Find all circular matches.

        Args:
            use_cache: If True, return cached result if available

        Returns:
            MatchResult with all circles and unmatched people
        """
        if use_cache and self._cached_result:
            return self._cached_result

        people = self.person_repository.get_all()
        result = self.matching_algorithm.find_matches(people)
        self._cached_result = result
        return result

    def get_cached_matches(self) -> Optional[MatchResult]:
        """Get the most recent match result from cache."""
        return self._cached_result
