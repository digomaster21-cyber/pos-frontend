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

// ✅ ADD THIS - For multiple items in a single sale
export interface CreateSaleDto {
  items: Array<{
    product_id: number;
    quantity: number;
    unit_price: number;
  }>;
  branch_id: number;        // Changed from 'branch' to 'branch_id' to match API
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
    const companyId = storage.getCompanyId();
    const userId = storage.getUser()?.id;
    return apiClient.post<{ message: string; sale_id: number; invoice_no: string }>(
      '/api/sales',
      { ...payload, company_id: companyId, created_by: userId }
    );
  },

  // ✅ ADD THIS - For creating sales with multiple items
  createMultiItemSale: (payload: CreateSaleDto) => {
    const companyId = storage.getCompanyId();
    const userId = storage.getUser()?.id;
    return apiClient.post<{ message: string; sale_id: number; invoice_no: string }>(
      '/api/sales/multi-item', // Adjust endpoint as needed
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
};

export default salesApi;