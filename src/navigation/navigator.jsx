// navigator.jsx
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Screens
import HomeScreen from '../screens/admin/index';
import Login from '../screens/common/login';
import About from '../screens/common/about';
import Signup from '../screens/common/signup';
import Home from '../screens/common/home';
import Account from '../screens/user/account';
import Details from '../screens/product/details';
import Cart from '../screens/product/cart';
import Checkout from '../screens/product/checkout';

// Custom Drawer 
import AppDrawer from '../components/common/appdrawer';
import AdminAppDrawer from '../components/admin/navbar';

// Get user
import { useSelector } from 'react-redux';
import { getUserCredentials } from '../utils/userStorage';
const Stack = createStackNavigator();

const Navigator = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getUserCredentials(); // Async call to fetch user credentials
      setUser(userData); // Update the state when data is available
    };

    fetchUserData();
  });
  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        {/* Floating Menu Icon */}
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={() => setDrawerVisible(true)}
        >
          <Ionicons name="menu" size={30} color="#000" />
        </TouchableOpacity>

        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="About" component={About} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Account" component={Account} />
          <Stack.Screen name="Details" component={Details} />
          <Stack.Screen name="Cart" component={Cart} />
          <Stack.Screen name="Checkout" component={Checkout} />

          {/* ADMIN STACKSSSSSS */}
          <Stack.Screen name="Adminhome" component={HomeScreen} />


        </Stack.Navigator>

        {/* Drawer Overlay */}
        {drawerVisible && (
          <View style={styles.drawerOverlay}>
            {user?.isAdmin === true ? (
              <AdminAppDrawer closeDrawer={() => setDrawerVisible(false)} />
              
            ) : (
              <AppDrawer closeDrawer={() => setDrawerVisible(false)} />
            )}
          </View>
        )}
      </View>
    </NavigationContainer>
  );
};

export default Navigator;

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    top: 20,
    right: 20,  // Move to the right side
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 5,
    borderRadius: 20,
    elevation: 5,
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 240,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 20,
    elevation: 10,
  },
});
