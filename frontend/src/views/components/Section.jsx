import React from "react";
import { Box, Divider, Typography } from "@mui/material";

import ChoiceView from "./ChoiceView";
import FillView from "./FillView";
import EssayView from "./EssayView";

const Section = ({ section }) => {
    const handleAnswerChange = (answer) => {
        // Handle answer change logic here, e.g., update state or send to parent component
        console.log('Answer changed:', answer);
    }

    const renderQuestion = (questionObj) => {
        const question = questionObj.question;
        const QuestionWrapper = ({ children }) => (
            <Box data-question-index={questionObj.index}>{children}</Box>
        );

        switch (question.type) {
            case 'choice':
                return (
                    <QuestionWrapper>
                        <ChoiceView 
                            question={{...question, index: questionObj.index}} 
                            onAnswerChange={handleAnswerChange} 
                            key={questionObj.index} 
                        />;
                    </QuestionWrapper>
                );
                    
            case 'fill':
                return (
                    <QuestionWrapper>
                        <FillView 
                            question={{...question, index: questionObj.index}} 
                            onAnswerChange={handleAnswerChange} 
                            key={questionObj.index} 
                        />
                    </QuestionWrapper> 
                );
            case 'essay':
                return (
                    <QuestionWrapper>
                        <EssayView 
                            question={{...question, index: questionObj.index}} 
                            onAnswerChange={handleAnswerChange} 
                            key={questionObj.index} 
                        />
                    </QuestionWrapper> 
                );
                    
            default:
                return (
                    <Typography key={questionObj.index} sx={{mb:2}}>
                        {`Question ${questionObj.index + 1}: [Unsupported question type "${question.type}"]`}
                    </Typography>
                );
        }
    }

    return (
        <Box 
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
            }}
        >
            {/* Title */}
            <Typography variant="h6" sx={{ mb: 2 }}>{section.title}</Typography>
            
            {/* Questions */}
            {Array.isArray(section.questions) && section.questions.length > 0 
                ? section.questions.map((questionObj) => 
                    renderQuestion(questionObj)
                ) : (
                <Typography>No questions available for this section.</Typography>
            )}

            {/* Divider */}
            <Divider sx={{width: '100%', mb:2}}/>
        </Box>
    );
}

export default Section;