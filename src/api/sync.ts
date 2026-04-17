import api from '../services/api';
import { storage } from '../utils/storage';

export interface SyncSaleSummary {
  count: number;
  total_sales: number | null;
  total_profit: number | null;
  from_date: string | null;
  to_date: string | null;
}

export interface SyncSaleDetail {
  invoice_no: string;
  product_id: number;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  total_price: number;
  profit: number;
  sale_date: string;
  customer_name?: string | null;
}

export interface SyncExpenseSummary {
  category: string;
  count: number;
  total_amount: number;
}

export interface SyncStockItem {
  product_id: number;
  name: string;
  quantity: number;
  current_avg_cost: number;
  stock_value: number;
}

export interface PreparedSyncData {
  branch_id: number;
  company_id?: number;
  sync_timestamp: string;
  hash: string;
  data: {
    sales: SyncSaleSummary;
    sales_details: SyncSaleDetail[];
    expenses: SyncExpenseSummary[];
    stock: SyncStockItem[];
  };
}

export interface SyncPrepareResponse {
  message: string;
  sync_data: PreparedSyncData;
}

export interface SyncResponse {
  message: string;
}

export interface SyncStatus {
  branch_id: number;
  company_id?: number;
  pending_sales_count: number;
  pending_expenses_count: number;
  stock_items_count: number;
  last_sync_date: string | null;
  can_receive_sync: boolean;
}

export interface SyncLogItem {
  id: number;
  branch_id: number;
  company_id?: number;
  sync_type: string;
  data_summary: string;
  records_count: number;
  status: string;
  error_message?: string | null;
  sync_date: string;
}

export interface SyncLogsResponse {
  logs: SyncLogItem[];
}

export const syncApi = {
  getStatus: async (): Promise<SyncStatus> => {
    const companyId = storage.getCompanyId();
    const params = new URLSearchParams();
    if (companyId) params.append('company_id', companyId);
    return api.get(`/api/sync/status?${params.toString()}`);
  },

  getLogs: async (): Promise<SyncLogsResponse> => {
    const companyId = storage.getCompanyId();
    const params = new URLSearchParams();
    if (companyId) params.append('company_id', companyId);
    return api.get(`/api/sync/logs?${params.toString()}`);
  },

  prepareSync: async (): Promise<SyncPrepareResponse> => {
    const companyId = storage.getCompanyId();
    const branchId = storage.getBranchId();
    return api.post('/api/sync/prepare', { company_id: companyId, branch_id: branchId });
  },

  uploadSync: async (): Promise<SyncResponse> => {
    const companyId = storage.getCompanyId();
    const branchId = storage.getBranchId();
    return api.post('/api/sync/upload', { company_id: companyId, branch_id: branchId });
  },

  receiveSyncFile: async (file: File): Promise<SyncResponse> => {
    const companyId = storage.getCompanyId();
    const formData = new FormData();
    formData.append('file', file);
    if (companyId) formData.append('company_id', companyId);
    return api.post('/api/sync/receive', formData);
  },
};

export default syncApi;