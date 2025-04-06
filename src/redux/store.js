// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';
import liquorReducer from './reducers/liquorReducer';
import userReducer from './reducers/userReducer';
import cartReducer from './reducers/cartReducer';
import createLiquorReducer from './slices/createLiqourSlice';
import orderReducer from './reducers/orderReducer'; 
import reviewReducer from './reducers/reviewReducer';

const store = configureStore({
  reducer: {
    auth: authReducer,
    liquor: liquorReducer,
    user: userReducer,
    cart: cartReducer,
    createdLiquor: createLiquorReducer,
    order: orderReducer,
    review: reviewReducer,
  },
});

export default store;
