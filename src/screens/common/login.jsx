// Login.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Constants from 'expo-constants';
import { useDispatch } from 'react-redux';
import { useAsyncSQLiteContext } from '../../utils/asyncSQliteProvider';
import { useNavigation } from '@react-navigation/native';

import { auth } from '../../utils/firebaseConfig';
import {
  GoogleSignin,
  GoogleSigninButton,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';

// Import redux async thunks for login and google login
import { loginUser, googleLogin } from '../../redux/actions/authAction';

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
  // apiURL is now only used for any non-redux logic
  const apiURL = BACKEND_URL || 'http://192.168.1.123:5000';

  const handleLogin = () => {
    dispatch(loginUser({ email, password, db }))
      .unwrap()
      .then((user) => {
        Alert.alert('Login Successful');
        navigation.navigate('Home');
      })
      .catch((error) => {
        Alert.alert('Login Failed', error);
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

        // Dispatch the googleLogin thunk passing the firebase token and database context.
        dispatch(googleLogin({ firebaseIdToken, db }))
          .unwrap()
          .then(() => {
            Alert.alert('Google Login Successful');
            navigation.navigate('Home');
          })
        .catch((error) => {
          Alert.alert('Google Login Failed', error);
        });
      }
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Google sign-in error:', error);
      Alert.alert('Google sign-in error', error.message);
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
