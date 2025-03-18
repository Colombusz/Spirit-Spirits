import Navigator from './navigation/navigator';
import store from './redux/store';
import { Provider } from 'react-redux';

export default function App() {
  return (
    <Provider store={store}>
      <Navigator />
    </Provider>
  );
}
