import { describe, expect, test } from 'bun:test';
import {
  computeStreaks,
  countDaysKept,
  averageStreakMs,
  longestStreakMs,
  longestPastStreakMs,
  toWholeDays,
} from './streaks';
import { formatStreakLength, formatTimeLeft, formatStreakAdjective } from './formatDuration';
import { MS_PER_DAY, MS_PER_HOUR } from '../constants/timeUnits';

// Sample journey used in the design artifact: started 1 Jul, 7 relapses, now 3 Oct (local time)
const at = (month: number, day: number, hour = 12) => new Date(2026, month - 1, day, hour).getTime();
const iso = (ms: number) => new Date(ms).toISOString();

const journeyStart = iso(at(7, 1, 9));
const relapses = [
  at(7, 4, 9),
  at(7, 27, 9),
  at(7, 28, 9),
  at(8, 9, 9),
  at(8, 9, 14),
  at(9, 9, 14),
  at(9, 24, 14),
].map((ms, i) => ({ id: `r${i}`, timestamp: iso(ms) }));
const now = at(10, 3, 15);

describe('computeStreaks', () => {
  test('returns nothing before the journey starts', () => {
    expect(computeStreaks(relapses, null, now)).toEqual([]);
  });

  test('splits the journey at each relapse, current streak last', () => {
    const streaks = computeStreaks(relapses, journeyStart, now);
    expect(streaks).toHaveLength(8);
    expect(streaks.map((s) => toWholeDays(s.durationMs))).toEqual([3, 23, 1, 12, 0, 31, 15, 9]);
    expect(streaks[4].durationMs).toBe(5 * MS_PER_HOUR);
    expect(streaks.at(-1)?.isCurrent).toBe(true);
    expect(streaks.at(-1)?.endedBy).toBeUndefined();
    expect(streaks[1].endedBy?.id).toBe('r1');
  });

  test('sorts relapses that arrive newest first', () => {
    const streaks = computeStreaks([...relapses].reverse(), journeyStart, now);
    expect(streaks.map((s) => toWholeDays(s.durationMs))).toEqual([3, 23, 1, 12, 0, 31, 15, 9]);
  });

  test('with no relapses the whole journey is one current streak', () => {
    const streaks = computeStreaks([], journeyStart, now);
    expect(streaks).toHaveLength(1);
    expect(streaks[0].isCurrent).toBe(true);
    expect(toWholeDays(streaks[0].durationMs)).toBe(94);
  });

  test('a relapse before the journey start does not create negative streaks', () => {
    const streaks = computeStreaks([{ timestamp: iso(at(6, 20)) }], journeyStart, now);
    expect(streaks.every((s) => s.durationMs >= 0)).toBe(true);
  });
});

describe('streak summaries', () => {
  const streaks = computeStreaks(relapses, journeyStart, now);

  test('longest and longest finished', () => {
    expect(toWholeDays(longestStreakMs(streaks))).toBe(31);
    expect(toWholeDays(longestPastStreakMs(streaks))).toBe(31);
    expect(longestPastStreakMs(computeStreaks([], journeyStart, now))).toBe(0);
  });

  test('average includes the current streak', () => {
    expect(Math.round(averageStreakMs(streaks) / MS_PER_DAY)).toBe(12);
  });
});

describe('countDaysKept', () => {
  test('counts days up to yesterday without a relapse', () => {
    // 1 Jul to 2 Oct is 94 days, 6 of them have a relapse
    expect(countDaysKept(relapses, journeyStart, now)).toBe(88);
  });

  test('a relapse today does not change it', () => {
    const withToday = [...relapses, { id: 'today', timestamp: iso(at(10, 3, 10)) }];
    expect(countDaysKept(withToday, journeyStart, now)).toBe(88);
  });

  test('is zero on the first day', () => {
    expect(countDaysKept([], journeyStart, at(7, 1, 20))).toBe(0);
  });
});

describe('formatDuration', () => {
  test('streak lengths', () => {
    expect(formatStreakLength(31 * MS_PER_DAY + 5 * MS_PER_HOUR)).toBe('31d');
    expect(formatStreakLength(5 * MS_PER_HOUR)).toBe('5h');
    expect(formatStreakAdjective(9 * MS_PER_DAY)).toBe('9-day');
  });

  test('time left', () => {
    expect(formatTimeLeft(4 * MS_PER_DAY + 17 * MS_PER_HOUR + 19 * 60000)).toBe('4d 17h');
    expect(formatTimeLeft(3 * MS_PER_HOUR + 20 * 60000)).toBe('3h 20m');
    expect(formatTimeLeft(10_000)).toBe('1m');
  });
});
