import { db } from '../connection';

export const reportQueries = {
  getExpensesForCsv(userId: number, startDate: string, endDate: string) {
    return db.getAllSync(
      `
      SELECT
        e.id,
        e.date,
        e.amount,
        e.merchant,
        e.description,
        e.source,
        c.name AS category
      FROM expenses e
      INNER JOIN categories c ON c.id = e.category_id
      WHERE e.user_id = ?
        AND e.deleted_at IS NULL
        AND date(e.date) BETWEEN date(?) AND date(?)
      ORDER BY e.date ASC, e.id ASC
      `,
      [userId, startDate, endDate]
    );
  },
};