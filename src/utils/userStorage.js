// userStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Clears any existing user data from AsyncStorage,
 * then stores the new user credentials.
 *
 * @param {Object} user - The user data to store.
 */
export const storeUserCredentials = async (user) => {
  try {
    // Remove existing user data (if any)
    await AsyncStorage.removeItem('user');
    // Store the new user data as a JSON string
    await AsyncStorage.setItem('user', JSON.stringify(user));
    console.log('User credentials stored successfully');
  } catch (error) {
    console.error('Error storing user credentials:', error);
  }
};

/**
 * Retrieves the stored user credentials.
 *
 * @returns {Object|null} The parsed user object or null.
 */
export const getUserCredentials = async () => {
  try {
    const data = await AsyncStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving user credentials:', error);
    return null;
  }
};

/**
 * Removes the stored user credentials.
 */
export const removeUserCredentials = async () => {
  try {
    await AsyncStorage.removeItem('user');
    console.log('User credentials removed successfully');
  } catch (error) {
    console.error('Error removing user credentials:', error);
  }
};
