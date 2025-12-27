/**
 * Export Service
 * Provides comprehensive data export functionality for user journey data
 * Excel (XLSX) is the primary export format with multi-sheet workbooks
 */
class ExportService {
  /**
   * Export to XLSX format with comprehensive analytics
   * Creates a multi-sheet Excel workbook with all journey data and insights
   */
  async exportToXLSX(): Promise<boolean> {
    try {
      const { xlsxExportService } = await import('./xlsxExportService');
      return await xlsxExportService.exportToXLSX();
    } catch (error) {
      console.error('[Export] XLSX export error:', error);
      return false;
    }
  }
}

export const exportService = new ExportService();
