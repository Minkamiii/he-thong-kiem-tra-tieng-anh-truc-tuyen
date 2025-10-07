import { Box, Typography, TextField } from "@mui/material";
import React, { useState } from "react";

const FillView = ({ question, onAnswerChange }) => {
    const [answer, setAnswer] = useState("");

    const handleChange = (event) => {
        const newAnswer = event.target.value;
        setAnswer(newAnswer);
        onAnswerChange(newAnswer);
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