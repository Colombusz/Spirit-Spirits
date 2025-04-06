import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncSQLiteContext } from '../utils/asyncSQliteProvider';
import { verifyUser } from '../redux/actions/authAction';

const PersistentLogin = () => {
    const db = useAsyncSQLiteContext();
    const dispatch = useDispatch();
  
    useEffect(() => {
      const checkPersistedLogin = async () => {
        if (!db) return; // Wait until the database is available
  
        // Dispatch the verifyUser thunk to check token validity with the backend
        const resultAction = await dispatch(verifyUser({ db }));
        if (verifyUser.fulfilled.match(resultAction)) {
          console.log('User verified persistently:', resultAction.payload);
        } else {
          console.error('Persistent login failed:', resultAction.payload);
          // Optionally, you can navigate the user to the login screen or show a message
        }
      };
  
      checkPersistedLogin();
    }, [db, dispatch]);
  
    return null;
  };
  
  export default PersistentLogin;
