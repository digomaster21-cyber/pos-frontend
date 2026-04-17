import api from './api';
import { Role } from '../types';
import { storage } from '../utils/storage';

export const rolesApi = {
  getRoles: async (): Promise<Role[]> => {
    const companyId = storage.getCompanyId();
    return api.get(`/api/roles?company_id=${companyId}`);
  },

  getRole: async (id: number): Promise<Role> => {
    const companyId = storage.getCompanyId();
    return api.get(`/api/roles/${id}?company_id=${companyId}`);
  },

  createRole: async (data: Partial<Role>): Promise<Role> => {
    const companyId = storage.getCompanyId();
    return api.post('/api/roles', {
      ...data,
      company_id: companyId
    });
  },

  updateRole: async (id: number, data: Partial<Role>): Promise<Role> => {
    const companyId = storage.getCompanyId();
    return api.put(`/api/roles/${id}?company_id=${companyId}`, data);
  },

  deleteRole: async (id: number): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    return api.delete(`/api/roles/${id}?company_id=${companyId}`);
  },
};

export default rolesApi;