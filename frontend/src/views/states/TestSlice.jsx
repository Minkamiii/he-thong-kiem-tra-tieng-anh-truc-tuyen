import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    _id: null,
    testName: '',
    testType: '',
    testTasks: [],
    answers: {}
};

const TestSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    setTest: (state, action) => {

      const { _id, testName, testType, testTasks } = action.payload;

      state._id= _id;
      state.testName = testName;
      state.testType = testType;
      state.testTasks = testTasks;

    },

    setTaskAndAnswers: (state, action) => {
      const {answers, testTasks} = action.payload;

      state.answers = answers;
      state.testTasks = testTasks;
    },

    saveAnswer: (state, action) => {
      const { id_question, answer } = action.payload;
      state.answers[id_question] = answer;
    },

    resetTest: (state) => Object.assign(state, initialState),
    resetAnswer: (state) => { state.answers = {}; },
  },
});

export default TestSlice.reducer;

export const { setTest, saveAnswer, resetAnswer, resetTest, setTaskAndAnswers } = TestSlice.actions;