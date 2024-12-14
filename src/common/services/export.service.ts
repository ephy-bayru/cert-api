import { Injectable } from '@nestjs/common';
import { Parser } from 'json2csv';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { LoggerService } from './logger.service';

@Injectable()
export class ExportService {
  constructor(private readonly logger: LoggerService) {}

  async exportToCsv(data: any[], filename: string): Promise<Buffer> {
    try {
      const parser = new Parser();
      const csv = parser.parse(data);
      this.logger.log(`CSV export created for ${filename}`, 'ExportService');
      return Buffer.from(csv);
    } catch (error) {
      this.logger.error(
        `Error exporting to CSV: ${error.message}`,
        'ExportService',
        { error },
      );
      throw new Error('Failed to export data to CSV');
    }
  }

  async exportToJson(data: any[]): Promise<Buffer> {
    try {
      const json = JSON.stringify(data, null, 2);
      this.logger.log('JSON export created', 'ExportService');
      return Buffer.from(json);
    } catch (error) {
      this.logger.error(
        `Error exporting to JSON: ${error.message}`,
        'ExportService',
        { error },
      );
      throw new Error('Failed to export data to JSON');
    }
  }

  async exportToExcel(data: any[], filename: string): Promise<Buffer> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
      // Add headers
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);
      // Add data
      data.forEach((item) => {
        worksheet.addRow(Object.values(item));
      });
      const buffer = await workbook.xlsx.writeBuffer();
      this.logger.log(`Excel export created for ${filename}`, 'ExportService');
      return Buffer.from(buffer);
    } catch (error) {
      this.logger.error(
        `Error exporting to Excel: ${error.message}`,
        'ExportService',
        { error },
      );
      throw new Error('Failed to export data to Excel');
    }
  }

  async exportToPdf(data: any[], filename: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          this.logger.log(
            `PDF export created for ${filename}`,
            'ExportService',
          );
          resolve(pdfBuffer);
        });
        // Add content to PDF
        doc.fontSize(16).text(filename, { align: 'center' });
        doc.moveDown();
        data.forEach((item) => {
          Object.entries(item).forEach(([key, value]) => {
            doc.fontSize(12).text(`${key}: ${value}`);
          });
          doc.moveDown();
        });
        doc.end();
      } catch (error) {
        this.logger.error(
          `Error exporting to PDF: ${error.message}`,
          'ExportService',
          { error },
        );
        reject(new Error('Failed to export data to PDF'));
      }
    });
  }

  getContentType(format: string): string {
    switch (format.toLowerCase()) {
      case 'csv':
        return 'text/csv';
      case 'json':
        return 'application/json';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  }

  async exportData(
    data: any[],
    format: string,
    filename: string,
  ): Promise<{ buffer: Buffer; contentType: string }> {
    let buffer: Buffer;
    switch (format.toLowerCase()) {
      case 'csv':
        buffer = await this.exportToCsv(data, filename);
        break;
      case 'json':
        buffer = await this.exportToJson(data);
        break;
      case 'excel':
        buffer = await this.exportToExcel(data, filename);
        break;
      case 'pdf':
        buffer = await this.exportToPdf(data, filename);
        break;
      default:
        throw new Error('Unsupported export format');
    }
    const contentType = this.getContentType(format);
    return { buffer, contentType };
  }
}
