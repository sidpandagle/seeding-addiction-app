import { afterAll, beforeAll, describe, expect, setSystemTime, test } from 'bun:test';
import { checkAllBadges } from './badgeChecker';
import { BADGE_DEFINITIONS } from '../data/badgeDefinitions';
import { ACTIVITY_CATEGORIES } from '../constants/tags';
import type { Activity, EarnedBadge, Relapse } from '../db/schema';

// Fixed clock so "today", "this week" and "last 30 days" are deterministic
const NOW = new Date(2026, 9, 3, 15, 0, 0); // Sat 3 Oct 2026, 15:00 local

beforeAll(() => setSystemTime(NOW));
afterAll(() => setSystemTime());

/** ISO timestamp for `daysAgo` days before today at the given local hour */
const at = (daysAgo: number, hour = 12) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

let seq = 0;
const act = (timestamp: string, categories?: string[], note?: string): Activity => ({
  id: `a${seq++}`,
  timestamp,
  categories,
  note,
});

/** One activity per day on `count` consecutive days, starting `startAgo` days back */
const daily = (count: number, startAgo = 0, categories?: string[]) =>
  Array.from({ length: count }, (_, i) => act(at(startAgo + i), categories));

/** `count` activities spread over distinct days, all at the same hour */
const atHour = (count: number, hour: number) =>
  Array.from({ length: count }, (_, i) => act(at(i, hour)));

const withCategory = (count: number, category: string) =>
  Array.from({ length: count }, (_, i) => act(at(i % 25), [category]));

interface Scenario {
  activities: Activity[];
  relapses?: Relapse[];
  journeyStart?: string;
}

const PHYSICAL = '🏃 Physical';
const MINDFUL = '🧘 Mindfulness';
const SOCIAL = '👥 Social';
const LEARNING = '📚 Learning';
const CREATIVE = '🎨 Creative';

const unlockedBy = async ({ activities, relapses, journeyStart }: Scenario, earned: EarnedBadge[] = []) => {
  const { newlyUnlocked } = await checkAllBadges(activities, earned, relapses, journeyStart);
  return newlyUnlocked.map((b) => b.id);
};

/** For every badge: data that must unlock it, and data one step short that must not */
const CASES: Record<string, { yes: () => Scenario; no: () => Scenario }> = {
  first_step: {
    yes: () => ({ activities: [act(at(0))] }),
    no: () => ({ activities: [] }),
  },
  weekly_warrior: {
    yes: () => ({ activities: daily(5) }),
    no: () => ({ activities: [8, 9, 10, 11, 12].map((h) => act(at(0, h))) }), // 5 logs, one day
  },
  active_week: {
    yes: () => ({ activities: daily(7) }),
    no: () => ({ activities: daily(6) }),
  },
  monthly_champion: {
    yes: () => ({ activities: daily(20) }),
    no: () => ({ activities: daily(19) }),
  },
  super_month: {
    yes: () => ({ activities: daily(30) }),
    no: () => ({ activities: daily(29) }),
  },
  power_day: {
    yes: () => ({ activities: [9, 11, 13].map((h) => act(at(0, h))) }),
    no: () => ({ activities: [9, 11].map((h) => act(at(0, h))) }),
  },
  milestone_50: { yes: () => ({ activities: daily(50) }), no: () => ({ activities: daily(49) }) },
  milestone_100: { yes: () => ({ activities: daily(100) }), no: () => ({ activities: daily(99) }) },
  milestone_250: { yes: () => ({ activities: daily(250) }), no: () => ({ activities: daily(249) }) },
  milestone_500: { yes: () => ({ activities: daily(500) }), no: () => ({ activities: daily(499) }) },

  hot_streak: { yes: () => ({ activities: daily(3) }), no: () => ({ activities: daily(2) }) },
  weekly_streak: { yes: () => ({ activities: daily(7) }), no: () => ({ activities: daily(6) }) },
  two_week_streak: { yes: () => ({ activities: daily(14) }), no: () => ({ activities: daily(13) }) },
  monthly_streak: { yes: () => ({ activities: daily(30) }), no: () => ({ activities: daily(29) }) },
  unstoppable_60: { yes: () => ({ activities: daily(60) }), no: () => ({ activities: daily(59) }) },
  perfect_week: {
    yes: () => ({ activities: daily(7) }),
    no: () => ({ activities: [...daily(3), ...daily(3, 4)] }), // gap 3 days ago
  },

  explorer: {
    yes: () => ({ activities: [act(at(0), [...ACTIVITY_CATEGORIES])] }),
    // 13 built-in plus a custom tag is not "all 14 categories"
    no: () => ({ activities: [act(at(0), [...ACTIVITY_CATEGORIES.slice(0, 13), '🎻 Violin'])] }),
  },
  balanced_week: {
    yes: () => {
      const cats = [PHYSICAL, MINDFUL, SOCIAL, LEARNING, CREATIVE];
      return { activities: Array.from({ length: 10 }, (_, i) => act(at(i % 6), [cats[i % 5]])) };
    },
    no: () => {
      const cats = [PHYSICAL, MINDFUL, SOCIAL, LEARNING];
      return { activities: Array.from({ length: 10 }, (_, i) => act(at(i % 6), [cats[i % 4]])) };
    },
  },
  well_rounded: {
    yes: () => ({
      activities: [PHYSICAL, MINDFUL, SOCIAL, LEARNING, CREATIVE].flatMap((c) => withCategory(10, c)),
    }),
    no: () => ({
      activities: [
        ...[PHYSICAL, MINDFUL, SOCIAL, LEARNING].flatMap((c) => withCategory(10, c)),
        ...withCategory(9, CREATIVE),
      ],
    }),
  },
  mind_and_body: {
    yes: () => ({ activities: [...withCategory(20, MINDFUL), ...withCategory(20, PHYSICAL)] }),
    no: () => ({ activities: [...withCategory(20, MINDFUL), ...withCategory(19, PHYSICAL)] }),
  },
  social_butterfly: {
    yes: () => ({ activities: withCategory(30, SOCIAL) }),
    no: () => ({ activities: withCategory(29, SOCIAL) }),
  },
  lifelong_learner: {
    yes: () => ({ activities: withCategory(30, LEARNING) }),
    no: () => ({ activities: withCategory(29, LEARNING) }),
  },

  first_month_tracking: {
    yes: () => ({ activities: daily(30), journeyStart: at(40) }),
    no: () => ({ activities: daily(29), journeyStart: at(40) }),
  },
  quarter_year: {
    yes: () => ({ activities: daily(90), journeyStart: at(100) }),
    no: () => ({ activities: daily(89), journeyStart: at(100) }),
  },
  half_year: {
    yes: () => ({ activities: daily(180), journeyStart: at(200) }),
    no: () => ({ activities: daily(179), journeyStart: at(200) }),
  },
  one_year_champion: {
    yes: () => ({ activities: daily(365), journeyStart: at(400) }),
    no: () => ({ activities: daily(364), journeyStart: at(400) }),
  },
  consistent_tracker: {
    // one log a week for 11 of the last 13 weeks
    yes: () => ({ activities: Array.from({ length: 11 }, (_, i) => act(at(i * 7))) }),
    no: () => ({ activities: Array.from({ length: 10 }, (_, i) => act(at(i * 7))) }),
  },

  self_aware: {
    yes: () => ({ activities: Array.from({ length: 20 }, (_, i) => act(at(i), undefined, 'felt calm')) }),
    // 19 real notes plus blank ones must not count
    no: () => ({
      activities: [
        ...Array.from({ length: 19 }, (_, i) => act(at(i), undefined, 'felt calm')),
        act(at(0), undefined, '   '),
        act(at(1)),
      ],
    }),
  },
  reflective: {
    yes: () => ({ activities: Array.from({ length: 50 }, (_, i) => act(at(i), undefined, 'felt calm')) }),
    no: () => ({ activities: Array.from({ length: 49 }, (_, i) => act(at(i), undefined, 'felt calm')) }),
  },
  night_owl_support: {
    yes: () => ({ activities: atHour(10, 22) }),
    no: () => ({ activities: atHour(9, 22) }),
  },
  early_bird: {
    yes: () => ({ activities: atHour(10, 7) }),
    no: () => ({ activities: atHour(9, 7) }),
  },

  comeback: {
    yes: () => ({
      activities: [1, 2, 3, 4, 5].map((h) => act(at(3, 12 + h))),
      relapses: [{ id: 'r1', timestamp: at(3, 11) }],
    }),
    no: () => ({
      activities: [1, 2, 3, 4].map((h) => act(at(3, 12 + h))),
      relapses: [{ id: 'r1', timestamp: at(3, 11) }],
    }),
  },
  variety_lover: {
    yes: () => ({ activities: [act(at(40), ['🎵 Music']), act(at(5), ['🎵 Music'])] }),
    no: () => ({ activities: [act(at(40), ['🎵 Music']), act(at(20), ['🎵 Music'])] }),
  },
};

