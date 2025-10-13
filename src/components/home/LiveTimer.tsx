import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { millisecondsToTimeBreakdown } from '../../utils/checkpointHelpers';

interface LiveTimerProps {
  startTime: string; // ISO timestamp
  showDays?: boolean;
}

/**
 * Optimized timer component that only re-renders itself
 * Isolated from parent component to prevent cascading re-renders
 */
export default function LiveTimer({ startTime, showDays = true }: LiveTimerProps) {
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
        <Text className="mt-2 text-5xl font-bold text-gray-900 dark:text-white">
          {days}
          <Text className='text-lg font-medium'>d</Text>
        </Text>
      )}
      <Text className={`font-bold text-gray-900 dark:text-white ${days > 0 ? 'mt-2 text-2xl' : 'mt-2 text-3xl'}`}>
        {hours > 0 && <>{hours.toString().padStart(2, '0')}<Text className='text-base font-medium'>h</Text> </>}
        {minutes.toString().padStart(2, '0')}<Text className='text-base font-medium'>m</Text> {seconds.toString().padStart(2, '0')}<Text className='text-base font-medium'>s</Text>
      </Text>
    </View>
  );
}
