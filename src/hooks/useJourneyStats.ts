import { useMemo, useState, useEffect } from 'react';
import { useRelapseStore } from '../stores/relapseStore';
import { getJourneyStart } from '../db/helpers';
import { getCheckpointProgress, millisecondsToTimeBreakdown } from '../utils/checkpointHelpers';
import { getGrowthStage } from '../utils/growthStages';

/**
 * Shared hook for journey statistics
 * Consolidates duplicate calculations across screens
 * Calculates stats on demand without intervals
 * LiveTimer component handles its own second-by-second updates independently
 */
export function useJourneyStats() {
  const relapses = useRelapseStore((state) => state.relapses);
  const [journeyStart, setJourneyStart] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load journey start timestamp
  useEffect(() => {
    let isMounted = true;
    const loadJourneyStart = async () => {
      try {
        const start = await getJourneyStart();
        if (isMounted) {
          setJourneyStart(start);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading journey start:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadJourneyStart();
    
    return () => {
      isMounted = false;
    };
  }, [relapses]); // Reload when relapses change

  const stats = useMemo(() => {
    let startTime: string | null = null;

    if (relapses.length === 0) {
      // No relapses - use journey start time
      startTime = journeyStart;
    } else {
      // Has relapses - use last relapse time
      const sortedRelapses = [...relapses].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      startTime = sortedRelapses[0].timestamp;
    }

    if (!startTime) {
      return {
        startTime: null,
        elapsedTime: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        checkpointProgress: null,
        growthStage: getGrowthStage(0),
        hasStarted: false,
        isLoading,
        // Legacy compatibility
        timeDiff: 0,
      };
    }

    // Calculate elapsed time at the moment of render
    const elapsedTime = Math.max(0, Date.now() - new Date(startTime).getTime());

    const { days, hours, minutes, seconds } = millisecondsToTimeBreakdown(elapsedTime);

    return {
      startTime,
      elapsedTime,
      days,
      hours,
      minutes,
      seconds,
      checkpointProgress: getCheckpointProgress(elapsedTime),
      growthStage: getGrowthStage(elapsedTime),
      hasStarted: true,
      isLoading,
      // Legacy compatibility
      timeDiff: elapsedTime,
    };
  }, [relapses, journeyStart, isLoading]);

  return stats;
}
