/**
 * Celebration messages and logic for activity tracking
 * Shows encouraging messages based on milestones
 */

export interface CelebrationMessage {
  message: string;
  emoji: string;
  milestone: 'monthly' | 'weekly' | 'streak' | 'first';
}

/**
 * Get celebration message based on activity count and milestones
 */
export const getCelebrationMessage = (
  totalActivitiesThisMonth: number,
  totalActivitiesThisWeek: number,
  daysInARow: number,
  isFirstActivity: boolean
): CelebrationMessage | null => {
  // First activity ever
  if (isFirstActivity) {
    return {
      message: "You've started watering your plant! 🌱 This is the beginning of growth.",
      emoji: '🌱',
      milestone: 'first',
    };
  }

  // Days in a row milestones
  if (daysInARow === 3) {
    return {
      message: '🔥 3 days in a row! You\'re building momentum!',
      emoji: '🔥',
      milestone: 'streak',
    };
  }

  if (daysInARow === 7) {
    return {
      message: '🔥 A whole week of growth! That\'s incredible!',
      emoji: '🔥',
      milestone: 'streak',
    };
  }

  if (daysInARow === 14) {
    return {
      message: '🚀 2 weeks of consistency! You\'re unstoppable!',
      emoji: '🚀',
      milestone: 'streak',
    };
  }

  // Weekly milestones
  if (totalActivitiesThisWeek === 5) {
    return {
      message: '🎉 5 activities this week! You\'re watering daily!',
      emoji: '🎉',
      milestone: 'weekly',
    };
  }

  // Monthly milestones
  if (totalActivitiesThisMonth === 10) {
    return {
      message: '🏆 10 activities this month! You\'re committed to growth!',
      emoji: '🏆',
      milestone: 'monthly',
    };
  }

  if (totalActivitiesThisMonth === 20) {
    return {
      message: '👑 20 activities this month! You\'re a growth champion!',
      emoji: '👑',
      milestone: 'monthly',
    };
  }

  if (totalActivitiesThisMonth === 30) {
    return {
      message: '⭐ 30 activities in a month! You\'re legendary!',
      emoji: '⭐',
      milestone: 'monthly',
    };
  }

  // Generic encouragement based on total
  if (totalActivitiesThisWeek === 3) {
    return {
      message: '💪 3 activities this week! Keep it up!',
      emoji: '💪',
      milestone: 'weekly',
    };
  }

  return null;
};

/**
 * Calculate all the stats needed for celebration messages
 */
export const calculateCelebrationStats = (
  activities: Array<{ timestamp: string }>,
  currentActivityTimestamp: string
): {
  totalActivitiesThisMonth: number;
  totalActivitiesThisWeek: number;
  daysInARow: number;
  isFirstActivity: boolean;
} => {
  const now = new Date();
  const currentDate = new Date(currentActivityTimestamp);

  // Month boundaries
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Count activities
  const thisMonth = activities.filter(a => {
    const date = new Date(a.timestamp);
    return date >= monthStart;
  }).length + 1; // +1 for current activity

  const thisWeek = activities.filter(a => {
    const date = new Date(a.timestamp);
    return date > weekAgo;
  }).length + 1; // +1 for current activity

  // Calculate days in a row
  const sortedActivities = [...activities]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  let daysInARow = 1;
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedActivities.length; i++) {
    const actDate = new Date(sortedActivities[i].timestamp);
    actDate.setHours(0, 0, 0, 0);

    const dayDiff = (currentDate.getTime() - actDate.getTime()) / (24 * 60 * 60 * 1000);
    if (dayDiff === daysInARow) {
      daysInARow++;
    } else if (dayDiff > daysInARow) {
      break;
    }
  }

  return {
    totalActivitiesThisMonth: thisMonth,
    totalActivitiesThisWeek: thisWeek,
    daysInARow,
    isFirstActivity: activities.length === 0,
  };
};
