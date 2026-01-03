import { useReducedMotion as useReanimatedReducedMotion } from 'react-native-reanimated';

/**
 * Animation duration presets that respect reduced motion preferences
 * All components should use these constants for consistent timing
 */
export const ANIMATION_PRESETS = {
  // Navigation transitions
  navigation: {
    duration: 200,
    fade: 200,
    slide: 300,
  },
  // Modal animations
  modal: {
    backdropDuration: 200,
    contentDuration: 300,
    springDamping: 20,
    springStiffness: 300,
  },
  // Card entrance animations
  card: {
    duration: 400,
    staggerDelay: 100,
    maxStaggerDelay: 300,
  },
  // List item animations
  list: {
    duration: 300,
    staggerDelay: 50,
    maxStaggerDelay: 300,
  },
  // Grid item animations
  grid: {
    duration: 300,
    staggerDelay: 30,
    maxStaggerDelay: 300,
  },
} as const;

/**
 * Central hook for checking reduced motion preference
 * Wraps Reanimated's useReducedMotion for consistent accessibility handling
 * 
 * @returns true if the user has enabled reduced motion in system settings
 * 
 * Usage:
 * ```tsx
 * const reducedMotion = useReducedMotion();
 * 
 * // Conditional animation
 * <Animated.View
 *   entering={reducedMotion ? undefined : FadeIn.duration(400)}
 * >
 * ```
 */
export function useReducedMotion(): boolean {
  const reducedMotion = useReanimatedReducedMotion();
  return reducedMotion === true;
}

/**
 * Helper to get animation config based on reduced motion preference
 * Returns undefined for entering/exiting animations when reduced motion is enabled
 */
export function getEnteringAnimation<T>(
  reducedMotion: boolean,
  animation: T
): T | undefined {
  return reducedMotion ? undefined : animation;
}

/**
 * Helper to calculate staggered delay with a maximum cap
 * Prevents excessively long delays for large lists
 */
export function getStaggerDelay(
  index: number,
  baseDelay: number,
  maxDelay: number
): number {
  return Math.min(index * baseDelay, maxDelay);
}
