import type { Relapse, Urge } from '../db/schema';

export interface WeeklyPatternData {
  day: string;
  dayShort: string;
  count: number;
  percentage: number;
}

export interface MonthlyTrendData {
  month: string;
  monthShort: string;
  year: number;
  count: number;
}

export interface ResistanceRatioData {
  urgeCount: number;
  relapseCount: number;
  totalEvents: number;
  urgePercentage: number;
  relapsePercentage: number;
  successRate: number;
}

export interface TimeOfDayData {
  period: string;
  periodShort: string;
  timeRange: string;
  count: number;
  percentage: number;
  icon: string;
}

export interface TimeOfDayPatternResult {
  data: TimeOfDayData[];
  mostVulnerable: TimeOfDayData | null;
  dangerHours: string;
}

/**
 * Calculate weekly relapse pattern (Sun-Sat)
 * Shows which days of the week have most relapses
 */
export function calculateWeeklyPattern(relapses: Relapse[]): WeeklyPatternData[] {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const counts = [0, 0, 0, 0, 0, 0, 0];

  // Count relapses per day of week
  relapses.forEach((relapse) => {
    const date = new Date(relapse.timestamp);
    const dayIndex = date.getDay(); // 0 = Sunday, 6 = Saturday
    counts[dayIndex]++;
  });

  const total = relapses.length || 1;

  return days.map((day, index) => ({
    day,
    dayShort: daysShort[index],
    count: counts[index],
    percentage: Math.round((counts[index] / total) * 100),
  }));
}

/**
 * Calculate monthly trend over the last 6 months
 * Shows relapse count per month to visualize trends
 */
export function calculateMonthlyTrend(relapses: Relapse[], months: number = 6): MonthlyTrendData[] {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNamesFull = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Get current date
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Generate last N months
  const monthsData: MonthlyTrendData[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const targetMonth = currentMonth - i;
    const targetYear = currentYear + Math.floor(targetMonth / 12);
    const normalizedMonth = ((targetMonth % 12) + 12) % 12;

    monthsData.push({
      month: monthNamesFull[normalizedMonth],
      monthShort: monthNames[normalizedMonth],
      year: targetYear,
      count: 0,
    });
  }

  // Count relapses per month
  relapses.forEach((relapse) => {
    const date = new Date(relapse.timestamp);
    const relapseMonth = date.getMonth();
    const relapseYear = date.getFullYear();

    const matchingMonth = monthsData.find(
      (m) => monthNames.indexOf(m.monthShort) === relapseMonth && m.year === relapseYear
    );

    if (matchingMonth) {
      matchingMonth.count++;
    }
  });

  return monthsData;
}

/**
 * Get the maximum value from an array for chart scaling
 */
export function getMaxValue(data: number[]): number {
  const max = Math.max(...data);
  return max === 0 ? 1 : max; // Avoid division by zero
}

/**
 * Format a date as "MMM DD"
 */
export function formatShortDate(timestamp: string): string {
  const date = new Date(timestamp);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Calculate resistance ratio data
 * Shows success rate in resisting urges vs relapses
 *
 * Research-based interpretation thresholds:
 * - 80%+: Exceptional recovery progress (top tier)
 * - 60-79%: Above average, exceeding healthy baseline
 * - 40-59%: Normal/healthy recovery range (baseline per NIDA research)
 * - <40%: Early recovery or challenging period (brain rewiring in progress)
 *
 * Note: A 40-60% success rate is considered normal in addiction recovery.
 * Progress is measured by increasing gaps between relapses over time,
 * not absolute perfection. Studies show success rates improve significantly
 * over 5 years (from 15% in year 1 to 85% by year 5).
 */
export function calculateResistanceRatio(relapses: Relapse[], urges: Urge[]): ResistanceRatioData {
  const urgeCount = urges.length;
  const relapseCount = relapses.length;
  const totalEvents = urgeCount + relapseCount;

  // Calculate percentages
  const urgePercentage = totalEvents > 0 ? Math.round((urgeCount / totalEvents) * 100) : 0;
  const relapsePercentage = totalEvents > 0 ? Math.round((relapseCount / totalEvents) * 100) : 0;

  // Success rate is the same as urge percentage
  const successRate = urgePercentage;

  return {
    urgeCount,
    relapseCount,
    totalEvents,
    urgePercentage,
    relapsePercentage,
    successRate,
  };
}

/**
 * Calculate time-of-day relapse pattern
 * Shows which times of day have most relapses
 * Periods: Morning (5am-12pm), Afternoon (12-5pm), Evening (5-9pm), Night (9pm-5am)
 */
export function calculateTimeOfDayPattern(relapses: Relapse[]): TimeOfDayPatternResult {
  const periods = [
    { period: 'Morning', periodShort: 'Morn', timeRange: '5am - 12pm', startHour: 5, endHour: 12, icon: '🌅' },
    { period: 'Afternoon', periodShort: 'Aftn', timeRange: '12pm - 5pm', startHour: 12, endHour: 17, icon: '☀️' },
    { period: 'Evening', periodShort: 'Eve', timeRange: '5pm - 9pm', startHour: 17, endHour: 21, icon: '🌆' },
    { period: 'Night', periodShort: 'Night', timeRange: '9pm - 5am', startHour: 21, endHour: 5, icon: '🌙' },
  ];

  const counts = [0, 0, 0, 0]; // Morning, Afternoon, Evening, Night

  // Count relapses per time period
  relapses.forEach((relapse) => {
    const date = new Date(relapse.timestamp);
    const hour = date.getHours();

    if (hour >= 5 && hour < 12) {
      counts[0]++; // Morning
    } else if (hour >= 12 && hour < 17) {
      counts[1]++; // Afternoon
    } else if (hour >= 17 && hour < 21) {
      counts[2]++; // Evening
    } else {
      counts[3]++; // Night (9pm-5am)
    }
  });

  const total = relapses.length || 1;

  const data: TimeOfDayData[] = periods.map((p, index) => ({
    period: p.period,
    periodShort: p.periodShort,
    timeRange: p.timeRange,
    count: counts[index],
    percentage: Math.round((counts[index] / total) * 100),
    icon: p.icon,
  }));

  // Find most vulnerable period
  const maxCount = Math.max(...counts);
  const mostVulnerableIndex = counts.indexOf(maxCount);
  const mostVulnerable = maxCount > 0 ? data[mostVulnerableIndex] : null;

  // Determine danger hours based on highest counts
  let dangerHours = '';
  if (mostVulnerable && maxCount > 0) {
    dangerHours = mostVulnerable.timeRange;
  }

  return {
    data,
    mostVulnerable,
    dangerHours,
  };
}
