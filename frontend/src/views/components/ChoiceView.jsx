import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  FormHelperText,
  Checkbox,
  FormControl,
  FormGroup,
} from "@mui/material";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import { useDispatch, useSelector } from "react-redux";
import { saveAnswer } from "../states/TestSlice";


const toNumberArray = (v) => {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(Number).filter((x) => !isNaN(x));
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.map(Number).filter((x) => !isNaN(x));
      const n = Number(v);
      if (!isNaN(n)) return [n];
    } catch {}
  }
  if (typeof v === "number") return [v];
  return [];
};

const ChoiceView = ({ question }) => {
  const dispatch = useDispatch();
  const questionId = question?._id ?? `q-${question?.index}`;

  // Get stored answer from Redux
  const rawStored = useSelector((s) => s.test.answers?.[questionId]);
  const stored = useMemo(() => toNumberArray(rawStored), [rawStored]);

  const [selectedAnswers, setSelectedAnswers] = useState(stored);

  useEffect(() => {
    if (JSON.stringify(stored) !== JSON.stringify(selectedAnswers)) {
      setSelectedAnswers(stored);
    }
  }, [stored]);

  const requiredSelections =
    Array.isArray(question?.keys) ? question.keys.length :
    typeof question?.keys === "number" ? question.keys : 1;

  // Handle checkbox toggle
  const handleToggle = useCallback(
    (idx) => {
        let next;

        if (requiredSelections === 1) {
          next = selectedAnswers.includes(idx) ? [] : [idx];
        } else if (selectedAnswers.includes(idx)) {
          next = selectedAnswers.filter((i) => i !== idx);
        } else if (selectedAnswers.length < requiredSelections) {
          next = [...selectedAnswers, idx];
        } else {
          next = [...selectedAnswers.slice(1), idx];
        }

        // Update local state
        setSelectedAnswers(next);
        dispatch(saveAnswer({ id_question: questionId, answer: next }));
      },
      [selectedAnswers, requiredSelections, dispatch, questionId]
  );

  const choices = Array.isArray(question?.choices) ? question.choices : [];

  return (
    <Box sx={{ mb: 2, textAlign: "left" }}>
      <Typography variant="body1" mb={1}>
        {`${question.index + 1}. ${question.question ?? ""}`}
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
      <FormControl component="fieldset">
        <FormGroup>
          {choices.map((choice, idx) => (
            <FormControlLabel
              key={idx}
              control={
                <Checkbox
                  checked={selectedAnswers.includes(idx)}
                  onChange={() => handleToggle(idx)}
                  icon={<RadioButtonUncheckedIcon />}
                  checkedIcon={<RadioButtonCheckedIcon />}
                />
              }
              label={choice.text ?? choice}
              sx={{ display: "block" }}
            />
          ))}
        </FormGroup>
        <FormHelperText>
          {`Select ${requiredSelections} answer${requiredSelections > 1 ? "s" : ""}`}
        </FormHelperText>
      </FormControl>
    </Box>
  );
};

export default ChoiceView;