# from fastapi import APIRouter, HTTPException
# from app.models.essay import EssayInput, GradingResponse
# from app.services.ai_handler import ai_service # Import the AI service

# router = APIRouter()

# @router.post("/grade", response_model=GradingResponse)
# async def grade_essay(payload: EssayInput):
#     # Log to the console so you can see it working in Docker logs
#     print(f"Sending essay to Google AI... Length: {len(payload.text)}")
    
#     try:
#         # This calls the function in ai_handler.py
#         result = await ai_service.analyze_essay(payload.text, payload.prompt)
#         return result
#     except Exception as e:
#         print(f"Error processing essay: {e}")
#         raise HTTPException(status_code=500, detail="AI processing failed")

from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session
from app.models.essay import EssayInput, GradingResponse
from app.services.ai_handler import ai_service
from app.models.db_models import EssaySubmission
from app.core.db import get_session # Dependency injection

router = APIRouter()

@router.post("/grade", response_model=GradingResponse)
async def grade_essay(
    payload: EssayInput, 
    session: Session = Depends(get_session) # Inject DB session
):
    print(f"Sending essay to Google AI... Length: {len(payload.text)}")
    
    try:
        # 1. Get AI Result
        result = await ai_service.analyze_essay(payload.text, payload.prompt)
        
        # 2. Save to Database
        submission = EssaySubmission(
            prompt=payload.prompt,
            original_text=payload.text,
            ai_result=result.model_dump() # Convert Pydantic model to JSON dict
        )
        
        session.add(submission)
        session.commit()
        session.refresh(submission)
        
        print(f"✅ Saved to DB with ID: {submission.id}")
        
        return result
        
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Processing failed")