describe('badge definitions', () => {
  test('every badge has a test case and every case has a badge', () => {
    expect(Object.keys(CASES).sort()).toEqual(BADGE_DEFINITIONS.map((b) => b.id).sort());
  });

  test('badge ids are unique', () => {
    const ids = BADGE_DEFINITIONS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('nothing unlocks with no data', async () => {
    expect(await unlockedBy({ activities: [] })).toEqual([]);
  });
});

describe('checkAllBadges unlocks each badge', () => {
  for (const badge of BADGE_DEFINITIONS) {
    const scenario = CASES[badge.id];
    if (!scenario) continue;

    test(`${badge.id}: unlocks`, async () => {
      expect(await unlockedBy(scenario.yes())).toContain(badge.id);
    });

    test(`${badge.id}: stays locked one step short`, async () => {
      expect(await unlockedBy(scenario.no())).not.toContain(badge.id);
    });
  }
});

describe('streak badges', () => {
  test('a streak that ended yesterday is still alive', async () => {
    // Logged the last 3 days up to yesterday, nothing yet today
    const { progress } = await checkAllBadges(daily(3, 1), [], [], undefined);
    const hot = progress.find((p) => p.badgeId === 'weekly_streak');
    expect(hot?.current).toBe(3);
  });

  test('a streak with a missed day is broken', async () => {
    const { progress } = await checkAllBadges([...daily(2, 2)], [], [], undefined);
    expect(progress.find((p) => p.badgeId === 'hot_streak')?.current).toBe(0);
  });
});

describe('progress and bookkeeping', () => {
  test('earned badges are never awarded twice', async () => {
    const earned: EarnedBadge[] = [{ id: 'e1', badge_id: 'first_step', unlocked_at: at(0) }];
    expect(await unlockedBy({ activities: [act(at(0))] }, earned)).not.toContain('first_step');
  });

  test('reports progress toward a locked badge', async () => {
    const { progress } = await checkAllBadges(daily(3), [], [], undefined);
    const warrior = progress.find((p) => p.badgeId === 'weekly_warrior');
    expect(warrior).toEqual({ badgeId: 'weekly_warrior', progress: 0.6, current: 3, required: 5 });
  });

  test('unlocked badges carry no progress entry', async () => {
    const { progress } = await checkAllBadges([act(at(0))], [], [], undefined);
    expect(progress.find((p) => p.badgeId === 'first_step')).toBeUndefined();
  });
});
