// frontend/src/services/users.ts
import api from './api';
import { User } from '../types';
import { storage } from '../utils/storage';

export interface UserFilters {
  role?: string;
  branch_id?: number;
  is_active?: boolean;
  search?: string;
}

export interface UserCreate {
  username: string;
  password: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  branch_id?: number;
  permissions?: number[];
}

export interface UserUpdate {
  full_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  branch_id?: number;
  is_active?: boolean;
  permissions?: number[];
}

export const usersApi = {
  getCurrentUser: async (): Promise<User> => {
    return api.get('/api/auth/me');
  },

  getUsers: async (filters?: UserFilters): Promise<User[]> => {
    const params = new URLSearchParams();
    const companyId = storage.getCompanyId();
    
    params.append('company_id', companyId || '');
    if (filters?.role) params.append('role', filters.role);
    if (filters?.branch_id) params.append('branch_id', String(filters.branch_id));
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters?.search) params.append('search', filters.search);
    
    return api.get(`/api/users?${params.toString()}`);
  },

  getUser: async (id: number): Promise<User> => {
    const companyId = storage.getCompanyId();
    return api.get(`/api/users/${id}?company_id=${companyId}`);
  },

  createUser: async (user: UserCreate): Promise<User> => {
    const companyId = storage.getCompanyId();
    return api.post('/api/users', {
      ...user,
      company_id: companyId
    });
  },

  updateUser: async (id: number, user: UserUpdate): Promise<User> => {
    const companyId = storage.getCompanyId();
    return api.put(`/api/users/${id}?company_id=${companyId}`, user);
  },

  deleteUser: async (id: number): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    return api.delete(`/api/users/${id}?company_id=${companyId}`);
  },

  toggleUserStatus: async (id: number, is_active: boolean): Promise<User> => {
    const companyId = storage.getCompanyId();
    return api.put(`/api/users/${id}?company_id=${companyId}`, { is_active });
  },

  resetPassword: async (id: number, new_password: string): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    return api.post(`/api/users/${id}/reset-password?company_id=${companyId}`, { new_password });
  },

  updateProfile: async (data: any): Promise<User> => {
    const companyId = storage.getCompanyId();
    return api.put(`/api/users/profile?company_id=${companyId}`, data);
  },

  changePassword: async (current_password: string, new_password: string): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    return api.post(`/api/users/change-password?company_id=${companyId}`, { 
      current_password, 
      new_password 
    });
  },
};