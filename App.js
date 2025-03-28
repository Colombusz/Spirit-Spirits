// App.js
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigator from './src/navigation/navigator';
import store from './src/redux/store';
import { Provider } from 'react-redux';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AsyncSQLiteProvider } from './src/utils/asyncSQliteProvider';
import { migrateDbIfNeeded } from './src/utils/storage';

export default function App() {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '974909794033-6p3obqv1vudjg0tnq8mo1og1i13ld2sj.apps.googleusercontent.com',
      profileImageSize: 150,
    });
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AsyncSQLiteProvider databaseName="spirits.db" onInit={migrateDbIfNeeded}>
          <Navigator />
        </AsyncSQLiteProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
