import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLoggedIn: false
}

const UserSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setLoggedIn: (state, action) => {
            const { isLoggedIn } = action.payload;

            state.isLoggedIn = isLoggedIn;
        }
    },
})

export default UserSlice.reducer;
export const { setLoggedIn } = UserSlice.actions;
