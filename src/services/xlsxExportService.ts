import * as XLSX from 'xlsx';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getRelapses, getActivities, getJourneyStart } from '../db/helpers';
import { calculateUserStats } from '../utils/statsHelpers';
import type { CapturedChart } from './chartExportService';
import { useBadgeStore } from '../stores/badgeStore';
import { BADGE_DEFINITIONS } from '../data/badgeDefinitions';
import { calculateWeeklyPattern, calculateTimeOfDayPattern, calculateMonthlyTrend } from '../utils/chartHelpers';
import { ACTIVITY_CATEGORIES } from '../constants/tags';
import type { Relapse, Activity, Badge } from '../db/schema';

interface ExportOptions {
  includeRelapses?: boolean;
  includeActivities?: boolean;
  includeCharts?: boolean;
  includeInsights?: boolean;
  sortOrder?: 'newest' | 'oldest';
  groupBy?: 'month' | 'week' | 'none';
  maxRecords?: number; // Safety limit to prevent memory issues
}

class XLSXExportService {
  /**
   * Export data to XLSX file with multiple sheets and formatting
   */
  async exportToXLSX(
    options: ExportOptions = {},
    charts: CapturedChart[] = []
  ): Promise<boolean> {
    try {
      // Set defaults with safety limit to prevent memory issues on large datasets
      const opts = {
        includeRelapses: true,
        includeActivities: true,
        includeCharts: charts.length > 0,
        includeInsights: true,
        sortOrder: 'newest' as const,
        groupBy: 'month' as const,
        maxRecords: 5000, // Safety limit per type - prevents memory issues
        ...options,
      };

      // Gather data with limits to prevent memory issues
      const [relapses, activities, journeyStart] = await Promise.all([
        getRelapses(opts.maxRecords),
        getActivities(opts.maxRecords),
        getJourneyStart(),
      ]);

      // Calculate stats
      const stats = calculateUserStats(relapses, journeyStart);
      const totalActivities = activities.length;
      const totalRelapses = relapses.length;
      const successRate = totalRelapses + totalActivities > 0
        ? ((totalActivities / (totalRelapses + totalActivities)) * 100).toFixed(1)
        : '100.0';

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Create Summary sheet (enhanced)
      this.createSummarySheet(workbook, {
        journeyStart,
        stats,
        totalActivities,
        totalRelapses,
        successRate,
        exportDate: new Date().toISOString(),
        relapseCount: relapses.length,
        activityCount: activities.length,
      });

      // Create Badges & Achievements sheet
      this.createBadgesSheet(workbook);

      // Create Relapses sheet
      if (opts.includeRelapses && relapses.length > 0) {
        this.createRelapsesSheet(workbook, relapses, opts.sortOrder);
      }

      // Create Activities sheet
      if (opts.includeActivities && activities.length > 0) {
        this.createActivitiesSheet(workbook, activities, opts.sortOrder);
      }

      // Create Weekly Vulnerability sheet
      if (relapses.length > 0) {
        this.createWeeklyVulnerabilitySheet(workbook, relapses);
      }

      // Create Monthly Trend sheet
      if (relapses.length > 0) {
        this.createMonthlyTrendSheet(workbook, relapses);
      }

      // Create Activity Effectiveness sheet
      if (activities.length > 0) {
        this.createActivityEffectivenessSheet(workbook, activities);
      }

      // Create Engagement Metrics sheet
      this.createEngagementMetricsSheet(workbook, relapses, activities);

      // Create Comparative Stats sheet
      this.createComparativeStatsSheet(workbook, relapses, activities);

      // Create Insights sheet (existing tag/category frequencies)
      if (opts.includeInsights) {
        this.createInsightsSheet(workbook, relapses, activities, journeyStart);
      }

      // Create Charts info sheet (if charts were captured)
      if (opts.includeCharts && charts.length > 0) {
        this.createChartsInfoSheet(workbook, charts);
      }

      // Write workbook to file
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `seeding-export-${dateStr}.xlsx`;
      const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

      const file = new File(Paths.document, filename);
      await file.write(wbout, { encoding: 'base64' });

      // Share file
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        if (__DEV__) {
          console.log('[XLSX Export] Sharing not available on this device');
        }
        return false;
      }

      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Export Your Journey Data (Excel)',
        UTI: 'com.microsoft.excel.xlsx',
      });

      // Clean up
      await file.delete();

      return true;
    } catch (error) {
      console.error('[XLSX Export] Error:', error);
      return false;
    }
  }

  /**
   * Create Summary sheet with overall statistics
   */
  private createSummarySheet(workbook: XLSX.WorkBook, data: any): void {
    const { earnedBadges } = useBadgeStore.getState();

    // Calculate engagement percentage
    const totalEngagement = data.totalActivities + data.totalRelapses;
    const activityPercentage = totalEngagement > 0
      ? ((data.totalActivities / totalEngagement) * 100).toFixed(1)
      : '0';

    // Get recent badges (last 3)
    const recentBadges = [...earnedBadges]
      .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
      .slice(0, 3);

    const summaryData: any[][] = [
      ['SEEDING RECOVERY JOURNEY - COMPREHENSIVE EXPORT'],
      [],
      ['Export Information'],
      ['Export Date', new Date(data.exportDate).toLocaleString()],
      ['Journey Started', data.journeyStart ? new Date(data.journeyStart).toLocaleString() : 'Not set'],
      ['Total Records', data.relapseCount + data.activityCount],
      [],
      ['Journey Statistics'],
      ['Current Streak (days)', data.stats.currentStreak],
      ['Best Streak (days)', data.stats.bestStreak],
      ['Total Relapses', data.totalRelapses],
      ['Total Activities', data.totalActivities],
      ['Success Rate', `${data.successRate}%`],
      [],
      ['Engagement Overview'],
      ['Activity Percentage', `${activityPercentage}%`],
      ['Engagement Assessment', parseFloat(activityPercentage) >= 70 ? 'Excellent' : parseFloat(activityPercentage) >= 50 ? 'Good' : 'Keep Going'],
      [],
      ['Badge Summary'],
      ['Total Badges Earned', earnedBadges.length],
    ];

    // Add recent badges
    if (recentBadges.length > 0) {
      summaryData.push(['Recent Unlocks:', '']);
      recentBadges.forEach(badge => {
        const badgeDef = BADGE_DEFINITIONS.find(b => b.id === badge.badge_id);
        if (badgeDef) {
          summaryData.push([`  ${badgeDef.emoji} ${badgeDef.title}`, new Date(badge.unlocked_at).toLocaleDateString()]);
        }
      });
    }

    summaryData.push([]);
    summaryData.push(['Export Contents']);
    summaryData.push(['This workbook contains 11 comprehensive sheets:']);
    summaryData.push(['• Summary - Overview of your journey']);
    summaryData.push(['• Badges & Achievements - Unlocked badges and progress']);
    summaryData.push(['• Relapses - Complete relapse records']);
    summaryData.push(['• Activities - Complete activity records']);
    summaryData.push(['• Weekly Vulnerability - Risky days and times']);
    summaryData.push(['• Monthly Trend - 6-month trend analysis']);
    summaryData.push(['• Activity Effectiveness - Category insights']);
    summaryData.push(['• Engagement Metrics - Activity vs relapse ratio']);
    summaryData.push(['• Comparative Stats - Period-over-period comparisons']);
    summaryData.push(['• Insights - Tag and category frequencies']);
    summaryData.push(['• Charts Info - Exported chart information (if applicable)']);
    summaryData.push([]);
    summaryData.push(['Privacy & Security']);
    summaryData.push(['All data is privacy-focused and stored locally.']);
    summaryData.push(['This export is for your personal use only.']);
    summaryData.push(['Generated by Seeding App']);

    const ws = XLSX.utils.aoa_to_sheet(summaryData);

    // Set column widths
    ws['!cols'] = [
      { wch: 35 },
      { wch: 35 },
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Summary');
  }

  /**
   * Create Relapses sheet with detailed relapse data
   */
  private createRelapsesSheet(
    workbook: XLSX.WorkBook,
    relapses: any[],
    sortOrder: 'newest' | 'oldest'
  ): void {
    // Sort data
    const sortedRelapses = [...relapses].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    // Create header
    const headers = ['Date', 'Time', 'Note', 'Tags'];

    // Create data rows
    const rows = sortedRelapses.map(relapse => {
      const date = new Date(relapse.timestamp);
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        relapse.note || '',
        relapse.tags ? relapse.tags.join(', ') : '',
      ];
    });

    // Combine headers and data
    const sheetData = [headers, ...rows];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // Date
      { wch: 12 }, // Time
      { wch: 40 }, // Note
      { wch: 30 }, // Tags
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Relapses');
  }

  /**
   * Create Activities sheet with detailed activity data
   */
  private createActivitiesSheet(
    workbook: XLSX.WorkBook,
    activities: any[],
    sortOrder: 'newest' | 'oldest'
  ): void {
    // Sort data
    const sortedActivities = [...activities].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    // Create header
    const headers = ['Date', 'Time', 'Note', 'Categories'];

    // Create data rows
    const rows = sortedActivities.map(activity => {
      const date = new Date(activity.timestamp);
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        activity.note || '',
        activity.categories ? activity.categories.join(', ') : '',
      ];
    });

    // Combine headers and data
    const sheetData = [headers, ...rows];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // Date
      { wch: 12 }, // Time
      { wch: 40 }, // Note
      { wch: 30 }, // Categories
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Activities');
  }

  /**
   * Create Insights sheet with calculated trends and patterns
   */
  private createInsightsSheet(
    workbook: XLSX.WorkBook,
    relapses: any[],
    activities: any[],
    journeyStart: string | null
  ): void {
    // Calculate insights
    const totalDays = journeyStart
      ? Math.floor((Date.now() - new Date(journeyStart).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const avgRelapsesPerWeek = totalDays > 0
      ? ((relapses.length / totalDays) * 7).toFixed(2)
      : '0.00';

    const avgActivitiesPerWeek = totalDays > 0
      ? ((activities.length / totalDays) * 7).toFixed(2)
      : '0.00';

    // Tag frequency analysis
    const tagFrequency: Record<string, number> = {};
    relapses.forEach(relapse => {
      if (relapse.tags) {
        relapse.tags.forEach((tag: string) => {
          tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
        });
      }
    });

    const topTags = Object.entries(tagFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // Category frequency analysis
    const categoryFrequency: Record<string, number> = {};
    activities.forEach(activity => {
      if (activity.categories) {
        activity.categories.forEach((category: string) => {
          categoryFrequency[category] = (categoryFrequency[category] || 0) + 1;
        });
      }
    });

    const topCategories = Object.entries(categoryFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const insightsData: any[][] = [
      ['INSIGHTS & PATTERNS'],
      [],
      ['Journey Overview'],
      ['Total Days', totalDays],
      ['Average Relapses per Week', avgRelapsesPerWeek],
      ['Average Activities per Week', avgActivitiesPerWeek],
      [],
      ['Most Common Relapse Tags'],
      ['Tag', 'Frequency'],
      ...topTags.map(([tag, count]) => [tag, count]),
      [],
      ['Most Common Activity Categories'],
      ['Category', 'Frequency'],
      ...topCategories.map(([category, count]) => [category, count]),
      [],
      ['Recovery Notes'],
      [''],
      ['Consistency is key! Keep logging your activities.'],
      ['Pay attention to your most common triggers (tags).'],
      ['Build on your strengths (most common activities).'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(insightsData);

    // Set column widths
    ws['!cols'] = [
      { wch: 30 },
      { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Insights');
  }

  /**
   * Create Charts info sheet
   */
  private createChartsInfoSheet(workbook: XLSX.WorkBook, charts: CapturedChart[]): void {
    const chartsData: any[][] = [
      ['EXPORTED CHARTS'],
      [],
      ['The following charts were captured during export:'],
      [],
      ['Chart Name', 'Filename'],
      ...charts.map(chart => [chart.name, chart.filename]),
      [],
      ['Note: Charts are saved as separate image files.'],
      ['You can import them into this spreadsheet or use them separately.'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(chartsData);

    // Set column widths
    ws['!cols'] = [
      { wch: 30 },
      { wch: 30 },
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Charts Info');
  }

  /**
   * Create Badges & Achievements sheet with earned badges and progress
   */
  private createBadgesSheet(workbook: XLSX.WorkBook): void {
    const { earnedBadges, badgeProgress } = useBadgeStore.getState();

    const badgesData: any[][] = [
      ['BADGES & ACHIEVEMENTS'],
      [],
      ['Earned Badges'],
      ['Badge ID', 'Title', 'Emoji', 'Category', 'Unlocked At', 'Description'],
    ];

    // Sort earned badges by unlock date (newest first)
    const sortedEarnedBadges = [...earnedBadges].sort((a, b) =>
      new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime()
    );

    // Add earned badge rows
    sortedEarnedBadges.forEach(earnedBadge => {
      const badgeDef = BADGE_DEFINITIONS.find(b => b.id === earnedBadge.badge_id);
      if (badgeDef) {
        badgesData.push([
          badgeDef.id,
          badgeDef.title,
          badgeDef.emoji,
          badgeDef.category,
          new Date(earnedBadge.unlocked_at).toLocaleString(),
          badgeDef.description,
        ]);
      }
    });

    // Add badge progress section
    badgesData.push([]);
    badgesData.push(['Badge Progress (In Progress)']);
    badgesData.push(['Badge ID', 'Title', 'Current', 'Required', 'Progress %']);

    // Add badges with progress < 100%
    Object.entries(badgeProgress).forEach(([badgeId, progress]) => {
      if (typeof progress === 'object' && progress && 'progress' in progress && progress.progress < 1) {
        const badgeDef = BADGE_DEFINITIONS.find(b => b.id === badgeId);
        if (badgeDef) {
          badgesData.push([
            badgeId,
            badgeDef.title,
            progress.current,
            progress.required,
            `${Math.round(progress.progress * 100)}%`,
          ]);
        }
      }
    });

    const ws = XLSX.utils.aoa_to_sheet(badgesData);

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // Badge ID
      { wch: 25 }, // Title
      { wch: 8 },  // Emoji
      { wch: 15 }, // Category
      { wch: 20 }, // Unlocked At
      { wch: 40 }, // Description
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Badges & Achievements');
  }

  /**
   * Create Weekly Vulnerability Pattern sheet
   */
  private createWeeklyVulnerabilitySheet(workbook: XLSX.WorkBook, relapses: Relapse[]): void {
    const weeklyData = calculateWeeklyPattern(relapses);
    const timeOfDayData = calculateTimeOfDayPattern(relapses);

    const sheetData: any[][] = [
      ['WEEKLY VULNERABILITY PATTERN'],
      [],
      ['Relapses by Day of Week'],
      ['Day', 'Count', 'Percentage'],
    ];

    // Add day-of-week data
    weeklyData.forEach(day => {
      sheetData.push([day.day, day.count, `${day.percentage}%`]);
    });

    // Add time-of-day distribution
    sheetData.push([]);
    sheetData.push(['Time-of-Day Distribution']);
    sheetData.push(['Period', 'Time Range', 'Count', 'Percentage']);

    timeOfDayData.data.forEach(period => {
      sheetData.push([
        period.period,
        period.timeRange,
        period.count,
        `${period.percentage}%`,
      ]);
    });

    // Add vulnerability summary
    sheetData.push([]);
    sheetData.push(['Vulnerability Summary']);

    const mostVulnerableDay = weeklyData.reduce((max, day) => day.count > max.count ? day : max, weeklyData[0]);
    sheetData.push(['Most Vulnerable Day', mostVulnerableDay.day]);

    if (timeOfDayData.mostVulnerable) {
      sheetData.push(['Most Vulnerable Time', timeOfDayData.mostVulnerable.timeRange]);
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Set column widths
    ws['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Weekly Vulnerability');
  }

  /**
   * Create Monthly Trend Analysis sheet
   */
  private createMonthlyTrendSheet(workbook: XLSX.WorkBook, relapses: Relapse[]): void {
    const monthlyData = calculateMonthlyTrend(relapses, 6);

    const sheetData: any[][] = [
      ['MONTHLY TREND ANALYSIS (Last 6 Months)'],
      [],
      ['Month', 'Year', 'Relapse Count'],
    ];

    // Add monthly data
    monthlyData.forEach(month => {
      sheetData.push([month.month, month.year, month.count]);
    });

    // Calculate trend
    const firstHalf = monthlyData.slice(0, 3);
    const secondHalf = monthlyData.slice(3, 6);
    const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.count, 0) / 3;
    const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.count, 0) / 3;

    let trendDirection = 'Stable';
    if (secondHalfAvg < firstHalfAvg * 0.8) {
      trendDirection = 'Improving';
    } else if (secondHalfAvg > firstHalfAvg * 1.2) {
      trendDirection = 'Declining';
    }

    const change = secondHalfAvg - firstHalfAvg;
    const changePercent = firstHalfAvg > 0 ? ((change / firstHalfAvg) * 100).toFixed(1) : '0';

    sheetData.push([]);
    sheetData.push(['Trend Analysis']);
    sheetData.push(['First Half Average', firstHalfAvg.toFixed(2)]);
    sheetData.push(['Second Half Average', secondHalfAvg.toFixed(2)]);
    sheetData.push(['Trend Direction', trendDirection]);
    sheetData.push(['Change', `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent}%)`]);

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Set column widths
    ws['!cols'] = [
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Monthly Trend');
  }

  /**
   * Create Activity Effectiveness sheet
   */
  private createActivityEffectivenessSheet(workbook: XLSX.WorkBook, activities: Activity[]): void {
    // Calculate category distribution
    const categoryFreq: Record<string, number> = {};
    activities.forEach(activity => {
      if (activity.categories) {
        activity.categories.forEach(cat => {
          categoryFreq[cat] = (categoryFreq[cat] || 0) + 1;
        });
      }
    });

    const sortedCategories = Object.entries(categoryFreq).sort(([, a], [, b]) => b - a);
    const totalCategoryInstances = Object.values(categoryFreq).reduce((sum, count) => sum + count, 0);

    const sheetData: any[][] = [
      ['ACTIVITY EFFECTIVENESS'],
      [],
      ['Category Distribution'],
      ['Category', 'Count', 'Percentage'],
    ];

    // Add category data
    sortedCategories.forEach(([category, count]) => {
      const percentage = totalCategoryInstances > 0 ? ((count / totalCategoryInstances) * 100).toFixed(1) : '0';
      sheetData.push([category, count, `${percentage}%`]);
    });

    // Calculate diversity score
    const uniqueCategories = new Set(activities.flatMap(a => a.categories || []));
    const totalAvailableCategories = ACTIVITY_CATEGORIES.length;
    const diversityScore = totalAvailableCategories > 0
      ? ((uniqueCategories.size / totalAvailableCategories) * 100).toFixed(1)
      : '0';

    sheetData.push([]);
    sheetData.push(['Diversity & Patterns']);
    sheetData.push(['Unique Categories Used', uniqueCategories.size]);
    sheetData.push(['Total Categories Available', totalAvailableCategories]);
    sheetData.push(['Diversity Score', `${diversityScore}%`]);

    // Calculate time-of-day distribution for activities
    const activityTimeData = this.calculateActivityTimeOfDay(activities);
    sheetData.push([]);
    sheetData.push(['Time-of-Day Distribution']);
    sheetData.push(['Period', 'Count', 'Percentage']);

    activityTimeData.data.forEach(period => {
      sheetData.push([period.period, period.count, `${period.percentage}%`]);
    });

    if (activityTimeData.peak) {
      sheetData.push([]);
      sheetData.push(['Peak Activity Time', activityTimeData.peak]);
    }

    // Calculate weekly average (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentActivities = activities.filter(a => new Date(a.timestamp) >= thirtyDaysAgo);
    const weeklyAvg = (recentActivities.length / 30 * 7).toFixed(1);

    sheetData.push([]);
    sheetData.push(['Weekly Average (Last 30 Days)', weeklyAvg]);

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Set column widths
    ws['!cols'] = [
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Activity Effectiveness');
  }

  /**
   * Calculate time-of-day pattern for activities
   */
  private calculateActivityTimeOfDay(activities: Activity[]): {
    data: Array<{ period: string; count: number; percentage: number }>;
    peak: string | null;
  } {
    const periods = [
      { period: 'Morning (5am - 12pm)', startHour: 5, endHour: 12 },
      { period: 'Afternoon (12pm - 5pm)', startHour: 12, endHour: 17 },
      { period: 'Evening (5pm - 9pm)', startHour: 17, endHour: 21 },
      { period: 'Night (9pm - 5am)', startHour: 21, endHour: 5 },
    ];

    const counts = [0, 0, 0, 0];

    activities.forEach(activity => {
      const date = new Date(activity.timestamp);
      const hour = date.getHours();

      if (hour >= 5 && hour < 12) {
        counts[0]++; // Morning
      } else if (hour >= 12 && hour < 17) {
        counts[1]++; // Afternoon
      } else if (hour >= 17 && hour < 21) {
        counts[2]++; // Evening
      } else {
        counts[3]++; // Night
      }
    });

    const total = activities.length || 1;
    const data = periods.map((p, i) => ({
      period: p.period,
      count: counts[i],
      percentage: Math.round((counts[i] / total) * 100),
    }));

    const maxCount = Math.max(...counts);
    const peakIndex = counts.indexOf(maxCount);
    const peak = maxCount > 0 ? periods[peakIndex].period : null;

    return { data, peak };
  }

  /**
   * Create Engagement Metrics sheet
   */
  private createEngagementMetricsSheet(workbook: XLSX.WorkBook, relapses: Relapse[], activities: Activity[]): void {
    const totalActivities = activities.length;
    const totalRelapses = relapses.length;
    const totalEngagement = totalActivities + totalRelapses;
    const activityPercentage = totalEngagement > 0
      ? ((totalActivities / totalEngagement) * 100).toFixed(1)
      : '0';

    let assessment = 'Focus on logging more activities';
    if (parseFloat(activityPercentage) >= 70) {
      assessment = 'Excellent - Strong engagement & recovery progress';
    } else if (parseFloat(activityPercentage) >= 50) {
      assessment = 'Good - Moderate engagement, room for growth';
    }

    const sheetData: any[][] = [
      ['ENGAGEMENT METRICS'],
      [],
      ['Resistance Ratio'],
      ['Total Activities', totalActivities],
      ['Total Relapses', totalRelapses],
      ['Total Engagement Events', totalEngagement],
      ['Activity Percentage', `${activityPercentage}%`],
      ['Engagement Assessment', assessment],
      [],
      ['Interpretation Guide'],
      ['70%+ Activities', 'Strong engagement & recovery progress'],
      ['50-69% Activities', 'Moderate engagement, room for growth'],
      ['<50% Activities', 'Focus on logging more positive activities'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Set column widths
    ws['!cols'] = [
      { wch: 30 },
      { wch: 40 },
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Engagement Metrics');
  }

  /**
   * Create Comparative Statistics sheet
   */
  private createComparativeStatsSheet(workbook: XLSX.WorkBook, relapses: Relapse[], activities: Activity[]): void {
    const getDateRange = (daysBack: number) => {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - daysBack);
      return { start, end };
    };

    const filterByDateRange = (items: Array<{ timestamp: string }>, start: Date, end: Date) => {
      return items.filter(item => {
        const date = new Date(item.timestamp);
        return date >= start && date <= end;
      });
    };

    const calculateSuccessRate = (acts: any[], rels: any[]) => {
      const total = acts.length + rels.length;
      return total > 0 ? ((acts.length / total) * 100).toFixed(1) : '0';
    };

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const change = ((current - previous) / previous * 100).toFixed(1);
      const changeNum = parseFloat(change);
      return `${changeNum >= 0 ? '+' : ''}${change}%`;
    };

    const getTrend = (currentSuccessRate: number, previousSuccessRate: number) => {
      if (currentSuccessRate > previousSuccessRate + 5) return 'Improving';
      if (currentSuccessRate < previousSuccessRate - 5) return 'Declining';
      return 'Stable';
    };

    // This Week vs Last Week
    const thisWeekRange = getDateRange(7);
    const lastWeekRange = { start: new Date(thisWeekRange.start.getTime() - 7 * 24 * 60 * 60 * 1000), end: thisWeekRange.start };

    const thisWeekRelapses = filterByDateRange(relapses, thisWeekRange.start, thisWeekRange.end);
    const thisWeekActivities = filterByDateRange(activities, thisWeekRange.start, thisWeekRange.end);
    const lastWeekRelapses = filterByDateRange(relapses, lastWeekRange.start, lastWeekRange.end);
    const lastWeekActivities = filterByDateRange(activities, lastWeekRange.start, lastWeekRange.end);

    const thisWeekSuccessRate = parseFloat(calculateSuccessRate(thisWeekActivities, thisWeekRelapses));
    const lastWeekSuccessRate = parseFloat(calculateSuccessRate(lastWeekActivities, lastWeekRelapses));

    // This Month vs Last Month
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthRelapses = filterByDateRange(relapses, thisMonthStart, now);
    const thisMonthActivities = filterByDateRange(activities, thisMonthStart, now);
    const lastMonthRelapses = filterByDateRange(relapses, lastMonthStart, lastMonthEnd);
    const lastMonthActivities = filterByDateRange(activities, lastMonthStart, lastMonthEnd);

    const thisMonthSuccessRate = parseFloat(calculateSuccessRate(thisMonthActivities, thisMonthRelapses));
    const lastMonthSuccessRate = parseFloat(calculateSuccessRate(lastMonthActivities, lastMonthRelapses));

    // Last 30 vs Previous 30
    const last30Range = getDateRange(30);
    const prev30Range = { start: new Date(last30Range.start.getTime() - 30 * 24 * 60 * 60 * 1000), end: last30Range.start };

    const last30Relapses = filterByDateRange(relapses, last30Range.start, last30Range.end);
    const last30Activities = filterByDateRange(activities, last30Range.start, last30Range.end);
    const prev30Relapses = filterByDateRange(relapses, prev30Range.start, prev30Range.end);
    const prev30Activities = filterByDateRange(activities, prev30Range.start, prev30Range.end);

    const last30SuccessRate = parseFloat(calculateSuccessRate(last30Activities, last30Relapses));
    const prev30SuccessRate = parseFloat(calculateSuccessRate(prev30Activities, prev30Relapses));

    const sheetData: any[][] = [
      ['COMPARATIVE STATISTICS'],
      [],
      ['This Week vs Last Week'],
      ['Metric', 'This Week', 'Last Week', 'Change', 'Trend'],
      ['Relapses', thisWeekRelapses.length, lastWeekRelapses.length, calculateChange(thisWeekRelapses.length, lastWeekRelapses.length), getTrend(thisWeekSuccessRate, lastWeekSuccessRate)],
      ['Activities', thisWeekActivities.length, lastWeekActivities.length, calculateChange(thisWeekActivities.length, lastWeekActivities.length), getTrend(thisWeekSuccessRate, lastWeekSuccessRate)],
      ['Success Rate', `${thisWeekSuccessRate}%`, `${lastWeekSuccessRate}%`, calculateChange(thisWeekSuccessRate, lastWeekSuccessRate), getTrend(thisWeekSuccessRate, lastWeekSuccessRate)],
      [],
      ['This Month vs Last Month'],
      ['Metric', 'This Month', 'Last Month', 'Change', 'Trend'],
      ['Relapses', thisMonthRelapses.length, lastMonthRelapses.length, calculateChange(thisMonthRelapses.length, lastMonthRelapses.length), getTrend(thisMonthSuccessRate, lastMonthSuccessRate)],
      ['Activities', thisMonthActivities.length, lastMonthActivities.length, calculateChange(thisMonthActivities.length, lastMonthActivities.length), getTrend(thisMonthSuccessRate, lastMonthSuccessRate)],
      ['Success Rate', `${thisMonthSuccessRate}%`, `${lastMonthSuccessRate}%`, calculateChange(thisMonthSuccessRate, lastMonthSuccessRate), getTrend(thisMonthSuccessRate, lastMonthSuccessRate)],
      [],
      ['Last 30 Days vs Previous 30 Days'],
      ['Metric', 'Last 30 Days', 'Previous 30', 'Change', 'Trend'],
      ['Relapses', last30Relapses.length, prev30Relapses.length, calculateChange(last30Relapses.length, prev30Relapses.length), getTrend(last30SuccessRate, prev30SuccessRate)],
      ['Activities', last30Activities.length, prev30Activities.length, calculateChange(last30Activities.length, prev30Activities.length), getTrend(last30SuccessRate, prev30SuccessRate)],
      ['Success Rate', `${last30SuccessRate}%`, `${prev30SuccessRate}%`, calculateChange(last30SuccessRate, prev30SuccessRate), getTrend(last30SuccessRate, prev30SuccessRate)],
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Set column widths
    ws['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Comparative Stats');
  }
}

export const xlsxExportService = new XLSXExportService();
