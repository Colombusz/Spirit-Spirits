import { createAsyncThunk } from '@reduxjs/toolkit';
import Constants from 'expo-constants';
import axios from 'axios';
import { removeMultipleCartItems, getToken } from '../../utils/storage';

const apiURL = Constants.expoConfig.extra?.BACKEND_URL || 'http://192.168.0.123:5000';

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async ({ orderDetails, db }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append('userId', orderDetails.userId);
      formData.append('shippingAddress', JSON.stringify(orderDetails.shippingAddress));
      
      const paymentMethod =
        orderDetails.paymentMethod === 'COD' ? 'Cash on Delivery' : 'GCash';
      formData.append('paymentMethod', paymentMethod);
      
      formData.append('orderItems', JSON.stringify(orderDetails.selectedProducts));
      
      formData.append('shippingPrice', orderDetails.shippingFee);
      formData.append('totalPrice', orderDetails.total);
      
      if (paymentMethod === 'GCash' && orderDetails.proofOfPayment) {
        const localUri = orderDetails.proofOfPayment;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';
        formData.append('proofOfPayment', { uri: localUri, name: filename, type });
      }
      
      const token = await getToken(db);
      const config = {
        method: 'POST',
        body: formData,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      const res = await fetch(`${apiURL}/api/orders`, config);
      const data = await res.json();

      const productIds = orderDetails.selectedProducts.map(item => item.productId);
      await removeMultipleCartItems(db, orderDetails.userId, productIds);
      
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

export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async ({ db }, thunkAPI) => {
    try {
      const token = await getToken(db);
      const config = {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };
      const response = await fetch(`${apiURL}/api/orders`, {
        method: 'GET',
        headers: config.headers,
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

// Update order status ADMIN
export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ orderId, newStatus, db }, thunkAPI) => {
    try {
      const token = await getToken(db);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      const response = await axios.put(
        `${apiURL}/api/orders/${orderId}`,
        { status: newStatus },
        config
      );

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

export const clearCurrentOrder = () => ({ type: 'order/clearCurrentOrder' });
