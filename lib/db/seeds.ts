import { db } from './connection';

export function seedDefaultCategories() {
  const user = db.getFirstSync<{ id: number }>('SELECT id FROM users LIMIT 1');

  if (!user) return;

  const categories = [
    { name: 'Comida', color: '#EF4444', icon: 'utensils' },
    { name: 'Transporte', color: '#3B82F6', icon: 'car' },
    { name: 'Renta', color: '#8B5CF6', icon: 'house' },
    { name: 'Ocio', color: '#F59E0B', icon: 'film' },
    { name: 'Salud', color: '#10B981', icon: 'heart' },
    { name: 'Servicios', color: '#6366F1', icon: 'bolt' },
    { name: 'Otros', color: '#6B7280', icon: 'circle-help' },
  ];

  for (const category of categories) {
    db.runSync(
      `
      INSERT OR IGNORE INTO categories (user_id, name, color, icon, is_default)
      VALUES (?, ?, ?, ?, 1)
      `,
      [user.id, category.name, category.color, category.icon]
    );
  }
}