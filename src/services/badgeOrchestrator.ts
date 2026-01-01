import * as Haptics from 'expo-haptics';
import { checkAllBadges } from '../utils/badgeChecker';
import * as dbHelpers from '../db/helpers';
import { useBadgeStore } from '../stores/badgeStore';
import type { Badge } from '../db/schema';

/**
 * Badge Orchestrator
 *
 * Centralized service for coordinating badge checking across the app.
 * Handles debouncing, loading states, and synchronization between SQLite and Zustand.
 */
class BadgeOrchestrator {
  private static instance: BadgeOrchestrator;
  private isChecking = false;
  private isSyncing = false;
  private debounceTimer: NodeJS.Timeout | null = null;
  private pendingCheck = false; // Queue for pending check requests

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): BadgeOrchestrator {
    if (!BadgeOrchestrator.instance) {
      BadgeOrchestrator.instance = new BadgeOrchestrator();
    }
    return BadgeOrchestrator.instance;
  }

  /**
   * Check all badges immediately
   * Returns newly unlocked badges
   * If a check is already in progress, queues another check to run after
   */
  async checkBadgesNow(): Promise<Badge[]> {
    // If already checking, queue another check for when this one finishes
    if (this.isChecking) {
      if (__DEV__) {
        console.log('[BadgeOrchestrator] Badge check already in progress, queuing for later');
      }
      this.pendingCheck = true;
      return [];
    }

    try {
      this.isChecking = true;
      useBadgeStore.getState().setIsCheckingBadges(true);

      if (__DEV__) {
        console.log('[BadgeOrchestrator] Starting badge check...');
      }

      // Load data from database
      const [activities, earnedBadges, relapses, journeyStart] = await Promise.all([
        dbHelpers.getActivities(1000),
        dbHelpers.getEarnedBadges(),
        dbHelpers.getRelapses(100),
        dbHelpers.getJourneyStart(),
      ]);

      if (__DEV__) {
        console.log(`[BadgeOrchestrator] Loaded ${activities.length} activities, ${earnedBadges.length} earned badges, ${relapses.length} relapses`);
      }

      // Run badge checker
      const { newlyUnlocked, progress } = await checkAllBadges(
        activities,
        earnedBadges,
        relapses,
        journeyStart || undefined
      );

      if (__DEV__) {
        console.log(`[BadgeOrchestrator] Badge check complete: ${newlyUnlocked.length} newly unlocked, ${progress.length} in progress`);
      }

      // Build progress record for batch update
      const progressRecord: Record<string, { badgeId: string; progress: number; current: number; required: number }> = {};
      for (const progressItem of progress) {
        progressRecord[progressItem.badgeId] = progressItem;
      }

      // Save newly unlocked badges to database and store
      if (newlyUnlocked.length > 0) {
        if (__DEV__) {
          console.log('[BadgeOrchestrator] Saving newly unlocked badges:', newlyUnlocked.map(b => b.id));
        }

        try {
          // Save all badges atomically using transaction
          const savedBadges = await dbHelpers.addEarnedBadgesBatch(
            newlyUnlocked.map(b => b.id)
          );

          // Get badges for celebration queue
          const celebrationBadges = savedBadges
            .map(eb => newlyUnlocked.find(b => b.id === eb.badge_id))
            .filter((b): b is Badge => b !== undefined);

          // PERFORMANCE: Single batch update instead of multiple individual calls
          useBadgeStore.getState().batchUpdate({
            addEarnedBadges: savedBadges,
            addToCelebrationQueue: celebrationBadges,
            badgeProgress: progressRecord,
            lastCheckedTimestamp: new Date().toISOString(),
          });

          // Trigger haptic feedback
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
          console.error('[BadgeOrchestrator] Error saving badges:', error);
          // Store not updated if database failed - maintains consistency
        }
      } else {
        // No new badges, still update progress and timestamp in single call
        useBadgeStore.getState().batchUpdate({
          badgeProgress: progressRecord,
          lastCheckedTimestamp: new Date().toISOString(),
        });
      }

      return newlyUnlocked;
    } catch (error) {
      if (__DEV__) {
        console.error('[BadgeOrchestrator] Error checking badges:', error);
      }
      return [];
    } finally {
      this.isChecking = false;
      useBadgeStore.getState().setIsCheckingBadges(false);

      // If there was a pending check request, run it now
      if (this.pendingCheck) {
        this.pendingCheck = false;
        // Use setTimeout to avoid stack overflow from recursive calls
        setTimeout(() => this.checkBadgesNow(), 0);
      }
    }
  }

  /**
   * Check badges with debounce (500ms delay)
   * Prevents multiple rapid badge checks
   */
  checkBadgesDebounced(): void {
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    if (__DEV__) {
      console.log('[BadgeOrchestrator] Badge check scheduled (500ms debounce)');
    }

    // Schedule new check
    this.debounceTimer = setTimeout(() => {
      this.checkBadgesNow();
      this.debounceTimer = null;
    }, 500);
  }

  /**
   * Sync earned badges from database to store
   * Used when screens come into focus
   * Protected with mutex to prevent race conditions
   */
  async syncBadgesFromDB(): Promise<void> {
    // Prevent concurrent syncs and don't sync while checking badges
    if (this.isSyncing || this.isChecking) {
      if (__DEV__) {
        console.log('[BadgeOrchestrator] Sync skipped - another operation in progress');
      }
      return;
    }

    try {
      this.isSyncing = true;
      if (__DEV__) {
        console.log('[BadgeOrchestrator] Syncing badges from database...');
      }
      const badges = await dbHelpers.getEarnedBadges();
      useBadgeStore.getState().setEarnedBadges(badges);
      if (__DEV__) {
        console.log(`[BadgeOrchestrator] Synced ${badges.length} badges from database`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[BadgeOrchestrator] Error syncing badges:', error);
      }
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Check if badge checking is currently in progress
   */
  isCheckingBadges(): boolean {
    return this.isChecking;
  }

  /**
   * Cancel any pending debounced check
   */
  cancelPendingCheck(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
      if (__DEV__) {
        console.log('[BadgeOrchestrator] Cancelled pending badge check');
      }
    }
    this.pendingCheck = false;
  }
}

// Export singleton instance
export const badgeOrchestrator = BadgeOrchestrator.getInstance();
