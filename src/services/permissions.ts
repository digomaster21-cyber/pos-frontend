// frontend/src/services/permissions.ts
import api from './api';
import { Permission, PermissionCreate } from '../types';
import { storage } from '../utils/storage';

export const permissionsApi = {
  // Get all permissions
  getPermissions: async (module?: string): Promise<Permission[]> => {
    const companyId = storage.getCompanyId();
    const params = new URLSearchParams();
    params.append('company_id', companyId || '');
    if (module) params.append('module', module);
    
    return api.get(`/api/permissions?${params.toString()}`);
  },

  // Get permissions grouped by module
  getPermissionsByModule: async (): Promise<Record<string, Permission[]>> => {
    const companyId = storage.getCompanyId();
    return api.get(`/api/permissions/by-module?company_id=${companyId}`);
  },

  // Get modules
  getModules: async (): Promise<{ modules: string[] }> => {
    const companyId = storage.getCompanyId();
    return api.get(`/api/permissions/modules?company_id=${companyId}`);
  },

  // Get single permission
  getPermission: async (id: number): Promise<Permission> => {
    const companyId = storage.getCompanyId();
    return api.get(`/api/permissions/${id}?company_id=${companyId}`);
  },

  // Create permission
  createPermission: async (permission: PermissionCreate): Promise<Permission> => {
    const companyId = storage.getCompanyId();
    return api.post('/api/permissions', {
      ...permission,
      company_id: companyId
    });
  },

  // Update permission
  updatePermission: async (id: number, permission: PermissionCreate): Promise<Permission> => {
    const companyId = storage.getCompanyId();
    return api.put(`/api/permissions/${id}?company_id=${companyId}`, permission);
  },

  // Delete permission
  deletePermission: async (id: number): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    return api.delete(`/api/permissions/${id}?company_id=${companyId}`);
  }
};