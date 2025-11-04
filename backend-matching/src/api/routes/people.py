"""
API routes for managing people.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from ...application.matching_service import MatchingService
from ...domain.models import Person, Practice
from ..schemas import PersonCreateSchema, PersonSchema, MessageSchema
from ..dependencies import get_matching_service
import uuid

router = APIRouter()


def domain_person_to_schema(person: Person) -> PersonSchema:
    """Convert domain Person to API schema."""
    return PersonSchema(
        id=person.id,
        name=person.name,
        current_practice={
            "name": person.current_practice.name,
            "location": person.current_practice.location
        },
        desired_practice_first={
            "name": person.desired_practice_first.name,
            "location": person.desired_practice_first.location
        },
        desired_practice_second={
            "name": person.desired_practice_second.name,
            "location": person.desired_practice_second.location
        } if person.desired_practice_second else None
    )


@router.post("/people", response_model=PersonSchema, status_code=status.HTTP_201_CREATED)
def create_person(
    person_data: PersonCreateSchema,
    service: MatchingService = Depends(get_matching_service)
):
    """
    Add a new person to the matching system.

    This endpoint allows adding a new person with their current practice
    and desired practices (first and optionally second choice).
    """
    # Create domain Person object
    person = Person(
        id=str(uuid.uuid4()),
        name=person_data.name,
        current_practice=Practice(
            name=person_data.current_practice_name,
            location=person_data.current_location
        ),
        desired_practice_first=Practice(
            name=person_data.desired_practice_first,
            location=person_data.desired_location_first
        ),
        desired_practice_second=Practice(
            name=person_data.desired_practice_second,
            location=person_data.desired_location_second
        ) if person_data.desired_practice_second else None
    )

    try:
        service.add_person(person)
        return domain_person_to_schema(person)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/people/{person_id}", response_model=PersonSchema)
def get_person(
    person_id: str,
    service: MatchingService = Depends(get_matching_service)
):
    """
    Get a specific person by ID.

    Returns the person's current and desired practices.
    """
    person = service.get_person(person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    return domain_person_to_schema(person)
