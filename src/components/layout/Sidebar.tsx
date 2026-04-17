import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  BarChart3,
  RefreshCw,
  Settings,
  LogOut,
  Users,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { cn } from '../../utils/cn';
import { storage } from '../../utils/storage';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[]; // Optional: only show for specific roles
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: 'Sales', href: '/sales', icon: <ShoppingCart className="h-5 w-5" /> },
  { name: 'Inventory', href: '/inventory', icon: <Package className="h-5 w-5" /> },
  { name: 'Expenses', href: '/expenses', icon: <FileText className="h-5 w-5" /> },
  { name: 'Reports', href: '/reports', icon: <BarChart3 className="h-5 w-5" /> },
  { name: 'Users', href: '/users', icon: <Users className="h-5 w-5" />, roles: ['admin', 'super_admin'] },
  { name: 'Sync', href: '/sync', icon: <RefreshCw className="h-5 w-5" /> },
  { name: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const companyId = storage.getCompanyId();
  const companyName = user?.company_name || (companyId ? `Company ${companyId}` : 'BizDash');

  const displayName = user?.full_name || user?.username || user?.email || 'User';
  const displayRole = user?.role || 'Staff';
  const userRole = user?.role || 'staff';

  // Filter navigation items based on user role
  const visibleNavItems = navigation.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600/75 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:border-r lg:border-gray-200 lg:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <span className="text-lg font-semibold text-gray-900">
                  {companyName}
                </span>
                {companyId && (
                  <p className="text-xs text-gray-500">ID: {companyId}</p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 lg:hidden"
              type="button"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-2 py-4">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
              >
                <span className="mr-3 text-gray-400 group-hover:text-gray-500">
                  {item.icon}
                </span>
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <span className="font-medium text-blue-600">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="ml-3 min-w-0">
                <p className="truncate text-sm font-medium text-gray-700">
                  {displayName}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {displayRole}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <button
                type="button"
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  navigate('/settings');
                  onClose();
                }}
              >
                <Settings className="mr-3 h-5 w-5 text-gray-400" />
                Settings
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};