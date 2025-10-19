import { useState, useEffect, memo } from 'react';
import { View, Text } from 'react-native';
import { millisecondsToTimeBreakdown } from '../../utils/growthStages';

interface LiveTimerProps {
  startTime: string; // ISO timestamp
  showDays?: boolean;
}

function LiveTimer({ startTime, showDays = true }: LiveTimerProps) {
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    // Update only this component every second
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeDiff = Math.max(0, time - new Date(startTime).getTime());
  const { days, hours, minutes, seconds } = millisecondsToTimeBreakdown(timeDiff);

  return (
    <View className="items-center">
      {showDays && days > 0 && (
        <View className="mb-1">
          <Text className="text-5xl font-extrabold text-gray-900 dark:text-white">
            {days}
            <Text className="text-xl font-medium text-gray-500 dark:text-gray-400"> days</Text>
          </Text>
        </View>
      )}
      <View className="flex-row items-baseline gap-1">
        {hours > 0 && (
          <>
            <Text className={`font-bold text-gray-800 dark:text-gray-200 ${days > 0 ? 'text-2xl' : 'text-3xl'}`}>
              {hours.toString().padStart(2, '0')}
            </Text>
            <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">h</Text>
          </>
        )}
        <Text className={`font-bold text-gray-800 dark:text-gray-200 ${days > 0 ? 'text-2xl' : 'text-3xl'}`}>
          {minutes.toString().padStart(2, '0')}
        </Text>
        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">m</Text>
        <Text className={`font-bold text-gray-800 dark:text-gray-200 ${days > 0 ? 'text-2xl' : 'text-3xl'}`}>
          {seconds.toString().padStart(2, '0')}
        </Text>
        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">s</Text>
      </View>
    </View>
  );
}

// Export memoized version to prevent re-renders when parent updates
export default memo(LiveTimer);
