from google import genai
from google.genai import types
import json
import asyncio # <--- ADD THIS
from app.core.config import settings
from app.models.essay import GradingResponse

class AIHandler:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        self.model_id = "gemini-2.5-flash" 

    async def analyze_essay(self, essay_text: str) -> GradingResponse:
        
        system_instruction = """
        You are an expert English Proofreader. Analyze the provided text.
        
        YOUR TASKS:
        1. Detect mistakes in spelling, grammar, punctuation, and word collocation.
        2. Ignore "Task Response" or "Coherence" scoring, BUT:
           - If the text is very short (under 150 words), mention in the 'overall_comment' that it is too short for a standard IELTS Task 1/2, but proceed with grammar checking anyway.
        
        OUTPUT FORMAT:
        Return a JSON object with this exact structure:
        {
            "mistakes": [
                {
                    "original_text": "substring from text",
                    "correction": "suggested fix",
                    "error_type": "grammar/spelling/collocation",
                    "explanation": "brief reason",
                    "full_sentence": "The complete sentence where the error was found."
                }
            ],
            "overall_comment": "A 2-sentence summary. Mention word count issues if relevant."
        }
        """
        
        full_prompt = f"{system_instruction}\n\nESSAY: {essay_text}"

        # --- RETRY LOGIC STARTS HERE ---
        max_retries = 3
        base_delay = 2  # Start waiting 2 seconds

        for attempt in range(max_retries):
            try:
                print(f"...Attempt {attempt + 1} sending to Google AI...")
                
                response = self.client.models.generate_content(
                    model=self.model_id,
                    contents=full_prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json", 
                        temperature=0.1
                    )
                )

                raw_json = response.text
                data = json.loads(raw_json)
                return GradingResponse(**data)

            except Exception as e:
                error_msg = str(e)
                
                # Check if it's a 503 Overloaded error
                if "503" in error_msg or "overloaded" in error_msg.lower():
                    if attempt < max_retries - 1:
                        wait_time = base_delay * (2 ** attempt) # Exponential backoff: 2s, 4s, 8s...
                        print(f"!! Model overloaded. Retrying in {wait_time} seconds...")
                        await asyncio.sleep(wait_time)
                        continue # Jump back to start of loop
                
                # If it's not 503, or we ran out of retries, return the error
                print(f"Failed after {attempt + 1} attempts: {error_msg}")
                return GradingResponse(
                    mistakes=[], 
                    overall_comment=f"Service Error: The AI model is currently overloaded. Please try again in a minute. (Details: {error_msg})"
                )
        # --- RETRY LOGIC ENDS HERE ---
        
        return GradingResponse(mistakes=[], overall_comment="Unknown error occurred.")

ai_service = AIHandler()