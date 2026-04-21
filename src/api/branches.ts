import api from '../services/api';
import { storage } from '../utils/storage';

export interface Branch {
  id: number;
  name: string;
  code: string;
  location?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  is_main_store: boolean;
  company_id: number;
  created_at: string;
}

export const branchesApi = {
  getBranches: async (params?: { active_only?: boolean }): Promise<Branch[]> => {
    const companyId = storage.getCompanyId();
    const query = new URLSearchParams();
    if (companyId) query.append('company_id', companyId);
    if (params?.active_only) query.append('active_only', 'true');
    
    const response = await api.get(`/api/branches?${query.toString()}`);
    // response is already the data array
    return response as Branch[];
  },

  getBranch: async (id: number): Promise<Branch> => {
    const companyId = storage.getCompanyId();
    const response = await api.get(`/api/branches/${id}?company_id=${companyId}`);
    return response as Branch;
  },

  createBranch: async (data: Partial<Branch>): Promise<Branch> => {
    const companyId = storage.getCompanyId();
    const response = await api.post(`/api/branches?company_id=${companyId}`, data);
    return response as Branch;
  },

  updateBranch: async (id: number, data: Partial<Branch>): Promise<Branch> => {
    const companyId = storage.getCompanyId();
    const response = await api.put(`/api/branches/${id}?company_id=${companyId}`, data);
    return response as Branch;
  },

  deleteBranch: async (id: number): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    const response = await api.delete(`/api/branches/${id}?company_id=${companyId}`);
    return response as { message: string };
  },

  setMainStore: async (id: number): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    const response = await api.post(`/api/branches/${id}/set-main-store?company_id=${companyId}`);
    return response as { message: string };
  },
};