import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import affirmationsData from '../data/affirmations.json';

interface LeafProps {
  delay: number;
  duration: number;
  startX: number;
}

const FloatingLeaf: React.FC<LeafProps> = ({ delay, duration, startX }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(0);
      translateX.setValue(0);
      rotate.setValue(0);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: duration,
          delay: delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: Math.random() > 0.5 ? 30 : -30,
          duration: duration,
          delay: delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 360,
          duration: duration,
          delay: delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: duration * 0.2,
            delay: delay,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: duration * 0.3,
            delay: duration * 0.5,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setTimeout(animate, Math.random() * 3000 + 2000);
      });
    };

    animate();
  }, [delay, duration, translateY, translateX, rotate, opacity]);

  const spin = rotate.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        top: -20,
        opacity: opacity,
        transform: [
          { translateY: translateY },
          { translateX: translateX },
          { rotate: spin },
        ],
      }}
    >
      <Text style={{ fontSize: 20 }}>🍃</Text>
    </Animated.View>
  );
};

export const MotivationCard: React.FC = () => {
  const isDark = useThemeStore((state:any) => state.isDark);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [showLeaves, setShowLeaves] = useState(false);

  const affirmations = affirmationsData.affirmations;

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        // Trigger leaf animation
        setShowLeaves(true);
        setTimeout(() => setShowLeaves(false), 100);

        // Change text
        setCurrentIndex((prev) => (prev + 1) % affirmations.length);

        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start();
      });
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, [fadeAnim, affirmations.length]);

  return (
    <View className="relative p-5 mx-4 mb-6 border rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
      {/* Leaf animations */}
      {showLeaves && (
        <>
          <FloatingLeaf delay={0} duration={2500} startX={20} />
          <FloatingLeaf delay={200} duration={2800} startX={60} />
          <FloatingLeaf delay={400} duration={2600} startX={100} />
        </>
      )}

      <View className="flex-row items-center mb-2">
        <Text className="mr-2 text-2xl">🌱</Text>
        <Text className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
          Daily Reflection
        </Text>
      </View>

      <Animated.View style={{ opacity: fadeAnim }}>
        <Text className="text-base italic leading-6 text-gray-700 dark:text-gray-300">
          "{affirmations[currentIndex]}"
        </Text>
      </Animated.View>

      {/* Decorative elements */}
      <View className="absolute flex-row gap-1 bottom-2 right-3">
        <Text className="text-xs opacity-30">🌿</Text>
      </View>
    </View>
  );
};
