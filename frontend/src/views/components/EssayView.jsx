import { Typography, Box, TextField } from "@mui/material";
import React, { useState } from "react";

const EssayView = ({ question, onAnswerChange }) => {
    const [essay, setEssay] = useState("");

    const handleChange = (event) => {
        const newEssay = event.target.value;
        setEssay(newEssay);
        onAnswerChange(newEssay);
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