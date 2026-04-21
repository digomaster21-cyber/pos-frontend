// Update src/api/settings.ts
import api from './api';
import { storage } from '../utils/storage';

export interface Backup {
  filename: string;
  size: string;
  created_at: string;
  type: string;
}

export interface SyncStatus {
  last_sync: string | null;
  pending_records: number;
  status: string;
}

export const settingsApi = {
  getSystemSettings: async (): Promise<any> => {
    const companyId = storage.getCompanyId();
    return api.get(`/api/settings?company_id=${companyId}`);
  },

  updateSystemSettings: async (settings: any): Promise<any> => {
    const companyId = storage.getCompanyId();
    return api.put(`/api/settings?company_id=${companyId}`, settings);
  },

  getBackups: async (): Promise<Backup[]> => {
    const companyId = storage.getCompanyId();
    return api.get(`/api/settings/backups?company_id=${companyId}`);
  },

  createBackup: async (): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    return api.post(`/api/settings/backups?company_id=${companyId}`, {});
  },

  restoreBackup: async (filename: string): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    return api.post(`/api/settings/backups/${filename}/restore?company_id=${companyId}`, {});
  },

  deleteBackup: async (filename: string): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    return api.delete(`/api/settings/backups/${filename}?company_id=${companyId}`);
  },

  downloadBackup: async (filename: string): Promise<Blob> => {
    const companyId = storage.getCompanyId();
    return api.get(`/api/settings/backups/${filename}/download?company_id=${companyId}`, {
      responseType: 'blob',
    });
  },

  syncData: async (): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    return api.post(`/api/settings/sync?company_id=${companyId}`, {});
  },

  getSyncStatus: async (): Promise<SyncStatus> => {
    const companyId = storage.getCompanyId();
    try {
      return await api.get(`/api/settings/sync/status?company_id=${companyId}`);
    } catch (error: any) {
      console.error('Sync status endpoint error:', error);
      // Return mock data if endpoint doesn't exist (405 error)
      if (error.response?.status === 405) {
        return {
          last_sync: null,
          pending_records: 0,
          status: 'Endpoint not implemented'
        };
      }
      throw error;
    }
  },

  optimizeDatabase: async (): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    return api.post(`/api/settings/database/optimize?company_id=${companyId}`, {});
  },

  cleanOldLogs: async (days: number = 30): Promise<{ message: string }> => {
    const companyId = storage.getCompanyId();
    return api.post(`/api/settings/logs/cleanup?company_id=${companyId}`, { days });
  },
};

export default settingsApi;