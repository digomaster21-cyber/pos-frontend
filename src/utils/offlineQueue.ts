import { storage } from './storage';

export interface QueueItem {
  id: number;
  action: 'create' | 'update' | 'delete';
  endpoint: string;
  data: any;
  timestamp: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retries: number;
}

class OfflineQueue {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 5000; // 5 seconds

  static add(item: Omit<QueueItem, 'id' | 'timestamp' | 'status' | 'retries'>): number {
    const queue = storage.getQueue();
    const newItem: QueueItem = {
      ...item,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      status: 'pending',
      retries: 0,
    };
    
    queue.push(newItem);
    storage.addToQueue(newItem);
    return newItem.id;
  }

  static getAll(): QueueItem[] {
    return storage.getQueue();
  }

  static remove(id: number): void {
    storage.removeFromQueue(id);
  }

  static clear(): void {
    storage.clearQueue();
  }

  static async processQueue(apiCall: (endpoint: string, data: any) => Promise<any>): Promise<void> {
    const queue = this.getAll();
    const pendingItems = queue.filter(item => item.status === 'pending' || item.status === 'failed');
    
    for (const item of pendingItems) {
      if (item.retries >= this.MAX_RETRIES) {
        item.status = 'failed';
        storage.removeFromQueue(item.id);
        storage.addToQueue(item);
        continue;
      }

      try {
        item.status = 'processing';
        storage.removeFromQueue(item.id);
        storage.addToQueue(item);

        await apiCall(item.endpoint, item.data);
        
        item.status = 'completed';
        storage.removeFromQueue(item.id);
      } catch (error) {
        console.error(`Failed to process queue item ${item.id}:`, error);
        
        item.status = 'failed';
        item.retries += 1;
        storage.removeFromQueue(item.id);
        storage.addToQueue(item);

        // Retry with exponential backoff
        if (item.retries < this.MAX_RETRIES) {
          const delay = this.RETRY_DELAY * Math.pow(2, item.retries);
          setTimeout(() => this.processQueue(apiCall), delay);
        }
      }
    }
  }

  static getStats() {
    const queue = this.getAll();
    return {
      total: queue.length,
      pending: queue.filter(item => item.status === 'pending').length,
      processing: queue.filter(item => item.status === 'processing').length,
      failed: queue.filter(item => item.status === 'failed').length,
      completed: queue.filter(item => item.status === 'completed').length,
    };
  }
}

export default OfflineQueue;