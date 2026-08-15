import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import MobileNav from './MobileNav';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showMobileNav?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showSidebar = false,
  showMobileNav = true,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <Header />

      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          onClose={closeSidebar}
        />
      )}

      {/* Main Content */}
      <main
        className={`
          pt-16 pb-16 transition-all duration-300
          ${showSidebar && !isMobile ? 'lg:ml-20' : ''}
          ${showSidebar && sidebarOpen && !isMobile ? 'lg:ml-64' : ''}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Navigation */}
      {showMobileNav && <MobileNav onActionClick={closeSidebar} />}
    </div>
  );
};

export default MainLayout;