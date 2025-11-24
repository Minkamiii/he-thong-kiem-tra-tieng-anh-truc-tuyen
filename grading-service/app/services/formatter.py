from app.models.essay import GradingResponse

def format_response_to_string(ai_response: GradingResponse) -> str:
    """
    Converts the structured AI JSON response into a single,
    human-readable string for display on a UI.
    """
    output_parts = []
    
    # 1. Add the overall comment
    output_parts.append("### Overall Comment")
    output_parts.append(ai_response.overall_comment)
    output_parts.append("\n---\n") # Markdown horizontal rule
    
    # 2. Add the mistakes
    if ai_response.mistakes:
        output_parts.append("### Detailed Feedback")
        
        for i, mistake in enumerate(ai_response.mistakes):
            output_parts.append(f"**Mistake {i + 1}: {mistake.error_type.title()}**")
            
            # Format: "Original" -> "Correction"
            output_parts.append(
                f"> **Original:** \"...{mistake.original_text}...\""
            )
            output_parts.append(
                f"> **Suggestion:** \"...{mistake.correction}...\""
            )
            
            output_parts.append(f"\n**Reason:** {mistake.explanation}")
            output_parts.append(f"\n**Original Sentence:** {mistake.full_sentence}")
            output_parts.append("\n---")
    else:
        output_parts.append("No specific mistakes found. Great job!")

    return "\n".join(output_parts)