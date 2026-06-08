// src/api/sales.ts
import { apiClient } from './client';
import { storage } from '../utils/storage';

export interface Sale {
  id: number;
  invoice_no: string;
  branch_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  total_price: number;
  total_cost: number;
  profit: number;
  sale_date: string;
  sold_by: number;
  customer_name?: string | null;
  payment_method?: string;
  notes?: string | null;
  status?: string;
  product_name?: string;
  product_sku?: string;
  seller_name?: string;
  branch_name?: string;
}

export interface SaleCreatePayload {
  branch_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  sale_date: string;
  customer_name?: string;
  payment_method?: string;
  notes?: string;
}

export interface CreateSaleDto {
  items: Array<{
    product_id: number;
    quantity: number;
    unit_price: number;
  }>;
  branch_id: number;
  customer_name?: string;
  payment_method: string;
  notes?: string;
}

export interface SalesSummary {
  total_sales: number;
  total_profit: number;
  total_items_sold: number;
  average_transaction: number;
  period: string;
  transaction_count?: number;
}

// Helper to add company_id to params
const addCompanyId = (params?: Record<string, any>): Record<string, any> => {
  const companyId = storage.getCompanyId();
  return { ...params, company_id: companyId || '' };
};

export const salesApi = {
  getSales: (params?: {
    branch_id?: number;
    start_date?: string;
    end_date?: string;
    product_id?: number;
    limit?: number;
    offset?: number;
  }) => {
    const allParams = addCompanyId(params);
    return apiClient.get<Sale[]>('/api/sales', allParams);
  },

  getSaleById: (saleId: number) => {
    const companyId = storage.getCompanyId();
    return apiClient.get<Sale>(`/api/sales/${saleId}?company_id=${companyId}`);
  },

  createSale: (payload: SaleCreatePayload) => {
    console.log("SALE PAYLOAD:", payload);
    const companyId = storage.getCompanyId();
    const userId = storage.getUser()?.id;
    return apiClient.post<{ message: string; sale_id: number; invoice_no: string }>(
      '/api/sales',
      { ...payload, company_id: companyId, created_by: userId }
    );
  },

  createMultiItemSale: (payload: CreateSaleDto) => {
    const companyId = storage.getCompanyId();
    const userId = storage.getUser()?.id;
    return apiClient.post<{ message: string; sale_id: number; invoice_no: string }>(
      '/api/sales/multi-item',
      { ...payload, company_id: companyId, sold_by: userId }
    );
  },

  getSummary: (params?: { branch_id?: number; period?: string }) => {
    const allParams = addCompanyId(params);
    return apiClient.get<SalesSummary>('/api/sales/summary', allParams);
  },

  cancelSale: (saleId: number, reason: string) => {
    const companyId = storage.getCompanyId();
    return apiClient.post<{ message: string }>(
      `/api/sales/${saleId}/cancel?reason=${encodeURIComponent(reason)}&company_id=${companyId}`
    );
  },

  getSalesByDate: (saleDate: string, branchId?: number) => {
    const companyId = storage.getCompanyId();
    const params = new URLSearchParams();
    params.append('company_id', companyId || '');
    if (branchId) params.append('branch_id', String(branchId));
    return apiClient.get<{
      date: string;
      total_sales: number;
      total_amount: number;
      total_profit: number;
      sales: Sale[];
    }>(`/api/sales/by-date/${saleDate}?${params.toString()}`);
  },

  // ==================== RECEIPT METHODS ====================
  
  getReceiptPDF: async (saleId: number): Promise<Blob> => {
    const companyId = storage.getCompanyId();
    // The apiClient returns the blob directly when responseType is 'blob'
    const blob = await apiClient.get<Blob>(
      `/api/receipts/sale/${saleId}?company_id=${companyId}`,
      undefined,
      {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      }
    );
    return blob;
  },

  getReceiptHTML: async (saleId: number): Promise<string> => {
    const companyId = storage.getCompanyId();
    // The apiClient returns the HTML string directly
    const html = await apiClient.get<string>(
      `/api/receipts/sale/${saleId}/print?company_id=${companyId}`,
      undefined,
      {
        responseType: 'text',
        headers: {
          'Accept': 'text/html'
        }
      }
    );
    return html;
  },

  printReceipt: async (saleId: number): Promise<void> => {
    try {
      const html = await salesApi.getReceiptHTML(saleId);
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }
    } catch (error) {
      console.error('Print failed:', error);
      throw error;
    }
  },

  downloadReceipt: async (saleId: number, invoiceNo: string): Promise<void> => {
    try {
      const pdfBlob = await salesApi.getReceiptPDF(saleId);
      
      // Validate the blob
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('Generated PDF is empty');
      }
      
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt_${invoiceNo}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }
};

export default salesApi;