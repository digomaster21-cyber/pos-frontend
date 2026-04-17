import React from 'react';
import { Navigate } from 'react-router-dom';
import { storage } from '../utils/storage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = storage.getToken();
  const companyId = storage.getCompanyId();
  
  // Check both token and company_id
  if (!token || !companyId) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;