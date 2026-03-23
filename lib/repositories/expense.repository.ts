import { db } from '../db/connection';

export const expenseRepository = {
  getAllByUser(userId: number) {
    return db.getAllSync(
      `
      SELECT
        e.*,
      FROM expenses e
      WHERE e.user_id = ? 
      ORDER BY e.date DESC, e.id DESC
      `,
      [userId]
    );
  },

  getByFilters(input: {
    userId: number;
    startDate?: string;
    endDate?: string;
    categoryId?: number;
  }) {
    const conditions = ['e.user_id = ?'];
    const params: (string | number)[] = [input.userId];

    if (input.startDate) {
      conditions.push('date(e.date) >= date(?)');
      params.push(input.startDate);
    }

    if (input.endDate) {
      conditions.push('date(e.date) <= date(?)');
      params.push(input.endDate);
    }

    if (input.categoryId) {
      conditions.push('e.category_id = ?');
      params.push(input.categoryId);
    }

    const sql = `
      SELECT e.*, c.name AS category_name, c.color AS category_color
      FROM expenses e
      INNER JOIN categories c ON c.id = e.category_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY e.date DESC, e.id DESC
    `;

    return db.getAllSync(sql, params);
  },

  create(input: {
    userId: number;
    amount: number;
    date: string;
    description?: string | null;
  }) {
    db.runSync(
      `
      INSERT INTO expenses (
        user_id, amount, date, description
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        input.userId,
        input.amount,
        input.date,
        input.description ?? null,
      ]
    );
  },

  update(id: number, input: {
    amount: number;
    date: string;
    merchant?: string | null;
    description?: string | null;
  }) {
    db.runSync(
      `
      UPDATE expenses
      SET
        amount = ?,
        date = ?,
        merchant = ?,
        description = ?,
      WHERE id = ?
      `,
      [
        input.amount,
        input.date,
        input.merchant ?? null,
        input.description ?? null,
        id,
      ]
    );
  },

  deleteById(id: number) {
    db.runSync(
      `
      DELETE FROM expenses
      WHERE id = ?
      `,
      [id]
    );
  },
};