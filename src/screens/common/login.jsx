// Login.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Constants from 'expo-constants';
import { useDispatch, useSelector } from 'react-redux';
import { useAsyncSQLiteContext } from '../../utils/asyncSQliteProvider';
import { useNavigation, CommonActions } from '@react-navigation/native';

import { auth } from '../../utils/firebaseConfig';
import {
  GoogleSignin,
  GoogleSigninButton,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';

import { loginUser, googleLogin } from '../../redux/actions/authAction';
import { Toasthelper } from '../../components/common/toasthelper';
import Toast from 'react-native-toast-message';

const Login = () => {
  const dispatch = useDispatch();
  const db = useAsyncSQLiteContext();
  const navigation = useNavigation();

  if (!db) {
    console.warn('Database is not initialized yet.');
  }

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { extra: { BACKEND_URL } = {} } = Constants.expoConfig;
  const apiURL = BACKEND_URL || 'http://192.168.1.123:5000';

  const navigateAfterLogin = (user) => {
    // Use CommonActions.reset to rebuild the navigation state based on updated user data
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: user?.isAdmin ? 'Adminhome' : 'Home' }],
      })
    );
  };

  const handleLogin = () => {
    setIsSubmitting(true);
    dispatch(loginUser({ email, password, db }))
      .unwrap()
      .then((user) => {
        Toasthelper.showSuccess('Login Successful');
        console.log('Logged in user:', user);
        navigateAfterLogin(user);
      })
      .catch((error) => {
        Toasthelper.showError('Login Failed: Invalid Credentials', error.message);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        const firebaseIdToken = await userCredential.user.getIdToken();

        dispatch(googleLogin({ firebaseIdToken, db }))
          .unwrap()
          .then((user) => {
            Toasthelper.showSuccess('Google Login Successful');
            navigateAfterLogin(user);
          })
          .catch((error) => {
            Toasthelper.showError('Google Login Failed', error.message);
          });
      }
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Google sign-in error:', error);
      Toasthelper.showError('Google Sign-In Failed', error.message);
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

      <View style={{ marginVertical: 12, width: '100%' }}>
        <GoogleSigninButton
          style={{ width: '100%', height: 48 }}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={handleGoogleSignIn}
          disabled={isSubmitting}
        />
        {isSubmitting && (
          <ActivityIndicator size="small" color="black" style={{ marginTop: 8 }} />
        )}
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
