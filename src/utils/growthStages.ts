/**
 * Growth stage definitions and utilities
 * Represents broader emotional/metaphorical phases of the recovery journey
 * These complement the detailed checkpoint system with meaningful visual metaphors
 */

export type GrowthStage = 'seedling' | 'sprout' | 'young-plant' | 'sapling' | 'tree' | 'forest' | 'ancient';

export interface GrowthStageConfig {
  id: GrowthStage;
  label: string;
  emoji: string;
  minMinutes: number;
  description: string;
  color: string;
}

export const GROWTH_STAGES: GrowthStageConfig[] = [
  {
    id: 'seedling',
    label: 'Seedling',
    emoji: '🌱',
    minMinutes: 0,
    description: 'Just planted. The journey begins.',
    color: '#E8F5E9',
  },
  {
    id: 'sprout',
    label: 'Sprout',
    emoji: '🌿',
    minMinutes: 60, // 1 hour
    description: 'Breaking through. Building momentum.',
    color: '#A5D6A7',
  },
  {
    id: 'young-plant',
    label: 'Young Plant',
    emoji: '🪴',
    minMinutes: 360, // 6 hours
    description: 'Growing strong. Taking shape.',
    color: '#66BB6A',
  },
  {
    id: 'sapling',
    label: 'Sapling',
    emoji: '🌳',
    minMinutes: 1440, // 1 day
    description: 'Taking root. Standing firm.',
    color: '#43A047',
  },
  {
    id: 'tree',
    label: 'Tree',
    emoji: '🌲',
    minMinutes: 4320, // 3 days
    description: 'Standing tall. Growing resilient.',
    color: '#2E7D32',
  },
  {
    id: 'forest',
    label: 'Forest',
    emoji: '🏔️',
    minMinutes: 10080, // 7 days
    description: 'Unshakeable. Deeply rooted.',
    color: '#1B5E20',
  },
  {
    id: 'ancient',
    label: 'Ancient',
    emoji: '🏆',
    minMinutes: 30240, // 21 days
    description: 'Legendary. Timeless strength.',
    color: '#FFD700',
  },
];

/**
 * Determine the current growth stage based on elapsed time
 * @param elapsedTime - Time elapsed in milliseconds
 * @returns Current growth stage configuration
 */
export function getGrowthStage(elapsedTime: number): GrowthStageConfig {
  const minutes = elapsedTime / (1000 * 60);

  // Find the matching stage (iterate backwards to find highest threshold met)
  for (let i = GROWTH_STAGES.length - 1; i >= 0; i--) {
    const stage = GROWTH_STAGES[i];
    if (minutes >= stage.minMinutes) {
      return stage;
    }
  }

  // Default to first stage if something goes wrong
  return GROWTH_STAGES[0];
}

/**
 * Get the next growth stage if available
 * @param currentStage - Current growth stage ID
 * @returns Next stage config or null if at final stage
 */
export function getNextStage(currentStage: GrowthStage): GrowthStageConfig | null {
  const currentIndex = GROWTH_STAGES.findIndex((s) => s.id === currentStage);
  if (currentIndex === -1 || currentIndex === GROWTH_STAGES.length - 1) {
    return null;
  }
  return GROWTH_STAGES[currentIndex + 1];
}

/**
 * Calculate progress towards the next growth stage (0 to 1)
 * @param elapsedTime - Time elapsed in milliseconds
 * @returns Progress value between 0 and 1, or 1 if at final stage
 */
export function getStageProgress(elapsedTime: number): number {
  const currentStage = getGrowthStage(elapsedTime);
  const nextStage = getNextStage(currentStage.id);

  if (!nextStage) {
    return 1; // At final stage
  }

  const minutes = elapsedTime / (1000 * 60);
  const minutesInCurrentStage = minutes - currentStage.minMinutes;
  const totalMinutesInStage = nextStage.minMinutes - currentStage.minMinutes;

  return Math.min(Math.max(minutesInCurrentStage / totalMinutesInStage, 0), 1);
}

/**
 * Get time until the next growth stage
 * @param elapsedTime - Time elapsed in milliseconds
 * @returns Time remaining in milliseconds, or null if at final stage
 */
export function getTimeUntilNextStage(elapsedTime: number): number | null {
  const currentStage = getGrowthStage(elapsedTime);
  const nextStage = getNextStage(currentStage.id);

  if (!nextStage) {
    return null; // At final stage
  }

  const minutes = elapsedTime / (1000 * 60);
  const minutesRemaining = nextStage.minMinutes - minutes;
  return minutesRemaining * 60 * 1000; // Convert back to milliseconds
}
