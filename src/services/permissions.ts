import api from './api';
import { Permission, PermissionCreate } from '../types';
import { storage } from '../utils/storage';

export const permissionsApi = {
  getPermissions: async (module?: string): Promise<Permission[]> => {
    const companyId = storage.getCompanyId();
    const params = new URLSearchParams();
    params.append('company_id', companyId || '');
    if (module) params.append('module', module);
    
    const response = await api.get<Permission[]>(`/api/permissions?${params.toString()}`);
    return response.data;
  },

  getPermissionsByModule: async (): Promise<Record<string, Permission[]>> => {
    const companyId = storage.getCompanyId();
    try {
      const response = await api.get<Record<string, Permission[]>>(`/api/permissions/by-module?company_id=${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching permissions by module:', error);
      return {};
    }
  },

  getUserPermissions: async (userId: number): Promise<Permission[]> => {
    const companyId = storage.getCompanyId();
    try {
      const response = await api.get<Permission[]>(`/api/users/${userId}/permissions?company_id=${companyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching permissions for user ${userId}:`, error);
      return [];
    }
  },

  getModules: async (): Promise<string[]> => {
    const companyId = storage.getCompanyId();
    const response = await api.get<{ modules: string[] }>(`/api/permissions/modules?company_id=${companyId}`);
    return response.data.modules || [];
  },

  createPermission: async (permission: PermissionCreate): Promise<Permission> => {
    const companyId = storage.getCompanyId();
    const response = await api.post<Permission>('/api/permissions', {
      ...permission,
      company_id: companyId
    });
    return response.data;
  },

  updatePermission: async (id: number, permission: PermissionCreate): Promise<Permission> => {
    const companyId = storage.getCompanyId();
    const response = await api.put<Permission>(`/api/permissions/${id}?company_id=${companyId}`, permission);
    return response.data;
  },

  deletePermission: async (id: number): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    const response = await api.delete<{ message: string }>(`/api/permissions/${id}?company_id=${companyId}`);
    return response.data;
  },
};

export default permissionsApi;