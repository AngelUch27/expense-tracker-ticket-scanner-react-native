import { db } from '../connection';

export const expenseRepository = {
  getAllByUser(userId: number) {
    return db.getAllSync(
      `
      SELECT
        e.*,
        c.name AS category_name,
        c.color AS category_color
      FROM expenses e
      INNER JOIN categories c ON c.id = e.category_id
      WHERE e.user_id = ? AND e.deleted_at IS NULL
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
    const conditions = ['e.user_id = ?', 'e.deleted_at IS NULL'];
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
    categoryId: number;
    receiptId?: number | null;
    amount: number;
    date: string;
    merchant?: string | null;
    description?: string | null;
    source?: 'manual' | 'ticket';
    currency?: string;
    notes?: string | null;
  }) {
    db.runSync(
      `
      INSERT INTO expenses (
        user_id, category_id, receipt_id, amount, date, merchant, description, source, currency, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.userId,
        input.categoryId,
        input.receiptId ?? null,
        input.amount,
        input.date,
        input.merchant ?? null,
        input.description ?? null,
        input.source ?? 'manual',
        input.currency ?? 'MXN',
        input.notes ?? null,
      ]
    );
  },

  update(id: number, input: {
    categoryId: number;
    amount: number;
    date: string;
    merchant?: string | null;
    description?: string | null;
    notes?: string | null;
  }) {
    db.runSync(
      `
      UPDATE expenses
      SET
        category_id = ?,
        amount = ?,
        date = ?,
        merchant = ?,
        description = ?,
        notes = ?,
        updated_at = datetime('now')
      WHERE id = ?
      `,
      [
        input.categoryId,
        input.amount,
        input.date,
        input.merchant ?? null,
        input.description ?? null,
        input.notes ?? null,
        id,
      ]
    );
  },

  softDelete(id: number) {
    db.runSync(
      `
      UPDATE expenses
      SET deleted_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
      `,
      [id]
    );
  },
};