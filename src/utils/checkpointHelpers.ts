import { CHECKPOINTS, Checkpoint } from '../data/checkpoints';

export interface CheckpointProgress {
  currentCheckpoint: Checkpoint | null; // The checkpoint just achieved/passed
  nextCheckpoint: Checkpoint | null; // The next checkpoint to reach
  progress: number; // 0 to 1, progress towards next checkpoint
  isCompleted: boolean; // True if all checkpoints are completed
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
      nextCheckpoint: CHECKPOINTS[0],
      progress: 0,
      isCompleted: false,
    };
  }

  // Find the current checkpoint (the last one that's been passed)
  let currentCheckpointIndex = -1;
  for (let i = 0; i < CHECKPOINTS.length; i++) {
    if (elapsedTime >= CHECKPOINTS[i].duration) {
      currentCheckpointIndex = i;
    } else {
      break;
    }
  }

  // If beyond all checkpoints
  if (currentCheckpointIndex === CHECKPOINTS.length - 1) {
    const lastCheckpoint = CHECKPOINTS[CHECKPOINTS.length - 1];
    return {
      currentCheckpoint: lastCheckpoint,
      nextCheckpoint: null,
      progress: 1,
      isCompleted: true,
    };
  }

  // Normal case: between checkpoints
  const currentCheckpoint = currentCheckpointIndex >= 0 ? CHECKPOINTS[currentCheckpointIndex] : null;
  const nextCheckpoint = CHECKPOINTS[currentCheckpointIndex + 1];

  // Calculate progress between current and next checkpoint
  const startTime = currentCheckpoint ? currentCheckpoint.duration : 0;
  const endTime = nextCheckpoint.duration;
  const timeInCurrentRange = elapsedTime - startTime;
  const totalRangeTime = endTime - startTime;
  const progress = Math.min(Math.max(timeInCurrentRange / totalRangeTime, 0), 1);

  return {
    currentCheckpoint,
    nextCheckpoint,
    progress,
    isCompleted: false,
  };
}

/**
 * Get the current checkpoint that has been achieved
 * @param elapsedTime - Time elapsed in milliseconds
 * @returns Current checkpoint or null if none achieved yet
 */
export function getCurrentCheckpoint(elapsedTime: number): Checkpoint | null {
  return getCheckpointProgress(elapsedTime).currentCheckpoint;
}

/**
 * Get the next checkpoint to reach
 * @param elapsedTime - Time elapsed in milliseconds
 * @returns Next checkpoint or null if all completed
 */
export function getNextCheckpoint(elapsedTime: number): Checkpoint | null {
  return getCheckpointProgress(elapsedTime).nextCheckpoint;
}

/**
 * Calculate progress towards the next checkpoint (0 to 1)
 * @param elapsedTime - Time elapsed in milliseconds
 * @returns Progress value between 0 and 1
 */
export function calculateProgress(elapsedTime: number): number {
  return getCheckpointProgress(elapsedTime).progress;
}

/**
 * Format time remaining until next checkpoint
 * @param remainingTime - Time remaining in milliseconds
 * @returns Formatted string (e.g., "2h 30m 15s", "1d 5h", "45m 30s")
 */
export function formatTimeRemaining(remainingTime: number): string {
  if (remainingTime <= 0) {
    return '0s';
  }

  const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    // For days, only show days and hours
    return parts.join(' ');
  }

  if (hours > 0) {
    parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    // For hours, only show hours and minutes
    return parts.join(' ');
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);
    return parts.join(' ');
  }

  // Less than a minute
  return `${seconds}s`;
}
