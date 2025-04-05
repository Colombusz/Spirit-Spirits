import { createAsyncThunk } from '@reduxjs/toolkit';
import Constants from 'expo-constants';

const apiURL = Constants.expoConfig.extra?.BACKEND_URL || 'http://192.168.1.123:5000';

// Create a new review
export const createReview = createAsyncThunk(
  'review/createReview',
  async ({ reviewDetails }, thunkAPI) => {
    try {
      console.log('Creating review:', reviewDetails);
      const res = await fetch(`${apiURL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewDetails),
      });
      const data = await res.json();
      if (data.success) {
        return data.data;
      } else {
        return thunkAPI.rejectWithValue(data.message);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Update an existing review
export const updateReview = createAsyncThunk(
  'review/updateReview',
  async ({ reviewId, reviewDetails }, thunkAPI) => {
    try {
      const res = await fetch(`${apiURL}/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewDetails),
      });
      const data = await res.json();
      if (data.success) {
        return data.data;
      } else {
        return thunkAPI.rejectWithValue(data.message);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
