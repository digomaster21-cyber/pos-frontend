import { apiClient } from '../api/client';
import { storage } from '../utils/storage';

export interface DashboardKPIResponse {
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

export interface DailySalesPoint {
  sale_date: string;
  transaction_count: number;
  total_items: number;
  total_revenue: number;
  total_profit: number;
  avg_transaction_value: number;
}

export interface DailySalesReportResponse {
  period: {
    start_date: string;
    end_date: string;
    days: number;
  };
  summary: {
    total_revenue: number;
    total_profit: number;
    total_transactions: number;
    avg_daily_revenue: number;
    avg_transaction_value: number;
  };
  daily_data: DailySalesPoint[];
}

export interface TopProduct {
  id: number;
  name: string;
  sku: string;
  category: string;
  sale_count: number;
  total_quantity: number;
  total_revenue: number;
  total_profit: number;
  avg_selling_price: number;
}

export interface TopProductsResponse {
  period: {
    start_date: string;
    end_date: string;
  };
  products: TopProduct[];
}

export interface CategorySale {
  category: string;
  sale_count: number;
  total_quantity: number;
  total_revenue: number;
  total_profit: number;
}

export interface CategorySalesResponse {
  period: {
    start_date: string;
    end_date: string;
  };
  categories: CategorySale[];
}

export interface InventoryValuationByCategory {
  category: string;
  product_count: number;
  total_quantity: number;
  total_value: number;
  retail_value: number;
}

export interface InventoryValuationResponse {
  branch_id: number;
  as_of: string;
  summary: {
    total_products: number;
    total_quantity: number;
    total_cost_value: number;
    total_retail_value: number;
    potential_profit: number;
  };
  by_category: InventoryValuationByCategory[];
}

export interface DetailedSaleItem {
  id: number;
  invoice_no: string;
  sale_date: string;
  sold_by: number;
  sold_by_name: string;
  sold_by_username: string;
  customer_name: string;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  total_price: number;
  profit: number;
  payment_method: string;
  status: string;
  created_at: string;
}

export interface DetailedSalesResponse {
  period: {
    start_date: string;
    end_date: string;
  };
  sales: DetailedSaleItem[];
  summary: {
    total_revenue: number;
    total_profit: number;
    total_transactions: number;
    total_items: number;
  };
}

export interface ProfitLossResponse {
  period: {
    start_date: string;
    end_date: string;
  };
  revenue: {
    total: number;
    transaction_count: number;
    items_sold: number;
  };
  expenses: {
    total: number;
    by_category: Array<{
      category: string;
      total: number;
    }>;
  };
  profit: {
    gross_profit: number;
    net_profit: number;
    profit_margin: number;
  };
}

// Business Dashboard Response Interface
export interface BusinessDashboardResponse {
  period: {
    name: string;
    start_date: string;
    end_date: string;
    previous_period_start: string;
    previous_period_end: string;
  };
  profit_loss: {
    total_sales: number;
    total_cost: number;
    gross_profit: number;
    gross_margin: number;
    total_expenses: number;
    expenses_breakdown: {
      rent: number;
      salaries: number;
      utilities: number;
      marketing: number;
      transport: number;
      other: number;
    };
    net_profit: number;
    net_margin: number;
    sales_change: number;
    profit_change: number;
  };
  sales_performance: {
    today: {
      revenue: number;
      transactions: number;
    };
    period_total: number;
    transactions: number;
    items_sold: number;
    avg_transaction: number;
  };
  top_products: Array<{
    name: string;
    total_revenue: number;
    quantity_sold: number;
    total_profit: number;
    profit_margin: number;
  }>;
  low_stock_alerts: {
    critical: Array<{
      id: number;
      name: string;
      current_quantity: number;
      min_stock_level: number;
    }>;
    warning: Array<{
      id: number;
      name: string;
      current_quantity: number;
      min_stock_level: number;
    }>;
    count: number;
  };
  daily_trend: Array<{
    date: string;
    revenue: number;
    profit: number;
    count: number;
  }>;
  best_day: {
    date: string;
    revenue: number;
    profit: number;
  } | null;
  worst_day: {
    date: string;
    revenue: number;
    profit: number;
  } | null;
  category_margins: Array<{
    category: string;
    total_revenue: number;
    total_profit: number;
    profit_margin: number;
  }>;
  recent_transactions: Array<{
    invoice_no: string;
    sale_date: string;
    created_at: string;
    customer_name: string;
    product_name: string;
    amount: number;
    sold_by_name: string;
  }>;
  cash_flow: {
    cash_in_drawer: number;
    upcoming_bills: number;
    has_sufficient_cash: boolean;
  };
  insights: {
    positive: string[];
    needs_attention: string[];
    opportunities: string[];
  };
  generated_at: string;
}

export const reportsApi = {
  getDashboardKPI: (branchId?: number) => {
    const companyId = storage.getCompanyId();
    const params = new URLSearchParams();
    params.append('company_id', companyId || '');
    if (branchId) params.append('branch_id', String(branchId));
    return apiClient.get<DashboardKPIResponse>(`/api/reports/dashboard/kpi?${params.toString()}`);
  },

  getDailySalesReport: (
    startDate: string,
    endDate: string,
    branchId?: number
  ) => {
    const companyId = storage.getCompanyId();
    const params = new URLSearchParams();
    params.append('company_id', companyId || '');
    params.append('start_date', startDate);
    params.append('end_date', endDate);
    if (branchId) params.append('branch_id', String(branchId));
    
    return apiClient.get<DailySalesReportResponse>(
      `/api/reports/sales/daily?${params.toString()}`
    );
  },

  getTopProducts: (
    startDate: string,
    endDate: string,
    branchId?: number,
    limit = 10
  ) => {
    const companyId = storage.getCompanyId();
    const params = new URLSearchParams();
    params.append('company_id', companyId || '');
    params.append('start_date', startDate);
    params.append('end_date', endDate);
    if (branchId) params.append('branch_id', String(branchId));
    params.append('limit', String(limit));
    
    return apiClient.get<TopProductsResponse>(
      `/api/reports/sales/by-product?${params.toString()}`
    );
  },

  getCategorySales: (
    startDate: string,
    endDate: string,
    branchId?: number
  ) => {
    const companyId = storage.getCompanyId();
    const params = new URLSearchParams();
    params.append('company_id', companyId || '');
    params.append('start_date', startDate);
    params.append('end_date', endDate);
    if (branchId) params.append('branch_id', String(branchId));
    
    return apiClient.get<CategorySalesResponse>(
      `/api/reports/sales/by-category?${params.toString()}`
    );
  },

  getInventoryValuation: (branchId?: number) => {
    const companyId = storage.getCompanyId();
    const params = new URLSearchParams();
    params.append('company_id', companyId || '');
    if (branchId) params.append('branch_id', String(branchId));
    
    return apiClient.get<InventoryValuationResponse>(
      `/api/reports/inventory/valuation?${params.toString()}`
    );
  },

  getProfitLossReport: (
    startDate: string,
    endDate: string,
    branchId?: number
  ) => {
    const companyId = storage.getCompanyId();
    const params = new URLSearchParams();
    params.append('company_id', companyId || '');
    params.append('start_date', startDate);
    params.append('end_date', endDate);
    if (branchId) params.append('branch_id', String(branchId));
    
    return apiClient.get<ProfitLossResponse>(
      `/api/reports/profit-loss?${params.toString()}`
    );
  },

  getDetailedSalesReport: (
    startDate: string,
    endDate: string,
    branchId?: number
  ) => {
    const companyId = storage.getCompanyId();
    const params = new URLSearchParams();
    params.append('company_id', companyId || '');
    params.append('start_date', startDate);
    params.append('end_date', endDate);
    if (branchId) params.append('branch_id', String(branchId));
    
    return apiClient.get<DetailedSalesResponse>(
      `/api/reports/sales/detailed?${params.toString()}`
    );
  },

  getBusinessDashboard: (period: string = 'month', branchId?: number) => {
    const companyId = storage.getCompanyId();
    const params = new URLSearchParams();
    params.append('company_id', companyId || '');
    params.append('period', period);
    if (branchId) params.append('branch_id', String(branchId));
    
    return apiClient.get<BusinessDashboardResponse>(
      `/api/reports/business-dashboard?${params.toString()}`
    );
  },

  exportSalesReport: (
    startDate: string,
    endDate: string,
    branchId?: number,
    format: 'csv' | 'json' = 'csv'
  ) => {
    const companyId = storage.getCompanyId();
    const params = new URLSearchParams();
    params.append('company_id', companyId || '');
    params.append('start_date', startDate);
    params.append('end_date', endDate);
    if (branchId) params.append('branch_id', String(branchId));
    params.append('format', format);
    
    return apiClient.get(
      `/api/reports/export/sales?${params.toString()}`
    );
  },
};

export default reportsApi;