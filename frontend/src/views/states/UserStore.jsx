import userReducer from './UserSlice.jsx';
import { configureStore } from '@reduxjs/toolkit';

const UserStore = configureStore({
    reducer: {
        user: userReducer,
    },
});

export { UserStore };