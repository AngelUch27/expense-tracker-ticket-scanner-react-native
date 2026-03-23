import { db } from "./connection";

export function runMigrations() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS incomes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL CHECK (amount >= 0),
      type TEXT NOT NULL CHECK (type IN ('fixed', 'variable')),
      date TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      period_type TEXT NOT NULL DEFAULT 'monthly'
        CHECK (period_type IN ('monthly', 'weekly', 'biweekly')),
      period_key TEXT NOT NULL,
      total_amount REAL NOT NULL CHECK (total_amount >= 0),
      alert_80_enabled INTEGER NOT NULL DEFAULT 1,
      alert_100_enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, period_type, period_key)
    );

    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      image_uri TEXT NOT NULL,
      ocr_text TEXT,
      detected_total REAL,
      detected_date TEXT,
      detected_merchant TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL CHECK (amount >= 0),
      date TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      budget_id INTEGER NOT NULL,
      type TEXT NOT NULL
        CHECK (type IN ('budget_80', 'budget_100', 'overspent')),
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recurring_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      merchant TEXT NOT NULL,
      expected_amount REAL,
      frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_incomes_user_id_date ON incomes(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON budgets(user_id, period_type, period_key);
    CREATE INDEX IF NOT EXISTS idx_receipts_user_id_status ON receipts(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_expenses_user_id_date ON expenses(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_alerts_user_id_created_at ON alerts(user_id, created_at);
  `);
}