import { useMemo } from 'react';
import { getCheckpointProgress, getGrowthStage } from '../utils/growthStages';
import { useLatestRelapseTimestamp } from '../stores/relapseStore';
import { useJourneyStartLoader } from './useJourneyStartLoader';
import { useStageTick } from './useClock';

/**
 * Shared hook for journey statistics
 * Re-renders only when the latest relapse changes or the streak reaches a new growth stage
 * (one scheduled timeout instead of polling). The timer card keeps its own minute tick.
 */
export function useJourneyStats() {
  // Use optimized selector that only updates when latest timestamp changes
  const latestRelapseTimestamp = useLatestRelapseTimestamp();

  // Use centralized journey start loader
  const { journeyStart, isLoading } = useJourneyStartLoader();

  // Current streak starts at the most recent relapse, or the journey start
  const startTime = latestRelapseTimestamp || journeyStart;
  const startMs = startTime ? new Date(startTime).getTime() : null;

  // Time of the last stage change (or refocus), so stage values stay correct
  const now = useStageTick(startMs);

  return useMemo(() => {
    if (!startTime || startMs === null) {
      return {
        startTime: null,
        journeyStart,
        now,
        checkpointProgress: null,
        growthStage: getGrowthStage(0),
        hasStarted: false,
        isLoading,
      };
    }

    const elapsedTime = Math.max(0, now - startMs);

    return {
      startTime,
      journeyStart,
      now,
      checkpointProgress: getCheckpointProgress(elapsedTime),
      growthStage: getGrowthStage(elapsedTime),
      hasStarted: true,
      isLoading,
    };
  }, [startTime, startMs, journeyStart, now, isLoading]);
}
