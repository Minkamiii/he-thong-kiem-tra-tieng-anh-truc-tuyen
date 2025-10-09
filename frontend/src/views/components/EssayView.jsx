import { Typography, Box, TextField } from "@mui/material";
import React, { useState, useEffect } from "react";

const EssayView = ({ question, onAnswerChange }) => {
    const [essay, setEssay] = useState("");

    // Persist essay across re-renders
    useEffect(() => {
        if (question?.index !== undefined) {
            onAnswerChange(question.index, essay);
        }
    }, [question.index, onAnswerChange, essay]);

    const handleChange = (event) => {
        const newEssay = event.target.value;
        setEssay(newEssay);
        
        // Log word count for monitoring
        const wordCount = newEssay.trim().split(/\s+/).filter(Boolean).length;
        console.log('Word count:', wordCount);
    }

    return (
        <Box sx={{mb:3}}>
            <Typography variant="body1" gutterBottom>{question.question}</Typography>
            <TextField 
                fullWidth
                multiline
                rows={32}
                value={essay}
                onChange={handleChange}
                variant="outlined"
                placeholder="Write your answer here..."
                sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#f5f5f5' },
                    '& .MuiInputBase-input': { fontFamily: 'Arial, sans-serif', fontSize: '1rem', lineHeight: '1.5' },
                }}
            />
            {/* Word count */}
            <Typography variant="caption" display="block" align="right" sx={{ mt: 1, color: 'text.secondary' }}>
                {`Word count: ${essay.trim() ? essay.trim().split(/\s+/).filter(Boolean).length : 0}`}
            </Typography>
        </Box>
    );
}

export default EssayView;