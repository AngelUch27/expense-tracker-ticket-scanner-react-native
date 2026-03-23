import { enableForeignKeys } from './connection';
import { runMigrations } from './migrations';
import { resetDatabase } from './reset'; // si es que queremos resetear la bd
//import { seedDefaultCategories } from './seeds';

const SHOULD_RESET_DB = false; // siempre en FALSO, TRUE para limpiar tablas 

export function initDatabase() {

  if (SHOULD_RESET_DB) {
    resetDatabase();
  }

  enableForeignKeys();
  runMigrations();
  //seedDefaultCategories();
}