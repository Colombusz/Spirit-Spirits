// storage.js
import * as SQLite from 'expo-sqlite';

/**
 * This migration function creates the necessary tables.
 * It is called by the AsyncSQLiteProvider's onInit prop.
 */
export async function migrateDbIfNeeded(dbInstance) {
  try {
    // Create the users table (if needed)
    await dbInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        token TEXT
        -- other columns if needed
      );
    `);

    // Create the token table
    await dbInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS tokenTable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT
      );
    `);

    console.log("Database migrated or initialized successfully");
  } catch (error) {
    console.error("Error initializing database", error);
  }
}

/**
 * Stores a token in the tokenTable.
 * @param {Object} dbInstance - The SQLite database instance.
 * @param {string} token - The token to store.
 */
export const storeToken = async (dbInstance, token) => {
  if (!dbInstance) {
    console.error("No dbInstance provided to storeToken");
    return;
  }
  try {
    // Wrap in a transaction so that runAsync is available
    await dbInstance.withTransactionAsync(async () => {
      await dbInstance.runAsync("INSERT INTO tokenTable (token) VALUES (?);", token);
    });
    console.log("Token stored successfully");
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
      "SELECT token FROM tokenTable ORDER BY id DESC LIMIT 1;"
    );
    return result ? result.token : null;
  } catch (error) {
    console.error("Error retrieving token", error);
    return null;
  }
};

/**
 * Removes all tokens from the tokenTable.
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
      await dbInstance.runAsync("DELETE FROM tokenTable;");
    });
    console.log("Token removed successfully");
  } catch (error) {
    console.error("Error removing token", error);
    throw error;
  }
};
