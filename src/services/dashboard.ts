import { apiClient } from '../api/client';
import { storage } from '../utils/storage';

export interface DashboardSummary {
  today: {
    transactions: number;
    revenue: number;
    profit: number;
  };
  month_to_date: {
    transactions: number;
    revenue: number;
    profit: number;
  };
  alerts: {
    low_stock: number;
    pending_approvals: number;
  };
}

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const companyId = storage.getCompanyId();
    const branchId = storage.getBranchId();
    const params = new URLSearchParams();
    
    params.append('company_id', companyId || '');
    if (branchId) params.append('branch_id', String(branchId));
    
    const response = await apiClient.get(`/api/reports/dashboard/kpi?${params.toString()}`);
    
    // Type assertion to tell TypeScript what shape the data has
    const data = response as any;
    
    // Return with proper structure
    return {
      today: {
        transactions: data?.today?.transactions || 0,
        revenue: data?.today?.revenue || 0,
        profit: data?.today?.profit || 0
      },
      month_to_date: {
        transactions: data?.month_to_date?.transactions || 0,
        revenue: data?.month_to_date?.revenue || 0,
        profit: data?.month_to_date?.profit || 0
      },
      alerts: {
        low_stock: data?.alerts?.low_stock || 0,
        pending_approvals: data?.alerts?.pending_approvals || 0
      }
    };
  },
};