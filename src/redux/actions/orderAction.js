import { createAsyncThunk } from '@reduxjs/toolkit';
import Constants from 'expo-constants';
import { removeMultipleCartItems } from '../../utils/storage';

const apiURL = Constants.expoConfig.extra?.BACKEND_URL || 'http://192.168.1.123:5000';

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
      
      const res = await fetch(`${apiURL}/api/orders`, {
        method: 'POST',
        body: formData,
        // Let fetch automatically set the Content-Type header
      });
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
    async (_, thunkAPI) => {
      try {
        const res = await fetch(`${apiURL}/api/orders`);
        const data = await res.json();
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
    async ({ orderId, newStatus }, thunkAPI) => {
      try {
        const res = await fetch(`${apiURL}/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        const data = await res.json();
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
