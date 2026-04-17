// frontend/src/services/products.ts
import api from './api';
import { Product, ProductCreate, ProductUpdate } from '../types';
import { storage } from '../utils/storage';

export const productsApi = {
  // Get all products with filters
  getProducts: async (
    activeOnly: boolean = true,
    category?: string,
    search?: string
  ): Promise<Product[]> => {
    const params = new URLSearchParams();
    const companyId = storage.getCompanyId();
    
    params.append('company_id', companyId || '');
    params.append('active_only', String(activeOnly));
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    
    return api.get(`/api/products?${params.toString()}`);
  },

  // Get single product
  getProduct: async (id: number): Promise<Product> => {
    const companyId = storage.getCompanyId();
    return api.get(`/api/products/${id}?company_id=${companyId}`);
  },

  // Create product
  createProduct: async (product: ProductCreate): Promise<Product> => {
    const companyId = storage.getCompanyId();
    return api.post('/api/products', {
      ...product,
      company_id: companyId
    });
  },

  // Update product
  updateProduct: async (id: number, product: ProductUpdate): Promise<Product> => {
    const companyId = storage.getCompanyId();
    return api.put(`/api/products/${id}?company_id=${companyId}`, product);
  },

  // Delete product (soft delete or permanent)
  deleteProduct: async (id: number, permanent: boolean = false): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    return api.delete(`/api/products/${id}?permanent=${permanent}&company_id=${companyId}`);
  },

  // Get product categories
  getCategories: async (): Promise<string[]> => {
    const companyId = storage.getCompanyId();
    return api.get(`/api/products/categories?company_id=${companyId}`);
  }
};