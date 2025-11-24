# YOUR SPECIFICATION: The System Prompt
def get_ielts_grader_prompt(essay_text: str):
    return f"""
    Act as a strict IELTS Examiner. Analyze the essay below.
    
    Rules:
    1. Identify mistakes in spelling, grammar, and word collocation.
    2. Return the result strictly in JSON format.

    Essay: {essay_text}
    """