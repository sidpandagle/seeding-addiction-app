import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useIsFocused } from 'expo-router';
import { MS_PER_MINUTE } from '../constants/timeUnits';
import { getNextStageTime } from '../utils/growthStages';
import { getLocalDateString } from '../utils/dateHelpers';

/**
 * Clock hooks that re-render only when something visible changes, instead of polling.
 *
 * Each hook schedules one timeout for the next moment that matters (the next elapsed
 * minute, the next growth stage, midnight). Timers stop while the screen is unfocused
 * or the app is in the background, and catch up as soon as it is visible again.
 */

// Long waits are split so no single native timer runs for hours
const MAX_TIMER_MS = 10 * MS_PER_MINUTE;
// Fire slightly after the boundary so the new value is already reached
const SLACK_MS = 25;

function useAppActive(): boolean {
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setActive(state === 'active'));
    return () => subscription.remove();
  }, []);
  return active;
}

/**
 * Re-render at the times returned by `nextAt`. `resetKey` restarts the schedule when its inputs change.
 */
function useScheduledNow(nextAt: (now: number) => number | null, resetKey: string): number {
  const isFocused = useIsFocused();
  const appActive = useAppActive();
  const [now, setNow] = useState(() => Date.now());
  const nextAtRef = useRef(nextAt);
  nextAtRef.current = nextAt;

  useEffect(() => {
    if (!isFocused || !appActive) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let target = nextAtRef.current(Date.now());

    const arm = () => {
      if (target === null) return;
      const delay = Math.min(Math.max(target - Date.now(), 0) + SLACK_MS, MAX_TIMER_MS);
      timer = setTimeout(() => {
        const t = Date.now();
        if (target !== null && t >= target) {
          setNow(t);
          target = nextAtRef.current(t);
        }
        arm();
      }, delay);
    };

    // Catch up after mount, refocus or returning from the background
    setNow(Date.now());
    arm();
    return () => clearTimeout(timer);
  }, [isFocused, appActive, resetKey]);

  return now;
}

/**
 * Current time, updated on every `intervalMs` boundary counted from `anchorMs`.
 * With a streak start as the anchor, minutes and seconds roll over exactly when the timer digits do.
 */
export function useElapsedTick(anchorMs: number | null, intervalMs: number): number {
  return useScheduledNow(
    (now) => (anchorMs === null ? null : anchorMs + (Math.floor((now - anchorMs) / intervalMs) + 1) * intervalMs),
    `${anchorMs}:${intervalMs}`
  );
}

/**
 * Current time, updated only when the streak that began at `startMs` reaches its next growth stage.
 */
export function useStageTick(startMs: number | null): number {
  return useScheduledNow(
    (now) => (startMs === null ? null : getNextStageTime(startMs, now)),
    `stage:${startMs}`
  );
}

/**
 * Today's local date (YYYY-MM-DD), updated at midnight.
 */
export function useLocalDay(): string {
  const now = useScheduledNow((t) => {
    const midnight = new Date(t);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime();
  }, 'day');
  return getLocalDateString(new Date(now).toISOString());
}
