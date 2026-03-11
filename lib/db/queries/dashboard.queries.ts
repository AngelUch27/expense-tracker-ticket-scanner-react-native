import { db } from '../connection';

export const dashboardQueries = {
  getMonthlySummary(userId: number, periodKey: string) {
    return db.getFirstSync(
      `
      WITH expense_sum AS (
        SELECT COALESCE(SUM(amount), 0) AS total_spent
        FROM expenses
        WHERE user_id = ?
          AND deleted_at IS NULL
          AND strftime('%Y-%m', date) = ?
      ),
      income_sum AS (
        SELECT COALESCE(SUM(amount), 0) AS total_income
        FROM incomes
        WHERE user_id = ?
          AND strftime('%Y-%m', date) = ?
      )
      SELECT
        income_sum.total_income,
        expense_sum.total_spent,
        b.total_amount AS budget_total,
        CASE
          WHEN COALESCE(b.total_amount, 0) = 0 THEN 0
          ELSE ROUND((expense_sum.total_spent * 100.0) / b.total_amount, 2)
        END AS spent_percentage,
        COALESCE(b.total_amount, 0) - expense_sum.total_spent AS remaining
      FROM expense_sum, income_sum
      LEFT JOIN budgets b
        ON b.user_id = ?
       AND b.period_type = 'monthly'
       AND b.period_key = ?
      `,
      [userId, periodKey, userId, periodKey, userId, periodKey]
    );
  },

  getExpensesByCategory(userId: number, periodKey: string) {
    return db.getAllSync(
      `
      SELECT
        c.id AS category_id,
        c.name AS category_name,
        c.color AS category_color,
        COALESCE(SUM(e.amount), 0) AS total_spent
      FROM categories c
      LEFT JOIN expenses e
        ON e.category_id = c.id
       AND e.user_id = ?
       AND e.deleted_at IS NULL
       AND strftime('%Y-%m', e.date) = ?
      WHERE c.user_id = ?
      GROUP BY c.id, c.name, c.color
      ORDER BY total_spent DESC, c.name ASC
      `,
      [userId, periodKey, userId]
    );
  },
};