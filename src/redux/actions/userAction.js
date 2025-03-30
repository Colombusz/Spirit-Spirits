// userAction.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import Constants from 'expo-constants';
import { getUserCredentials } from '../../utils/userStorage';

const apiURL = Constants.expoConfig.extra?.BACKEND_URL || 'http://192.168.1.123:5000';

export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, thunkAPI) => {
    try {
        // sa AsyncStorage lang ako nagfetch, sa update user na lang magfetch sa backend
        const userCredentials = await getUserCredentials();
        if (!userCredentials) {
            return thunkAPI.rejectWithValue('No user credentials found');
        } else {
            console.log('User credentials:', userCredentials);
            return userCredentials;
        }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
