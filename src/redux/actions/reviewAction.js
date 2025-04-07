import { createAsyncThunk } from '@reduxjs/toolkit';
import Constants from 'expo-constants';
import axios from 'axios';
import { getToken } from '../../utils/storage';

const apiURL = Constants.expoConfig.extra?.BACKEND_URL || 'http://192.168.1.123:5000';

export const createReview = createAsyncThunk(
  'review/createReview',
  async ({ reviewDetails, db }, thunkAPI) => {
    try {
      console.log('Creating review:', reviewDetails);
      const token = await getToken(db);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };
      const response = await axios.post(`${apiURL}/api/reviews`, reviewDetails, config);
      // axios response data is in response.data
      if (response.data.success) {
        return response.data.data;
      } else {
        return thunkAPI.rejectWithValue(response.data.message);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const updateReview = createAsyncThunk(
  'review/updateReview',
  async ({ reviewId, reviewDetails, db }, thunkAPI) => {
    try {
      const token = await getToken(db);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };
      const response = await axios.put(`${apiURL}/api/reviews/${reviewId}`, reviewDetails, config);
      if (response.data.success) {
        return response.data.data;
      } else {
        return thunkAPI.rejectWithValue(response.data.message);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
