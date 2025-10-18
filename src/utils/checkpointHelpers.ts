/**
 * DEPRECATED: This file is maintained for backward compatibility only.
 * All checkpoint functions have been migrated to growthStages.ts
 *
 * Please import directly from growthStages.ts instead:
 * import { getCheckpointProgress, millisecondsToTimeBreakdown, formatTimeRemaining } from './growthStages';
 */

// Re-export everything from growthStages.ts for backward compatibility
export type {
  CheckpointProgress,
  TimeBreakdown,
  Checkpoint,
  GrowthStageConfig,
} from './growthStages';

export {
  getCheckpointProgress,
  millisecondsToTimeBreakdown,
  formatTimeRemaining,
  CHECKPOINTS,
} from './growthStages';
