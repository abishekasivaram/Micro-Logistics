import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import ErrorBoundary from '../components/common/ErrorBoundary';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('micrologi_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('micrologi_sidebar_collapsed', String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  return (
    <div className={`dashboard-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
      />
      
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      
      <div className="dashboard-main">
        <Header 
          onMenuClick={() => setIsSidebarOpen(true)}
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />
        <main className="dashboard-content">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
