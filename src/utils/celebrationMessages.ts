/**
 * Celebration messages and logic for activity tracking
 * Shows encouraging messages based on milestones
 */

import { getLocalDateString } from './dateHelpers';

export interface CelebrationMessage {
  message: string;
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
      milestone: 'first',
    };
  }

  // Days in a row milestones
  if (daysInARow === 3) {
    return {
      message: '🔥 3 days in a row! You\'re building momentum!',
      milestone: 'streak',
    };
  }

  if (daysInARow === 7) {
    return {
      message: '🔥 A whole week of growth! That\'s incredible!',
      milestone: 'streak',
    };
  }

  if (daysInARow === 14) {
    return {
      message: '🚀 2 weeks of consistency! You\'re unstoppable!',
      milestone: 'streak',
    };
  }

  // Weekly milestones
  if (totalActivitiesThisWeek === 5) {
    return {
      message: '🎉 5 activities this week! You\'re watering daily!',
      milestone: 'weekly',
    };
  }

  // Monthly milestones
  if (totalActivitiesThisMonth === 10) {
    return {
      message: '🏆 10 activities this month! You\'re committed to growth!',
      milestone: 'monthly',
    };
  }

  if (totalActivitiesThisMonth === 20) {
    return {
      message: '👑 20 activities this month! You\'re a growth champion!',
      milestone: 'monthly',
    };
  }

  if (totalActivitiesThisMonth === 30) {
    return {
      message: '⭐ 30 activities in a month! You\'re legendary!',
      milestone: 'monthly',
    };
  }

  // Generic encouragement based on total
  if (totalActivitiesThisWeek === 3) {
    return {
      message: '💪 3 activities this week! Keep it up!',
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

  // Calculate days in a row using local date strings
  const sortedActivities = [...activities]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  let daysInARow = 1;

  // Convert all activities to local date strings
  const activityDateStrings = sortedActivities.map(a =>
    getLocalDateString(a.timestamp)
  );

  // Check consecutive days backwards from current date
  const currentDateObj = new Date(currentActivityTimestamp);
  for (let i = 1; i < 365; i++) { // Reasonable upper limit
    const checkDate = new Date(currentDateObj);
    checkDate.setDate(checkDate.getDate() - i);
    const checkDateStr = getLocalDateString(checkDate.toISOString());

    if (activityDateStrings.includes(checkDateStr)) {
      daysInARow++;
    } else {
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
