// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnnW2gV_jxNo7nSrJ1zzCfXvmp7r4nCq8",
  authDomain: "spirit-spirits-52611.firebaseapp.com",
  projectId: "spirit-spirits-52611",
  storageBucket: "spirit-spirits-52611.firebasestorage.app",
  messagingSenderId: "974909794033",
  appId: "1:974909794033:web:494d771f4f6e753a00eb50",
  measurementId: "G-SD4CPLVVH3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app, {
  persistence: ReactNativeAsyncStorage,
});
