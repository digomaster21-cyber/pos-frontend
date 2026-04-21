import api from './api';
import { Permission, PermissionCreate } from '../types';
import { storage } from '../utils/storage';

export const permissionsApi = {
  getPermissions: async (module?: string): Promise<Permission[]> => {
    const companyId = storage.getCompanyId();
    const params = new URLSearchParams();
    params.append('company_id', companyId || '');
    if (module) params.append('module', module);
    
    return await api.get(`/api/permissions?${params.toString()}`);
  },

  getPermissionsByModule: async (): Promise<Record<string, Permission[]>> => {
    const companyId = storage.getCompanyId();
    try {
      return await api.get(`/api/permissions/by-module?company_id=${companyId}`);
    } catch (error) {
      console.error('Error fetching permissions by module:', error);
      return {};
    }
  },

  getUserPermissions: async (userId: number): Promise<Permission[]> => {
    const companyId = storage.getCompanyId();
    try {
      return await api.get(`/api/users/${userId}/permissions?company_id=${companyId}`);
    } catch (error) {
      console.error(`Error fetching permissions for user ${userId}:`, error);
      return [];
    }
  },

  getModules: async (): Promise<string[]> => {
    const companyId = storage.getCompanyId();
    const response = await api.get(`/api/permissions/modules?company_id=${companyId}`);
    return (response as any).modules || [];
  },

  createPermission: async (permission: PermissionCreate): Promise<Permission> => {
    const companyId = storage.getCompanyId();
    return await api.post('/api/permissions', {
      ...permission,
      company_id: companyId
    });
  },

  updatePermission: async (id: number, permission: PermissionCreate): Promise<Permission> => {
    const companyId = storage.getCompanyId();
    return await api.put(`/api/permissions/${id}?company_id=${companyId}`, permission);
  },

  deletePermission: async (id: number): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    return await api.delete(`/api/permissions/${id}?company_id=${companyId}`);
  },
};

export default permissionsApi;