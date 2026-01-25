import React from "react";
import { Box, Divider, Typography } from "@mui/material";
import ChoiceView from "./ChoiceView";
import FillView from "./FillView";
import EssayView from "./EssayView";

const Section = ({ section, onAnswerChange }) => {
  const renderQuestion = (questionObj, index) => {
    const { question } = questionObj;
    const qWithIndex = { ...question, index };

    switch (question.type) {
      case "choice":
        return <ChoiceView key={index} question={qWithIndex} onAnswerChange={onAnswerChange} />;
      case "fill":
        return <FillView key={index} question={qWithIndex} onAnswerChange={onAnswerChange} />;
      case "essay":
        return <EssayView key={index} question={qWithIndex} onAnswerChange={onAnswerChange} />;
      default:
        return (
          <Typography key={index}>
            {`Question ${index + 1}: [Unsupported type "${question.type}"]`}
          </Typography>
        );
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
      {section.title &&
        <Typography variant="h6" sx={{ mb: 2, whiteSpace: "pre-line" }}>
          {section.title}
        </Typography>
      }
      {section.image &&
        <Box
          component="img"
          src={section.image}
          sx={{
            width: '100%',
            maxWidth: 550,
            objectFit: 'contain',
            display: 'block',
            margin: '16px auto'
          }}
        />}

      {Array.isArray(section.questions) && section.questions.length > 0
        ? section.questions.map(q => renderQuestion(q, q.index))
        : <Typography>No questions available.</Typography>
      }

      <Divider sx={{ width: "100%", mb: 2 }} />
    </Box>
  );
};

export default Section;