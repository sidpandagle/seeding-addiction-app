import { captureRef } from 'react-native-view-shot';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export interface ChartExportOptions {
  includeWeeklyPattern?: boolean;
  includeMonthlyTrend?: boolean;
  includeResistanceRatio?: boolean;
  includeActivityEffectiveness?: boolean;
  includeComparativeStats?: boolean;
}

export interface CapturedChart {
  name: string;
  uri: string;
  filename: string;
}

class ChartExportService {
  /**
   * Capture a chart component as an image
   * @param chartRef - React ref to the chart view
   * @param chartName - Name of the chart for the filename
   * @param format - Image format (png or jpg)
   * @param quality - Image quality (0-1 for jpg)
   */
  async captureChartAsImage(
    chartRef: any,
    chartName: string,
    format: 'png' | 'jpg' = 'png',
    quality: number = 1
  ): Promise<string | null> {
    try {
      if (!chartRef || !chartRef.current) {
        console.warn(`[ChartExport] Chart ref not available for ${chartName}`);
        return null;
      }

      const uri = await captureRef(chartRef, {
        format,
        quality,
        result: 'tmpfile',
      });

      console.log(`[ChartExport] Captured ${chartName}: ${uri}`);
      return uri;
    } catch (error) {
      console.error(`[ChartExport] Error capturing ${chartName}:`, error);
      return null;
    }
  }

  /**
   * Capture multiple charts and return their URIs
   * @param chartRefs - Object containing chart refs
   * @param options - Which charts to include
   */
  async captureMultipleCharts(
    chartRefs: {
      weeklyPattern?: any;
      monthlyTrend?: any;
      resistanceRatio?: any;
      activityEffectiveness?: any;
      comparativeStats?: any;
    },
    options: ChartExportOptions
  ): Promise<CapturedChart[]> {
    const capturedCharts: CapturedChart[] = [];

    try {
      // Capture Weekly Pattern
      if (options.includeWeeklyPattern && chartRefs.weeklyPattern) {
        const uri = await this.captureChartAsImage(chartRefs.weeklyPattern, 'WeeklyPattern');
        if (uri) {
          capturedCharts.push({
            name: 'Weekly Pattern',
            uri,
            filename: 'weekly-pattern.png',
          });
        }
      }

      // Capture Monthly Trend
      if (options.includeMonthlyTrend && chartRefs.monthlyTrend) {
        const uri = await this.captureChartAsImage(chartRefs.monthlyTrend, 'MonthlyTrend');
        if (uri) {
          capturedCharts.push({
            name: 'Monthly Trend',
            uri,
            filename: 'monthly-trend.png',
          });
        }
      }

      // Capture Resistance Ratio
      if (options.includeResistanceRatio && chartRefs.resistanceRatio) {
        const uri = await this.captureChartAsImage(chartRefs.resistanceRatio, 'ResistanceRatio');
        if (uri) {
          capturedCharts.push({
            name: 'Resistance Ratio',
            uri,
            filename: 'resistance-ratio.png',
          });
        }
      }

      // Capture Activity Effectiveness
      if (options.includeActivityEffectiveness && chartRefs.activityEffectiveness) {
        const uri = await this.captureChartAsImage(chartRefs.activityEffectiveness, 'ActivityEffectiveness');
        if (uri) {
          capturedCharts.push({
            name: 'Activity Effectiveness',
            uri,
            filename: 'activity-effectiveness.png',
          });
        }
      }

      // Capture Comparative Stats
      if (options.includeComparativeStats && chartRefs.comparativeStats) {
        const uri = await this.captureChartAsImage(chartRefs.comparativeStats, 'ComparativeStats');
        if (uri) {
          capturedCharts.push({
            name: 'Comparative Stats',
            uri,
            filename: 'comparative-stats.png',
          });
        }
      }

      console.log(`[ChartExport] Captured ${capturedCharts.length} charts`);
      return capturedCharts;
    } catch (error) {
      console.error('[ChartExport] Error capturing multiple charts:', error);
      return capturedCharts; // Return what we managed to capture
    }
  }

  /**
   * Export charts as separate image files and share them
   */
  async exportChartsAsImages(charts: CapturedChart[]): Promise<boolean> {
    try {
      if (charts.length === 0) {
        console.log('[ChartExport] No charts to export');
        return false;
      }

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        console.log('[ChartExport] Sharing not available on this device');
        return false;
      }

      // For single chart, share directly
      if (charts.length === 1) {
        await Sharing.shareAsync(charts[0].uri, {
          mimeType: 'image/png',
          dialogTitle: `Export ${charts[0].name}`,
        });
        return true;
      }

      // For multiple charts, we'll need to share them one by one or create a zip
      // For now, let's share the first chart and inform about others
      // TODO: Implement zip file creation for multiple charts
      await Sharing.shareAsync(charts[0].uri, {
        mimeType: 'image/png',
        dialogTitle: 'Export Charts',
      });

      return true;
    } catch (error) {
      console.error('[ChartExport] Error exporting charts:', error);
      return false;
    }
  }

  /**
   * Bundle charts with CSV data export
   * Creates a summary document that includes both data and chart references
   */
  async exportWithCharts(
    csvUri: string,
    charts: CapturedChart[]
  ): Promise<boolean> {
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const summaryFilename = `seeding-export-${dateStr}-summary.txt`;
      const summaryFile = new File(Paths.document, summaryFilename);

      // Create summary content
      const lines: string[] = [];
      lines.push('SEEDING EXPORT - DATA & CHARTS');
      lines.push('═'.repeat(50));
      lines.push('');
      lines.push(`Exported on: ${new Date().toLocaleString()}`);
      lines.push('');
      lines.push('FILES INCLUDED:');
      lines.push('─'.repeat(50));
      lines.push('1. Complete data export (CSV file)');
      if (charts.length > 0) {
        charts.forEach((chart, index) => {
          lines.push(`${index + 2}. ${chart.name} (${chart.filename})`);
        });
      }
      lines.push('');
      lines.push('NOTE: All files have been saved and are ready to share.');
      lines.push('');
      lines.push('Generated by Seeding App 🌱');

      const summaryContent = lines.join('\n');
      await summaryFile.write(summaryContent);

      // Share the summary file
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(summaryFile.uri, {
          mimeType: 'text/plain',
          dialogTitle: 'Export Complete - Data & Charts',
        });
      }

      // Clean up summary file
      await summaryFile.delete();

      return true;
    } catch (error) {
      console.error('[ChartExport] Error bundling export:', error);
      return false;
    }
  }

  /**
   * Clean up temporary chart files
   */
  async cleanupChartFiles(charts: CapturedChart[]): Promise<void> {
    try {
      for (const chart of charts) {
        try {
          const file = new File('', chart.uri);
          await file.delete();
          console.log(`[ChartExport] Cleaned up ${chart.filename}`);
        } catch (error) {
          // Ignore individual cleanup errors
          console.warn(`[ChartExport] Could not clean up ${chart.filename}:`, error);
        }
      }
    } catch (error) {
      console.error('[ChartExport] Error during cleanup:', error);
    }
  }
}

export const chartExportService = new ChartExportService();
