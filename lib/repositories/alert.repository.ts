import { db } from '../connection';

export const alertRepository = {
  create(input: {
    userId: number;
    budgetId: number;
    categoryId?: number | null;
    type: 'budget_80' | 'budget_100' | 'overspent';
    message: string;
  }) {
    db.runSync(
      `
      INSERT INTO alerts (user_id, budget_id, category_id, type, message)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        input.userId,
        input.budgetId,
        input.categoryId ?? null,
        input.type,
        input.message,
      ]
    );
  },

  getAllByUser(userId: number) {
    return db.getAllSync(
      `
      SELECT *
      FROM alerts
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId]
    );
  },

  markAsRead(id: number) {
    db.runSync(
      `
      UPDATE alerts
      SET is_read = 1
      WHERE id = ?
      `,
      [id]
    );
  },
};