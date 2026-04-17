import React from 'react';
import { useAuth } from '../../auth/AuthContext';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  permissions,
  fallback = null,
}) => {
  const { user } = useAuth();

  if (!user) return <>{fallback}</>;

  const userPermissions = user.permissions || [];

  const allowed =
    (permission && userPermissions.includes(permission)) ||
    (permissions && permissions.some((p) => userPermissions.includes(p))) ||
    (!permission && !permissions);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};