// navigator.jsx
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDbIfNeeded } from '../utils/storage';

// Screens
import HomeScreen from '../screens/admin/index';
import Login from '../screens/common/login';
import About from '../screens/common/about';

// Custom Drawer 
import AppDrawer from '../components/common/appdrawer';

const Stack = createStackNavigator();

const Navigator = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <SQLiteProvider databaseName="spirits.db" onInit={migrateDbIfNeeded}>
      <NavigationContainer>
        <View style={{ flex: 1 }}>
          {/* Floating Menu Icon */}
          <TouchableOpacity 
            style={styles.floatingButton}
            onPress={() => setDrawerVisible(true)}
          >
            <Ionicons name="menu" size={30} color="#000" />
          </TouchableOpacity>

          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="About" component={About} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Adminhome" component={HomeScreen} />
          </Stack.Navigator>

          {/* Drawer Overlay */}
          {drawerVisible && (
            <View style={styles.drawerOverlay}>
              <AppDrawer closeDrawer={() => setDrawerVisible(false)} />
            </View>
          )}
        </View>
      </NavigationContainer>
    </SQLiteProvider>
  );
};

export default Navigator;

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: 'white',
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
    backgroundColor: '#fff',
    zIndex: 20,
    elevation: 10,
  },
});
