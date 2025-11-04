"""
Pydantic schemas for API request/response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional, List


class PracticeSchema(BaseModel):
    """Schema for a huisarts practice."""
    name: str
    location: str


class PersonCreateSchema(BaseModel):
    """Schema for creating a new person."""
    name: str = Field(..., description="Full name of the person")
    current_practice_name: str = Field(..., description="Name of current huisarts practice")
    current_location: str = Field(..., description="Current location/city")
    desired_practice_first: str = Field(..., description="First choice desired practice name")
    desired_location_first: str = Field(..., description="First choice desired location")
    desired_practice_second: Optional[str] = Field(None, description="Second choice desired practice name")
    desired_location_second: Optional[str] = Field(None, description="Second choice desired location")


class PersonSchema(BaseModel):
    """Schema for a person in the system."""
    id: str
    name: str
    current_practice: PracticeSchema
    desired_practice_first: PracticeSchema
    desired_practice_second: Optional[PracticeSchema] = None

    class Config:
        from_attributes = True


class CirclePersonSchema(BaseModel):
    """Person within a circle, with their next person in the swap."""
    person: PersonSchema
    preference_level: int  # 1 or 2
    gets_spot_from: str  # Name of next person


class CircleSchema(BaseModel):
    """Schema for a circular match."""
    size: int
    people: List[CirclePersonSchema]
    is_first_choice_only: bool
    is_second_choice_only: bool


class MatchResultSchema(BaseModel):
    """Schema for match results."""
    circles: List[CircleSchema]
    unmatched_people: List[PersonSchema]
    total_people: int
    total_matched: int
    match_rate: float
    first_choice_count: int
    second_choice_count: int
    average_circle_size: float
    circle_sizes: List[int]


class StatisticsSchema(BaseModel):
    """Summary statistics."""
    total_people: int
    total_matched: int
    total_unmatched: int
    match_rate: float
    first_choice_count: int
    first_choice_rate: float
    second_choice_count: int
    second_choice_rate: float
    number_of_circles: int
    circle_sizes: List[int]
    average_circle_size: float


class MessageSchema(BaseModel):
    """Generic message response."""
    message: str
