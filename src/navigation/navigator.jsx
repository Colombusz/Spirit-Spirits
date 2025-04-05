import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Provider as PaperProvider } from 'react-native-paper';

// Screens
import HomeScreen from '../screens/admin/index';
import CreateLiquor from '../screens/admin/create';
import AdminOrders from '../screens/admin/orders';
import Login from '../screens/common/login';
import About from '../screens/common/about';
import Signup from '../screens/common/signup';
import Home from '../screens/common/home';
import Account from '../screens/user/account';
import Details from '../screens/product/details';
import Cart from '../screens/product/cart';
import Checkout from '../screens/product/checkout';

// Drawers
import AppDrawer from '../components/common/appdrawer';
import AdminAppDrawer from '../components/admin/navbar';

// Utils
import { getUserCredentials } from '../utils/userStorage';

const Stack = createStackNavigator();

const Navigator = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user data once on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getUserCredentials();
      setUser(userData);
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const commonScreens = (
    <>
      <Stack.Screen name="About" component={About} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Account" component={Account} />
      <Stack.Screen name="Details" component={Details} />
      <Stack.Screen name="Cart" component={Cart} />
      <Stack.Screen name="Checkout" component={Checkout} />
    </>
  );

  if (loading) return null; // or a loading spinner

  return (
    <PaperProvider>
      <NavigationContainer>
        <View style={{ flex: 1 }}>
          {/* Show floating menu button only when user is ready */}
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => setDrawerVisible(true)}
          >
            <Ionicons name="menu" size={30} color="#000" />
          </TouchableOpacity>

          <Stack.Navigator
            initialRouteName={user?.isAdmin ? 'Adminhome' : 'Home'}
            screenOptions={{ headerShown: false }}
          >
            {user?.isAdmin && (
              <>
                <Stack.Screen name="Adminhome" component={HomeScreen} />
                <Stack.Screen name="CreateLiquor" component={CreateLiquor} />
                <Stack.Screen name="AdminOrders" component={AdminOrders} />
              </>
            )}
            {commonScreens}
          </Stack.Navigator>

          {drawerVisible && (
            <View style={styles.drawerOverlay}>
              {user?.isAdmin ? (
                <AdminAppDrawer closeDrawer={() => setDrawerVisible(false)} />
              ) : (
                <AppDrawer closeDrawer={() => setDrawerVisible(false)} />
              )}
            </View>
          )}
        </View>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default Navigator;

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    top: 20,
    right: 20,
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
