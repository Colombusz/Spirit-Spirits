// store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';
import liquorReducer from './reducers/liquorReducer';
import userReducer from './reducers/userReducer';
import cartReducer from './reducers/cartReducer';

const store = configureStore({
  reducer: {
    auth: authReducer,
    liquor: liquorReducer,
    user: userReducer,
    cart: cartReducer,
  },
});

export default store;
