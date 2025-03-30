// liquorAction.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import Constants from 'expo-constants';

const apiURL = Constants.expoConfig.extra?.BACKEND_URL || 'http://192.168.1.123:5000';

export const fetchLiquors = createAsyncThunk(
  'liquor/fetchLiquors',
  async (_, thunkAPI) => {
    try {
      const response = await fetch(`${apiURL}/api/liquors`, {
        method: 'GET',
      });
      const data = await response.json();
      if (data.success) {
        return data.data; // assuming the liquors are in data.data
      } else {
        return thunkAPI.rejectWithValue(data.message);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
