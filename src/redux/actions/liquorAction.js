// liquorAction.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import Constants from 'expo-constants';
import axios from 'axios';

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
       
        return data.data; // assuming the liquors are in data.data
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
  async ({ liquorId, updatedData }, thunkAPI) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data', // for file uploads
        },
        timeout: 15000,
      };

      console.log(`Updating liquor with ID: ${liquorId}`);
      console.log('Updated Data:', updatedData); // Log the data you're sending

      const response = await axios.put(`${apiURL}/api/liquors/${liquorId}`, updatedData, config);

      console.log('Response:', response); // Log the entire response

      if (response.data.success) {
        return response.data.data; // Return the updated data
      } else {
        console.log('Update failed:', response.data.message);
        return thunkAPI.rejectWithValue(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error in updating liquor:', error);

      

      // Ensure that the error is logged within the catch block
      console.error('Caught error:', serializableError);

      
    }
  }
);

export const deleteLiquor = createAsyncThunk(
  'liquor/deleteLiquor',
  async (liquorId, thunkAPI) => {
    try {
      const response = await fetch(`${apiURL}/api/liquors/${liquorId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchLiquors();
         // Refresh the list of liquors after deletion
        return liquorId; // Return the ID of the deleted liquor
      } else {
        return thunkAPI.rejectWithValue(data.message);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);


export const clearCurrentLiquor = () => ({ type: 'liquor/clearCurrentLiquor' });

