from pydantic import BaseModel, Field
from typing import List, Optional

# YOUR SPECIFICATION: Input Data
class EssayInput(BaseModel):
    text: str = Field(..., min_length=50, description="The student's essay")
    prompt: str = Field(..., description="The IELTS writing topic")
    target_band: Optional[float] = 6.5

# YOUR SPECIFICATION: Output Data
class MistakeDetail(BaseModel):
    original_text: str
    correction: str
    error_type: str # e.g., "spelling", "collocation"
    explanation: str

class GradingResponse(BaseModel):
    mistakes: List[MistakeDetail]
    overall_comment: str