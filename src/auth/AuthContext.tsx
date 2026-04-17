import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import authApi, { AuthUser, LoginResponse } from '../api/auth';
import { storage } from '../utils/storage';
import apiClient from '../api/client';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(storage.getUser());
  const [token, setToken] = useState<string | null>(storage.getToken());
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const savedToken = storage.getToken();

    if (!savedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      apiClient.setAuthToken(savedToken);

      const result = await authApi.verifyToken();
      
      // Store company_id and branch_id from user data
      if (result.user?.company_id) {
        storage.setCompanyId(result.user.company_id);
      }
      if (result.user?.branch_id) {
        storage.setBranchId(result.user.branch_id);
      }
      
      setUser(result.user);
      setToken(savedToken);
      storage.setUser(result.user);
    } catch {
      apiClient.clearAuthToken();
      storage.clearAll(); // Clear everything including company_id and branch_id
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await authApi.login({ username, password });

    // Store all auth data
    storage.setToken(response.access_token);
    storage.setUser(response.user);
    
    // Store company_id and branch_id
    if (response.user?.company_id) {
      storage.setCompanyId(response.user.company_id);
    }
    if (response.user?.branch_id) {
      storage.setBranchId(response.user.branch_id);
    }
    
    apiClient.setAuthToken(response.access_token);

    setToken(response.access_token);
    setUser(response.user);

    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore logout api failure
    } finally {
      apiClient.clearAuthToken();
      storage.clearAll(); // Clear everything including company_id and branch_id
      setUser(null);
      setToken(null);
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!token && !!user,
      login,
      logout,
      refreshUser,
    }),
    [user, token, loading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};