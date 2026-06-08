import api from './api';
import { Branch } from '../types';
import { storage } from '../utils/storage';

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
    params.append('company_id', storage.getCompanyId() || '');
    if (search) params.append('search', search);

    return api.get(`/api/branches/?${params.toString()}`);
  },

  getBranch: async (id: number): Promise<Branch> => {
    const companyId = storage.getCompanyId();
    return api.get(`/api/branches/${id}?company_id=${companyId}`);
  },

  createBranch: async (branch: BranchCreate): Promise<Branch> => {
    const companyId = storage.getCompanyId();
    return api.post('/api/branches/', {
      ...branch,
      company_id: companyId
    });
  },

  updateBranch: async (id: number, branch: BranchUpdate): Promise<Branch> => {
    const companyId = storage.getCompanyId();
    return api.put(`/api/branches/${id}?company_id=${companyId}`, branch);
  },

  deleteBranch: async (id: number): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    return api.delete(`/api/branches/${id}?company_id=${companyId}`);
  },

  toggleBranchStatus: async (id: number, is_active: boolean): Promise<Branch> => {
    const companyId = storage.getCompanyId();
    return api.patch(`/api/branches/${id}/status?company_id=${companyId}`, { is_active });
  },

  getBranchStats: async (): Promise<any> => {
    const companyId = storage.getCompanyId();
    return api.get(`/api/branches/stats?company_id=${companyId}`);
  },
};