import { apiClient } from '../api/client';
import { storage } from '../utils/storage';

const addCompanyId = (params: URLSearchParams): URLSearchParams => {
  const companyId = storage.getCompanyId();
  if (companyId) params.append('company_id', companyId);
  return params;
};

export const settingsApi = {
  getSystemSettings: async () => {
    const params = addCompanyId(new URLSearchParams());
    return apiClient.get(`/api/settings/system?${params.toString()}`);
  },

  updateSystemSettings: async (settings: any) => {
    const params = addCompanyId(new URLSearchParams());
    return apiClient.put(`/api/settings/system?${params.toString()}`, settings);
  },

  getBackups: async () => {
    const params = addCompanyId(new URLSearchParams());
    return apiClient.get(`/api/settings/backups?${params.toString()}`);
  },

  createBackup: async () => {
    const params = addCompanyId(new URLSearchParams());
    return apiClient.post(`/api/settings/backups?${params.toString()}`);
  },

  restoreBackup: async (filename: string) => {
    const params = addCompanyId(new URLSearchParams());
    params.append('filename', filename);
    return apiClient.post(`/api/settings/restore?${params.toString()}`);
  },

  deleteBackup: async (filename: string) => {
    const params = addCompanyId(new URLSearchParams());
    return apiClient.delete(`/api/settings/backups/${filename}?${params.toString()}`);
  },

  downloadBackup: async (filename: string): Promise<Blob> => {
  const params = addCompanyId(new URLSearchParams());

  const response: any = await apiClient.get(
    `/api/settings/backups/download/${filename}?${params.toString()}`,
    {
      responseType: 'blob',
    }
  );

  return response.data;
},

  getSyncStatus: async () => {
    const params = addCompanyId(new URLSearchParams());
    return apiClient.get(`/api/settings/sync/status?${params.toString()}`);
  },

  syncData: async () => {
    const params = addCompanyId(new URLSearchParams());
    return apiClient.post(`/api/sync/upload?${params.toString()}`);
  },

  optimizeDatabase: async () => {
    const params = addCompanyId(new URLSearchParams());
    return apiClient.post(`/api/settings/optimize?${params.toString()}`);
  },

  cleanOldLogs: async (days: number) => {
    const params = addCompanyId(new URLSearchParams());
    params.append('days', String(days));
    return apiClient.post(`/api/settings/clean-logs?${params.toString()}`);
  },
};

export default settingsApi;