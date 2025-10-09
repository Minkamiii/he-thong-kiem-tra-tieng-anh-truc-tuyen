import React, { useEffect, useState } from 'react';
import { Box, Typography, FormControlLabel, FormHelperText, Checkbox, FormControl, FormGroup } from '@mui/material';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';

const ChoiceView = ({ question, onAnswerChange }) => {
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const requiredSelections = question.keys?.length || 1; // Default to 1 if keys is undefined
    
    // Persist selection across re-renders
    useEffect(() => {
        if (question?.index !== undefined) {
            onAnswerChange(question.index, selectedAnswers);
        }
    }, [question.index, onAnswerChange, selectedAnswers]);

    const handleChange = (choice) => {
        setSelectedAnswers((prev) => {
            const newAnswers = prev.includes(choice)
                ? prev.filter((item) => item !== choice)
                : prev.length >= requiredSelections
                    ? [...prev.slice(1), choice]
                    : [...prev, choice];

            // Check correctness
            const isCorrect = question.keys?.every(key => 
                newAnswers.includes(key)) 
                && newAnswers.length === question.keys.length;
            console.log('Selected answers:', newAnswers, 'Is correct:', isCorrect);
            // Notify parent component of answer change
                    
            onAnswerChange(newAnswers);

            return newAnswers;
        });
    }
    
    return (
        <Box sx={{ mb: 2, display: 'block'}}>
            <Typography variant="body1" mb={1} mr={2}>
                {`${question.index + 1}. ${question.question}`}
            </Typography>
            <FormControl component="fieldset">
                <FormGroup>
                    {question.choices?.map((choice, index) => (
                        <FormControlLabel
                            key={index}
                            control={
                                <Checkbox
                                    checked={selectedAnswers.includes(index)}
                                    onChange={() => handleChange(index)}
                                    //disabled={!selectedAnswers.includes(choice) && selectedAnswers.length >= requiredSelections}
                                    icon={<RadioButtonUncheckedIcon />}
                                    checkedIcon={<RadioButtonCheckedIcon />}
                                    sx={{
                                        '&:hover': { bgcolor: 'transparent' },
                                        '&.Mui-checked': { color: 'primary.main' },
                                    }}
                                />
                            }
                            label={choice.text}
                            sx={{
                                display: 'block',
                                //mb: 1,
                                cursor: 'pointer',
                            }}
                        />
                    ))}
                </FormGroup>
                <FormHelperText>{`Select ${requiredSelections > 1 ? 's' : ''} answers`}</FormHelperText>
            </FormControl>
        </Box>
    );
}
export default ChoiceView;