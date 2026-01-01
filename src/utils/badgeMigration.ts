import { cleanSlateRebadge } from '../db/helpers';

/**
 * Badge Migration Utility
 *
 * Provides a clean interface for migrating the badge system.
 * Can be called from Settings UI or programmatically.
 */

export interface BadgeMigrationResult {
  success: boolean;
  badgesAwarded: number;
  error?: string;
}

/**
 * Migrate the badge system by:
 * 1. Clearing all existing earned badges
 * 2. Recalculating which badges should be earned based on current data
 * 3. Re-awarding all earned badges
 *
 * This resolves issues with:
 * - Duplicate badges
 * - Inconsistent badge state
 * - Badges that should/shouldn't be unlocked
 *
 * @returns Result object with success status and badges awarded count
 */
export async function migrateBadgeSystem(): Promise<BadgeMigrationResult> {
  try {
    console.log('[Badge Migration] Starting badge system migration...');

    const badgesAwarded = await cleanSlateRebadge();

    console.log(`[Badge Migration] Migration completed successfully. ${badgesAwarded} badges awarded.`);

    return {
      success: true,
      badgesAwarded,
    };
  } catch (error) {
    console.error('[Badge Migration] Migration failed:', error);

    return {
      success: false,
      badgesAwarded: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred during migration',
    };
  }
}

/**
 * Check if badge migration might be needed
 * This is a heuristic check - migration is safe to run anytime
 */
export async function shouldMigrate(): Promise<boolean> {
  // For now, always return false - user can manually trigger migration
  // In the future, could check for duplicate badges or version flags
  return false;
}
