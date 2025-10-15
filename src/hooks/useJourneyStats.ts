import { useMemo, useState, useEffect, useRef } from 'react';
import { getJourneyStart } from '../db/helpers';
import { getCheckpointProgress } from '../utils/checkpointHelpers';
import { getGrowthStage } from '../utils/growthStages';
import { useLatestRelapseTimestamp } from '../stores/relapseStore';

/**
 * Shared hook for journey statistics
 * Optimized to avoid unnecessary re-renders and database calls
 * Only recalculates when the latest relapse timestamp changes
 * LiveTimer component handles its own second-by-second updates independently
 */
export function useJourneyStats() {
  // Use optimized selector that only updates when latest timestamp changes
  const latestRelapseTimestamp = useLatestRelapseTimestamp();

  const [journeyStart, setJourneyStart] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const journeyStartLoadedRef = useRef(false);

  // Load journey start timestamp ONCE on mount (not on every relapse change)
  useEffect(() => {
    if (journeyStartLoadedRef.current) return;

    let isMounted = true;
    const loadJourneyStart = async () => {
      try {
        const start = await getJourneyStart();
        if (isMounted) {
          setJourneyStart(start);
          setIsLoading(false);
          journeyStartLoadedRef.current = true;
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
  }, []); // Only run once on mount

  // Calculate stats based on snapshot when relapses change
  // This provides a stable reference point for non-time-dependent components
  const stats = useMemo(() => {
    // Determine start time (most recent relapse or journey start)
    const startTime = latestRelapseTimestamp || journeyStart;

    if (!startTime) {
      return {
        startTime: null,
        checkpointProgress: null,
        growthStage: getGrowthStage(0),
        hasStarted: false,
        isLoading,
      };
    }

    // Calculate elapsed time as a snapshot (not continuously updating)
    // Time-dependent components should use LiveTimer or their own intervals
    const snapshotTime = Math.max(0, Date.now() - new Date(startTime).getTime());

    return {
      startTime,
      checkpointProgress: getCheckpointProgress(snapshotTime),
      growthStage: getGrowthStage(snapshotTime),
      hasStarted: true,
      isLoading,
    };
  }, [latestRelapseTimestamp, journeyStart, isLoading]);

  return stats;
}
/**
 * Hook for components that only need the start time
 * Use for: LiveTimer component
 * Optimized to load journey start once and use cached latest relapse
 */
export function useJourneyStartTime(): string | null {
  const latestRelapseTimestamp = useLatestRelapseTimestamp();
  const [journeyStart, setJourneyStart] = useState<string | null>(null);
  const journeyStartLoadedRef = useRef(false);

  useEffect(() => {
    if (journeyStartLoadedRef.current) return;

    let isMounted = true;
    const loadJourneyStart = async () => {
      try {
        const start = await getJourneyStart();
        if (isMounted) {
          setJourneyStart(start);
          journeyStartLoadedRef.current = true;
        }
      } catch (error) {
        console.error('Error loading journey start:', error);
      }
    };
    loadJourneyStart();
    return () => {
      isMounted = false;
    };
  }, []); // Only load once

  // Return the most recent timestamp (relapse or journey start)
  return latestRelapseTimestamp || journeyStart;
}

/**
 * Hook for components that only need the growth stage
 * Use for: Growth icon displays
 * Optimized to load journey start once and use cached latest relapse
 */
export function useGrowthStage() {
  const latestRelapseTimestamp = useLatestRelapseTimestamp();
  const [journeyStart, setJourneyStart] = useState<string | null>(null);
  const journeyStartLoadedRef = useRef(false);

  useEffect(() => {
    if (journeyStartLoadedRef.current) return;

    let isMounted = true;
    const loadJourneyStart = async () => {
      try {
        const start = await getJourneyStart();
        if (isMounted) {
          setJourneyStart(start);
          journeyStartLoadedRef.current = true;
        }
      } catch (error) {
        console.error('Error loading journey start:', error);
      }
    };
    loadJourneyStart();
    return () => {
      isMounted = false;
    };
  }, []); // Only load once

  const growthStage = useMemo(() => {
    const startTime = latestRelapseTimestamp || journeyStart;
    if (!startTime) return getGrowthStage(0);

    const elapsedTime = Math.max(0, Date.now() - new Date(startTime).getTime());
    return getGrowthStage(elapsedTime);
  }, [latestRelapseTimestamp, journeyStart]);

  return growthStage;
}

/**
 * Hook for components that only need checkpoint progress
 * Use for: Progress bars and checkpoint displays
 * Optimized to load journey start once and use cached latest relapse
 */
export function useCheckpointProgress() {
  const latestRelapseTimestamp = useLatestRelapseTimestamp();
  const [journeyStart, setJourneyStart] = useState<string | null>(null);
  const journeyStartLoadedRef = useRef(false);

  useEffect(() => {
    if (journeyStartLoadedRef.current) return;

    let isMounted = true;
    const loadJourneyStart = async () => {
      try {
        const start = await getJourneyStart();
        if (isMounted) {
          setJourneyStart(start);
          journeyStartLoadedRef.current = true;
        }
      } catch (error) {
        console.error('Error loading journey start:', error);
      }
    };
    loadJourneyStart();
    return () => {
      isMounted = false;
    };
  }, []); // Only load once

  const checkpointProgress = useMemo(() => {
    const startTime = latestRelapseTimestamp || journeyStart;
    if (!startTime) return null;

    const elapsedTime = Math.max(0, Date.now() - new Date(startTime).getTime());
    return getCheckpointProgress(elapsedTime);
  }, [latestRelapseTimestamp, journeyStart]);

  return checkpointProgress;
}
