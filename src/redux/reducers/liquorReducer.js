// liquorReducer.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchLiquors } from '../actions/liquorAction';

const initialState = {
  liquors: [],
  loading: false,
  error: null,
};

const liquorSlice = createSlice({
  name: 'liquor',
  initialState,
  reducers: {
    // You can add manual reducers here if needed
  },
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export default liquorSlice.reducer;
