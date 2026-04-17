import api from './api';

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
    return api.get('/api/settings');
  },

  updateSystemSettings: async (settings: any): Promise<any> => {
    return api.put('/api/settings', settings);
  },

  getBackups: async (): Promise<Backup[]> => {
    return api.get('/api/settings/backups');
  },

  createBackup: async (): Promise<{ message: string }> => {
    return api.post('/api/settings/backups', {});
  },

  restoreBackup: async (filename: string): Promise<{ message: string }> => {
    return api.post(`/api/settings/backups/${filename}/restore`, {});
  },

  deleteBackup: async (filename: string): Promise<{ message: string }> => {
    return api.delete(`/api/settings/backups/${filename}`);
  },

  downloadBackup: async (filename: string): Promise<Blob> => {
    return api.get(`/api/settings/backups/${filename}/download`, {
      responseType: 'blob',
    });
  },

  syncData: async (): Promise<{ message: string }> => {
    return api.post('/api/settings/sync', {});
  },

  getSyncStatus: async (): Promise<SyncStatus> => {
    return api.get('/api/settings/sync/status');
  },

  optimizeDatabase: async (): Promise<{ message: string }> => {
    return api.post('/api/settings/database/optimize', {});
  },

  cleanOldLogs: async (days: number = 30): Promise<{ message: string }> => {
    return api.post('/api/settings/logs/cleanup', { days });
  },
};

export default settingsApi;