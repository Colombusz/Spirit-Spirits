import * as SQLite from 'expo-sqlite';

// ---------- SQLite Initialization ----------
export async function migrateDbIfNeeded(dbInstance) {
  const DATABASE_VERSION = 1;
  // Get current version using the asynchronous API provided by SQLiteProvider
  let { user_version: currentDbVersion } = await dbInstance.getFirstAsync('PRAGMA user_version');
  
  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }
  
  if (currentDbVersion === 0) {
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
    // You can also insert default data if needed here.
  }
  
  await dbInstance.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

// ---------- User Storage Functions ----------
// Save (or update) the logged-in user's details in the "users" table.
// This function expects an object containing the parameters returned by your login controllers.
export const storeUser = (dbInstance, userData) => {
  dbInstance.transaction(tx => {
    tx.executeSql('DELETE FROM users');
    tx.executeSql(
      `INSERT INTO users (
         id, token, username, firstname, lastname, email, address, phone,
         image_public_id, image_url, isVerified, isAdmin, FCMtoken
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userData.id,
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
        userData.FCMtoken || null,
      ]
    );
  });
};

export const getUser = (dbInstance, callback) => {
  dbInstance.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM users LIMIT 1',
      [],
      (_, { rows }) => {
        const user = rows._array.length > 0 ? rows._array[0] : null;
        callback(user);
      },
      (_, error) => {
        console.error("Error retrieving user:", error);
        callback(null);
        return false;
      }
    );
  });
};

export const deleteUser = (dbInstance) => {
  dbInstance.transaction(tx => {
    tx.executeSql('DELETE FROM users');
  });
};
