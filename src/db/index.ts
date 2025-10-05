/**
 * Database module exports
 *
 * This module provides all database-related functionality including
 * schema initialization and CRUD helpers for relapse records.
 */

export { initializeDatabase, getDatabase } from './schema';
export type { Relapse, RelapseInput } from './schema';
export {
  addRelapse,
  getRelapses,
  deleteRelapse,
  updateRelapse,
} from './helpers';
