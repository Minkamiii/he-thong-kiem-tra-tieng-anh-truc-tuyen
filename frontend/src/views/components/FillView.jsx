import { Box, Typography, TextField } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveAnswer } from "../states/TestSlice";

const FillView = ({ question }) => {
  const dispatch = useDispatch();
  const storedAnswer = useSelector(
    (state) => state.test.answers[question._id] || ""
  );

  const [answer, setAnswer] = useState(storedAnswer);

  
  useEffect(() => {
    if (storedAnswer !== answer) setAnswer(storedAnswer);
  }, [storedAnswer]);

  
  const handleChange = (event) => {
    const value = event.target.value;
    setAnswer(value);
    dispatch(saveAnswer({ id_question: question._id, answer: value }));
  };

  return (
    <Box sx={{ mb: 2, textAlign: "left", width: "100%" }}>
      <Typography variant="body1" sx={{ mb: 1 }}>
        {`${question.index + 1}. ${question.question}`}
      </Typography>
      {question?.image && <Box 
        component='img'
        src={question.image}
        sx={{
          width: 60,
          height: 60,
          objectFit: 'cover',
          alignSelf: 'center',
          justifySelf: 'center'
        }}
      />}
      <TextField
        fullWidth
        size="small"
        value={answer}
        onChange={handleChange}
        variant="outlined"
        sx={{
          maxWidth: "400px",
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            backgroundColor: "#f5f5f5",
          },
        }}
      />
    </Box>
  );
};

export default FillView;