// App.js
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigator from './src/navigation/navigator';
import store from './src/redux/store';
import { Provider } from 'react-redux';

import { AsyncSQLiteProvider } from './src/utils/asyncSQliteProvider';
import { migrateDbIfNeeded } from './src/utils/storage';
import Toast from 'react-native-toast-message';
import PersistentLogin from './src/utils/persistentLogin';

import NotificationHandler from './src/components/NotificationHandler'; // we’ll create this next

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AsyncSQLiteProvider databaseName="spirits.db" onInit={migrateDbIfNeeded}>
          <PersistentLogin />
          <NotificationHandler />
          <Navigator/>
          <Toast />
        </AsyncSQLiteProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
