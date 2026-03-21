import { enableForeignKeys } from './connection';
import { runMigrations } from './migrations';
import { resetDatabase } from './reset'; // si es que queremos resetear la bd
//import { seedDefaultCategories } from './seeds';

const SHOULD_RESET_DB = true; // siempre en FALSO, solo para resetear la bd en caso de que mame algo

export function initDatabase() {

  if (SHOULD_RESET_DB) {
    resetDatabase();
  }

  enableForeignKeys();
  runMigrations();
  //seedDefaultCategories();
}