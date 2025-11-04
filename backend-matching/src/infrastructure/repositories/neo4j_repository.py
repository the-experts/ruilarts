"""Neo4j implementation of the PersonRepository interface."""

from typing import List, Optional
from ...domain.interfaces import PersonRepository
from ...domain.models import Person, Practice
from ..neo4j_connection import Neo4jConnection


class Neo4jPersonRepository(PersonRepository):
    """Neo4j-based repository for person data."""

    def __init__(self, connection: Neo4jConnection):
        """
        Initialize the repository.

        Args:
            connection: Neo4j connection instance
        """
        self.connection = connection

    def add(self, person: Person) -> None:
        """
        Add a new person to the database.

        Args:
            person: Person object to add
        """
        with self.connection.session() as session:
            # Create or merge the person node
            session.run("""
                MERGE (p:Person {id: $person_id})
                SET p.name = $name,
                    p.current_location = $current_location
            """, person_id=person.id, name=person.name,
                current_location=person.current_practice.location)

            # Create or merge the current practice
            session.run("""
                MERGE (pr:Practice {name: $practice_name})
                SET pr.location = $location
            """, practice_name=person.current_practice.name,
                location=person.current_practice.location)

            # Create CURRENTLY_AT relationship
            session.run("""
                MATCH (p:Person {id: $person_id})
                MATCH (pr:Practice {name: $practice_name})
                MERGE (p)-[:CURRENTLY_AT]->(pr)
            """, person_id=person.id, practice_name=person.current_practice.name)

            # Create or merge first desired practice
            session.run("""
                MERGE (pr:Practice {name: $practice_name})
                SET pr.location = $location
            """, practice_name=person.desired_practice_first.name,
                location=person.desired_practice_first.location)

            # Create WANTS_FIRST relationship
            session.run("""
                MATCH (p:Person {id: $person_id})
                MATCH (pr:Practice {name: $practice_name})
                MERGE (p)-[w:WANTS_FIRST]->(pr)
                SET w.location = $location
            """, person_id=person.id,
                practice_name=person.desired_practice_first.name,
                location=person.desired_practice_first.location)

            # Handle second desired practice if it exists
            if person.desired_practice_second:
                session.run("""
                    MERGE (pr:Practice {name: $practice_name})
                    SET pr.location = $location
                """, practice_name=person.desired_practice_second.name,
                    location=person.desired_practice_second.location)

                session.run("""
                    MATCH (p:Person {id: $person_id})
                    MATCH (pr:Practice {name: $practice_name})
                    MERGE (p)-[w:WANTS_SECOND]->(pr)
                    SET w.location = $location
                """, person_id=person.id,
                    practice_name=person.desired_practice_second.name,
                    location=person.desired_practice_second.location)

    def get_by_id(self, person_id: str) -> Optional[Person]:
        """
        Get a person by ID.

        Args:
            person_id: Person ID to look up

        Returns:
            Person object if found, None otherwise
        """
        with self.connection.session() as session:
            result = session.run("""
                MATCH (p:Person {id: $person_id})-[:CURRENTLY_AT]->(current:Practice)
                MATCH (p)-[w1:WANTS_FIRST]->(first:Practice)
                OPTIONAL MATCH (p)-[w2:WANTS_SECOND]->(second:Practice)
                RETURN p.id AS person_id,
                       p.name AS person_name,
                       p.current_location AS current_location,
                       current.name AS current_practice_name,
                       current.location AS current_practice_location,
                       first.name AS first_practice_name,
                       w1.location AS first_practice_location,
                       second.name AS second_practice_name,
                       w2.location AS second_practice_location
            """, person_id=person_id)

            record = result.single()
            if not record:
                return None

            return self._record_to_person(record)

    def get_all(self) -> List[Person]:
        """
        Get all people from the database.

        Returns:
            List of all Person objects
        """
        with self.connection.session() as session:
            result = session.run("""
                MATCH (p:Person)-[:CURRENTLY_AT]->(current:Practice)
                MATCH (p)-[w1:WANTS_FIRST]->(first:Practice)
                OPTIONAL MATCH (p)-[w2:WANTS_SECOND]->(second:Practice)
                RETURN p.id AS person_id,
                       p.name AS person_name,
                       p.current_location AS current_location,
                       current.name AS current_practice_name,
                       current.location AS current_practice_location,
                       first.name AS first_practice_name,
                       w1.location AS first_practice_location,
                       second.name AS second_practice_name,
                       w2.location AS second_practice_location
                ORDER BY p.id
            """)

            return [self._record_to_person(record) for record in result]

    def delete(self, person_id: str) -> bool:
        """
        Delete a person from the database.

        Args:
            person_id: ID of person to delete

        Returns:
            True if deleted, False if not found
        """
        with self.connection.session() as session:
            result = session.run("""
                MATCH (p:Person {id: $person_id})
                DETACH DELETE p
                RETURN count(p) AS deleted_count
            """, person_id=person_id)

            record = result.single()
            return record["deleted_count"] > 0 if record else False

    def save_all(self) -> None:
        """
        Persist all changes to storage.

        Note: With Neo4j, changes are persisted immediately on each operation,
        so this method is a no-op for compatibility with the interface.
        """
        pass

    def _record_to_person(self, record) -> Person:
        """
        Convert a Neo4j record to a Person domain object.

        Args:
            record: Neo4j record from query

        Returns:
            Person object
        """
        current_practice = Practice(
            name=record["current_practice_name"],
            location=record["current_practice_location"]
        )

        first_practice = Practice(
            name=record["first_practice_name"],
            location=record["first_practice_location"]
        )

        second_practice = None
        if record["second_practice_name"]:
            second_practice = Practice(
                name=record["second_practice_name"],
                location=record["second_practice_location"]
            )

        return Person(
            id=record["person_id"],
            name=record["person_name"],
            current_practice=current_practice,
            desired_practice_first=first_practice,
            desired_practice_second=second_practice
        )
