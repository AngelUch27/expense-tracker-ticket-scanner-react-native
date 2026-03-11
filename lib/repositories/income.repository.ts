import { db } from '../connection';

export const incomeRepository = {
  getAllByUser(userId: number) {
    return db.getAllSync(
      `
      SELECT *
      FROM incomes
      WHERE user_id = ?
      ORDER BY date DESC, id DESC
      `,
      [userId]
    );
  },

  create(input: {
    userId: number;
    amount: number;
    type: 'fixed' | 'variable';
    period?: string;
    date: string;
    description?: string | null;
  }) {
    db.runSync(
      `
      INSERT INTO incomes (user_id, amount, type, period, date, description)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        input.userId,
        input.amount,
        input.type,
        input.period ?? 'monthly',
        input.date,
        input.description ?? null,
      ]
    );
  },

  update(id: number, input: {
    amount: number;
    type: 'fixed' | 'variable';
    period?: string;
    date: string;
    description?: string | null;
  }) {
    db.runSync(
      `
      UPDATE incomes
      SET amount = ?, type = ?, period = ?, date = ?, description = ?, updated_at = datetime('now')
      WHERE id = ?
      `,
      [
        input.amount,
        input.type,
        input.period ?? 'monthly',
        input.date,
        input.description ?? null,
        id,
      ]
    );
  },

  remove(id: number) {
    db.runSync(`DELETE FROM incomes WHERE id = ?`, [id]);
  },
};