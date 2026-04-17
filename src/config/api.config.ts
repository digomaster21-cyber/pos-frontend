// src/config/api.config.ts
export const API_CONFIG = {
  // Development URLs
  development: 'http://localhost:8000',
  
  // Production URL (Render)
  production: 'https://master-project-bjaz.onrender.com',
  
  // Get current base URL
  getBaseUrl(): string {
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    
    return import.meta.env.PROD 
      ? this.production 
      : this.development;
  },
  
  // API endpoints
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      me: '/api/auth/me',
      verifyToken: '/api/verify-token',
      logout: '/api/auth/logout',
    },
    users: '/api/users',
    roles: '/api/roles',
    permissions: '/api/permissions',
    branches: '/api/branches',
    products: '/api/products',
    sales: '/api/sales',
    inventory: '/api/inventory',
    expenses: '/api/expenses',
    reports: {
      dashboard: '/api/reports/dashboard/kpi',
      sales: '/api/reports/sales/daily',
      profitLoss: '/api/reports/profit-loss',
      inventory: '/api/reports/inventory/valuation',
    },
    sync: '/api/sync',
    health: '/health',
    system: '/api/info',
  },
  
  // Timeouts
  timeouts: {
    default: 30000,
    upload: 60000,
    download: 60000,
  },
};

export default API_CONFIG;