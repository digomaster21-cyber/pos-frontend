import api from './api';
import { Role, Permission } from '../types';
import { storage } from '../utils/storage';

export const rolesApi = {
  getRoles: async (): Promise<Role[]> => {
    const companyId = storage.getCompanyId();
    return await api.get(`/api/roles?company_id=${companyId}`);
  },

  getRole: async (id: number): Promise<Role> => {
    const companyId = storage.getCompanyId();
    return await api.get(`/api/roles/${id}?company_id=${companyId}`);
  },

  getRolePermissions: async (roleId: number): Promise<Permission[]> => {
    const companyId = storage.getCompanyId();
    try {
      return await api.get(`/api/roles/${roleId}/permissions?company_id=${companyId}`);
    } catch (error) {
      console.error(`Failed to fetch permissions for role ${roleId}:`, error);
      return [];
    }
  },

  createRole: async (data: Partial<Role>): Promise<Role> => {
    const companyId = storage.getCompanyId();
    return await api.post('/api/roles', {
      ...data,
      company_id: companyId
    });
  },

  updateRole: async (id: number, data: Partial<Role>): Promise<Role> => {
    const companyId = storage.getCompanyId();
    return await api.put(`/api/roles/${id}?company_id=${companyId}`, data);
  },

  deleteRole: async (id: number): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    return await api.delete(`/api/roles/${id}?company_id=${companyId}`);
  },

  assignPermissions: async (roleId: number, permissionIds: number[]): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    return await api.post(`/api/roles/${roleId}/permissions?company_id=${companyId}`, { 
      permission_ids: permissionIds 
    });
  },
};

export default rolesApi;