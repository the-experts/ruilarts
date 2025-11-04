"""
Dependency injection for FastAPI.
"""

from functools import lru_cache

from ..application.matching_service import MatchingService
from ..domain.interfaces import PersonRepository, MatchingAlgorithm
from ..infrastructure.repositories.neo4j_repository import Neo4jPersonRepository
from ..infrastructure.matching.neo4j_matcher import Neo4jMatcher
from ..infrastructure.neo4j_connection import Neo4jConnection, get_neo4j_connection


@lru_cache()
def get_neo4j_conn() -> Neo4jConnection:
    """Get the Neo4j connection instance (singleton)."""
    conn = get_neo4j_connection()
    # Initialize schema on first connection
    conn.initialize_schema()
    return conn


@lru_cache()
def get_person_repository() -> PersonRepository:
    """Get the person repository instance (singleton)."""
    return Neo4jPersonRepository(get_neo4j_conn())


@lru_cache()
def get_matching_algorithm() -> MatchingAlgorithm:
    """Get the matching algorithm instance (singleton)."""
    return Neo4jMatcher(get_neo4j_conn())


@lru_cache()
def get_matching_service() -> MatchingService:
    """Get the matching service instance (singleton)."""
    return MatchingService(
        person_repository=get_person_repository(),
        matching_algorithm=get_matching_algorithm()
    )
