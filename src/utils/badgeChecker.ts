import { Activity, Relapse, Badge, EarnedBadge } from '../db/schema';
import { BADGE_DEFINITIONS } from '../data/badgeDefinitions';

interface BadgeProgress {
  badgeId: string;
  progress: number; // 0-1
  current: number;
  required: number;
}

interface BadgeCheckResult {
  newlyUnlocked: Badge[];
  progress: BadgeProgress[];
}

/**
 * Main function to check all badge unlock conditions
 */
export const checkAllBadges = async (
  activities: Activity[],
  earnedBadges: EarnedBadge[],
  relapses?: Relapse[],
  journeyStart?: string
): Promise<BadgeCheckResult> => {
  const earnedBadgeIds = new Set(earnedBadges.map((b) => b.badge_id));
  const newlyUnlocked: Badge[] = [];
  const progress: BadgeProgress[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    // Skip if already earned
    if (earnedBadgeIds.has(badge.id)) {
      continue;
    }

    const { unlocked, progressData } = await checkBadgeUnlock(
      badge,
      activities,
      earnedBadges,
      relapses,
      journeyStart
    );

    if (unlocked) {
      newlyUnlocked.push(badge);
    } else if (progressData) {
      progress.push(progressData);
    }
  }

  return { newlyUnlocked, progress };
};

/**
 * Check if a specific badge should be unlocked
 */
const checkBadgeUnlock = async (
  badge: Badge,
  activities: Activity[],
  earnedBadges: EarnedBadge[],
  relapses?: Relapse[],
  journeyStart?: string
): Promise<{ unlocked: boolean; progressData?: BadgeProgress }> => {
  const { type, threshold, timeframe, categoryId, customCheck } = badge.unlockCriteria;

  switch (type) {
    case 'activity_count':
      return checkActivityCount(badge, activities, threshold!, timeframe, categoryId);

    case 'streak_days':
      return checkStreakDays(badge, activities, threshold!);

    case 'category_diversity':
      return checkCategoryDiversity(badge, activities, threshold!);

    case 'time_tracking':
      return checkTimeTracking(badge, journeyStart, threshold!);

    case 'custom':
      return checkCustom(badge, activities, earnedBadges, relapses, customCheck!);

    default:
      return { unlocked: false };
  }
};

/**
 * Check activity count badges
 */
