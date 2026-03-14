import { db } from '../connection';

export const userRepository = {
  create(name: string, email?: string | null, currency = 'MXN', timezone = 'America/Mexico_City') {
    db.runSync(
      `
      INSERT INTO users (name, email, currency, timezone)
      VALUES (?, ?, ?, ?)
      `,
      [name, email ?? null, currency, timezone]
    );
  },

  getFirst() {
    return db.getFirstSync(`
      SELECT * FROM users
      ORDER BY id ASC
      LIMIT 1
    `);
  },

  update(id: number, data: { name: string; email?: string | null; currency: string; timezone: string }) {
    db.runSync(
      `
      UPDATE users
      SET name = ?, email = ?, currency = ?, timezone = ?, updated_at = datetime('now')
      WHERE id = ?
      `,
      [data.name, data.email ?? null, data.currency, data.timezone, id]
    );
  },
};