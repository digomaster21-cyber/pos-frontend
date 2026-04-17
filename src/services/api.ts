import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';
import { storage } from '../utils/storage';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    // Get API URL based on environment
    const apiUrl = this.getApiUrl();
    
    console.log(`🔧 API Service initialized with URL: ${apiUrl}`);
    
    this.api = axios.create({
      baseURL: apiUrl,
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private getApiUrl(): string {
    // Check for environment variable first
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    
    // Production fallback
    if (import.meta.env.PROD) {
      return 'https://master-project-bjaz.onrender.com';
    }
    
    // Development fallback
    return 'http://localhost:8000';
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = storage.getToken();
        const companyId = storage.getCompanyId();
        const branchId = storage.getBranchId();

        config.headers = config.headers ?? {};

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add company_id and branch_id to headers
        if (companyId) {
          config.headers['X-Company-Id'] = companyId;
        }
        if (branchId) {
          config.headers['X-Branch-Id'] = branchId;
        }

        // Add company_id to URL params for GET requests
        if (config.method === 'get' && companyId) {
          const url = new URL(config.url || '', config.baseURL);
          if (!url.searchParams.has('company_id')) {
            config.params = {
              ...config.params,
              company_id: companyId,
            };
          }
        }

        const isFormData = config.data instanceof FormData;

        if (!isFormData && !config.headers['Content-Type']) {
          config.headers['Content-Type'] = 'application/json';
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const status = error.response?.status;
        const url = error.config?.url ?? '';

        const isAuthCheck =
          url.includes('/api/verify-token') ||
          url.includes('/api/auth/me') ||
          url.includes('/api/auth/refresh');

        if (status === 401 && isAuthCheck) {
          storage.clearAll();

          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }

        // Log errors in development
        if (import.meta.env.DEV) {
          console.error('API Error:', {
            url,
            status,
            data: error.response?.data,
            message: error.message
          });
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete(url, config);
    return response.data;
  }
}

export default new ApiService();