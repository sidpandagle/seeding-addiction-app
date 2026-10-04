/**
 * Growth stage definitions and utilities
 * CONSOLIDATED: Combines growth stages, achievements, and checkpoints into one source of truth
 * Represents the complete recovery journey from 0 minutes to 365 days (1 year)
 */

import { millisecondsToDays, daysToMilliseconds } from '../constants/timeUnits';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type GrowthStage = string;

export interface GrowthStageConfig {
  // Core identity
  id: string;
  label: string;
  emoji: string;
  minDays: number; // Minimum days to reach this stage (supports fractional days: 5m=0.00347, 1h=0.04167, 6h=0.25, 1d=1, etc.)
  description: string;
  color: string;

  // Achievement metadata (for celebrations)
  achievementTitle: string;
  achievementDescription: string;

  // Checkpoint metadata (for progress tracking)
  shortLabel: string; // Display label (e.g., "5m", "1h", "6h", "1d", "7d", "365d")
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  threshold: number; // in milliseconds
  shortLabel: string; // e.g. "5 minutes"
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface CheckpointProgress {
  currentCheckpoint: GrowthStageConfig | null;
  nextCheckpoint: GrowthStageConfig | null;
  progress: number; // 0 to 1
  isCompleted: boolean;
}

export interface TimeBreakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// ============================================================================
// GROWTH STAGES DATA (14 stages: 5m → 1h → 6h → 1d → 365d)
// Progression with early sub-day milestones and day-based stages
// ============================================================================

export const GROWTH_STAGES: GrowthStageConfig[] = [
  {
    id: 'bean',
    label: 'Germinating Seed',
    emoji: '🫘',
    minDays: 0,
    description: "The seed awakens, the very first spark of life.",
    color: '#F3F4F6',
    achievementTitle: 'The Beginning',
    achievementDescription: "You planted the seed of growth.",
    shortLabel: '0d',
  },
  {
    id: 'sprout',
    label: 'First Minutes',
    emoji: '🌱',
    minDays: 5 / 1440, // 5 minutes = 0.00347 days
    description: "The first moments of your journey, every second counts.",
    color: '#E8F5E9',
    achievementTitle: 'First Five Minutes',
    achievementDescription: "You've taken the first step in your recovery.",
    shortLabel: '5m',
  },
  {
    id: 'seedling',
    label: 'First Hour',
    emoji: '🌿',
    minDays: 1 / 24, // 1 hour = 0.04167 days
    description: "An hour of strength, you're building momentum.",
    color: '#D0F0C0',
    achievementTitle: 'One Hour Strong',
    achievementDescription: "The first hour is complete.",
    shortLabel: '1h',
  },
  {
    id: 'small-plant',
    label: 'Six Hours',
    emoji: '☘️',
    minDays: 6 / 24, // 6 hours = 0.25 days
    description: "Quarter of a day, resilience is taking root.",
    color: '#C8E6C9',
    achievementTitle: 'Six Hour Victory',
    achievementDescription: "You're gaining strength with each passing hour.",
    shortLabel: '6h',
  },
  {
    id: 'healthy-growth',
    label: 'First Day',
    emoji: '🍀',
    minDays: 1,
    description: "Your leaves are vibrant, filled with energy and vitality.",
    color: '#A5D6A7',
    achievementTitle: 'One Full Day',
    achievementDescription: "You've completed your first day.",
    shortLabel: '1d',
  },
  {
    id: 'potted-sapling',
    label: 'Three Days',
    emoji: '🪴',
    minDays: 3,
    description: "Roots deepen, and you're adjusting to new surroundings.",
    color: '#81C784',
    achievementTitle: 'Three Day Streak',
    achievementDescription: "Care and patience are paying off.",
    shortLabel: '3d',
  },
  {
    id: 'grass-growth',
    label: 'One Week',
    emoji: '🌾',
    minDays: 7,
    description: "Your foundation strengthens, resilience takes hold.",
    color: '#AED581',
    achievementTitle: 'First Week',
    achievementDescription: "You are growing from within.",
    shortLabel: '7d',
  },
  {
    id: 'leafy-phase',
    label: 'Two Weeks',
    emoji: '🍃',
    minDays: 14,
    description: "You've grown lush and full of life.",
    color: '#9CCC65',
    achievementTitle: 'Two Week Milestone',
    achievementDescription: "Energy radiates through every leaf.",
    shortLabel: '14d',
  },
  {
    id: 'budding',
    label: 'Three Weeks',
    emoji: '🌼',
    minDays: 21,
    description: "The first buds appear, transformation is near.",
    color: '#8BC34A',
    achievementTitle: 'Three Weeks Strong',
    achievementDescription: "You're preparing for your first bloom.",
    shortLabel: '21d',
  },
  {
    id: 'blooming',
    label: 'One Month',
    emoji: '🌷',
    minDays: 30,
    description: "Your flowers begin to open, you're in full bloom.",
    color: '#7CB342',
    achievementTitle: 'One Month',
    achievementDescription: "Beauty and strength combine.",
    shortLabel: '30d',
  },
  {
    id: 'flowering',
    label: 'Two Months',
    emoji: '🌻',
    minDays: 60,
    description: "Vibrant and radiant, you are flourishing.",
    color: '#689F38',
    achievementTitle: 'Two Months',
    achievementDescription: "You've reached sustained vitality.",
    shortLabel: '60d',
  },
  {
    id: 'young-tree',
    label: 'Three Months',
    emoji: '🌴',
    minDays: 90,
    description: "You stand tall, ready to face the seasons ahead.",
    color: '#558B2F',
    achievementTitle: 'Three Months',
    achievementDescription: "Stability and wisdom grow together.",
    shortLabel: '90d',
  },
  {
    id: 'evergreen',
    label: 'Six Months',
    emoji: '🌲',
    minDays: 180,
    description: "Evergreen and enduring, your presence is constant.",
    color: '#33691E',
    achievementTitle: 'Six Months',
    achievementDescription: "You've become a symbol of lasting strength.",
    shortLabel: '180d',
  },
  {
    id: 'full-tree',
    label: 'One Year',
    emoji: '🌳',
    minDays: 365,
    description: "A magnificent tree, deeply rooted and thriving after a full year.",
    color: '#1B5E20',
    achievementTitle: 'One Year Strong',
    achievementDescription: "A full cycle of growth completed.",
    shortLabel: '365d',
  },
];





// ============================================================================
// CORE GROWTH STAGE FUNCTIONS
// ============================================================================

/**
 * Determine the current growth stage based on elapsed time
 * @param elapsedTime - Time elapsed in milliseconds
 * @returns Current growth stage configuration
 */
export function getGrowthStage(elapsedTime: number): GrowthStageConfig {
  const days = millisecondsToDays(elapsedTime);

  // Find the matching stage (iterate backwards to find highest threshold met)
  for (let i = GROWTH_STAGES.length - 1; i >= 0; i--) {
    const stage = GROWTH_STAGES[i];
    if (days >= stage.minDays) {
      return stage;
    }
  }

  // Default to first stage if something goes wrong
  return GROWTH_STAGES[0];
}

/**
 * Index of the current growth stage in GROWTH_STAGES for an elapsed time
 */
export function getStageIndex(elapsedTime: number): number {
  const days = millisecondsToDays(elapsedTime);
  for (let i = GROWTH_STAGES.length - 1; i >= 0; i--) {
    if (days >= GROWTH_STAGES[i].minDays) return i;
  }
  return 0;
}

/**
 * Epoch ms when the stage after the current one starts, or null once every stage is reached
 * @param startMs - When the current streak started
 * @param now - Current time in ms
 */
export function getNextStageTime(startMs: number, now: number): number | null {
  const elapsed = Math.max(0, now - startMs);
  const next = GROWTH_STAGES.find((stage) => daysToMilliseconds(stage.minDays) > elapsed);
  return next ? startMs + daysToMilliseconds(next.minDays) : null;
}

/**
 * Get the next growth stage if available
 * @param currentStage - Current growth stage ID
 * @returns Next stage config or null if at final stage
 */
export function getNextStage(currentStage: string): GrowthStageConfig | null {
  const currentIndex = GROWTH_STAGES.findIndex((s) => s.id === currentStage);
  if (currentIndex === -1 || currentIndex === GROWTH_STAGES.length - 1) {
    return null;
  }
  return GROWTH_STAGES[currentIndex + 1];
}

// ============================================================================
// ACHIEVEMENT FUNCTIONS (Migrated from achievements.ts)
// ============================================================================

// Memoization Cache (Performance Optimization)
// Cache prevents recreating achievement objects on every render
// Cache key: elapsedTime rounded to nearest minute (60000ms)
interface AchievementCache {
  key: number;
  result: Achievement[];
}

let achievementCache: AchievementCache | null = null;

/**
 * Get achievements based on elapsed time (memoized)
 * @param elapsedTime - Time elapsed in milliseconds
 * @returns Array of achievements with unlock status
 *
 * Performance: Caches result for 1 minute intervals
 * - Reduction: 98.3% fewer object allocations
 */
export function getAchievements(elapsedTime: number): Achievement[] {
  // Round to nearest minute for cache key (reduces cache misses)
  const cacheKey = Math.floor(elapsedTime / 60000);

  // Return cached result if available
  if (achievementCache && achievementCache.key === cacheKey) {
    return achievementCache.result;
  }

  // Calculate new result by mapping growth stages to achievements
  const result = GROWTH_STAGES.map((stage) => {
    const threshold = daysToMilliseconds(stage.minDays);
    return {
      id: stage.id,
      title: stage.achievementTitle,
      description: stage.achievementDescription,
      emoji: stage.emoji,
      threshold,
      shortLabel: stage.shortLabel,
      isUnlocked: elapsedTime >= threshold,
      unlockedAt: elapsedTime >= threshold
        ? new Date(Date.now() - (elapsedTime - threshold)).toISOString()
        : undefined,
    };
  });

  // Update cache
  achievementCache = { key: cacheKey, result };

  return result;
}

/**
 * Get newly unlocked achievements since last check
 * @param currentTime - Current elapsed time in milliseconds
 * @param previousTime - Previous elapsed time in milliseconds
 * @returns Array of newly unlocked achievements
 */
export function getNewlyUnlockedAchievements(
  currentTime: number,
  previousTime: number
): Achievement[] {
  return GROWTH_STAGES.filter((stage) => {
    const threshold = daysToMilliseconds(stage.minDays);
    return currentTime >= threshold && previousTime < threshold;
  }).map((stage) => ({
    id: stage.id,
    title: stage.achievementTitle,
    description: stage.achievementDescription,
    emoji: stage.emoji,
    shortLabel: stage.shortLabel,
    threshold: daysToMilliseconds(stage.minDays),
    isUnlocked: true,
    unlockedAt: new Date().toISOString(),
  }));
}

// ============================================================================
// CHECKPOINT FUNCTIONS (Migrated from checkpointHelpers.ts)
// ============================================================================

/**
 * Convert milliseconds to days, hours, minutes, seconds breakdown
 * @param milliseconds - Time in milliseconds
 * @returns TimeBreakdown object with days, hours, minutes, seconds
 */
export function millisecondsToTimeBreakdown(milliseconds: number): TimeBreakdown {
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

/**
 * Calculate the current checkpoint progress based on elapsed time
 * @param elapsedTime - Time elapsed in milliseconds
 * @returns CheckpointProgress object with current/next checkpoints and progress
 */
export function getCheckpointProgress(elapsedTime: number): CheckpointProgress {
  // If no time has elapsed
  if (elapsedTime <= 0) {
    return {
      currentCheckpoint: null,
      nextCheckpoint: GROWTH_STAGES[0],
      progress: 0,
      isCompleted: false,
    };
  }

  const days = millisecondsToDays(elapsedTime);

  // Find the current stage (the stage the user is currently in)
  let currentStageIndex = -1;
  for (let i = 0; i < GROWTH_STAGES.length; i++) {
    if (days >= GROWTH_STAGES[i].minDays) {
      currentStageIndex = i;
    } else {
      break;
    }
  }

  // If beyond all stages
  if (currentStageIndex === GROWTH_STAGES.length - 1) {
    const lastStage = GROWTH_STAGES[GROWTH_STAGES.length - 1];
    return {
      currentCheckpoint: lastStage,
      nextCheckpoint: null,
      progress: 1,
      isCompleted: true,
    };
  }

  // Normal case: user is in a current stage working towards the next stage
  const currentCheckpoint = GROWTH_STAGES[currentStageIndex];
  const nextCheckpoint = GROWTH_STAGES[currentStageIndex + 1];

  // Calculate progress towards the next stage
  const stageStartDays = currentCheckpoint.minDays;
  const stageDurationDays = nextCheckpoint.minDays - currentCheckpoint.minDays;
  const daysInCurrentStage = days - stageStartDays;
  const progress = Math.min(Math.max(daysInCurrentStage / stageDurationDays, 0), 1);

  return {
    currentCheckpoint,
    nextCheckpoint,
    progress,
    isCompleted: false,
  };
}

// ============================================================================
// BACKWARD COMPATIBILITY & EXPORTS
// ============================================================================

/**
 * Export CHECKPOINTS array for backward compatibility
 * All growth stages function as checkpoints in the consolidated system
 */
export const CHECKPOINTS = GROWTH_STAGES.map((stage) => ({
  id: stage.id,
  label: stage.label,
  shortLabel: stage.shortLabel,
  duration: daysToMilliseconds(stage.minDays),
}));

/**
 * Legacy Checkpoint interface for backward compatibility
 */
export interface Checkpoint {
  id: string;
  label: string;
  shortLabel: string;
  duration: number; // in milliseconds
}
