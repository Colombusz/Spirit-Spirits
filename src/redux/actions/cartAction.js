// redux/actions/cartAction.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { addCartItem } from '../../utils/storage';

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ db, userId, liquor }, thunkAPI) => {
    try {
      const quantity = 1;
      // Insert cart item into SQLite
      await addCartItem(db, {
        user_id: userId,
        productId: liquor._id,
        name: liquor.name,
        quantity,
        price: liquor.price,
      });

      console.log('Cart item added successfully:', {
        userId,
        liquor,
        quantity,
      });
      // Return details to update Redux state
      return { userId, liquor, quantity };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
