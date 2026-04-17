import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Menu, Bell, Search, User, Building2 } from 'lucide-react';
import { OfflineIndicator } from '../common/OfflineIndicator';
import { storage } from '../../utils/storage';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const companyId = storage.getCompanyId();
  const branchId = storage.getBranchId();

  const displayName = user?.full_name || user?.username || user?.email || 'User';
  const displayEmail = user?.email || '';
  const displayRole = user?.role || 'Staff';
  const companyName = user?.company_name || (companyId ? `Company ${companyId}` : 'My Business');

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-500 lg:hidden"
              aria-label="Open menu"
              type="button"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">{companyName}</h1>
              </div>
              {branchId && (
                <p className="text-xs text-gray-500 hidden lg:block">
                  Branch ID: {branchId}
                </p>
              )}
            </div>

            <div className="hidden lg:block ml-10">
              <div className="flex items-center">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="search"
                    className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <OfflineIndicator />

            <button
              className="p-2 rounded-full text-gray-500 hover:text-gray-700"
              type="button"
            >
              <Bell className="h-6 w-6" />
            </button>

            <div className="relative group">
              <button
                className="flex items-center space-x-3 focus:outline-none"
                type="button"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">{displayRole}</p>
                </div>
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-50">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">{displayEmail}</p>
                  {companyId && (
                    <p className="text-xs text-gray-400 mt-1">Company ID: {companyId}</p>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  type="button"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};