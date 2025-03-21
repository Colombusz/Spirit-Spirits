import { createAsyncThunk, createSlice, configureStore } from "@reduxjs/toolkit";

import axios from "axios";

const initialState = {
    user: {},
    role: "",
    loading: false,
    error: null,
    };

const loginSlice = createSlice({
    name: "login",
    initialState,
    reducers: {
        setUser: (  state, action) => {
            state.user = action.payload;
            role = "test";
        }
    },
});


export const { setUser } = loginSlice.actions;
export default loginSlice.reducer;
