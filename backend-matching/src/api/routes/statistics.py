"""
API routes for statistics.
"""

from fastapi import APIRouter, Depends, HTTPException
from ...application.matching_service import MatchingService
from ..schemas import StatisticsSchema
from ..dependencies import get_matching_service

router = APIRouter()


@router.get("/statistics", response_model=StatisticsSchema)
def get_statistics(
    service: MatchingService = Depends(get_matching_service)
):
    """
    Get summary statistics about the matching results.

    Returns:
    - Total people, matched, unmatched
    - Match rates
    - Preference fulfillment statistics
    - Circle size distribution
    """
    result = service.get_cached_matches()
    if not result:
        raise HTTPException(
            status_code=404,
            detail="No matches found. Run POST /api/matches first."
        )

    total_people = result.total_people
    first_choice_rate = (result.first_choice_count / total_people * 100) if total_people > 0 else 0
    second_choice_rate = (result.second_choice_count / total_people * 100) if total_people > 0 else 0

    return StatisticsSchema(
        total_people=result.total_people,
        total_matched=result.total_matched,
        total_unmatched=len(result.unmatched_people),
        match_rate=result.match_rate,
        first_choice_count=result.first_choice_count,
        first_choice_rate=first_choice_rate,
        second_choice_count=result.second_choice_count,
        second_choice_rate=second_choice_rate,
        number_of_circles=len(result.circles),
        circle_sizes=result.circle_sizes,
        average_circle_size=result.average_circle_size
    )
