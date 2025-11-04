"""
API routes for finding and retrieving matches.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ...application.matching_service import MatchingService
from ...domain.models import MatchResult, Circle, PreferenceLevel
from ..schemas import MatchResultSchema, CircleSchema, CirclePersonSchema, PersonSchema
from ..dependencies import get_matching_service
from .people import domain_person_to_schema

router = APIRouter()


def domain_circle_to_schema(circle: Circle) -> CircleSchema:
    """Convert domain Circle to API schema."""
    circle_people = []

    for i, person in enumerate(circle.people):
        next_person = circle.get_next_person(person)
        pref_level = circle.preference_levels.get(person.name, PreferenceLevel.FIRST)

        circle_people.append(CirclePersonSchema(
            person=domain_person_to_schema(person),
            preference_level=pref_level.value,
            gets_spot_from=next_person.name
        ))

    return CircleSchema(
        size=circle.size,
        people=circle_people,
        is_first_choice_only=circle.is_first_choice_only,
        is_second_choice_only=circle.is_second_choice_only
    )


def domain_match_result_to_schema(result: MatchResult) -> MatchResultSchema:
    """Convert domain MatchResult to API schema."""
    return MatchResultSchema(
        circles=[domain_circle_to_schema(c) for c in result.circles],
        unmatched_people=[domain_person_to_schema(p) for p in result.unmatched_people],
        total_people=result.total_people,
        total_matched=result.total_matched,
        match_rate=result.match_rate,
        first_choice_count=result.first_choice_count,
        second_choice_count=result.second_choice_count,
        average_circle_size=result.average_circle_size,
        circle_sizes=result.circle_sizes
    )


@router.post("/matches", response_model=MatchResultSchema)
def find_matches(
    service: MatchingService = Depends(get_matching_service)
):
    """
    Run the matching algorithm to find all circular matches.

    This endpoint:
    1. Loads all people from the system
    2. Runs the circular matching algorithm
    3. Returns all circles found, unmatched people, and statistics

    The algorithm prioritizes:
    - Smaller circles (to minimize risk if someone backs out)
    - First choice preferences over second choice
    """
    result = service.find_matches(use_cache=False)
    return domain_match_result_to_schema(result)


@router.get("/matches", response_model=MatchResultSchema)
def get_cached_matches(
    service: MatchingService = Depends(get_matching_service)
):
    """
    Get the most recent matching results (from cache).

    Returns the last computed matching results without re-running the algorithm.
    If no matches have been computed yet, returns a 404.
    """
    result = service.get_cached_matches()
    if not result:
        raise HTTPException(
            status_code=404,
            detail="No matches found. Run POST /api/matches first."
        )

    return domain_match_result_to_schema(result)
