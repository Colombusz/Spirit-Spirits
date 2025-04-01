// redux/reducers/cartReducer.js
import { createSlice } from '@reduxjs/toolkit';
import { addToCart } from '../actions/cartAction';

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new cart item into the state
        state.items.push({
          productId: action.payload.liquor._id,
          name: action.payload.liquor.name,
          quantity: action.payload.quantity,
          price: action.payload.liquor.price,
        });
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
