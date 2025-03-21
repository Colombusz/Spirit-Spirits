import { configureStore } from '@reduxjs/toolkit';
import userReducer from './reducers/loginReducer';
// import { composeWithDevTools } from 'redux-devtools-extension';
// import thunk from 'redux-thunk';
// import rootReducer from './reducers'; // Make sure you have a rootReducer in your reducers folderr

// const initialState = {};

// const middleware = [thunk];

const store = configureStore({
    reducer: {
        user: userReducer,
        
    },      
});

export default store;