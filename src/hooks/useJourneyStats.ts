import { useMemo, useState, useEffect, useRef } from 'react';
import { getJourneyStart } from '../db/helpers';
import { getCheckpointProgress } from '../utils/growthStages';
import { getGrowthStage } from '../utils/growthStages';
import { useLatestRelapseTimestamp } from '../stores/relapseStore';

/**
 * Shared hook for journey statistics
 * Optimized to avoid unnecessary re-renders and database calls
 * Updates when the latest relapse timestamp changes OR when milestones are crossed
 * LiveTimer component handles its own second-by-second updates independently
 */
export function useJourneyStats() {
  // Use optimized selector that only updates when latest timestamp changes
  const latestRelapseTimestamp = useLatestRelapseTimestamp();

  const [journeyStart, setJourneyStart] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const journeyStartLoadedRef = useRef(false);

  // State to trigger updates when milestones are crossed
  const [, setMilestoneTrigger] = useState(0);

  // Track previous growth stage and checkpoint to detect changes
  const previousGrowthStageRef = useRef<string | null>(null);
  const previousCheckpointRef = useRef<string | null>(null);

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

  // Monitor for milestone changes every 60 seconds
  useEffect(() => {
    const startTime = latestRelapseTimestamp || journeyStart;
    if (!startTime) return;

    const checkMilestones = () => {
      const elapsed = Math.max(0, Date.now() - new Date(startTime).getTime());
      const currentGrowthStage = getGrowthStage(elapsed);
      const currentCheckpoint = getCheckpointProgress(elapsed);

      const currentGrowthStageId = currentGrowthStage.id;
      const currentCheckpointId = currentCheckpoint.nextCheckpoint?.id ?? 'completed';

      // Check if growth stage or checkpoint has changed
      // Only log and update if we have a previous value (skip initial render)
      if (previousGrowthStageRef.current !== null && 
          (previousGrowthStageRef.current !== currentGrowthStageId ||
           previousCheckpointRef.current !== currentCheckpointId)) {
        console.log('🎯 Milestone crossed! Growth:', previousGrowthStageRef.current, '→', currentGrowthStageId, 'Checkpoint:', previousCheckpointRef.current, '→', currentCheckpointId);
        
        // Trigger recalculation by updating state
        setMilestoneTrigger(prev => prev + 1);
      }
      
      // Always update refs after check
      previousGrowthStageRef.current = currentGrowthStageId;
      previousCheckpointRef.current = currentCheckpointId;
    };

    // Initial check (will set refs but not log)
    checkMilestones();

    // Check every 5 seconds for milestone changes
    const interval = setInterval(checkMilestones, 5000);

    return () => clearInterval(interval);
  }, [latestRelapseTimestamp, journeyStart]);

  // Calculate stats based on current time when milestones change or relapses change
  // This provides updated values when growth stages or checkpoints are crossed
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

    // Calculate elapsed time (updates when milestones are crossed)
    const elapsedTime = Math.max(0, Date.now() - new Date(startTime).getTime());

    return {
      startTime,
      checkpointProgress: getCheckpointProgress(elapsedTime),
      growthStage: getGrowthStage(elapsedTime),
      hasStarted: true,
      isLoading,
    };
  }, [latestRelapseTimestamp, journeyStart, isLoading, previousGrowthStageRef.current, previousCheckpointRef.current]);

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
