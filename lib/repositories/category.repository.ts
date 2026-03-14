import { db } from '../connection';

export const categoryRepository = {
  getAllByUser(userId: number) {
    return db.getAllSync(
      `
      SELECT *
      FROM categories
      WHERE user_id = ?
      ORDER BY is_default DESC, name ASC
      `,
      [userId]
    );
  },

  create(userId: number, name: string, color?: string | null, icon?: string | null) {
    db.runSync(
      `
      INSERT INTO categories (user_id, name, color, icon)
      VALUES (?, ?, ?, ?)
      `,
      [userId, name, color ?? null, icon ?? null]
    );
  },

  remove(id: number) {
    db.runSync(`DELETE FROM categories WHERE id = ?`, [id]);
  },
};