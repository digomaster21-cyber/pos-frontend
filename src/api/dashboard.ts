import { apiClient } from './client';
import { storage } from '../utils/storage';

export interface DashboardSummary {
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  salesTrend: number; // percentage
  topProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  recentSales: Array<{
    id: string;
    date: string;
    amount: number;
    customer?: string;
  }>;
}

export interface KpiMetric {
  label: string;
  value: number;
  change: number;
  isPositive: boolean;
}

export const dashboardApi = {
  getSummary: () => {
    const companyId = storage.getCompanyId();
    const branchId = storage.getBranchId();
    const params = new URLSearchParams();
    
    params.append('company_id', companyId || '');
    if (branchId) params.append('branch_id', String(branchId));
    
    return apiClient.get<DashboardSummary>(`/api/dashboard/summary?${params.toString()}`);
  },
};