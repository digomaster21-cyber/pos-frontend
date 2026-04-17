// frontend/src/types/index.ts

export interface User {
  id: number;
  username: string;
  full_name: string;
  email?: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'branch_manager' | 'cashier';
  branch_id: number | null;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface Branch {
  id: number;
  code: string;
  name: string;
  location: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  opening_date: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  description?: string;
  unit: string;
  selling_price: number;
  current_avg_cost: number;
  min_stock_level: number;
  max_stock_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  stock_quantity?: number;
  stock_value?: number;
}

export interface ProductCreate {
  sku: string;
  name: string;
  category: string;
  description?: string;
  unit?: string;
  selling_price: number;
  current_avg_cost?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  is_active?: boolean;
}

export interface ProductUpdate {
  sku?: string;
  name?: string;
  category?: string;
  description?: string;
  unit?: string;
  selling_price?: number;
  current_avg_cost?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  is_active?: boolean;
}

export interface Expense {
  id: number;
  expense_no: string;
  branch_id?: number;
  category: string;
  subcategory?: string;
  amount: number;
  description: string;
  expense_date: string;
  paid_to?: string;
  payment_method: string;
  recorded_by: number;
  recorder_name?: string;
  created_at: string;
}

export interface ExpenseCreate {
  branch_id?: number;
  category: string;
  subcategory?: string;
  amount: number;
  description: string;
  expense_date: string;
  paid_to?: string;
  payment_method?: string;
}

export interface Permission {
  id: number;
  name: string;
  module: string;
  action: string;
  description?: string;
}

export interface PermissionCreate {
  name: string;
  module: string;
  action: string;
  description?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  is_system: boolean;
  created_at: string;
  permissions?: Permission[];
}

export interface RoleCreate {
  name: string;
  description?: string;
  permissions?: number[];
}

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
  customer_name?: string;
  payment_method: string;
  notes?: string;
  status: string;
  created_at: string;
  product_name?: string;
  seller_name?: string;
}

export interface SaleCreate {
  branch_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  sale_date: string;
  customer_name?: string;
  payment_method?: string;
  notes?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  current_avg_cost: number;
  selling_price: number;
  quantity: number;
  stock_value: number;
  min_stock_level: number;
  max_stock_level: number;
  stock_status: 'Low' | 'Normal' | 'High';
}

export interface DashboardKPI {
  total_sales: number;
  total_profit: number;
  total_expenses: number;
  net_profit: number;
  total_products: number;
  low_stock_count: number;
  today_sales: number;
  today_transactions: number;
}

export interface SalesReport {
  sale_date: string;
  transaction_count: number;
  total_items: number;
  total_revenue: number;
  total_profit: number;
}

export interface ProfitLossReport {
  total_revenue: number;
  total_profit: number;
  total_expenses: number;
  net_profit: number;
  start_date: string;
  end_date: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ExpenseSummary {
  total_expenses: number;
  total_count: number;
  by_category?: Record<string, number>;
}

export interface SalesSummary {
  total_sales: number;
  total_revenue: number;
  total_profit: number;
  total_transactions: number;
}