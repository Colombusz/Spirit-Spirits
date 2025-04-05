// storage.js
import * as SQLite from 'expo-sqlite';

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
        user_id TEXT NOT NULL,
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

export const getToken = async (dbInstance) => {
  if (!dbInstance) {
    console.error("No dbInstance provided to getToken");
    return null;
  }
  try {
    const result = await dbInstance.getFirstAsync(
      "SELECT token FROM users ORDER BY id DESC LIMIT 1;"
    );
    console.log("Retrieved token:", result.token);
    return result ? result.token : null;
  } catch (error) {
    console.error("Error retrieving token", error);
    return null;
  }
};

export const removeToken = async (dbInstance) => {
  if (!dbInstance) {
    console.error("No dbInstance provided to removeToken");
    return;
  }
  try {
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

export const addCartItem = async (dbInstance, cartItem) => {
  if (!dbInstance) {
    throw new Error("No dbInstance provided");
  }
  try {
    await dbInstance.withTransactionAsync(async () => {
      // Check if the cart item already exists for the user
      const existingItem = await dbInstance.getFirstAsync(
        "SELECT * FROM cart WHERE user_id = ? AND productId = ?;",
        [cartItem.user_id, cartItem.productId]
      );
      if (existingItem) {
        // If it exists, update the quantity
        await dbInstance.runAsync(
          "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND productId = ?;",
          [cartItem.quantity, cartItem.user_id, cartItem.productId]
        );
        console.log("Cart item updated successfully");
        return;
      }
      await dbInstance.runAsync(
        "INSERT INTO cart (user_id, productId, name, quantity, price) VALUES (?, ?, ?, ?, ?);",
        [
          cartItem.user_id,
          cartItem.productId,
          cartItem.name,
          cartItem.quantity,
          cartItem.price,
        ]
      );
    });
    console.log("Cart item stored successfully");
  } catch (error) {
    console.error("Error storing cart item", error);
    throw error;
  }
};

export const getCartItems = async (dbInstance, user_id) => {
  if (!dbInstance) {
    throw new Error("No dbInstance provided");
  }
  try {
    const result = await dbInstance.getAllAsync(`SELECT * FROM cart where user_id = ?;`, [user_id]);
    if (result.length === 0) {
      console.log("No cart items found for user:", user_id);
      return [];
    }
    // console.log("Retrieved cart items:", result);
    return result;
  } catch (error) {
    console.error("Error retrieving cart items", error);
    throw error;
  }
}

export const removeCartItemdb = async (dbInstance, user_id, productId) => {
  if (!dbInstance) throw new Error("No dbInstance provided");
  try {
    await dbInstance.withTransactionAsync(async () => {
      await dbInstance.runAsync(
        "DELETE FROM cart WHERE user_id = ? AND productId = ?;",
        [user_id, productId]
      );
    });
    console.log("Cart item removed successfully");
  } catch (error) {
    console.error("Error removing cart item", error);
    throw error;
  }
};

export const updateCartItemQuantitydb = async (dbInstance, user_id, productId, quantity) => {
  if (!dbInstance) throw new Error("No dbInstance provided");
  try {
    await dbInstance.withTransactionAsync(async () => {
      await dbInstance.runAsync(
        "UPDATE cart SET quantity = ? WHERE user_id = ? AND productId = ?;",
        [quantity, user_id, productId]
      );
    });
    console.log("Cart item quantity updated successfully");
  } catch (error) {
    console.error("Error updating cart item quantity", error);
    throw error;
  }
};

export const removeMultipleCartItems = async (dbInstance, user_id, productIds) => {
  if (!dbInstance) throw new Error("No dbInstance provided");
  try {
    // Build a query with placeholders for each productId
    const placeholders = productIds.map(() => '?').join(', ');
    const query = `DELETE FROM cart WHERE user_id = ? AND productId IN (${placeholders});`;
    await dbInstance.withTransactionAsync(async () => {
      await dbInstance.runAsync(query, [user_id, ...productIds]);
    });
    console.log("Selected cart items removed successfully for user:", user_id);
  } catch (error) {
    console.error("Error removing selected cart items", error);
    throw error;
  }
};





