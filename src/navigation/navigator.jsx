// Navigator.js
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Provider as PaperProvider } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { createNavigationContainerRef } from '@react-navigation/native';

// Admin Screens
import HomeIndex from '../screens/admin/index';
import CreateLiquor from '../screens/admin/create';
import EditLiquorForm from '../screens/admin/edit';
import AdminOrders from '../screens/admin/orders';

// User Screens
import Home from '../screens/common/home';
import About from '../screens/common/about';
import Login from '../screens/common/login';
import Signup from '../screens/common/signup';
import Account from '../screens/user/account';
import Details from '../screens/product/details';
import Cart from '../screens/product/cart';
import Checkout from '../screens/product/checkout';
import UserOrders from '../screens/user/orders';
import DiscountProductForm from '../screens/admin/promo';
import PromoCarousel from '../screens/admin/promolist';
// Drawers
import AppDrawer from '../components/common/appdrawer';
import AdminAppDrawer from '../components/admin/navbar';

const Stack = createStackNavigator();
export const navigationRef = createNavigationContainerRef();

const Navigator = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const user = useSelector((state) => state.auth.user);

  // While user state is undefined (e.g., during startup), show a spinner
  if (user === undefined) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <NavigationContainer ref={navigationRef}>
        <View style={{ flex: 1 }}>
          {/* Floating menu button */}
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => setDrawerVisible(true)}
          >
            <Ionicons name="menu" size={30} color="#000" />
          </TouchableOpacity>

          {/* Stack Navigator */}
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
              user.isAdmin ? (
                // Admin Stack
                <>
                  <Stack.Screen name="Adminhome" component={HomeIndex} />
                  <Stack.Screen name="CreateLiquor" component={CreateLiquor} />
                  <Stack.Screen name="AdminOrders" component={AdminOrders} />
                  <Stack.Screen name="EditLiquor" component={EditLiquorForm} />
                  <Stack.Screen name="Account" component={Account} />
                    <Stack.Screen name="PromoList" component={PromoCarousel} />
                <Stack.Screen name="Promo" component={DiscountProductForm} />
                
            </>
              ) : (
                // User Stack
                <>
                  <Stack.Screen name="Home" component={Home} />
                  <Stack.Screen name="About" component={About} />
                  <Stack.Screen name="Account" component={Account} />
                  <Stack.Screen name="Details" component={Details} />
                  <Stack.Screen name="Cart" component={Cart} />
                  <Stack.Screen name="Checkout" component={Checkout} />
                  <Stack.Screen name="UserOrders" component={UserOrders} />
                </>
              )
            ) : (
              // Not logged in
              <>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Signup" component={Signup} />
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="About" component={About} />
                <Stack.Screen name="Details" component={Details} />
              </>
            )}

          </Stack.Navigator>

          {/* Drawer Overlay */}
          {drawerVisible && (
            <View style={styles.drawerOverlay}>
              {user?.isAdmin ? (
                <AdminAppDrawer
                  closeDrawer={() => setDrawerVisible(false)}
                  navigation={navigationRef.current} // Pass navigation explicitly
                />
              ) : (
                <AppDrawer
                  closeDrawer={() => setDrawerVisible(false)}
                  navigation={navigationRef} // Pass navigation explicitly
                />
              )}
            </View>
          )}
        </View>
      </NavigationContainer>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButton: {
    position: 'absolute',
    top: 25,
    right: 25,
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

export default Navigator;
