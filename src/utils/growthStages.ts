/**
 * Growth stage definitions and utilities
 * Maps checkpoint milestones to visual growth metaphors
 */

export type GrowthStage = '5min' | '15min' | '30min' | '1hr' | '2hr' | '3hr' | '6hr' | '12hr' | '1d' | '2d' | '3d' | '7d' | '14d' | '21d';

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
    id: '5min',
    label: '5 minutes',
    emoji: '🌱',
    minMinutes: 0,
    description: 'Just planted. The journey begins.',
    color: '#E8F5E9',
  },
  {
    id: '15min',
    label: '15 minutes',
    emoji: '🌾',
    minMinutes: 5,
    description: 'Taking the first step.',
    color: '#C8E6C9',
  },
  {
    id: '30min',
    label: '30 minutes',
    emoji: '🌿',
    minMinutes: 15,
    description: 'Half an hour of strength.',
    color: '#A5D6A7',
  },
  {
    id: '1hr',
    label: '1 hour',
    emoji: '☘️',
    minMinutes: 30,
    description: 'One hour conquered.',
    color: '#81C784',
  },
  {
    id: '2hr',
    label: '2 hours',
    emoji: '🍀',
    minMinutes: 60,
    description: 'Building momentum.',
    color: '#66BB6A',
  },
  {
    id: '3hr',
    label: '3 hours',
    emoji: '🌿',
    minMinutes: 120,
    description: 'Three hours strong.',
    color: '#4CAF50',
  },
  {
    id: '6hr',
    label: '6 hours',
    emoji: '🪴',
    minMinutes: 180,
    description: 'Half a day resilient.',
    color: '#43A047',
  },
  {
    id: '12hr',
    label: '12 hours',
    emoji: '🌳',
    minMinutes: 360,
    description: 'Twelve hours standing tall.',
    color: '#388E3C',
  },
  {
    id: '1d',
    label: '1 day',
    emoji: '🌲',
    minMinutes: 720,
    description: 'One day victorious.',
    color: '#2E7D32',
  },
  {
    id: '2d',
    label: '2 days',
    emoji: '🎋',
    minMinutes: 1440,
    description: 'Two days thriving.',
    color: '#1B5E20',
  },
  {
    id: '3d',
    label: '3 days',
    emoji: '🌴',
    minMinutes: 2880,
    description: 'Three days deep-rooted.',
    color: '#0D5E1F',
  },
  {
    id: '7d',
    label: '1 week',
    emoji: '🌳',
    minMinutes: 4320,
    description: 'One week unshakeable.',
    color: '#0A4D18',
  },
  {
    id: '14d',
    label: '2 weeks',
    emoji: '🏔️',
    minMinutes: 10080,
    description: 'Two weeks unwavering.',
    color: '#083C12',
  },
  {
    id: '21d',
    label: '3 weeks',
    emoji: '🏆',
    minMinutes: 20160,
    description: 'Three weeks legendary.',
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
