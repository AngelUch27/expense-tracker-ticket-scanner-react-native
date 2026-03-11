import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('expense_tracker.db');

export function enableForeignKeys() {
    db.execSync('PRAGMA foreign_keys = ON')
}