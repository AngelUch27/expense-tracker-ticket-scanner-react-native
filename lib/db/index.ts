import { enableForeignKeys } from './connection';
import { runMigrations } from './migrations';
import { seedDefaultCategories } from './seeds';

export function initDatabase() {
  enableForeignKeys();
  runMigrations();
  seedDefaultCategories();
}