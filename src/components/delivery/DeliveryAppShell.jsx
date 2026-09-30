import React, { useState, useEffect } from 'react';
import { DeliveryProvider, useDelivery } from '../../context/DeliveryContext';
import DeliverySidebar from './DeliverySidebar';
import DeliveryTopbar from './DeliveryTopbar';
import DeliveryBottomNav from './DeliveryBottomNav';
import CommandPalette from './CommandPalette';
import ToastContainer from './ToastContainer';
import OrderDrawer from './OrderDrawer';
import ErrorBoundary from '../common/ErrorBoundary';
import './DeliveryAppShell.css';

// Internal shell wrapper that consumes useDelivery
const DeliveryAppShellContent = ({ children }) => {
  const { isCmdOpen, setIsCmdOpen, selectedOrderForDrawer, setSelectedOrderForDrawer, updateOrderStatus } = useDelivery();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('micrologi_fleet_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('micrologi_fleet_sidebar_collapsed', String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  return (
    <div className={`dl-shell-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Off-canvas mobile overlay */}
      {isOpenMobile && (
        <div 
          className="dl-mobile-backdrop" 
          onClick={() => setIsOpenMobile(false)}
          aria-hidden="true"
        />
      )}

      {/* Desktop/Tablet Sidebar & Mobile Drawer */}
      <DeliverySidebar 
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Command Workspace */}
      <div className="dl-main-area">
        <DeliveryTopbar onOpenMobileMenu={() => setIsOpenMobile(true)} />
        <main className="dl-content-scroll">
          <div className="dl-page-viewport">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Mobile Tab Bar */}
      <DeliveryBottomNav />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />

      {/* Global Toasts with Undo Action */}
      <ToastContainer />

      {/* Global Order Inspection Drawer */}
      {selectedOrderForDrawer && (
        <OrderDrawer 
          order={selectedOrderForDrawer}
          isOpen={Boolean(selectedOrderForDrawer)}
          onClose={() => setSelectedOrderForDrawer(null)}
          onUpdateStatus={(order) => {
            // Can trigger status change flow
            updateOrderStatus(order.id, 'OUT_FOR_DELIVERY');
            setSelectedOrderForDrawer(null);
          }}
        />
      )}
    </div>
  );
};

const DeliveryAppShell = ({ children }) => {
  return (
    <DeliveryProvider>
      <DeliveryAppShellContent>
        {children}
      </DeliveryAppShellContent>
    </DeliveryProvider>
  );
};

export default DeliveryAppShell;
