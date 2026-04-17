import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  BarChart3,
  RefreshCw,
  Settings,
  Users,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

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
  { name: 'Sync', href: '/sync', icon: <RefreshCw className="h-5 w-5" /> },
  // Admin only routes (optional)
  { name: 'Users', href: '/users', icon: <Users className="h-5 w-5" />, roles: ['admin', 'super_admin'] },
  { name: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" />, roles: ['admin', 'super_admin'] },
];

export const MobileNav: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'staff';

  // Filter navigation items based on user role
  const visibleNavItems = navigation.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white lg:hidden">
      <div className={`grid h-16 grid-cols-${visibleNavItems.length}`}>
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-[11px] ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`
            }
          >
            {item.icon}
            <span className="mt-1 truncate">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};