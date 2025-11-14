# YOUR SPECIFICATION: The System Prompt
def get_ielts_grader_prompt(essay_text: str, question_text: str):
    return f"""
    Act as a strict IELTS Examiner. Analyze the essay below.
    
    Rules:
    1. Identify mistakes in spelling, grammar, and word collocation.
    2. Check if the content matches the prompt (Off-topic detection).
    3. Return the result strictly in JSON format.

    Prompt: {question_text}
    Essay: {essay_text}
    """