const checkActivityCount = (
  badge: Badge,
  activities: Activity[],
  threshold: number,
  timeframe?: string,
  categoryId?: string
): { unlocked: boolean; progressData?: BadgeProgress } => {
  let filteredActivities = activities;

  // Filter by category if specified
  if (categoryId) {
    filteredActivities = activities.filter((a) => a.categories?.includes(categoryId));
  }

  // Filter by timeframe
  if (timeframe && timeframe !== 'all_time') {
    const now = Date.now();
    const timeframeMs = getTimeframeMs(timeframe);
    filteredActivities = filteredActivities.filter(
      (a) => now - new Date(a.timestamp).getTime() <= timeframeMs
    );
  }

  // For weekly/daily timeframe badges with threshold >= 5, ensure activities are on different days
  let count = filteredActivities.length;
  if ((timeframe === 'week' || timeframe === 'day') && threshold >= 5) {
    const uniqueDays = new Set(
      filteredActivities.map((a) => {
        const d = new Date(a.timestamp);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );
    // For multi-day requirements, use unique days count instead of total activities
    count = uniqueDays.size;
  }

  const unlocked = count >= threshold;

  return {
    unlocked,
    progressData: unlocked
      ? undefined
      : {
          badgeId: badge.id,
          progress: Math.min(count / threshold, 1),
          current: count,
          required: threshold,
        },
  };
};

/**
 * Check streak days badges
 */
const checkStreakDays = (
  badge: Badge,
  activities: Activity[],
  threshold: number
): { unlocked: boolean; progressData?: BadgeProgress } => {
  if (activities.length === 0) {
    return {
      unlocked: false,
      progressData: {
        badgeId: badge.id,
        progress: 0,
        current: 0,
        required: threshold,
      },
    };
  }

  // Sort activities by timestamp (newest first)
  const sorted = [...activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Calculate current streak
  let currentStreak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Check if there's an activity today or yesterday
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const hasRecentActivity = sorted.some((a) => {
    const activityDate = new Date(a.timestamp);
    activityDate.setHours(0, 0, 0, 0);
    return activityDate.getTime() >= yesterday.getTime();
  });

  if (!hasRecentActivity) {
    // Streak is broken
    return {
      unlocked: false,
      progressData: {
        badgeId: badge.id,
        progress: 0,
        current: 0,
        required: threshold,
      },
    };
  }

  // Count consecutive days
  const uniqueDays = new Set(
    sorted.map((a) => {
      const d = new Date(a.timestamp);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a);

  for (let i = 0; i < sortedDays.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    if (sortedDays[i] === expectedDate.getTime()) {
      currentStreak++;
    } else {
      break;
    }
  }

  const unlocked = currentStreak >= threshold;

  return {
    unlocked,
    progressData: unlocked
      ? undefined
      : {
          badgeId: badge.id,
          progress: Math.min(currentStreak / threshold, 1),
          current: currentStreak,
          required: threshold,
        },
  };
};

/**
 * Check category diversity badges
 */
const checkCategoryDiversity = (
  badge: Badge,
  activities: Activity[],
  threshold: number
): { unlocked: boolean; progressData?: BadgeProgress } => {
  const uniqueCategories = new Set<string>();

  activities.forEach((activity) => {
    activity.categories?.forEach((category) => {
      uniqueCategories.add(category);
    });
  });

  const count = uniqueCategories.size;
  const unlocked = count >= threshold;

  return {
    unlocked,
    progressData: unlocked
      ? undefined
      : {
          badgeId: badge.id,
          progress: Math.min(count / threshold, 1),
          current: count,
          required: threshold,
        },
  };
};

/**
 * Check time tracking badges
 */
const checkTimeTracking = (
  badge: Badge,
  journeyStart: string | undefined,
  threshold: number
): { unlocked: boolean; progressData?: BadgeProgress } => {
  if (!journeyStart) {
    return { unlocked: false };
  }

  const daysSinceStart = Math.floor(
    (Date.now() - new Date(journeyStart).getTime()) / (1000 * 60 * 60 * 24)
  );

  const unlocked = daysSinceStart >= threshold;

  return {
    unlocked,
    progressData: unlocked
      ? undefined
      : {
          badgeId: badge.id,
          progress: Math.min(daysSinceStart / threshold, 1),
          current: daysSinceStart,
          required: threshold,
        },
  };
};

/**
 * Check custom badge conditions
 */
const checkCustom = (
  badge: Badge,
  activities: Activity[],
  earnedBadges: EarnedBadge[],
  relapses: Relapse[] | undefined,
  customCheck: string
): { unlocked: boolean; progressData?: BadgeProgress } => {
  switch (customCheck) {
    case 'perfectWeek':
      return checkPerfectWeek(badge, activities);

    case 'balancedWeek':
      return checkBalancedWeek(badge, activities);

    case 'wellRounded':
      return checkWellRounded(badge, activities);

    case 'mindAndBody':
      return checkMindAndBody(badge, activities);

    case 'consistentTracker':
      return checkConsistentTracker(badge, activities);

    case 'activitiesWithNotes':
      return checkActivitiesWithNotes(badge, activities);

    case 'nightOwl':
      return checkNightOwl(badge, activities);

    case 'earlyBird':
      return checkEarlyBird(badge, activities);

    case 'comeback':
      return checkComeback(badge, activities, relapses);

    case 'varietyLover':
      return checkVarietyLover(badge, activities);

    default:
      return { unlocked: false };
  }
};

/**
 * Custom check: Perfect Week (1 activity every day for 7 days)
 */
const checkPerfectWeek = (
  badge: Badge,
  activities: Activity[]
): { unlocked: boolean; progressData?: BadgeProgress } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let consecutiveDays = 0;

  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    checkDate.setHours(0, 0, 0, 0);

    const hasActivity = activities.some((a) => {
      const activityDate = new Date(a.timestamp);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === checkDate.getTime();
    });

    if (hasActivity) {
      consecutiveDays++;
    } else {
      break;
    }
  }

  const unlocked = consecutiveDays >= 7;

  return {
    unlocked,
    progressData: unlocked
      ? undefined
      : {
          badgeId: badge.id,
          progress: consecutiveDays / 7,
          current: consecutiveDays,
          required: 7,
        },
  };
};

/**
 * Custom check: Balanced Week (5+ different categories in one week with at least 10 activities total)
 */
const checkBalancedWeek = (
  badge: Badge,
  activities: Activity[]
): { unlocked: boolean; progressData?: BadgeProgress } => {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentActivities = activities.filter(
    (a) => new Date(a.timestamp).getTime() >= oneWeekAgo
  );

  // Need at least 10 activities in the week
  if (recentActivities.length < 10) {
    return {
      unlocked: false,
      progressData: {
        badgeId: badge.id,
        progress: recentActivities.length / 10,
        current: recentActivities.length,
        required: 10,
      },
    };
  }

  const categoriesThisWeek = new Set<string>();
  recentActivities.forEach((a) => {
    a.categories?.forEach((cat) => categoriesThisWeek.add(cat));
  });

  const count = categoriesThisWeek.size;
  const unlocked = count >= 5;

  return {
    unlocked,
    progressData: unlocked
      ? undefined
      : {
          badgeId: badge.id,
          progress: count / 5,
          current: count,
          required: 5,
        },
  };
};

/**
 * Custom check: Well-Rounded (10+ activities in each major category)
 */
const checkWellRounded = (
  badge: Badge,
  activities: Activity[]
): { unlocked: boolean; progressData?: BadgeProgress } => {
  const categoryGroups = ['🏃 Physical', '🧘 Mindfulness', '👥 Social', '📚 Learning', '🎨 Creative'];

  const categoryCounts = categoryGroups.map((cat) => {
    return activities.filter((a) => a.categories?.includes(cat)).length;
  });

  const minCount = Math.min(...categoryCounts);
  const unlocked = minCount >= 10;

  return {
    unlocked,
    progressData: unlocked
      ? undefined
      : {
          badgeId: badge.id,
          progress: minCount / 10,
          current: minCount,
          required: 10,
        },
  };
};

/**
 * Custom check: Mind & Body (20+ mindfulness + 20+ physical)
 */
const checkMindAndBody = (
  badge: Badge,
  activities: Activity[]
): { unlocked: boolean; progressData?: BadgeProgress } => {
  const mindfulnessCount = activities.filter((a) => a.categories?.includes('🧘 Mindfulness')).length;
  const physicalCount = activities.filter((a) => a.categories?.includes('🏃 Physical')).length;

  const unlocked = mindfulnessCount >= 20 && physicalCount >= 20;
  const progress = Math.min(mindfulnessCount / 20, physicalCount / 20);

  return {
    unlocked,
    progressData: unlocked
      ? undefined
      : {
          badgeId: badge.id,
          progress,
          current: Math.min(mindfulnessCount, physicalCount),
          required: 20,
        },
  };
};

/**
 * Custom check: Consistent Tracker (80% of weeks over 3 months)
 */
const checkConsistentTracker = (
  badge: Badge,
  activities: Activity[]
): { unlocked: boolean; progressData?: BadgeProgress } => {
  const threeMonthsAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const recentActivities = activities.filter(
    (a) => new Date(a.timestamp).getTime() >= threeMonthsAgo
  );

  if (recentActivities.length === 0) {
    return { unlocked: false };
  }

  // Count unique weeks with activities
  const weeksWithActivity = new Set<number>();
  recentActivities.forEach((a) => {
    const date = new Date(a.timestamp);
    const weekNumber = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
    weeksWithActivity.add(weekNumber);
  });

  const totalWeeks = 13; // ~90 days / 7
  const percentage = weeksWithActivity.size / totalWeeks;
  const unlocked = percentage >= 0.8;

  return {
    unlocked,
    progressData: unlocked
      ? undefined
      : {
          badgeId: badge.id,
          progress: percentage / 0.8,
          current: weeksWithActivity.size,
          required: Math.ceil(totalWeeks * 0.8),
        },
  };
};

/**
 * Custom check: Activities with notes
 */
const checkActivitiesWithNotes = (
  badge: Badge,
  activities: Activity[]
): { unlocked: boolean; progressData?: BadgeProgress } => {
  const threshold = badge.unlockCriteria.threshold || 20;
  const withNotes = activities.filter((a) => a.note && a.note.trim().length > 0);
  const count = withNotes.length;
  const unlocked = count >= threshold;

  return {
    unlocked,
    progressData: unlocked
      ? undefined
      : {
          badgeId: badge.id,
          progress: count / threshold,
          current: count,
          required: threshold,
        },
  };
};

/**
 * Custom check: Night Owl (10+ activities after 9pm)
 */
const checkNightOwl = (
  badge: Badge,
  activities: Activity[]
): { unlocked: boolean; progressData?: BadgeProgress } => {
  const nightActivities = activities.filter((a) => {
    const hour = new Date(a.timestamp).getHours();
    return hour >= 21 || hour < 6;
  });

  const count = nightActivities.length;
  const unlocked = count >= 10;

  return {
    unlocked,
    progressData: unlocked
      ? undefined
      : {
          badgeId: badge.id,
          progress: count / 10,
          current: count,
          required: 10,
        },
  };
};

/**
 * Custom check: Early Bird (10+ activities before 8am)
 */
const checkEarlyBird = (
  badge: Badge,
  activities: Activity[]
): { unlocked: boolean; progressData?: BadgeProgress } => {
  const earlyActivities = activities.filter((a) => {
    const hour = new Date(a.timestamp).getHours();
    return hour < 8;
  });

  const count = earlyActivities.length;
  const unlocked = count >= 10;

  return {
    unlocked,
    progressData: unlocked
      ? undefined
      : {
          badgeId: badge.id,
          progress: count / 10,
          current: count,
          required: 10,
        },
  };
};

/**
 * Custom check: Comeback (5 activities within 24h of relapse)
 */
const checkComeback = (
  badge: Badge,
  activities: Activity[],
  relapses: Relapse[] | undefined
): { unlocked: boolean; progressData?: BadgeProgress } => {
  if (!relapses || relapses.length === 0) {
    return { unlocked: false };
  }

  // Check each relapse
  for (const relapse of relapses) {
    const relapseTime = new Date(relapse.timestamp).getTime();
    const activitiesAfter = activities.filter((a) => {
      const activityTime = new Date(a.timestamp).getTime();
      return activityTime > relapseTime && activityTime <= relapseTime + 24 * 60 * 60 * 1000;
    });

    if (activitiesAfter.length >= 5) {
      return { unlocked: true };
    }
  }

  return { unlocked: false };
};

/**
 * Custom check: Variety Lover (new category after 30+ days)
 */
const checkVarietyLover = (
  badge: Badge,
  activities: Activity[]
): { unlocked: boolean; progressData?: BadgeProgress } => {
  if (activities.length === 0) {
    return { unlocked: false };
  }

  // Sort activities by timestamp
  const sorted = [...activities].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Track last use of each category
  const categoryLastUsed = new Map<string, number>();

  for (const activity of sorted) {
    const activityTime = new Date(activity.timestamp).getTime();

    activity.categories?.forEach((category) => {
      const lastUsed = categoryLastUsed.get(category);

      if (lastUsed) {
        const daysSinceLastUse = (activityTime - lastUsed) / (1000 * 60 * 60 * 24);
        if (daysSinceLastUse >= 30) {
          // Found a category used again after 30+ days
          return { unlocked: true };
        }
      }

      categoryLastUsed.set(category, activityTime);
    });
  }

  return { unlocked: false };
};

/**
 * Helper: Convert timeframe to milliseconds
 */
const getTimeframeMs = (timeframe: string): number => {
  switch (timeframe) {
    case 'day':
      return 24 * 60 * 60 * 1000;
    case 'week':
      return 7 * 24 * 60 * 60 * 1000;
    case 'month':
      return 30 * 24 * 60 * 60 * 1000;
    default:
      return Infinity;
  }
};
