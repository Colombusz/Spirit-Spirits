import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Provider as PaperProvider } from 'react-native-paper';
import { useSelector } from 'react-redux';

// Screens
import HomeIndex from '../screens/admin/index';
import CreateLiquor from '../screens/admin/create';
import EditLiquorForm from '../screens/admin/edit';
import AdminOrders from '../screens/admin/orders';
import Login from '../screens/common/login';
import About from '../screens/common/about';
import Signup from '../screens/common/signup';
import Home from '../screens/common/home';
import Account from '../screens/user/account';
import Details from '../screens/product/details';
import Cart from '../screens/product/cart';
import Checkout from '../screens/product/checkout';
import UserOrders from '../screens/user/orders';

// Drawers
import AppDrawer from '../components/common/appdrawer';
import AdminAppDrawer from '../components/admin/navbar';

const Stack = createStackNavigator();

const Navigator = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Get user from Redux auth state
  const user = useSelector((state) => state.auth.user);

  // If the auth state is still undefined (e.g., during startup) show a loader.
  if (user === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <View style={{ flex: 1 }}>
          {/* Floating menu button */}
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => setDrawerVisible(true)}
          >
            <Ionicons name="menu" size={30} color="#000" />
          </TouchableOpacity>

          {/* Stack Navigator */}
          <Stack.Navigator
            initialRouteName={user?.isAdmin ? 'Adminhome' : 'Home'}
            screenOptions={{ headerShown: false }}
          >
            {user?.isAdmin && (
              <>
                <Stack.Screen name="Adminhome" component={HomeIndex} />
                <Stack.Screen name="CreateLiquor" component={CreateLiquor} />
                <Stack.Screen name="AdminOrders" component={AdminOrders} />
                <Stack.Screen name="EditLiquor" component={EditLiquorForm} />
            </>
            )}

            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="About" component={About} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name="Account" component={Account} />
            <Stack.Screen name="Details" component={Details} />
            <Stack.Screen name="Cart" component={Cart} />
            <Stack.Screen name="Checkout" component={Checkout} />
            <Stack.Screen name="UserOrders" component={UserOrders} />
          </Stack.Navigator>

          {/* Drawer Overlay */}
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
