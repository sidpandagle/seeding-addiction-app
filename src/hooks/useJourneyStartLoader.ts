import { useState, useEffect, useRef } from 'react';
import { getJourneyStart } from '../db/helpers';

/**
 * Custom hook to load journey start timestamp
 * Prevents duplicate loading logic across multiple hooks
 * Loads once on mount and caches the result
 *
 * @returns Object containing journeyStart timestamp and loading state
 */
export function useJourneyStartLoader() {
  const [journeyStart, setJourneyStart] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const journeyStartLoadedRef = useRef(false);

  useEffect(() => {
    // Skip if already loaded
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

  return { journeyStart, isLoading };
}
