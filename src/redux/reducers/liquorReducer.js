// liquorReducer.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchLiquors, fetchLiquorById } from '../actions/liquorAction';

const initialState = {
  liquors: [],
  currentLiquor: null,
  loading: false,
  error: null,
};

const liquorSlice = createSlice({
  name: 'liquor',
  initialState,
  reducers: {
    clearCurrentLiquor: (state) => {
      state.currentLiquor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // For the list of liquors
      .addCase(fetchLiquors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLiquors.fulfilled, (state, action) => {
        state.loading = false;
        state.liquors = action.payload;
      })
      .addCase(fetchLiquors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // For fetching liquor details by ID
      .addCase(fetchLiquorById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentLiquor = null;
      })
      .addCase(fetchLiquorById.fulfilled, (state, action) => {
        state.loading = false;
        // Expecting action.payload to include liquor details (e.g., in action.payload.data)
        state.currentLiquor = action.payload.data;
      })
      .addCase(fetchLiquorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentLiquor } = liquorSlice.actions;
export default liquorSlice.reducer;
