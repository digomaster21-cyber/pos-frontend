import { apiClient } from '../api/client';

export interface DashboardResponse {
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
  getSummary: () => apiClient.get<DashboardResponse>('/api/reports/dashboard/kpi'),
};