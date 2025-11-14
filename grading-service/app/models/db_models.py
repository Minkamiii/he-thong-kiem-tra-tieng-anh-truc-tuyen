from sqlmodel import SQLModel, Field, JSON
from typing import Optional, List, Dict
from datetime import datetime, timezone
from sqlalchemy import Column

class EssaySubmission(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    prompt: str
    original_text: str
    
    # We store the specific AI feedback as a JSON object
    ai_result: Dict = Field(default={}, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))