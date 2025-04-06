// liquorAction.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import Constants from 'expo-constants';
import axios from 'axios';
import { getToken } from '../../utils/storage';

const apiURL = Constants.expoConfig.extra?.BACKEND_URL || 'http://192.168.0.155:5000';

export const fetchLiquors = createAsyncThunk(
  'liquor/fetchLiquors',
  async ({ search = '', category = '', sort = '' } = {}, thunkAPI) => {
    try {
      // Build query string from provided filters
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (sort) params.append('sort', sort);
      
      const url = `${apiURL}/api/liquors?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
      });
      const data = await response.json();
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

export const fetchLiquorById = createAsyncThunk(
  'liquor/fetchLiquorById',
  async (liquorId, thunkAPI) => {
    try {
      const response = await fetch(`${apiURL}/api/liquors/${liquorId}`, {
        method: 'GET',
      });
      const data = await response.json();
      console.log('Fetched liquor by ID:', data);
      if (data.success) {
        return data;
      } else {
        return thunkAPI.rejectWithValue(data.message);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const updateLiquorById = createAsyncThunk(
  'liquor/updateLiquorById',
  async ({ liquorId, updatedData, db }, thunkAPI) => {
    try {
      const token = await getToken(db);
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      console.log(`Updating liquor with ID: ${liquorId}`);
      console.log('Updated Data:', updatedData);
      const response = await axios.put(`${apiURL}/api/liquors/${liquorId}`, updatedData, config);
      console.log('Response:', response);
      if (response.data.success) {
        return response.data.data;
      } else {
        return thunkAPI.rejectWithValue(response.data.message || 'Update failed');
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const deleteLiquor = createAsyncThunk(
  'liquor/deleteLiquor',
  async ({ liquorId, db }, thunkAPI) => {
    try {
      const token = await getToken(db);
      const config = {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      const response = await axios.delete(`${apiURL}/api/liquors/${liquorId}`, config);
      if (response.data.success) {
        return liquorId;
      } else {
        return thunkAPI.rejectWithValue(response.data.message);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);


export const clearCurrentLiquor = () => ({ type: 'liquor/clearCurrentLiquor' });

