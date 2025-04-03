// userAction.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import Constants from 'expo-constants';
import { getUserCredentials, storeUserCredentials } from '../../utils/userStorage';

const apiURL = Constants.expoConfig.extra?.BACKEND_URL || 'http://192.168.1.123:5000';

export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, thunkAPI) => {
    try {
        // sa AsyncStorage lang ako nagfetch, sa update user na lang magfetch sa backend tapos update sa local storage
        // sa sqlite lang ung tokens, user credentials sa async storage
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

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async ({ user }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append('userId', user._id || user.id);
      formData.append('username', user.username);
      formData.append('firstname', user.firstname);
      formData.append('lastname', user.lastname);
      formData.append('email', user.email);
      if (user.address) {
        formData.append('address', JSON.stringify(user.address));
      }
      if (user.phone) {
        formData.append('phone', user.phone);
      }

      const res = await fetch(`${apiURL}/api/auth/update-profile`, {
        method: 'PUT',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        // Update AsyncStorage with the new user data
        await storeUserCredentials(data.user);
        return data.user;
      } else {
        return thunkAPI.rejectWithValue(data.message);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);



