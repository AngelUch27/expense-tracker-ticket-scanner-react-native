import { db } from './connection';

export function runMigrations() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      currency TEXT NOT NULL DEFAULT 'MXN',
      timezone TEXT NOT NULL DEFAULT 'America/Mexico_City',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      color TEXT,
      icon TEXT,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, name)
    );

    CREATE TABLE IF NOT EXISTS incomes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL CHECK (amount >= 0),
      type TEXT NOT NULL CHECK (type IN ('fixed', 'variable')),
      period TEXT NOT NULL DEFAULT 'monthly',
      date TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
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

    CREATE TABLE IF NOT EXISTS budget_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      budget_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      limit_amount REAL NOT NULL CHECK (limit_amount >= 0),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
      UNIQUE(budget_id, category_id)
    );

    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      image_uri TEXT NOT NULL,
      ocr_text TEXT,
      detected_total REAL,
      detected_date TEXT,
      detected_merchant TEXT,
      detected_currency TEXT,
      suggested_category_id INTEGER,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'rejected')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (suggested_category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      receipt_id INTEGER,
      amount REAL NOT NULL CHECK (amount >= 0),
      date TEXT NOT NULL,
      merchant TEXT,
      description TEXT,
      source TEXT NOT NULL DEFAULT 'manual'
        CHECK (source IN ('manual', 'ticket')),
      currency TEXT NOT NULL DEFAULT 'MXN',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      deleted_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
      FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      budget_id INTEGER NOT NULL,
      category_id INTEGER,
      type TEXT NOT NULL
        CHECK (type IN ('budget_80', 'budget_100', 'overspent')),
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS recurring_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      merchant TEXT NOT NULL,
      category_id INTEGER,
      expected_amount REAL,
      frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
    CREATE INDEX IF NOT EXISTS idx_incomes_user_id_date ON incomes(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON budgets(user_id, period_type, period_key);
    CREATE INDEX IF NOT EXISTS idx_budget_categories_budget_id ON budget_categories(budget_id);
    CREATE INDEX IF NOT EXISTS idx_receipts_user_id_status ON receipts(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_expenses_user_id_date ON expenses(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_expenses_category_id_date ON expenses(category_id, date);
    CREATE INDEX IF NOT EXISTS idx_alerts_user_id_created_at ON alerts(user_id, created_at);
  `);
}