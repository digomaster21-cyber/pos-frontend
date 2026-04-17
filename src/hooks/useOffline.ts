// frontend/src/hooks/useOffline.ts
import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import api from '../services/api';
import { storage } from '../utils/storage';

// Remove the unused PendingOperation interface or export it if needed
// If you don't need it, just remove it
// export interface PendingOperation {
//   id: number;
//   type: string;
//   endpoint: string;
//   data: any;
//   timestamp: string;
//   status: string;
// }

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      message.success('Back online!');
    };
    const handleOffline = () => {
      setIsOnline(false);
      message.warning('You are offline. Changes will be saved locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const queue = storage.getQueue();
    setPendingCount(queue.length);
  }, []);

  const queueOperation = useCallback(async (type: string, endpoint: string, data: any) => {
    storage.addToQueue({ type, endpoint, data });
    setPendingCount(storage.getQueue().length);
    
    if (isOnline) {
      return true;
    }
    return false;
  }, [isOnline]);

  const syncNow = useCallback(async () => {
    if (!isOnline || syncing) return;
    
    setSyncing(true);
    const queue = storage.getQueue();
    
    for (const op of queue) {
      try {
        await api.post(op.endpoint, op.data);
        storage.removeFromQueue(op.id);
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
    
    setPendingCount(storage.getQueue().length);
    setSyncing(false);
    message.success('Sync completed');
  }, [isOnline, syncing]);

  return {
    isOnline,
    pendingCount,
    syncing,
    queueOperation,
    syncNow,
  };
}