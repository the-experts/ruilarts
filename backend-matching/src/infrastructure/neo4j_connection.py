"""Neo4j database connection and configuration management."""

import os
from typing import Optional
from neo4j import GraphDatabase, Driver
from contextlib import contextmanager


class Neo4jConnection:
    """Manages Neo4j database connections."""

    def __init__(
        self,
        uri: Optional[str] = None,
        user: Optional[str] = None,
        password: Optional[str] = None
    ):
        """
        Initialize Neo4j connection.

        Args:
            uri: Neo4j connection URI (defaults to env var NEO4J_URI or bolt://localhost:7687)
            user: Neo4j username (defaults to env var NEO4J_USER or neo4j)
            password: Neo4j password (defaults to env var NEO4J_PASSWORD or ruilarts123)
        """
        self.uri = uri or os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.user = user or os.getenv("NEO4J_USER", "neo4j")
        self.password = password or os.getenv("NEO4J_PASSWORD", "ruilarts123")
        self._driver: Optional[Driver] = None

    def connect(self) -> Driver:
        """
        Establish connection to Neo4j database.

        Returns:
            Neo4j driver instance
        """
        if self._driver is None:
            self._driver = GraphDatabase.driver(
                self.uri,
                auth=(self.user, self.password)
            )
        return self._driver

    def close(self):
        """Close the database connection."""
        if self._driver is not None:
            self._driver.close()
            self._driver = None

    @contextmanager
    def session(self):
        """
        Context manager for Neo4j sessions.

        Yields:
            Neo4j session
        """
        driver = self.connect()
        session = driver.session()
        try:
            yield session
        finally:
            session.close()

    def verify_connectivity(self) -> bool:
        """
        Verify database connectivity.

        Returns:
            True if connection is successful, False otherwise
        """
        try:
            driver = self.connect()
            driver.verify_connectivity()
            return True
        except Exception as e:
            print(f"Failed to connect to Neo4j: {e}")
            return False

    def initialize_schema(self):
        """Create constraints and indexes for the database schema."""
        with self.session() as session:
            # Create constraints for unique identifiers
            session.run("""
                CREATE CONSTRAINT person_id_unique IF NOT EXISTS
                FOR (p:Person) REQUIRE p.id IS UNIQUE
            """)

            session.run("""
                CREATE CONSTRAINT practice_name_unique IF NOT EXISTS
                FOR (pr:Practice) REQUIRE pr.name IS UNIQUE
            """)

            # Create indexes for better query performance
            session.run("""
                CREATE INDEX person_name IF NOT EXISTS
                FOR (p:Person) ON (p.name)
            """)

            session.run("""
                CREATE INDEX practice_location IF NOT EXISTS
                FOR (pr:Practice) ON (pr.location)
            """)

    def clear_database(self):
        """Clear all nodes and relationships from the database."""
        with self.session() as session:
            session.run("MATCH (n) DETACH DELETE n")


# Singleton instance for the application
_connection: Optional[Neo4jConnection] = None


def get_neo4j_connection() -> Neo4jConnection:
    """
    Get or create the singleton Neo4j connection.

    Returns:
        Neo4jConnection instance
    """
    global _connection
    if _connection is None:
        _connection = Neo4jConnection()
    return _connection


def close_neo4j_connection():
    """Close the singleton Neo4j connection."""
    global _connection
    if _connection is not None:
        _connection.close()
        _connection = None
