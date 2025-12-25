import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getRelapses, getActivities, getJourneyStart } from '../db/helpers';
import { calculateUserStats } from '../utils/statsHelpers';

interface ExportData {
  relapses: Array<{
    id: string;
    timestamp: string;
    note?: string;
    tags?: string[];
  }>;
  activities: Array<{
    id: string;
    timestamp: string;
    note?: string;
    categories?: string[];
  }>;
  journeyStart: string | null;
  stats: {
    totalRelapses: number;
    totalActivities: number;
    currentStreak: number;
    bestStreak: number;
    successRate: string;
  };
  exportDate: string;
}

class ExportService {
  /**
   * Generate CSV content from relapses and activities
   */
  generateCSV(data: ExportData): string {
    const lines: string[] = [];

    // Header section
    lines.push('SEEDING RECOVERY JOURNEY EXPORT');
    lines.push(`Export Date: ${new Date(data.exportDate).toLocaleString()}`);
    lines.push(`Journey Start: ${data.journeyStart ? new Date(data.journeyStart).toLocaleString() : 'Not set'}`);
    lines.push('');

    // Stats section
    lines.push('STATISTICS');
    lines.push(`Total Relapses: ${data.stats.totalRelapses}`);
    lines.push(`Total Activities: ${data.stats.totalActivities}`);
    lines.push(`Current Streak (days): ${data.stats.currentStreak}`);
    lines.push(`Best Streak (days): ${data.stats.bestStreak}`);
    lines.push(`Success Rate: ${data.stats.successRate}%`);
    lines.push('');

    // Relapses section
    lines.push('RELAPSES');
    lines.push('Date,Time,Note,Tags');
    data.relapses.forEach(relapse => {
      const date = new Date(relapse.timestamp);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      const note = this.escapeCSV(relapse.note || '');
      const tags = relapse.tags ? relapse.tags.join('; ') : '';
      lines.push(`${dateStr},${timeStr},"${note}","${tags}"`);
    });
    lines.push('');

    // Activities section
    lines.push('ACTIVITIES');
    lines.push('Date,Time,Note,Categories');
    data.activities.forEach(activity => {
      const date = new Date(activity.timestamp);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      const note = this.escapeCSV(activity.note || '');
      const categories = activity.categories ? activity.categories.join('; ') : '';
      lines.push(`${dateStr},${timeStr},"${note}","${categories}"`);
    });

    return lines.join('\n');
  }

  /**
   * Escape special characters for CSV
   */
  private escapeCSV(value: string): string {
    return value.replace(/"/g, '""').replace(/\n/g, ' ');
  }

  /**
   * Export data to CSV file and share it
   */
  async exportToCSV(): Promise<boolean> {
    try {
      // Gather all data
      const [relapses, activities, journeyStart] = await Promise.all([
        getRelapses(),
        getActivities(),
        getJourneyStart(),
      ]);

      // Calculate stats
      const stats = calculateUserStats(relapses, journeyStart);
      const totalActivities = activities.length;
      const totalRelapses = relapses.length;
      const successRate = totalRelapses + totalActivities > 0
        ? ((totalActivities / (totalRelapses + totalActivities)) * 100).toFixed(1)
        : '100.0';

      const exportData: ExportData = {
        relapses,
        activities,
        journeyStart,
        stats: {
          totalRelapses,
          totalActivities,
          currentStreak: stats.currentStreak,
          bestStreak: stats.bestStreak,
          successRate,
        },
        exportDate: new Date().toISOString(),
      };

      // Generate CSV
      const csvContent = this.generateCSV(exportData);

      // Generate filename with date
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `seeding-export-${dateStr}.csv`;
      const file = new File(Paths.document, filename);

      // Write file
      await file.write(csvContent);

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        console.log('[Export] Sharing not available on this device');
        return false;
      }

      // Share file
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Your Journey Data',
        UTI: 'public.comma-separated-values-text',
      });

      // Clean up file after sharing
      await file.delete();

      return true;
    } catch (error) {
      console.error('[Export] CSV export error:', error);
      return false;
    }
  }

  /**
   * Generate a formatted text report for sharing
   */
  async exportToText(): Promise<boolean> {
    try {
      // Gather all data
      const [relapses, activities, journeyStart] = await Promise.all([
        getRelapses(),
        getActivities(),
        getJourneyStart(),
      ]);

      // Calculate stats
      const stats = calculateUserStats(relapses, journeyStart);
      const totalActivities = activities.length;
      const totalRelapses = relapses.length;
      const successRate = totalRelapses + totalActivities > 0
        ? ((totalActivities / (totalRelapses + totalActivities)) * 100).toFixed(1)
        : '100.0';

      // Build report
      const lines: string[] = [];
      lines.push('🌱 SEEDING - RECOVERY JOURNEY REPORT');
      lines.push('═'.repeat(40));
      lines.push('');

      lines.push('📊 STATISTICS');
      lines.push('─'.repeat(40));
      lines.push(`Journey Started: ${journeyStart ? new Date(journeyStart).toLocaleDateString() : 'Not set'}`);
      lines.push(`Current Streak: ${stats.currentStreak} days`);
      lines.push(`Best Streak: ${stats.bestStreak} days`);
      lines.push(`Total Activities: ${totalActivities}`);
      lines.push(`Total Relapses: ${totalRelapses}`);
      lines.push(`Success Rate: ${successRate}%`);
      lines.push('');

      if (relapses.length > 0) {
        lines.push('📍 RECENT RELAPSES');
        lines.push('─'.repeat(40));
        relapses.slice(0, 10).forEach(relapse => {
          const date = new Date(relapse.timestamp);
          lines.push(`• ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`);
          if (relapse.tags && relapse.tags.length > 0) {
            lines.push(`  Tags: ${relapse.tags.join(', ')}`);
          }
          if (relapse.note) {
            lines.push(`  Note: ${relapse.note.substring(0, 50)}${relapse.note.length > 50 ? '...' : ''}`);
          }
        });
        if (relapses.length > 10) {
          lines.push(`  ... and ${relapses.length - 10} more`);
        }
        lines.push('');
      }

      if (activities.length > 0) {
        lines.push('✨ RECENT ACTIVITIES');
        lines.push('─'.repeat(40));
        activities.slice(0, 10).forEach(activity => {
          const date = new Date(activity.timestamp);
          lines.push(`• ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`);
          if (activity.categories && activity.categories.length > 0) {
            lines.push(`  Categories: ${activity.categories.join(', ')}`);
          }
          if (activity.note) {
            lines.push(`  Note: ${activity.note.substring(0, 50)}${activity.note.length > 50 ? '...' : ''}`);
          }
        });
        if (activities.length > 10) {
          lines.push(`  ... and ${activities.length - 10} more`);
        }
        lines.push('');
      }

      lines.push('─'.repeat(40));
      lines.push(`Exported on ${new Date().toLocaleString()}`);
      lines.push('Generated by Seeding App 🌱');

      const content = lines.join('\n');

      // Generate filename
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `seeding-report-${dateStr}.txt`;
      const file = new File(Paths.document, filename);

      // Write file
      await file.write(content);

      // Share
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        return false;
      }

      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/plain',
        dialogTitle: 'Share Your Journey Report',
      });

      // Clean up
      await file.delete();

      return true;
    } catch (error) {
      console.error('[Export] Text export error:', error);
      return false;
    }
  }
}

export const exportService = new ExportService();
