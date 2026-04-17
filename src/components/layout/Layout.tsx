import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import Footer from '../common/Footer';

// Temporarily comment out Header and BranchProvider
// import Header from './Header';
// import { BranchProvider } from '../../context/BranchContext';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Temporarily replace Header with simple div */}
        <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            ☰
          </button>
          <div className="text-xl font-semibold">POS System</div>
          <div>User</div>
        </div>

        <main className="flex-1 px-4 py-4 pb-20 sm:px-6 lg:px-8 lg:pb-6">
          {children ?? <Outlet />}
          <div className="text-center text-gray-500 mt-10">
            <p>If you see this, the layout is working!</p>
            <p>Branch selector is temporarily disabled for testing.</p>
          </div>
        </main>

        <Footer />
        <MobileNav />
      </div>
    </div>
  );
};

export default Layout;