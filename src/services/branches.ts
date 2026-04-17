import api from './api';
import { Branch } from '../types';

export interface BranchCreate {
  code: string;
  name: string;
  location: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  opening_date: string;
}

export interface BranchUpdate {
  name?: string;
  location?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  opening_date?: string;
  is_active?: boolean;
}

export const branchesApi = {
  getBranches: async (activeOnly: boolean = false, search?: string): Promise<Branch[]> => {
    const params = new URLSearchParams();
    params.append('active_only', String(activeOnly));
    if (search) params.append('search', search);

    return api.get(`/api/branches/?${params.toString()}`);
  },

  getBranch: async (id: number): Promise<Branch> => {
    return api.get(`/api/branches/${id}`);
  },

  createBranch: async (branch: BranchCreate): Promise<Branch> => {
    return api.post('/api/branches/', branch);
  },

  updateBranch: async (id: number, branch: BranchUpdate): Promise<Branch> => {
    return api.put(`/api/branches/${id}`, branch);
  },

  deleteBranch: async (id: number): Promise<{ message: string }> => {
    return api.delete(`/api/branches/${id}`);
  },

  toggleBranchStatus: async (id: number, is_active: boolean): Promise<Branch> => {
    return api.patch(`/api/branches/${id}/status`, { is_active });
  },

  getBranchStats: async (): Promise<any> => {
    return api.get('/api/branches/stats');
  },
};