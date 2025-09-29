import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    testId: null,
    testName: '',
    testType: '',
    testTasks: [],
};

const TestSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    setTest: (state, action) => {
      const { _id, testName, testType, testTasks } = action.payload;
      state._id = _id;
      state.testName = testName;
      state.testType = testType;
      state.testTasks = testTasks;
    },
  },
});

export const { setTest } = TestSlice.actions;

export default TestSlice.reducer;