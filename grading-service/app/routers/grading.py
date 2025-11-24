from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
# REMOVE: , Depends
# REMOVE: from sqlmodel import Session
from app.models.essay import EssayInput, GradingStringResponse # <-- CHANGED
from app.services.ai_handler import ai_service
from app.services.formatter import format_response_to_string # <-- NEW
import re
# REMOVE: from app.models.db_models import EssaySubmission
# REMOVE: from app.core.db import get_session

router = APIRouter()

# --- ESSAY VALIDATION FUNCTION ---
def validate_essay_input(text: str) -> str | None:
    """
    Validates essay to save API costs. 
    Returns error string if invalid, None if valid.
    """
    cleaned = text.strip()
    
    # 1. EMPTY CHECK
    if not cleaned:
        return "Essay cannot be empty."

    # 2. GIBBERISH / NUMBERS CHECK
    content_only = re.sub(r'[ \n\t.,;]', '', cleaned)
    if content_only.isdigit():
        return "Essay cannot consist only of numbers."

    # 3. WORD COUNT CHECK
    words = cleaned.split()
    word_count = len(words)

    # REJECT LOGIC: < 25 words
    if word_count < 25:
        return f"Essay is too short ({word_count} words). Please write at least 25 words for a valid analysis."

    # 4. REPETITION CHECK
    if word_count > 1:
        unique_words = set([w.lower() for w in words])
        ratio = len(unique_words) / word_count
        if ratio < 0.2: 
            return "Essay contains too much repetitive content."

    return None

# --- HELPER FUNCTION TO FIND ORIGINAL SENTENCE ---
def _find_sentence_for_mistake(essay_text: str, original_substring: str) -> str:
    """
    Finds the full original sentence containing the substring.
    Treats newlines (\n) as sentence boundaries to prevent merging paragraphs.
    """
    try:
        # Escape any special regex characters in the substring
        safe_substring = re.escape(original_substring)
        
        # UPDATED REGEX EXPLAINED:
        # 1. ([^.?!\n]*? ... [^.?!\n]*) 
        #    We added \n to the exclusion set [^...]. 
        #    This means: "Look left and right, but STOP if you hit a dot, ?, !, OR a newline."
        #
        # 2. (\.|\?|!|\n|$) 
        #    The sentence ender can be punctuation, a newline, or the End of String ($).
        pattern = r"([^.?!\n]*?" + safe_substring + r"[^.?!\n]*)(\.|\?|!|\n|$)"
        
        match = re.search(pattern, essay_text, re.DOTALL | re.IGNORECASE)
        
        if match:
            # return match.group(0).strip() # group(0) is the full match
            # match.group(0) is the raw text found.
            raw_sentence = match.group(0)
            
            # CLEANUP: 
            # Replace any internal newlines/tabs with a single space.
            # This ensures the UI displays "He goes to school" 
            # instead of "He goes\nto school".
            clean_sentence = re.sub(r'\s+', ' ', raw_sentence).strip()
            return clean_sentence
        
        # Fallback if regex fails (e.g., substring is split across sentences)
        return f"...(Context not found for: '{original_substring}')..."
    except Exception:
        return f"...(Error finding context for: '{original_substring}')..."
# --- END HELPER FUNCTION ---

@router.post("/grade", response_model=GradingStringResponse) # <-- CHANGED
async def grade_essay(payload: EssayInput): # <-- REMOVED session

    # --- STEP 0: LOCAL VALIDATION (Cost: $0) ---
    # This handles the <25 words reject case immediately
    validation_error = validate_essay_input(payload.answer)
    
    if validation_error:
        return JSONResponse(
            status_code=400,
            content={
                "status": 400,
                "response": validation_error
            }
        )
    
    print(f" Processing essay... Words: {len(payload.answer.split())}")
    
    try:
        # 1. Get AI Result (this is still GradingResponse)
        ai_result = await ai_service.analyze_essay(payload.answer)
        # --- ADD THIS POST-PROCESSING STEP ---
        # If AI failed to find the sentence, find it ourselves.
        for mistake in ai_result.mistakes:
            if not mistake.full_sentence:
                print(f"!! AI missed full_sentence for '{mistake.original_text}'. Finding it...")
                mistake.full_sentence = _find_sentence_for_mistake(
                    payload.answer, 
                    mistake.original_text
                )
        # --- END POST-PROCESSING STEP ---
        
        # 2. Format to String
        display_string = format_response_to_string(ai_result)
        
        return GradingStringResponse(
            status=200, 
            response=display_string
        )
        
    except Exception as e:
        print(f"Error processing essay: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "status": 500,
                "response": "System Error: The grading service is unavailable. Please try again later."
            }
        )