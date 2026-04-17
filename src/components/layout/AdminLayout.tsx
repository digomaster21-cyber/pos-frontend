import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import Layout from './Layout';
import { LoadingSpinner } from '../common/LoadingSpinner';

const AdminLayout: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin =
    user.role === 'admin' || user.role === 'super_admin';

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default AdminLayout;