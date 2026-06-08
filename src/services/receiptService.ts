// frontend/src/services/receiptService.ts
import { salesApi } from '../api/sales';

class ReceiptService {
  async downloadPDF(saleId: number, invoiceNo: string): Promise<void> {
    try {
      await salesApi.downloadReceipt(saleId, invoiceNo);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      throw new Error('Could not download receipt. Please try again.');
    }
  }

  async printReceipt(saleId: number): Promise<void> {
    try {
      await salesApi.printReceipt(saleId);
    } catch (error) {
      console.error('Failed to print:', error);
      throw new Error('Could not print receipt. Please check your printer connection.');
    }
  }

  async getReceiptHTML(saleId: number): Promise<string> {
    return await salesApi.getReceiptHTML(saleId);
  }

  async checkPrinter(): Promise<boolean> {
    return typeof window !== 'undefined' && !!window.print;
  }
}

// Create a singleton instance
const receiptService = new ReceiptService();

// Export as default
export default receiptService;