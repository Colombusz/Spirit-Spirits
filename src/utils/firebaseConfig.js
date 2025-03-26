// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCnnW2gV_jxNo7nSrJ1zzCfXvmp7r4nCq8",
  authDomain: "spirit-spirits-52611.firebaseapp.com",
  projectId: "spirit-spirits-52611",
  storageBucket: "spirit-spirits-52611.firebasestorage.app",
  messagingSenderId: "974909794033",
  appId: "1:974909794033:web:494d771f4f6e753a00eb50",
  measurementId: "G-SD4CPLVVH3"
};

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with React Native persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
