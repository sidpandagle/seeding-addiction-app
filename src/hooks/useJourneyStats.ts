import { useMemo, useState, useEffect } from 'react';
import { useRelapseStore } from '../stores/relapseStore';
import { getJourneyStart } from '../db/helpers';
import { getCheckpointProgress, millisecondsToTimeBreakdown } from '../utils/checkpointHelpers';
import { getGrowthStage } from '../utils/growthStages';

/**
 * Shared hook for journey statistics
 * Consolidates duplicate calculations across screens
 * Recalculates only when relapses change (no interval)
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

    // Calculate elapsed time at the moment of calculation (only when relapses change)
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
/**
 * Hook for components that only need the start time
 * Use for: LiveTimer component
 */
export function useJourneyStartTime(): string | null {
  const relapses = useRelapseStore((state) => state.relapses);
  const [journeyStart, setJourneyStart] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadJourneyStart = async () => {
      try {
        const start = await getJourneyStart();
        if (isMounted) {
          setJourneyStart(start);
        }
      } catch (error) {
        console.error('Error loading journey start:', error);
      }
    };
    loadJourneyStart();
    return () => {
      isMounted = false;
    };
  }, [relapses]);

  if (relapses.length === 0) {
    return journeyStart;
  } else {
    const sortedRelapses = [...relapses].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return sortedRelapses[0].timestamp;
  }
}

/**
 * Hook for components that only need the growth stage
 * Use for: Growth icon displays
 */
export function useGrowthStage() {
  const relapses = useRelapseStore((state) => state.relapses);
  const [journeyStart, setJourneyStart] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadJourneyStart = async () => {
      try {
        const start = await getJourneyStart();
        if (isMounted) setJourneyStart(start);
      } catch (error) {
        console.error('Error loading journey start:', error);
      }
    };
    loadJourneyStart();
    return () => {
      isMounted = false;
    };
  }, [relapses]);

  const growthStage = useMemo(() => {
    let startTime: string | null = null;

    if (relapses.length === 0) {
      startTime = journeyStart;
    } else {
      const sortedRelapses = [...relapses].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      startTime = sortedRelapses[0].timestamp;
    }

    if (!startTime) return getGrowthStage(0);

    const elapsedTime = Math.max(0, Date.now() - new Date(startTime).getTime());
    return getGrowthStage(elapsedTime);
  }, [relapses, journeyStart]);

  return growthStage;
}

/**
 * Hook for components that only need checkpoint progress
 * Use for: Progress bars and checkpoint displays
 */
export function useCheckpointProgress() {
  const relapses = useRelapseStore((state) => state.relapses);
  const [journeyStart, setJourneyStart] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadJourneyStart = async () => {
      try {
        const start = await getJourneyStart();
        if (isMounted) setJourneyStart(start);
      } catch (error) {
        console.error('Error loading journey start:', error);
      }
    };
    loadJourneyStart();
    return () => {
      isMounted = false;
    };
  }, [relapses]);

  const checkpointProgress = useMemo(() => {
    let startTime: string | null = null;

    if (relapses.length === 0) {
      startTime = journeyStart;
    } else {
      const sortedRelapses = [...relapses].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      startTime = sortedRelapses[0].timestamp;
    }

    if (!startTime) return null;

    const elapsedTime = Math.max(0, Date.now() - new Date(startTime).getTime());
    return getCheckpointProgress(elapsedTime);
  }, [relapses, journeyStart]);

  return checkpointProgress;
}
