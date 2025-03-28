// storage.js
import * as SQLite from 'expo-sqlite';

/**
 * This migration function creates the necessary tables.
 * It is called by the AsyncSQLiteProvider's onInit prop.
 */
export async function migrateDbIfNeeded(dbInstance) {
  try {
    // Create the users table with token
    await dbInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        token TEXT
      );
    `);

    // Create the cart table
    await dbInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId TEXT NOT NULL,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL
      );
    `);

    console.log("Database migrated or initialized successfully");
  } catch (error) {
    console.error("Error initializing database", error);
  }
}

/**
 * Stores a token in the users table.
 * @param {Object} dbInstance - The SQLite database instance.
 * @param {string} token - The token to store.
 */
export const storeToken = async (dbInstance, token) => {
  if (!dbInstance) {
    console.error("No dbInstance provided to users");
    return;
  }
  try {
    // Wrap in a transaction so that runAsync is available
    await dbInstance.withTransactionAsync(async () => {
      await dbInstance.runAsync("INSERT INTO users (token) VALUES (?);", [token]);
    });
    console.log("Token stored successfully");
    console.log("Stored token:", token);
  } catch (error) {
    console.error("Error storing token", error);
    throw error;
  }
};

/**
 * Retrieves the most recently stored token.
 * @param {Object} dbInstance - The SQLite database instance.
 * @returns {string|null} - The stored token or null if none exists.
 */
export const getToken = async (dbInstance) => {
  if (!dbInstance) {
    console.error("No dbInstance provided to getToken");
    return null;
  }
  try {
    const result = await dbInstance.getFirstAsync(
      "SELECT token FROM users ORDER BY id DESC LIMIT 1;"
    );
    return result ? result.token : null;
  } catch (error) {
    console.error("Error retrieving token", error);
    return null;
  }
};

/**
 * Removes all tokens from the users table.
 * @param {Object} dbInstance - The SQLite database instance.
 */
export const removeToken = async (dbInstance) => {
  if (!dbInstance) {
    console.error("No dbInstance provided to removeToken");
    return;
  }
  try {
    // Wrap in a transaction so that runAsync is available
    await dbInstance.withTransactionAsync(async () => {
      await dbInstance.runAsync("DELETE FROM users;");
    });
    console.log("Token removed successfully");
  } catch (error) {
    console.error("Error removing token", error);
    throw error;
  }
};

export const logTableContents = async (dbInstance, tableName) => {
  if (!dbInstance) {
    console.error("No dbInstance provided to logTableContents");
    return;
  }
  dbInstance.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM ${tableName};`,
      [],
      (_, { rows }) => {
        console.log(`Contents of ${tableName}:`, rows._array);
      },
      (_, error) => {
        console.error(`Error querying ${tableName}:`, error);
        return false;
      }
    );
  });
};

