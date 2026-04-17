import { apiClient } from './client';
import { storage } from '../utils/storage';

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  description?: string | null;
  unit?: string;
  selling_price: number;
  current_avg_cost: number;
  min_stock_level?: number;
  max_stock_level?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
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

export interface StockMovementPayload {
  product_id: number;
  branch_id: number;
  quantity_change: number;
  movement_type: string;
  reference_id?: number | null;
  notes?: string | null;
}

export interface StockTransferPayload {
  product_id: number;
  from_branch: number;
  to_branch: number;
  quantity: number;
}

export interface StockMovementRecord {
  id: number;
  product_id: number;
  branch_id: number;
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  movement_type: string;
  reference_id?: number | null;
  created_by?: number | null;
  created_at: string;
  product_name?: string;
  product_sku?: string;
}

export interface LowStockItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  min_stock_level: number;
  max_stock_level: number;
  current_quantity: number;
  shortage: number;
}

export interface CreateProductPayload {
  sku: string;
  name: string;
  category: string;
  description?: string;
  unit?: string;
  selling_price: number;
  current_avg_cost?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  branch_id?: number;
  initial_quantity?: number;
}

export interface UpdateProductPayload {
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

// Helper to add company_id to params
const addCompanyId = (params?: Record<string, any>): Record<string, any> => {
  const companyId = storage.getCompanyId();
  return { ...params, company_id: companyId || '' };
};

export const inventoryApi = {
  getProducts: (params?: {
    category?: string;
    active_only?: boolean;
    search?: string;
  }) => {
    const allParams = addCompanyId(params);
    return apiClient.get<Product[]>('/api/inventory/products', allParams);
  },

  getProductCategories: () => {
    const companyId = storage.getCompanyId();
    return apiClient.get<{ categories: string[] }>(`/api/inventory/products/categories?company_id=${companyId}`);
  },

  getProductById: (productId: number) => {
    const companyId = storage.getCompanyId();
    return apiClient.get<Product>(`/api/inventory/products/${productId}?company_id=${companyId}`);
  },

  createProduct: (payload: CreateProductPayload) => {
    const companyId = storage.getCompanyId();
    const userId = storage.getUser()?.id;
    return apiClient.post<Product>('/api/inventory/products', { 
      ...payload, 
      company_id: companyId,
      created_by: userId 
    });
  },

  updateProduct: (productId: number, payload: UpdateProductPayload) => {
    const companyId = storage.getCompanyId();
    return apiClient.put<Product>(`/api/inventory/products/${productId}?company_id=${companyId}`, payload);
  },

  deleteProduct: (productId: number, permanent = false) => {
    const companyId = storage.getCompanyId();
    return apiClient.delete<{ message: string }>(
      `/api/inventory/products/${productId}?permanent=${permanent}&company_id=${companyId}`,
      {}
    );
  },

  getStock: (params?: {
    branch_id?: number;
    low_stock_only?: boolean;
  }) => {
    const allParams = addCompanyId(params);
    return apiClient.get<InventoryItem[]>('/api/inventory/stock', allParams);
  },

  getStockMovements: (params?: {
    product_id?: number;
    branch_id?: number;
    limit?: number;
  }) => {
    const allParams = addCompanyId(params);
    return apiClient.get<StockMovementRecord[]>('/api/inventory/stock/movements', allParams);
  },

  adjustStock: (payload: StockMovementPayload) => {
    const companyId = storage.getCompanyId();
    return apiClient.post<{ message: string }>('/api/inventory/stock/adjust', { 
      ...payload, 
      company_id: companyId 
    });
  },

  getLowStock: (params?: {
    branch_id?: number;
  }) => {
    const companyId = storage.getCompanyId();
    const allParams = { ...params, company_id: companyId || '' };
    return apiClient.get<LowStockItem[]>('/api/inventory/stock/low-stock', allParams);
  },

  transferStock: (payload: StockTransferPayload) => {
    const companyId = storage.getCompanyId();
    return apiClient.post<{ message: string }>('/api/inventory/stock/transfer', { 
      ...payload, 
      company_id: companyId 
    });
  },
};

export default inventoryApi;