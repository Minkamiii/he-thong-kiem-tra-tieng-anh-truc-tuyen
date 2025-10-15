import { Typography, Box, TextField } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveAnswer } from "../states/TestSlice";

const EssayView = ({ question, onAnswerChange }) => {
    const dispatch = useDispatch();
    const [essay, setEssay] = useState("");

    const storedEssay = useSelector(
        (state) => state.test.answers[question._id] || ""
    );

    useEffect(() => {
        if (storedEssay !== essay) setEssay(storedEssay);
    }, [storedEssay]);

    const handleChange = (event) => {
        const value = event.target.value;
        setEssay(value);
        dispatch(saveAnswer({ id_question: question._id, answer: value }));
    };

    const handleBlur = () => {
        if (question?.index !== undefined) {
            onAnswerChange(question.index, essay);
        }
    }

    return (
        <Box sx={{mb:3, width: '100%'}}>
            <TextField 
                multiline
                rows={14}
                value={essay}
                onChange={handleChange}
                onBlur={handleBlur}
                variant="outlined"
                placeholder="Write your answer here..."
                sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#f5f5f5' },
                    '& .MuiInputBase-input': { fontFamily: 'Arial, sans-serif', fontSize: '1rem', lineHeight: '1.5' },
                    width: '100%'
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