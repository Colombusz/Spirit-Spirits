// actions/authAction.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import Constants from 'expo-constants';
import { storeToken, removeToken } from '../../utils/storage';

const apiURL = Constants.expoConfig.extra?.BACKEND_URL || 'http://192.168.1.123:5000';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password, db }, thunkAPI) => {
    try {
      const res = await fetch(`${apiURL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        // Pass the same db context from useAsyncSQLiteContext()
        await storeToken(db, data.token);
        return data.user;
      } else {
        return thunkAPI.rejectWithValue(data.message);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const signupUser = createAsyncThunk('auth/signup',
  async ({ username, firstname, lastname, email, password }, thunkAPI) => {
    try {
      const res = await fetch(`${apiURL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, firstname, lastname, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        // Optionally, you can auto-login the user here by returning data.user
        return data.user;
      } else {
        return thunkAPI.rejectWithValue(data.message);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    await removeToken();
    return;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// New thunk for Google Login using token storage
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async ({ firebaseIdToken, db }, thunkAPI) => {
    try {
      const res = await fetch(`${apiURL}/api/auth/googlelogin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseIdToken }),
      });
      const data = await res.json();
      if (data.success) {
        // Store only the token locally 
        await storeToken(db, data.token);
        console.log('Google login successful:', data.user);
        return data.user;
      } else {
        return thunkAPI.rejectWithValue(data.message);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
