import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_EDIT: 'products.edit',
  PRODUCTS_DELETE: 'products.delete',
  SALES_VIEW: 'sales.view',
  SALES_CREATE: 'sales.create',
  SALES_EDIT: 'sales.edit',
  SALES_DELETE: 'sales.delete',
  PURCHASES_VIEW: 'purchases.view',
  PURCHASES_CREATE: 'purchases.create',
  PURCHASES_EDIT: 'purchases.edit',
  PURCHASES_DELETE: 'purchases.delete',
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_ADJUST: 'inventory.adjust',
  INVENTORY_TRANSFER: 'inventory.transfer',
  EXPENSES_VIEW: 'expenses.view',
  EXPENSES_CREATE: 'expenses.create',
  EXPENSES_EDIT: 'expenses.edit',
  EXPENSES_DELETE: 'expenses.delete',
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  BRANCHES_VIEW: 'branches.view',
  BRANCHES_CREATE: 'branches.create',
  BRANCHES_EDIT: 'branches.edit',
  BRANCHES_DELETE: 'branches.delete',
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
  SETTINGS_BACKUP: 'settings.backup',
  SETTINGS_SYNC: 'settings.sync',
  AUDIT_VIEW: 'audit.view',
  ADMIN_ACCESS: 'admin.access',
} as const;

export type PermissionValue = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export function usePermission() {
  const { user } = useAuth();

  const userPermissions = user?.permissions ?? [];
  const userRole = user?.role ?? null;

  const hasPermission = (permission: PermissionValue | PermissionValue[]): boolean => {
    if (!user) return false;
    if (userRole === 'super_admin') return true;

    if (Array.isArray(permission)) {
      return permission.some((p) => userPermissions.includes(p));
    }

    return userPermissions.includes(permission);
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;

    if (Array.isArray(role)) {
      return role.includes(userRole ?? '');
    }

    return userRole === role;
  };

  const can = {
    view: (resource: string): boolean => {
      const perm = `${resource}.view` as PermissionValue;
      return hasPermission(perm);
    },
    create: (resource: string): boolean => {
      const perm = `${resource}.create` as PermissionValue;
      return hasPermission(perm);
    },
    edit: (resource: string): boolean => {
      const perm = `${resource}.edit` as PermissionValue;
      return hasPermission(perm);
    },
    delete: (resource: string): boolean => {
      const perm = `${resource}.delete` as PermissionValue;
      return hasPermission(perm);
    },
  };

  const hasAny = (permissions: PermissionValue[]): boolean => {
    return permissions.some((p) => hasPermission(p));
  };

  const hasAll = (permissions: PermissionValue[]): boolean => {
    return permissions.every((p) => hasPermission(p));
  };

  const role = userRole;
  const isAdmin = hasRole(['super_admin', 'admin']);
  const isSuperAdmin = hasRole('super_admin');
  const isBranchManager = hasRole('branch_manager');
  const isCashier = hasRole('cashier');

  return {
    user,
    hasPermission,
    hasRole,
    hasAny,
    hasAll,
    can,
    role,
    isAdmin,
    isSuperAdmin,
    isBranchManager,
    isCashier,
  };
}

interface IfPermissionProps {
  permission: PermissionValue | PermissionValue[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function IfPermission({
  permission,
  children,
  fallback = null,
}: IfPermissionProps) {
  const { hasPermission } = usePermission();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

export function useBranchFilter<T extends { branch_id?: number | null }>(items: T[]) {
  const { user } = useAuth();
  const { isAdmin, isSuperAdmin } = usePermission();

  if (isAdmin || isSuperAdmin) {
    return items;
  }

  if (user?.branch_id != null) {
    return items.filter((item) => item.branch_id === user.branch_id);
  }

  return [];
}