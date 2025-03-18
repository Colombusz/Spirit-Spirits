import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import Screens
import HomeScreen from '../screens/HomeAdmin';
import Login from '../screens/LoginUserAdmin';
import About from '../screens/common/about';

// 449px x 961px = 1080px x 1400px || Screen Size Google Pixel 8a / POCO M5s


const Stack = createStackNavigator();

const Navigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="About">
                {/* User / Non User Screens */}
                <Stack.Screen name="About" component={About} />
                <Stack.Screen name="Login" component={Login} />

                {/* User Screens */}


                {/* Admin Screens */}
                <Stack.Screen name="Adminhome" component={HomeScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Navigator;