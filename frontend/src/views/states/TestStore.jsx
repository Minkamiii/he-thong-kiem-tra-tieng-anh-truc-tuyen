import { configureStore } from '@reduxjs/toolkit';
import testReducer from './TestSlice.jsx';

const TestStore = configureStore({
    reducer: {
        test: testReducer,
    },
});


export { TestStore };
