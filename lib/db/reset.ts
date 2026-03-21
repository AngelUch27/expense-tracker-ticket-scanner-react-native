import { db } from "./connection";

export function resetDatabase() {
  db.execSync(`
    DROP TABLE IF EXISTS alerts;
    DROP TABLE IF EXISTS recurring_rules;
    DROP TABLE IF EXISTS expenses;
    DROP TABLE IF EXISTS receipts;
    DROP TABLE IF EXISTS budget_categories;
    DROP TABLE IF EXISTS budgets;
    DROP TABLE IF EXISTS incomes;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS users;
  `);
}