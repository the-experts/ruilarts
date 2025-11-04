"""Neo4j implementation of the MatchingAlgorithm interface."""

from typing import List, Dict, Set
from ...domain.interfaces import MatchingAlgorithm
from ...domain.models import Person, Practice, Circle, MatchResult, PreferenceLevel
from ..neo4j_connection import Neo4jConnection


class Neo4jMatcher(MatchingAlgorithm):
    """
    Neo4j-based circular matching algorithm.

    Uses Cypher queries to find circular matches in the graph database.
    """

    def __init__(self, connection: Neo4jConnection):
        """
        Initialize the matcher.

        Args:
            connection: Neo4j connection instance
        """
        self.connection = connection

    def find_matches(self, people: List[Person]) -> MatchResult:
        """
        Find circular matches for the given list of people.

        Args:
            people: List of Person objects with their preferences

        Returns:
            MatchResult containing all circles and unmatched people
        """
        # Find cycles with first preferences
        cycles_first = self._find_cycles_with_preference("WANTS_FIRST")
        selected_first = self._select_non_overlapping_cycles(cycles_first)

        # Track matched people
        matched_people_first = set()
        for cycle in selected_first:
            matched_people_first.update(cycle)

        # Find cycles with second preferences for unmatched people
        cycles_second = self._find_cycles_with_preference("WANTS_SECOND")

        # Filter out cycles that include already-matched people
        cycles_second_filtered = [
            cycle for cycle in cycles_second
            if not any(person in matched_people_first for person in cycle)
        ]

        selected_second = self._select_non_overlapping_cycles(cycles_second_filtered)

        matched_people_second = set()
        for cycle in selected_second:
            matched_people_second.update(cycle)

        # Build preference map
        preference_map = {}
        for cycle in selected_first:
            for person_name in cycle:
                preference_map[person_name] = PreferenceLevel.FIRST
        for cycle in selected_second:
            for person_name in cycle:
                preference_map[person_name] = PreferenceLevel.SECOND

        # Convert cycles to Circle domain objects
        circles = []
        all_selected_cycles = selected_first + selected_second

        for cycle_names in all_selected_cycles:
            # Get person objects from the provided list
            cycle_people = []
            cycle_prefs = {}

            for name in cycle_names:
                person = next((p for p in people if p.name == name), None)
                if person:
                    cycle_people.append(person)
                    cycle_prefs[person.name] = preference_map[name]

            if cycle_people:
                circles.append(Circle(
                    people=cycle_people,
                    preference_levels=cycle_prefs
                ))

        # Find unmatched people
        matched_names = matched_people_first | matched_people_second
        unmatched = [p for p in people if p.name not in matched_names]

        return MatchResult(circles=circles, unmatched_people=unmatched)

    def _find_cycles_with_preference(
        self,
        preference_type: str,
        max_cycle_length: int = 4
    ) -> List[List[str]]:
        """
        Find all cycles using Cypher path queries.

        Args:
            preference_type: "WANTS_FIRST" or "WANTS_SECOND"
            max_cycle_length: Maximum cycle length to search for (default: 4)

        Returns:
            List of cycles, where each cycle is a list of person names
        """
        # Use explicit pattern matching for cycles of size 2, 3, and 4
        # This is more reliable than variable-length path matching
        query = f"""
        MATCH (p1:Person)-[:CURRENTLY_AT]->(pr1:Practice)
        MATCH (p1)-[:{preference_type}]->(pr2:Practice)<-[:CURRENTLY_AT]-(p2:Person)
        MATCH (p2)-[:{preference_type}]->(pr1:Practice)
        WHERE p1.name < p2.name  // Avoid duplicate pairs
        RETURN DISTINCT [p1.name, p2.name] AS cycle, 2 AS cycle_length

        UNION

        MATCH (p1:Person)-[:CURRENTLY_AT]->(pr1:Practice)
        MATCH (p1)-[:{preference_type}]->(pr2:Practice)<-[:CURRENTLY_AT]-(p2:Person)
        MATCH (p2)-[:{preference_type}]->(pr3:Practice)<-[:CURRENTLY_AT]-(p3:Person)
        MATCH (p3)-[:{preference_type}]->(pr1:Practice)
        WHERE p1 <> p2 AND p2 <> p3 AND p1 <> p3
        AND id(p1) < id(p2) AND id(p1) < id(p3)  // Avoid rotations
        RETURN DISTINCT [p1.name, p2.name, p3.name] AS cycle, 3 AS cycle_length

        UNION

        MATCH (p1:Person)-[:CURRENTLY_AT]->(pr1:Practice)
        MATCH (p1)-[:{preference_type}]->(pr2:Practice)<-[:CURRENTLY_AT]-(p2:Person)
        MATCH (p2)-[:{preference_type}]->(pr3:Practice)<-[:CURRENTLY_AT]-(p3:Person)
        MATCH (p3)-[:{preference_type}]->(pr4:Practice)<-[:CURRENTLY_AT]-(p4:Person)
        MATCH (p4)-[:{preference_type}]->(pr1:Practice)
        WHERE p1 <> p2 AND p2 <> p3 AND p3 <> p4 AND p1 <> p3 AND p1 <> p4 AND p2 <> p4
        AND id(p1) < id(p2) AND id(p1) < id(p3) AND id(p1) < id(p4)
        RETURN DISTINCT [p1.name, p2.name, p3.name, p4.name] AS cycle, 4 AS cycle_length

        ORDER BY cycle_length ASC
        """

        cycles = []
        with self.connection.session() as session:
            result = session.run(query)
            for record in result:
                cycle = record['cycle']
                # Ensure no duplicates in the cycle list
                if len(cycle) == len(set(cycle)):
                    cycles.append(cycle)

        return cycles

    def _select_non_overlapping_cycles(
        self,
        all_cycles: List[List[str]]
    ) -> List[List[str]]:
        """
        Select the optimal set of non-overlapping cycles.
        Prioritize smaller cycles to minimize points of failure.

        Args:
            all_cycles: List of all possible cycles

        Returns:
            List of selected non-overlapping cycles
        """
        # Sort by cycle length (smallest first)
        sorted_cycles = sorted(all_cycles, key=len)

        selected_cycles = []
        used_people: Set[str] = set()

        for cycle in sorted_cycles:
            # Check if any person in this cycle is already used
            if not any(person in used_people for person in cycle):
                selected_cycles.append(cycle)
                used_people.update(cycle)

        return selected_cycles
