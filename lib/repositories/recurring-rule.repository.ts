import { db } from '../connection';

export const recurringRuleRepository = {
  getAllByUser(userId: number) {
    return db.getAllSync(
      `
      SELECT *
      FROM recurring_rules
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId]
    );
  },

  create(input: {
    userId: number;
    merchant: string;
    categoryId?: number | null;
    expectedAmount?: number | null;
    frequency: 'weekly' | 'monthly';
  }) {
    db.runSync(
      `
      INSERT INTO recurring_rules (user_id, merchant, category_id, expected_amount, frequency)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        input.userId,
        input.merchant,
        input.categoryId ?? null,
        input.expectedAmount ?? null,
        input.frequency,
      ]
    );
  },

  disable(id: number) {
    db.runSync(
      `
      UPDATE recurring_rules
      SET is_active = 0
      WHERE id = ?
      `,
      [id]
    );
  },
};