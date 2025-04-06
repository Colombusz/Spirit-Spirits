import { createAsyncThunk } from '@reduxjs/toolkit';
import Constants from 'expo-constants';
import axios from 'axios';

const apiURL = Constants.expoConfig.extra?.BACKEND_URL || 'http://192.168.1.123:5000';

export const createPromo = createAsyncThunk(
  'promo/createPromo',
  async ({ promoDetails, images }, thunkAPI) => {
    try {
      console.log('promoDetails', promoDetails, images);

      const requiredFields = {
        name: 'name',
        discountRate: 'discountRate',
        category: 'category',
        description: 'description',
      };

      const missingFields = Object.keys(requiredFields)
        .filter(field => !promoDetails[field])
        .map(field => requiredFields[field]);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      if (!images || images.length === 0) {
        throw new Error('At least one image is required');
      }

      const formData = new FormData();
      formData.append('name', promoDetails.name);
      formData.append('discountRate', promoDetails.discountRate);
      formData.append('category', promoDetails.category);
      formData.append('description', promoDetails.description);

      for (const image of images) {
        const filename = image.uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';

        formData.append('images', {
          uri: image.uri || image,
          name: filename,
          type,
        });
      }

      console.log('formData', formData, 'url:', `${apiURL}/api/promos/`);

      const response = await axios.post(`${apiURL}/api/promos/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 15000,
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        return thunkAPI.rejectWithValue(response.data.message || 'Promo creation failed');
      }
    } catch (error) {
      console.error('createPromo error:', error.message);
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'An error occurred');
    }
  }
);

export const getAllPromos = createAsyncThunk(
    'promo/getAllPromos',
    async (_, thunkAPI) => {
        try {
        const response = await axios.get(`${apiURL}/api/promos/`);
        console.log("WIWIWIIWIW", response.data);
        return response.data;
        } catch (error) {
        console.error('getAllPromos error:', error.message);
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'An error occurred');
        }
    }
    );

export const deletePromo = createAsyncThunk(
  'promo/deletePromo',
  async (promoId, thunkAPI) => {
    console.log('deletePromo promoId:', promoId);
    try {
      const response = await axios.delete(`${apiURL}/api/promos/${promoId}`);
      return response.data;
    } catch (error) {
      console.error('deletePromo error:', error.message);
      console.log("WUWUWUWUWUW");
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'An error occurred');
    }
  }
);
    
