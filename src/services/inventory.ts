// frontend/src/services/inventory.ts
import api from './api';
import { InventoryItem } from '../types';
import { storage } from '../utils/storage';

export const inventoryApi = {
  getInventory: async (
    branchId?: number,
    category?: string,
    status?: string,
    search?: string
  ): Promise<InventoryItem[]> => {
    const params = new URLSearchParams();
    const companyId = storage.getCompanyId();
    
    params.append('company_id', companyId || '');
    if (branchId) params.append('branch_id', String(branchId));
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    
    return api.get(`/api/inventory/stock?${params.toString()}`);
  },

  getInventorySummary: async (branchId?: number): Promise<any> => {
    const companyId = storage.getCompanyId();
    const params = new URLSearchParams();
    params.append('company_id', companyId || '');
    if (branchId) params.append('branch_id', String(branchId));
    
    return api.get(`/api/inventory/summary?${params.toString()}`);
  },

  getCategories: async (): Promise<string[]> => {
    const companyId = storage.getCompanyId();
    return api.get(`/api/inventory/products/categories?company_id=${companyId}`);
  },

  getStockMovements: async (
    productId?: number,
    branchId?: number,
    startDate?: string,
    endDate?: string
  ): Promise<any[]> => {
    const params = new URLSearchParams();
    const companyId = storage.getCompanyId();
    
    params.append('company_id', companyId || '');
    if (productId) params.append('product_id', String(productId));
    if (branchId) params.append('branch_id', String(branchId));
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    return api.get(`/api/inventory/stock/movements?${params.toString()}`);
  },

  adjustStock: async (
    productId: number,
    branchId: number,
    quantityChange: number,
    movementType: string,
    notes?: string
  ): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    const userId = storage.getUser()?.id;
    
    return api.post('/api/inventory/stock/adjust', {
      product_id: productId,
      branch_id: branchId,
      quantity_change: quantityChange,
      movement_type: movementType,
      notes: notes || `Stock adjustment: ${movementType}`,
      company_id: companyId,
      created_by: userId
    });
  },

  getLowStockAlerts: async (branchId?: number): Promise<any[]> => {
    const companyId = storage.getCompanyId();
    const params = new URLSearchParams();
    params.append('company_id', companyId || '');
    if (branchId) params.append('branch_id', String(branchId));
    
    return api.get(`/api/inventory/stock/low-stock?${params.toString()}`);
  },

  transferStock: async (
    productId: number,
    fromBranch: number,
    toBranch: number,
    quantity: number
  ): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    const userId = storage.getUser()?.id;
    
    return api.post('/api/inventory/stock/transfer', {
      product_id: productId,
      from_branch: fromBranch,
      to_branch: toBranch,
      quantity: quantity,
      company_id: companyId,
      created_by: userId
    });
  }
};