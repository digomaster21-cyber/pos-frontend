import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { storage } from '../utils/storage';

// Dynamic API URL based on environment
const getApiBaseUrl = (): string => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Production fallback
  if (import.meta.env.PROD) {
    return 'https://master-project-bjaz.onrender.com';
  }
  
  // Development fallback
  return 'http://127.0.0.1:8000';
};

const API_BASE_URL = getApiBaseUrl();

// Log the API URL on initialization
console.log(`📡 API Client initialized with base URL: ${API_BASE_URL}`);
console.log(`🌍 Environment: ${import.meta.env.PROD ? 'Production' : 'Development'}`);

/* ================= TYPES ================= */

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

export interface ValidationErrorItem {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]> | ValidationErrorItem[] | unknown;
}

/* ================= AUTHENTICATED CLIENT ================= */

export class ApiClient {
  private client: AxiosInstance;
 
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  /* ---------- INTERCEPTORS ---------- */

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = storage.getToken();
        const companyId = storage.getCompanyId();
        const branchId = storage.getBranchId();

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
          const hasParams = config.url?.includes('?');
          const separator = hasParams ? '&' : '?';
          
          // Only add if not already present
          if (!config.url?.includes('company_id=')) {
            config.url = `${config.url}${separator}company_id=${companyId}`;
          }
        }

        const isFormData = config.data instanceof FormData;

        if (!isFormData && !config.headers['Content-Type']) {
          config.headers['Content-Type'] = 'application/json';
        }

        // Log requests in development
        if (import.meta.env.DEV) {
          console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => {
        // Log responses in development
        if (import.meta.env.DEV) {
          console.log(`📥 API Response: ${response.config.url}`, response.status);
        }
        return response;
      },
      (error: AxiosError) => {
        const normalized = this.normalizeError(error);

        // Log errors in development
        if (import.meta.env.DEV) {
          console.error(`❌ API Error: ${error.config?.url}`, {
            status: error.response?.status,
            message: normalized.message
          });
        }

        if (error.response?.status === 401) {
          storage.clearAll();

          const currentPath = window.location.pathname;
          if (currentPath !== '/login') {
            window.location.href = '/login';
          }
        }

        return Promise.reject(normalized);
      }
    );
  }

  /* ---------- ERROR NORMALIZER ---------- */

  private normalizeError(error: AxiosError): ApiError {
    const data = error.response?.data as
      | {
          message?: string;
          detail?: string | ValidationErrorItem[];
          errors?: Record<string, string[]> | ValidationErrorItem[];
        }
      | undefined;

    let message = 'Unexpected error';

    if (typeof data?.detail === 'string') {
      message = data.detail;
    } else if (typeof data?.message === 'string') {
      message = data.message;
    } else if (error.message) {
      message = error.message;
    }

    return {
      message,
      status: error.response?.status,
      errors: data?.errors ?? data?.detail,
    };
  }

  /* ---------- CORE REQUEST ---------- */

  private async request<T>(config: {
    method: 'get' | 'post' | 'put' | 'patch' | 'delete';
    url: string;
    data?: unknown;
    params?: Record<string, unknown>;
    axiosConfig?: AxiosRequestConfig;
  }): Promise<T> {
    const response = await this.client.request({
      method: config.method,
      url: config.url,
      data: config.data,
      params: config.params,
      ...config.axiosConfig,
    });

    if (config.axiosConfig?.responseType === 'blob') {
      return response.data as T;
    }

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return (response.data as ApiResponse<T>).data;
    }

    return response.data as T;
  }

  /* ---------- TOKEN HELPERS ---------- */

  setAuthToken(token: string): void {
    storage.setToken(token);
    this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    storage.clearAll();
    delete this.client.defaults.headers.common.Authorization;
  }

  /* ---------- HTTP METHODS ---------- */

  get<T>(
    url: string,
    params?: Record<string, unknown>,
    axiosConfig?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ method: 'get', url, params, axiosConfig });
  }

  post<T>(
    url: string,
    data?: unknown,
    axiosConfig?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ method: 'post', url, data, axiosConfig });
  }

  put<T>(
    url: string,
    data?: unknown,
    axiosConfig?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ method: 'put', url, data, axiosConfig });
  }

  patch<T>(
    url: string,
    data?: unknown,
    axiosConfig?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ method: 'patch', url, data, axiosConfig });
  }

  delete<T>(
    url: string,
    params?: Record<string, unknown>,
    axiosConfig?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ method: 'delete', url, params, axiosConfig });
  }
}

/* ================= PUBLIC CLIENT (NO AUTH) ================= */

export class PublicApiClient {
  private client: AxiosInstance;
 
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Only response interceptor for error handling, no request auth interceptors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const normalized = this.normalizeError(error);
        
        if (import.meta.env.DEV) {
          console.error(`❌ Public API Error: ${error.config?.url}`, normalized.message);
        }
        
        return Promise.reject(normalized);
      }
    );
  }

  private normalizeError(error: AxiosError): ApiError {
    const data = error.response?.data as
      | {
          message?: string;
          detail?: string | ValidationErrorItem[];
          errors?: Record<string, string[]> | ValidationErrorItem[];
        }
      | undefined;

    let message = 'Unexpected error';

    if (typeof data?.detail === 'string') {
      message = data.detail;
    } else if (typeof data?.message === 'string') {
      message = data.message;
    } else if (error.message) {
      message = error.message;
    }

    return {
      message,
      status: error.response?.status,
      errors: data?.errors ?? data?.detail,
    };
  }

  private async request<T>(config: {
    method: 'get' | 'post' | 'put' | 'patch' | 'delete';
    url: string;
    data?: unknown;
    params?: Record<string, unknown>;
    axiosConfig?: AxiosRequestConfig;
  }): Promise<T> {
    const response = await this.client.request({
      method: config.method,
      url: config.url,
      data: config.data,
      params: config.params,
      ...config.axiosConfig,
    });

    if (config.axiosConfig?.responseType === 'blob') {
      return response.data as T;
    }

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return (response.data as ApiResponse<T>).data;
    }

    return response.data as T;
  }

  /* ---------- HTTP METHODS ---------- */

  get<T>(
    url: string,
    params?: Record<string, unknown>,
    axiosConfig?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ method: 'get', url, params, axiosConfig });
  }

  post<T>(
    url: string,
    data?: unknown,
    axiosConfig?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ method: 'post', url, data, axiosConfig });
  }

  put<T>(
    url: string,
    data?: unknown,
    axiosConfig?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ method: 'put', url, data, axiosConfig });
  }

  patch<T>(
    url: string,
    data?: unknown,
    axiosConfig?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ method: 'patch', url, data, axiosConfig });
  }

  delete<T>(
    url: string,
    params?: Record<string, unknown>,
    axiosConfig?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ method: 'delete', url, params, axiosConfig });
  }

  /* ---------- HELPER METHODS ---------- */
  
  getApiUrl(): string {
    return API_BASE_URL;
  }
  
  isProduction(): boolean {
    return import.meta.env.PROD;
  }
}

/* ================= SINGLETONS ================= */

export const apiClient = new ApiClient();
export const publicApiClient = new PublicApiClient();

export default apiClient;