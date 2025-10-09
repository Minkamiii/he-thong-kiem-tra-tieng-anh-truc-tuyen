import { Box, Typography, TextField } from "@mui/material";
import React, { useState, useEffect } from "react";

const FillView = ({ question, onAnswerChange }) => {
    const [answer, setAnswer] = useState("");

    useEffect(() => {
        if (question?.index !== undefined) {
            onAnswerChange(question.index, answer);
        }
    }, [question.index, onAnswerChange, answer]);

    const handleChange = (event) => {
        const newAnswer = event.target.value;
        setAnswer(newAnswer);
    }

    const handleBlur = () => {
        if (question?.index !== undefined) {
            onAnswerChange(question.index, answer);
            console.log('Answer saved on blur:', answer);
        }
    }

    return (
        <Box sx={{mb:2, display: 'flex', flexDirection: 'row'}}>
            <Typography variant="body1" mb={1} mr={2}>
                {`${question.index + 1}. ${question.question}`}
            </Typography>
            <TextField
                fullWidth
                size="small"
                value={answer}
                onChange={handleChange}
                onBlur={handleBlur}
                variant="outlined"
                sx={{
                    maxWidth: '300px',
                    '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#f5f5f5' },
                }}
            />
        </Box>
    );
}

export default FillView;