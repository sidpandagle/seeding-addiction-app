import { useMemo, useState, useEffect } from 'react';
import { useRelapseStore } from '../stores/relapseStore';
import { getJourneyStart } from '../db/helpers';
import { getCheckpointProgress, millisecondsToTimeBreakdown } from '../utils/checkpointHelpers';
import { getGrowthStage } from '../utils/growthStages';

/**
 * Shared hook for journey statistics
 * Consolidates duplicate calculations across screens
 * Updates every second for real-time stats, but only recalculates when dependencies change
 * LiveTimer component handles its own second-by-second updates
 */
export function useJourneyStats() {
  const relapses = useRelapseStore((state) => state.relapses);
  const [journeyStart, setJourneyStart] = useState<string | null>(null);
  const [updateTrigger, setUpdateTrigger] = useState(Date.now());

  // Load journey start timestamp
  useEffect(() => {
    const loadJourneyStart = async () => {
      const start = await getJourneyStart();
      setJourneyStart(start);
    };
    loadJourneyStart();
  }, [relapses]); // Reload when relapses change

  // Update stats every second for real-time accuracy
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTrigger(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
        // Legacy compatibility
        timeDiff: 0,
      };
    }

    const elapsedTime = Math.max(0, updateTrigger - new Date(startTime).getTime());

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
      // Legacy compatibility
      timeDiff: elapsedTime,
    };
  }, [relapses, journeyStart, updateTrigger]);

  return stats;
}
