import { Badge } from '../db/schema';

/**
 * All badge definitions organized by category
 * ~40 badges total covering frequency, streaks, diversity, milestones, recovery-specific, and special badges
 */
export const BADGE_DEFINITIONS: Badge[] = [
  // ===== FREQUENCY BADGES (Volume-Based) =====
  {
    id: 'first_step',
    category: 'frequency',
    title: 'First Step',
    description: 'Every journey starts with a single step. Welcome to your transformation!',
    emoji: '🌱',
    unlockCriteria: {
      type: 'activity_count',
      threshold: 1,
      timeframe: 'all_time',
    },
  },
  {
    id: 'weekly_warrior',
    category: 'frequency',
    title: 'Weekly Warrior',
    description: 'Log activities on 5 different days in one week. Consistency matters!',
    emoji: '🔥',
    unlockCriteria: {
      type: 'activity_count',
      threshold: 5,
      timeframe: 'week',
    },
  },
  {
    id: 'active_week',
    category: 'frequency',
    title: 'Active Week',
    description: 'Log activities on 7 different days in one week. A full week of action!',
    emoji: '💪',
    unlockCriteria: {
      type: 'activity_count',
      threshold: 7,
      timeframe: 'week',
    },
  },
  {
    id: 'monthly_champion',
    category: 'frequency',
    title: 'Monthly Champion',
    description: 'Track 20 activities in a month. Your dedication is truly inspiring!',
    emoji: '🏆',
    unlockCriteria: {
      type: 'activity_count',
      threshold: 20,
      timeframe: 'month',
    },
  },
  {
    id: 'super_month',
    category: 'frequency',
    title: 'Super Month',
    description: 'Log 30 activities in one month. An extraordinary commitment to growth!',
    emoji: '⭐',
    unlockCriteria: {
      type: 'activity_count',
      threshold: 30,
      timeframe: 'month',
    },
  },
  {
    id: 'power_day',
    category: 'frequency',
    title: 'Power Day',
    description: 'Log 3+ activities in a single day. Making every moment count!',
    emoji: '🎯',
    unlockCriteria: {
      type: 'activity_count',
      threshold: 3,
      timeframe: 'day',
    },
  },
  {
    id: 'milestone_50',
    category: 'frequency',
    title: 'Half Century',
    description: 'Reach 50 total activities tracked. A significant milestone in your journey!',
    emoji: '🎉',
    unlockCriteria: {
      type: 'activity_count',
      threshold: 50,
      timeframe: 'all_time',
    },
  },
  {
    id: 'milestone_100',
    category: 'frequency',
    title: 'Century Club',
    description: 'Complete 100 activities total. You\'ve proven your commitment to change!',
    emoji: '🌟',
    unlockCriteria: {
      type: 'activity_count',
      threshold: 100,
      timeframe: 'all_time',
    },
  },
  {
    id: 'milestone_250',
    category: 'frequency',
    title: 'Super Tracker',
    description: 'Achieve 250 activities logged. Your transformation is remarkable!',
    emoji: '✨',
    unlockCriteria: {
      type: 'activity_count',
      threshold: 250,
      timeframe: 'all_time',
    },
  },
  {
    id: 'milestone_500',
    category: 'frequency',
    title: 'Legend',
    description: 'Reach 500 total activities. A legendary achievement - you\'re an inspiration!',
    emoji: '💫',
    unlockCriteria: {
      type: 'activity_count',
      threshold: 500,
      timeframe: 'all_time',
    },
  },

  // ===== STREAK BADGES (Consistency-Based) =====
  {
    id: 'hot_streak',
    category: 'streak',
    title: 'Hot Streak',
    description: 'Log activities for 3 consecutive days. Consistency is key to success!',
    emoji: '🔥',
    unlockCriteria: {
      type: 'streak_days',
      threshold: 3,
    },
  },
  {
    id: 'weekly_streak',
    category: 'streak',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak. One full week of unwavering commitment!',
    emoji: '🚀',
    unlockCriteria: {
      type: 'streak_days',
      threshold: 7,
    },
  },
  {
    id: 'two_week_streak',
    category: 'streak',
    title: 'Two Week Wonder',
    description: 'Keep a 14-day streak alive. Two weeks of powerful daily habits!',
    emoji: '💪',
    unlockCriteria: {
      type: 'streak_days',
      threshold: 14,
    },
  },
  {
    id: 'monthly_streak',
    category: 'streak',
    title: 'Month Master',
    description: 'Achieve a 30-day streak. A full month of dedication - you\'re unstoppable!',
    emoji: '👑',
    unlockCriteria: {
      type: 'streak_days',
      threshold: 30,
    },
  },
  {
    id: 'unstoppable_60',
    category: 'streak',
    title: 'Unstoppable',
    description: 'Reach a 60-day streak. Two months of pure determination - nothing can stop you now!',
    emoji: '🌟',
    unlockCriteria: {
      type: 'streak_days',
      threshold: 60,
    },
  },
  {
    id: 'perfect_week',
    category: 'streak',
    title: 'Perfect Week',
    description: 'Log at least one activity every day for 7 consecutive days. Perfection achieved!',
    emoji: '🎉',
    unlockCriteria: {
      type: 'custom',
      customCheck: 'perfectWeek',
    },
  },

  // ===== DIVERSITY BADGES (Balance-Based) =====
  {
    id: 'explorer',
    category: 'diversity',
    title: 'Explorer',
    description: 'Try all 14 activity categories. Embrace a well-rounded path to growth!',
    emoji: '🎨',
    unlockCriteria: {
      type: 'category_diversity',
      threshold: 14,
    },
  },
  {
    id: 'balanced_week',
    category: 'diversity',
    title: 'Balanced Week',
    description: 'Log 10+ activities from 5 different categories in one week. True balance!',
    emoji: '⚖️',
    unlockCriteria: {
      type: 'custom',
      customCheck: 'balancedWeek',
    },
  },
  {
    id: 'well_rounded',
    category: 'diversity',
    title: 'Well-Rounded',
    description: 'Complete 10+ activities in all 5 major categories (Physical, Mindfulness, Social, Learning, Creative). True balance in all aspects of life!',
    emoji: '🌈',
    unlockCriteria: {
      type: 'custom',
      customCheck: 'wellRounded',
    },
  },
  {
    id: 'mind_and_body',
    category: 'diversity',
    title: 'Mind & Body',
    description: 'Log 20+ mindfulness and 20+ physical activities. Perfect mind-body harmony!',
    emoji: '🧘',
    unlockCriteria: {
      type: 'custom',
      customCheck: 'mindAndBody',
    },
  },
  {
    id: 'social_butterfly',
    category: 'diversity',
    title: 'Social Butterfly',
    description: 'Complete 30 social activities. Strong connections are vital to recovery!',
    emoji: '🤝',
    unlockCriteria: {
      type: 'activity_count',
      threshold: 30,
      timeframe: 'all_time',
      categoryId: '👥 Social',
    },
  },
  {
    id: 'lifelong_learner',
    category: 'diversity',
    title: 'Lifelong Learner',
    description: 'Complete 30 learning activities. Knowledge empowers your transformation!',
    emoji: '📚',
    unlockCriteria: {
      type: 'activity_count',
      threshold: 30,
      timeframe: 'all_time',
      categoryId: '📚 Learning',
    },
  },

  // ===== MILESTONE BADGES (Time-Based Commitment) =====
  {
    id: 'first_month_tracking',
    category: 'milestone',
    title: 'First Month',
    description: 'Log activities on 30 different days. The first month is the foundation of lasting change!',
    emoji: '📆',
    unlockCriteria: {
      type: 'time_tracking',
      threshold: 30,
    },
  },
  {
    id: 'quarter_year',
    category: 'milestone',
    title: 'Quarter Year',
    description: 'Log activities on 90 different days. Three months of growth - a quarter year of progress!',
    emoji: '🎊',
    unlockCriteria: {
      type: 'time_tracking',
      threshold: 90,
    },
  },
  {
    id: 'half_year',
    category: 'milestone',
    title: 'Half Year Hero',
    description: 'Log activities on 180 different days. Half a year of transformation - you\'re a hero!',
    emoji: '🏅',
    unlockCriteria: {
      type: 'time_tracking',
      threshold: 180,
    },
  },
  {
    id: 'one_year_champion',
    category: 'milestone',
    title: 'One Year Star',
    description: 'Log activities on 365 different days. A full year of dedication - you are a shining star!',
    emoji: '👑',
    unlockCriteria: {
      type: 'time_tracking',
      threshold: 365,
    },
  },
  {
    id: 'consistent_tracker',
    category: 'milestone',
    title: 'Steady Tracker',
    description: 'Log activities in at least 11 of the last 13 weeks. Consistency builds character!',
    emoji: '🔥',
    unlockCriteria: {
      type: 'custom',
      customCheck: 'consistentTracker',
    },
  },

  // ===== RECOVERY-SPECIFIC BADGES =====
  {
    id: 'self_aware',
    category: 'recovery',
    title: 'Self-Aware',
    description: 'Add personal notes to 20 activities. Self-reflection is the key to understanding yourself!',
    emoji: '🧠',
    unlockCriteria: {
      type: 'custom',
      customCheck: 'activitiesWithNotes',
      threshold: 20,
    },
  },
  {
    id: 'reflective',
    category: 'recovery',
    title: 'Deep Thinker',
    description: 'Add personal reflections to 50 activities. Deep introspection fuels lasting change!',
    emoji: '💭',
    unlockCriteria: {
      type: 'custom',
      customCheck: 'activitiesWithNotes',
      threshold: 50,
    },
  },
  {
    id: 'night_owl_support',
    category: 'recovery',
    title: 'Night Owl',
    description: 'Log 10+ activities between 9 PM and 6 AM. Finding strength in the quiet hours!',
    emoji: '🌙',
    unlockCriteria: {
      type: 'custom',
      customCheck: 'nightOwl',
    },
  },
  {
    id: 'early_bird',
    category: 'recovery',
    title: 'Early Bird',
    description: 'Log 10+ activities between 5 AM and 9 AM. Starting each day with purpose!',
    emoji: '⏰',
    unlockCriteria: {
      type: 'custom',
      customCheck: 'earlyBird',
    },
  },

  // ===== SPECIAL/HIDDEN BADGES =====
  {
    id: 'comeback',
    category: 'special',
    title: 'Comeback',
    description: 'Log 5 activities within 24 hours of a relapse. Resilience is getting back up!',
    emoji: '🌟',
    isHidden: true,
    unlockCriteria: {
      type: 'custom',
      customCheck: 'comeback',
    },
  },
  {
    id: 'variety_lover',
    category: 'special',
    title: 'Variety Lover',
    description: 'Try a new activity category you haven\'t used in 30+ days. Embrace change and growth!',
    emoji: '🎭',
    isHidden: true,
    unlockCriteria: {
      type: 'custom',
      customCheck: 'varietyLover',
    },
  },
];
