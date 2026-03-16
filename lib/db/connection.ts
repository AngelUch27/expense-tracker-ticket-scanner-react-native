import { Platform } from 'react-native';

let db: any = null;

if (Platform.OS !== "web") {
  const SQLite = require("expo-sqlite");
  db = SQLite.openDatabaseSync("expense_tracker.db");
}

export { db };

export function enableForeignKeys() {
  if (db) {
    db.execSync('PRAGMA foreign_keys = ON');
  }
}
