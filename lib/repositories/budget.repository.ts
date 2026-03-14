import { db } from '../connection';

export const budgetRepository = {
  upsertBudget(input: {
    userId: number;
    periodType?: 'monthly' | 'weekly' | 'biweekly';
    periodKey: string;
    totalAmount: number;
  }) {
    db.runSync(
      `
      INSERT INTO budgets (user_id, period_type, period_key, total_amount)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, period_type, period_key)
      DO UPDATE SET
        total_amount = excluded.total_amount,
        updated_at = datetime('now')
      `,
      [
        input.userId,
        input.periodType ?? 'monthly',
        input.periodKey,
        input.totalAmount,
      ]
    );
  },

  getBudgetByPeriod(
    userId: number,
    periodKey: string,
    periodType: 'monthly' | 'weekly' | 'biweekly' = 'monthly'
  ) {
    return db.getFirstSync(
      `
      SELECT *
      FROM budgets
      WHERE user_id = ? AND period_key = ? AND period_type = ?
      LIMIT 1
      `,
      [userId, periodKey, periodType]
    );
  },

  setCategoryLimit(budgetId: number, categoryId: number, limitAmount: number) {
    db.runSync(
      `
      INSERT INTO budget_categories (budget_id, category_id, limit_amount)
      VALUES (?, ?, ?)
      ON CONFLICT(budget_id, category_id)
      DO UPDATE SET
        limit_amount = excluded.limit_amount
      `,
      [budgetId, categoryId, limitAmount]
    );
  },

  getCategoryLimits(budgetId: number) {
    return db.getAllSync(
      `
      SELECT bc.*, c.name AS category_name, c.color AS category_color
      FROM budget_categories bc
      INNER JOIN categories c ON c.id = bc.category_id
      WHERE bc.budget_id = ?
      ORDER BY c.name ASC
      `,
      [budgetId]
    );
  },
};