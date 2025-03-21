// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBTJ1NSvzQUUBd-2LkUgxJCsktiB2T2kiY",
  authDomain: "spirit-spirits.firebaseapp.com",
  projectId: "spirit-spirits",
  storageBucket: "spirit-spirits.firebasestorage.app",
  messagingSenderId: "977548520440",
  appId: "1:977548520440:web:51f1ef842c7554a09e440d",
  measurementId: "G-2M60LEJGJK"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();