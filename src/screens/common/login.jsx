import React, { useState, useEffect, use } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/reducers/loginReducer';
import { storeUser } from '../../utils/storage';
import { useSQLiteContext } from 'expo-sqlite';

// import auth from '@react-native-firebase/auth';

import { auth } from '../../utils/firebaseConfig';
import { GoogleSignin, GoogleSigninButton, isSuccessResponse } from '@react-native-google-signin/google-signin';

const Login = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const db = useSQLiteContext(); 
  const { extra: { BACKEND_URL } = {} } = Constants.expoConfig;
  const apiURL = BACKEND_URL || 'http://192.168.1.123:5000';

  // Handler for email/password login
  const handleLogin = async () => {
    try {
      const res = await fetch(`${apiURL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (data.success) {
        storeUser(db, { ...data.user, token: data.token });
        dispatch(setUser(data.user));
        Alert.alert('Login Successful');
      } else {
        Alert.alert('Login Failed', data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login error', error.message);
    }
  };

  // Handler for Google sign-in using Firebase Auth
  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      console.log('Google sign-in response:', response);

      if (isSuccessResponse(response)) {
        const { idToken, user } = response.data;
        const { email, name, photo } = user;
        console.log('Google sign-in success:', { email, name, photo });
        
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);

        const firebaseIdToken = await userCredential.user.getIdToken();
        await handleGoogleLogin(firebaseIdToken);
      }

      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Google sign-in error:', error);
      Alert.alert('Google sign-in error', error.message);
    }
  };

  // Handler for Google login: sends *Firebase* ID token to the backend
  const handleGoogleLogin = async (firebaseIdToken) => {
    try {
      const res = await fetch(`${apiURL}/api/auth/googlelogin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseIdToken }),
      });
      const data = await res.json();
      
      if (data.success) {
        storeUser(db, { ...data.user, token: data.token });
        dispatch(setUser(data.user));
        Alert.alert('Google Login Successful');
      } else {
        Alert.alert('Google Login Failed', data.message);
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('Google login error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      
      <View style={{ marginVertical: 12 }}>
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={handleGoogleSignIn}
          disabled={isSubmitting}
        />
        {isSubmitting && <ActivityIndicator size="small" color="black" style={{ marginTop: 8 }} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default Login;
