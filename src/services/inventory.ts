// frontend/src/services/inventory.ts
import api from './api';
import { InventoryItem } from '../types';

export const inventoryApi = {
  getInventory: async (
    branchId?: number,
    category?: string,
    status?: string,
    search?: string
  ): Promise<InventoryItem[]> => {
    const params = new URLSearchParams();
    if (branchId) params.append('branch_id', String(branchId));
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    
    return api.get(`/api/inventory?${params.toString()}`);
  },

  getInventorySummary: async (branchId?: number): Promise<any> => {
    const params = branchId ? `?branch_id=${branchId}` : '';
    return api.get(`/api/inventory/summary${params}`);
  },

  getCategories: async (): Promise<string[]> => {
    return api.get('/api/inventory/categories');
  },

  getStockMovements: async (
    productId?: number,
    branchId?: number,
    startDate?: string,
    endDate?: string
  ): Promise<any[]> => {
    const params = new URLSearchParams();
    if (productId) params.append('product_id', String(productId));
    if (branchId) params.append('branch_id', String(branchId));
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    return api.get(`/api/inventory/movements?${params.toString()}`);
  },

  adjustStock: async (
    productId: number,
    branchId: number,
    quantity: number,
    reason: string
  ): Promise<{ message: string }> => {
    return api.post('/api/inventory/adjust', {
      product_id: productId,
      branch_id: branchId,
      quantity,
      reason,
    });
  },
};