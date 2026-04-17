import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';
import Footer from '../common/Footer';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 py-4 pb-20 sm:px-6 lg:px-8 lg:pb-6">
          <Outlet />
        </main>

        <Footer />
        <MobileNav />
      </div>
    </div>
  );
};

export default MainLayout;