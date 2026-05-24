const TOKEN_KEY = import.meta.env.VITE_TOKEN_STORAGE_KEY || 'auth_token';
const USER_KEY = import.meta.env.VITE_USER_STORAGE_KEY || 'user_data';
const QUEUE_KEY = import.meta.env.VITE_QUEUE_STORAGE_KEY || 'offline_queue';
const COMPANY_ID_KEY = import.meta.env.VITE_COMPANY_ID_KEY || 'company_id';
const BRANCH_ID_KEY = import.meta.env.VITE_BRANCH_ID_KEY || 'branch_id';

export const storage = {
  // Token management
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      // Check if token is valid (not undefined, null, or 'undefined' string)
      if (token && token !== 'undefined' && token !== 'null') {
        return token;
      }
      // Clear invalid token
      if (token === 'undefined' || token === 'null') {
        localStorage.removeItem(TOKEN_KEY);
      }
      return null;
    } catch (error) {
      console.error('Error reading token from storage:', error);
      return null;
    }
  },

  setToken(token: string): void {
    try {
      if (token && token !== 'undefined' && token !== 'null') {
        localStorage.setItem(TOKEN_KEY, token);
      }
    } catch (error) {
      console.error('Error saving token to storage:', error);
    }
  },

  clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error clearing token from storage:', error);
    }
  },

  // User data
  getUser(): any | null {
    try {
      const user = localStorage.getItem(USER_KEY);
      if (user && user !== 'undefined' && user !== 'null') {
        return JSON.parse(user);
      }
      // Clear invalid user data
      if (user === 'undefined' || user === 'null') {
        localStorage.removeItem(USER_KEY);
      }
      return null;
    } catch (error) {
      console.error('Error reading user from storage:', error);
      // Clear corrupted data
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  setUser(user: any): void {
    try {
      if (user && user !== 'undefined' && user !== 'null') {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  },

  // Company ID management
  getCompanyId(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const companyId = localStorage.getItem(COMPANY_ID_KEY);
      if (companyId && companyId !== 'undefined' && companyId !== 'null') {
        return companyId;
      }
      if (companyId === 'undefined' || companyId === 'null') {
        localStorage.removeItem(COMPANY_ID_KEY);
      }
      return null;
    } catch (error) {
      console.error('Error reading company ID from storage:', error);
      return null;
    }
  },

  setCompanyId(companyId: string | number): void {
    try {
      if (companyId && companyId !== 'undefined' && companyId !== 'null') {
        localStorage.setItem(COMPANY_ID_KEY, String(companyId));
      }
    } catch (error) {
      console.error('Error saving company ID to storage:', error);
    }
  },

  clearCompanyId(): void {
    try {
      localStorage.removeItem(COMPANY_ID_KEY);
    } catch (error) {
      console.error('Error clearing company ID from storage:', error);
    }
  },

  // Branch ID management
  getBranchId(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const branchId = localStorage.getItem(BRANCH_ID_KEY);
      if (branchId && branchId !== 'undefined' && branchId !== 'null') {
        return branchId;
      }
      if (branchId === 'undefined' || branchId === 'null') {
        localStorage.removeItem(BRANCH_ID_KEY);
      }
      return null;
    } catch (error) {
      console.error('Error reading branch ID from storage:', error);
      return null;
    }
  },

  setBranchId(branchId: string | number): void {
    try {
      if (branchId && branchId !== 'undefined' && branchId !== 'null') {
        localStorage.setItem(BRANCH_ID_KEY, String(branchId));
      }
    } catch (error) {
      console.error('Error saving branch ID to storage:', error);
    }
  },

  clearBranchId(): void {
    try {
      localStorage.removeItem(BRANCH_ID_KEY);
    } catch (error) {
      console.error('Error clearing branch ID from storage:', error);
    }
  },

  // Offline queue
  getQueue(): any[] {
    try {
      const queue = localStorage.getItem(QUEUE_KEY);
      if (queue && queue !== 'undefined' && queue !== 'null') {
        return JSON.parse(queue);
      }
      return [];
    } catch (error) {
      console.error('Error reading queue from storage:', error);
      return [];
    }
  },

  addToQueue(item: any): void {
    try {
      const queue = this.getQueue();
      queue.push({
        ...item,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error adding to queue:', error);
    }
  },

  removeFromQueue(id: number): void {
    try {
      const queue = this.getQueue();
      const filtered = queue.filter(item => item.id !== id);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing from queue:', error);
    }
  },

  clearQueue(): void {
    try {
      localStorage.removeItem(QUEUE_KEY);
    } catch (error) {
      console.error('Error clearing queue:', error);
    }
  },

  // Clear all app data (logout)
  clearAll(): void {
    this.clearToken();
    this.clearQueue();
    this.clearCompanyId();
    this.clearBranchId();
  },
  
  // Add this method to check and fix storage
  fixStorage(): void {
    console.log('🔧 Fixing storage...');
    const keys = [TOKEN_KEY, USER_KEY, COMPANY_ID_KEY, BRANCH_ID_KEY, QUEUE_KEY];
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value === 'undefined' || value === 'null') {
        console.log(`Removing invalid ${key}`);
        localStorage.removeItem(key);
      }
    });
    console.log('✅ Storage fixed');
  }
};

// Auto-fix storage on import
if (typeof window !== 'undefined') {
  storage.fixStorage();
}