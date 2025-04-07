// AsyncSQLiteProvider.js
import React, { useState, useEffect, createContext, useContext } from 'react';
import * as SQLite from 'expo-sqlite';

const AsyncSQLiteContext = createContext(null);

export const AsyncSQLiteProvider = ({ children, databaseName, onInit }) => {
  const [db, setDb] = useState(null);

  useEffect(() => {
    SQLite.openDatabaseAsync(databaseName)
      .then(async (dbInstance) => {
        if (onInit) {
          await onInit(dbInstance);
        }
        setDb(dbInstance);
      })
      .catch((error) => {
        console.error("Error opening database:", error);
      });
  }, [databaseName, onInit]);

  return (
    <AsyncSQLiteContext.Provider value={db}>
      {children}
    </AsyncSQLiteContext.Provider>
  );
};

export const useAsyncSQLiteContext = () => {
  const context = useContext(AsyncSQLiteContext);
  if (context === null) {
    // Optionally, you can throw an error if you want to enforce that consumers only render once ready.
    // throw new Error('useAsyncSQLiteContext must be used within an AsyncSQLiteProvider that has initialized the DB');
  }
  return context;
};
