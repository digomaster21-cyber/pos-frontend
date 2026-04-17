import api from './api';
import { Sale, SaleCreate, SalesSummary } from '../types';
import { storage } from '../utils/storage';

export interface SalesFilters {
  branch_id?: number;
  product_id?: number;
  start_date?: string;
  end_date?: string;
  payment_method?: string;
  status?: string;
  search?: string;
}

export const salesApi = {
  getSales: async (filters?: SalesFilters): Promise<Sale[]> => {
    const params = new URLSearchParams();
    const companyId = storage.getCompanyId();
    
    params.append('company_id', companyId || '');
    if (filters?.branch_id) params.append('branch_id', String(filters.branch_id));
    if (filters?.product_id) params.append('product_id', String(filters.product_id));
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.payment_method) params.append('payment_method', filters.payment_method);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString();
    return api.get<Sale[]>(`/api/sales${query ? `?${query}` : ''}`);
  },

  getSale: async (id: number): Promise<Sale> => {
    const companyId = storage.getCompanyId();
    return api.get<Sale>(`/api/sales/${id}?company_id=${companyId}`);
  },

  createSale: async (data: SaleCreate): Promise<Sale> => {
    const companyId = storage.getCompanyId();
    const userId = storage.getUser()?.id;
    return api.post<Sale>('/api/sales', {
      ...data,
      company_id: companyId,
      created_by: userId
    });
  },

  updateSale: async (id: number, data: Partial<SaleCreate>): Promise<Sale> => {
    const companyId = storage.getCompanyId();
    return api.put<Sale>(`/api/sales/${id}?company_id=${companyId}`, data);
  },

  deleteSale: async (id: number): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    return api.delete<{ message: string }>(`/api/sales/${id}?company_id=${companyId}`);
  },

  getSalesSummary: async (filters?: SalesFilters): Promise<SalesSummary> => {
    const params = new URLSearchParams();
    const companyId = storage.getCompanyId();
    
    params.append('company_id', companyId || '');
    if (filters?.branch_id) params.append('branch_id', String(filters.branch_id));
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);

    const query = params.toString();
    return api.get<SalesSummary>(`/api/sales/summary${query ? `?${query}` : ''}`);
  },
  
  exportSales: async (filters?: SalesFilters): Promise<Blob> => {
    const params = new URLSearchParams();
    const companyId = storage.getCompanyId();
    
    params.append('company_id', companyId || '');
    if (filters?.branch_id) params.append('branch_id', String(filters.branch_id));
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);

    const query = params.toString();
    return api.get<Blob>(`/api/sales/export${query ? `?${query}` : ''}`);
  },
  
  cancelSale: async (id: number, reason?: string): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    return api.post(`/api/sales/${id}/cancel?company_id=${companyId}`, { reason });
  },
};

export default salesApi;