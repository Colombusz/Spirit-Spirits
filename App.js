// App.js
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigator from './src/navigation/navigator';
import store from './src/redux/store';
import { Provider } from 'react-redux';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function App() {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "1030795510253-e63qcl013pkeihpfak8k2uplahvjet0e.apps.googleusercontent.com",
      profileImageSize: 150,
    });
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <Navigator />
      </Provider>
    </SafeAreaProvider>
  );
}
