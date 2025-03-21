import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/reducers/loginReducer';
import { storeUser } from '../../utils/storage';
import { useSQLiteContext } from 'expo-sqlite';
import { GoogleSignin, GoogleSigninButton, isSuccessResponse } from '@react-native-google-signin/google-signin';

const Login = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const db = useSQLiteContext(); 

  const { extra: { BACKEND_URL } = {} } = Constants.expoConfig;
  const apiURL = BACKEND_URL || 'http://localhost:5000';

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

  // Placeholder for Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if(isSuccessResponse(response)) {
        const { idToken, user } = response.data;
        const { email, name, photo } = user;

        console.log('Google sign-in success:', { email, name, photo });
        // initiate Google sign in, then use handleGoogleLogin to send idToken to backend.
        handleGoogleLogin(idToken);
      }
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Google sign-in error:', error);
      Alert.alert('Google sign-in error', error.message);
    }
  };

  // Handler for Google login: sends idToken to the backend and handles the response
  const handleGoogleLogin = async (idToken) => {
    try {
      const res = await fetch(`${apiURL}/api/auth/googlelogin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
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
