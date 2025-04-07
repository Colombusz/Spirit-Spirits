import { createSlice } from '@reduxjs/toolkit';
import Constants from 'expo-constants';
import axios from 'axios';

const apiURL = Constants.expoConfig?.extra?.BACKEND_URL || 'http://192.168.1.123:5000';

const initialState = {
  product: null,
  loading: false,
  error: null,
};

const createLiquorSlice = createSlice({
  name: 'createLiquor',
  initialState,
  reducers: {
    createLiquorRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createLiquorSuccess: (state, action) => {
      state.loading = false;
      state.product = action.payload;
    },
    createLiquorFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  createLiquorRequest,
  createLiquorSuccess,
  createLiquorFailure,
} = createLiquorSlice.actions;

export const createLiquor = (productDetails, images) => async (dispatch) => {
    try {
      dispatch(createLiquorRequest());
  
      // Validate inputs
      const requiredFields = {
        name: 'Product name',
        price: 'Price',
        description: 'Description',
        brand: 'Brand',
        category: 'Category'
      };
  
      const missingFields = Object.keys(requiredFields)
        .filter(field => !productDetails[field])
        .map(field => requiredFields[field]);
  
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
  
      if (!images || images.length === 0) {
        throw new Error('At least one image is required');
      }
  
      const formData = new FormData();
  
      // Append text fields
      formData.append('name', productDetails.name);
      formData.append('price', productDetails.price.toString());
      formData.append('description', productDetails.description);
      formData.append('brand', productDetails.brand);
      formData.append('stock', productDetails.stock ? productDetails.stock.toString() : '0');
      formData.append('category', productDetails.category);
  
      // Append images with proper content type
      for (const image of images) {
        const filename = image.uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
  
        formData.append('images', {
          uri: image.uri,
          name: filename,
          type
        });
      }
  
      // Create clean config for axios
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: () => formData,
        timeout: 15000
      };
  
      const response = await axios.post(`${apiURL}/api/liquors`, formData, config);
  
      if (response.data.success) {
        dispatch(createLiquorSuccess(response.data.data));
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create liquor');
      
    } catch (error) {
      // Create serializable error object
      const serializableError = {
        message: error.message,
        name: error.name,
        stack: error.stack,
        code: error.code,
        isAxiosError: axios.isAxiosError(error),
        status: error.response?.status,
        responseData: error.response?.data
      };
  
      console.error('Create liquor error:', serializableError);
  
      dispatch(createLiquorFailure({
        userMessage: 'Failed to create product. Please try again.',
        technicalMessage: error.message,
        ...serializableError
      }));
  
      throw error;
    }
  };
export default createLiquorSlice.reducer;
