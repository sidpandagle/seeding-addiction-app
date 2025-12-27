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
  private debounceTimer: NodeJS.Timeout | null = null;

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
   */
  async checkBadgesNow(): Promise<Badge[]> {
    // Prevent concurrent checks
    if (this.isChecking) {
      console.log('[BadgeOrchestrator] Badge check already in progress, skipping');
      return [];
    }

    try {
      this.isChecking = true;
      useBadgeStore.getState().setIsCheckingBadges(true);

      console.log('[BadgeOrchestrator] Starting badge check...');

      // Load data from database
      const [activities, earnedBadges, relapses, journeyStart] = await Promise.all([
        dbHelpers.getActivities(1000),
        dbHelpers.getEarnedBadges(),
        dbHelpers.getRelapses(100),
        dbHelpers.getJourneyStart(),
      ]);

      console.log(`[BadgeOrchestrator] Loaded ${activities.length} activities, ${earnedBadges.length} earned badges, ${relapses.length} relapses`);

      // Run badge checker
      const { newlyUnlocked, progress } = await checkAllBadges(
        activities,
        earnedBadges,
        relapses,
        journeyStart || undefined
      );

      console.log(`[BadgeOrchestrator] Badge check complete: ${newlyUnlocked.length} newly unlocked, ${progress.length} in progress`);

      // Save newly unlocked badges to database and store
      if (newlyUnlocked.length > 0) {
        console.log('[BadgeOrchestrator] Saving newly unlocked badges:', newlyUnlocked.map(b => b.id));

        for (const badge of newlyUnlocked) {
          try {
            const earnedBadge = await dbHelpers.addEarnedBadge(badge.id);
            useBadgeStore.getState().addEarnedBadge(earnedBadge);
            useBadgeStore.getState().enqueueCelebration(badge);
          } catch (error) {
            console.error(`[BadgeOrchestrator] Error saving badge ${badge.id}:`, error);
          }
        }

        // Trigger haptic feedback
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
          console.warn('[BadgeOrchestrator] Haptic feedback failed:', error);
        }
      }

      // Update badge progress
      for (const progressItem of progress) {
        useBadgeStore.getState().setBadgeProgress(progressItem.badgeId, progressItem);
      }

      // Update last checked timestamp
      useBadgeStore.getState().setLastCheckedTimestamp(new Date().toISOString());

      return newlyUnlocked;
    } catch (error) {
      console.error('[BadgeOrchestrator] Error checking badges:', error);
      return [];
    } finally {
      this.isChecking = false;
      useBadgeStore.getState().setIsCheckingBadges(false);
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

    console.log('[BadgeOrchestrator] Badge check scheduled (500ms debounce)');

    // Schedule new check
    this.debounceTimer = setTimeout(() => {
      this.checkBadgesNow();
      this.debounceTimer = null;
    }, 500);
  }

  /**
   * Sync earned badges from database to store
   * Used when screens come into focus
   */
  async syncBadgesFromDB(): Promise<void> {
    try {
      console.log('[BadgeOrchestrator] Syncing badges from database...');
      const badges = await dbHelpers.getEarnedBadges();
      useBadgeStore.getState().setEarnedBadges(badges);
      console.log(`[BadgeOrchestrator] Synced ${badges.length} badges from database`);
    } catch (error) {
      console.error('[BadgeOrchestrator] Error syncing badges:', error);
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
      console.log('[BadgeOrchestrator] Cancelled pending badge check');
    }
  }
}

// Export singleton instance
export const badgeOrchestrator = BadgeOrchestrator.getInstance();
