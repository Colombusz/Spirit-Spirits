// Signup.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';

// Import the signupUser thunk from Redux actions
import { signupUser } from '../../redux/actions/authAction';

const Signup = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // remains here if needed.
  const { extra: { BACKEND_URL } = {} } = Constants.expoConfig;
  const apiURL = BACKEND_URL || 'http://192.168.1.123:5000';

  const [username, setUsername] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = () => {
    if (!username || !firstname || !lastname || !email || !password) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    setIsSubmitting(true);
    dispatch(signupUser({ username, firstname, lastname, email, password }))
    .unwrap()
    .then((user) => {
      console.log('Signup successful:', user);
      if (user.isAdmin) {
        navigation.navigate('Adminhome');
      } else {
        navigation.navigate('Home');
      }
    })
    .catch((error) => {
      console.error('Signup error:', error);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signup</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstname}
        onChangeText={setFirstname}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastname}
        onChangeText={setLastname}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title={isSubmitting ? 'Signing Up...' : 'Signup'}
        onPress={handleSignup}
        disabled={isSubmitting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
});

export default Signup;
