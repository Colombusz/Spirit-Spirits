// storage.js
import * as SQLite from 'expo-sqlite';

// Initialize your database (using async methods)
export async function migrateDbIfNeeded(dbInstance) {
  try {
    // execAsync runs the SQL without parameter binding.
    await dbInstance.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE IF NOT EXISTS users (
         id TEXT PRIMARY KEY NOT NULL,
         token TEXT,
         username TEXT,
         firstname TEXT,
         lastname TEXT,
         email TEXT,
         address TEXT,
         phone TEXT,
         image_public_id TEXT,
         image_url TEXT,
         isVerified INTEGER,
         isAdmin INTEGER,
         FCMtoken TEXT
      );
    `);
    console.log("Database initialized");
  } catch (error) {
    console.error("Error initializing database", error);
  }
}

export const storeUser = async (dbInstance, userData) => {
  try {
    console.log("Storing user:", userData);
    const userId = userData._id || userData.id || userData.uid;
    
    if (!userId) {
      throw new Error("User ID is missing!");
    }
    
    // Use withTransactionAsync to run queries within a transaction
    await dbInstance.withTransactionAsync(async () => {
      // Delete existing users
      await dbInstance.runAsync('DELETE FROM users');
      
      // Insert the new user record using runAsync which supports parameter binding.
      const result = await dbInstance.runAsync(
        `INSERT INTO users (
          id, token, username, firstname, lastname, email, address, phone,
          image_public_id, image_url, isVerified, isAdmin, FCMtoken
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        userId,
        userData.token,
        userData.username,
        userData.firstname,
        userData.lastname,
        userData.email,
        userData.address || null,
        userData.phone || null,
        userData.image?.public_id || null,
        userData.image?.url || null,
        userData.isVerified ? 1 : 0,
        userData.isAdmin ? 1 : 0,
        userData.FCMtoken || null
      );
      console.log("User stored successfully", result);
    });
  } catch (error) {
    console.error("Error storing user:", error);
    throw error;
  }
};

export const getUser = async (dbInstance) => {
  try {
    const result = await dbInstance.getFirstAsync('SELECT * FROM users LIMIT 1');
    return result; // result should be a single row object
  } catch (error) {
    console.error("Error retrieving user:", error);
    return null;
  }
};

export const deleteUser = async (dbInstance) => {
  try {
    await dbInstance.runAsync('DELETE FROM users');
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};
