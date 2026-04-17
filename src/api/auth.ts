// frontend/src/api/auth.ts
import { apiClient, publicApiClient } from './client';  // Import both clients
import { storage } from '../utils/storage';

export interface AuthUser {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  role: string;
  branch_id?: number;
  company_id?: number;
  company_name?: string;
  subscription_expiry?: string;
  permissions?: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface CompanyRegistrationRequest {
  company_name: string;
  email: string;
  phone: string;
  password: string;
  username?: string;
}

export interface CompanyRegistrationResponse {
  access_token: string;
  token_type: string;
  company_id: number;
  branch_id: number;
  user_id: number;
  company_name: string;
  subscription_expiry: string;
}

export const authApi = {
  // Use publicApiClient for login (no auth headers needed)
  login: (credentials: LoginRequest) =>
    publicApiClient.post<LoginResponse>('/api/auth/login', credentials),

  // Use publicApiClient for registration (no auth headers needed)
  registerCompany: (data: CompanyRegistrationRequest) =>
    publicApiClient.post<CompanyRegistrationResponse>('/api/auth/register-company', data),

  // Use regular apiClient for authenticated endpoints
  logout: () => apiClient.post<{ message: string }>('/api/auth/logout', {}),

  verifyToken: () => apiClient.get<{ user: AuthUser }>('/api/auth/me'),

  getCurrentUser: () => apiClient.get<AuthUser>('/api/auth/me'),

  checkSubscription: () => {
    const companyId = storage.getCompanyId();
    const params = new URLSearchParams();
    if (companyId) params.append('company_id', companyId);
    return apiClient.get<{ valid: boolean; plan?: string; days_left?: number }>(
      `/api/auth/check-subscription?${params.toString()}`
    );
  },
};

export default authApi;