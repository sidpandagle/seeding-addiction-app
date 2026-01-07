/**
 * AnimatedEmoji Component
 *
 * Renders Noto Emoji animations using Lottie with automatic fallback to static emojis
 * Features:
 * - Automatic emoji-to-Lottie mapping
 * - Reduced motion support (falls back to static emoji)
 * - Multiple animation behaviors (loop, once, interactive)
 * - Graceful fallback for unavailable animations
 */

import React, { useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import LottieView from 'lottie-react-native';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { EMOJI_TO_CODEPOINT } from '../../utils/notoEmojiMapping';
import { getLottieSource } from '../../assets/notoEmojis';

interface AnimatedEmojiProps {
  /** The emoji character to animate (e.g., '🔥') */
  emoji: string;

  /** Size in pixels (width and height) */
  size?: number;

  /** Animation behavior */
  behavior?: 'loop' | 'once' | 'interactive' | 'static';

  /** Animation speed multiplier (0.5 = half speed, 2 = double speed) */
  speed?: number;

  /** Accessibility label for screen readers */
  accessibilityLabel?: string;

  /** Test ID for testing */
  testID?: string;
}

/**
 * Static emoji fallback component
 * Used when:
 * - Reduced motion is enabled
 * - Lottie animation is unavailable
 * - Animation behavior is 'static'
 */
function StaticEmojiFallback({ emoji, size }: { emoji: string; size: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: size * 0.75 }}>{emoji}</Text>
    </View>
  );
}

/**
 * Get animation configuration based on behavior
 */
function getAnimationConfig(behavior: AnimatedEmojiProps['behavior']) {
  switch (behavior) {
    case 'once':
      return { autoPlay: true, loop: false };
    case 'loop':
      return { autoPlay: true, loop: true };
    case 'interactive':
      return { autoPlay: false, loop: false };
    case 'static':
      return { autoPlay: false, loop: false };
    default:
      return { autoPlay: true, loop: true };
  }
}

export default function AnimatedEmoji({
  emoji,
  size = 48,
  behavior = 'once',
  speed = 1,
  accessibilityLabel,
  testID,
}: AnimatedEmojiProps) {
  const reducedMotion = useReducedMotion();
  const animationRef = useRef<LottieView>(null);

  // 1. Check if reduced motion is enabled → use static fallback
  if (reducedMotion) {
    return <StaticEmojiFallback emoji={emoji} size={size} />;
  }

  // 2. Check if behavior is explicitly static
  if (behavior === 'static') {
    return <StaticEmojiFallback emoji={emoji} size={size} />;
  }

  // 3. Get Lottie source for emoji
  const codepoint = EMOJI_TO_CODEPOINT[emoji];
  const lottieSource = codepoint ? getLottieSource(codepoint) : null;

  // 4. If no Lottie available, use fallback
  if (!lottieSource) {
    if (__DEV__) {
      console.log(`[AnimatedEmoji] No Lottie animation for emoji: ${emoji} (will use static fallback)`);
    }
    return <StaticEmojiFallback emoji={emoji} size={size} />;
  }

  // 5. Configure animation based on behavior
  const animationConfig = getAnimationConfig(behavior);

  // 6. Handle interactive behavior
  const handlePress = () => {
    if (behavior === 'interactive' && animationRef.current) {
      animationRef.current.reset();
      animationRef.current.play();
    }
  };

  // 7. Render Lottie animation
  const lottieComponent = (
    <View
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? `${emoji} emoji`}
      testID={testID}
    >
      <LottieView
        ref={animationRef}
        source={lottieSource}
        autoPlay={animationConfig.autoPlay}
        loop={animationConfig.loop}
        speed={speed}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );

  // 8. Wrap in Pressable if interactive
  if (behavior === 'interactive') {
    return (
      <Pressable onPress={handlePress} testID={testID ? `${testID}-pressable` : undefined}>
        {lottieComponent}
      </Pressable>
    );
  }

  return lottieComponent;
}
