import { createSlice } from '@reduxjs/toolkit';
import Constants from 'expo-constants';
import axios from 'axios';

// Get the backend URL from expo constants or fallback to a default URL
const apiURL = Constants.expoConfig.extra?.BACKEND_URL || 'http://192.168.1.123:5000';

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
    },
    createLiquorSuccess: (state, action) => {
      state.loading = false;
      state.product = action.payload; // Save the product data in the state
    },
    createLiquorFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload; // Save error in case of failure
    },
  },
});

export const { createLiquorRequest, createLiquorSuccess, createLiquorFailure } = createLiquorSlice.actions;

// Asynchronous action to handle the API call with FormData
export const createLiquor = (productDetails, images) => async (dispatch) => {
  try {
    dispatch(createLiquorRequest()); // Indicate the request has started

    // Create a new FormData object to send the data
    const formData = new FormData();

    // Append the product details
    formData.append('name', productDetails.name);
    formData.append('price', productDetails.price);
    formData.append('description', productDetails.description);
    formData.append('brand', productDetails.brand);
    formData.append('stock', productDetails.stock);
    formData.append('category', productDetails.category);

    // Append each image as a FormData entry
    images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: image.type || 'image/jpeg', // Adjust type if necessary
          name: image.uri.split('/').pop(), // Extract filename from URI
        });
      });

    // Make the actual API call using axios
    const response = await axios.post(`${apiURL}/api/liquors`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        // Add other headers like authentication tokens if needed
      },
    });
    console.log('API Response:');
    // Dispatch success with the product data from the API response
    dispatch(createLiquorSuccess(response.data));
  } catch (error) {
    // Dispatch failure with error message if the request fails
    dispatch(createLiquorFailure(error.response ? error.response.data : error.message));
    console.error('Error creating liquor:', error.response ? error.response.data : error.message);
  }
};

export default createLiquorSlice.reducer;
