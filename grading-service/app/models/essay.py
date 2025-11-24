from pydantic import BaseModel, Field
from typing import List, Optional

class EssayInput(BaseModel):
    # We keep this without min_length so the router can handle the error manually
    answer: str = Field(..., description="The student's essay")

class MistakeDetail(BaseModel):
    original_text: str
    correction: str
    error_type: str
    explanation: str
    full_sentence: Optional[str] = Field(None, description="The original sentence containing the error")

class GradingResponse(BaseModel):
    mistakes: List[MistakeDetail]
    overall_comment: str

# UPDATED: Standardized response structure
class GradingStringResponse(BaseModel):
    status: int = Field(..., description="HTTP status code")
    response: str = Field(..., description="The formatted grading result or error message")