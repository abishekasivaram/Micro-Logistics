import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Navigation, Truck, MoreHorizontal, 
  FileText, Bell, User, HelpCircle, X 
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import './DeliveryBottomNav.css';

const DeliveryBottomNav = () => {
  const { notifications } = useDelivery();
  const [showMoreSheet, setShowMoreSheet] = useState(false);

  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  return (
    <>
      <nav className="dl-bottom-nav dl-glass" aria-label="Mobile Bottom Navigation">
        <NavLink to="/delivery" end className={({ isActive }) => `bottom-tab-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} strokeWidth={1.75} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/delivery/deliveries" className={({ isActive }) => `bottom-tab-item ${isActive ? 'active' : ''}`}>
          <Package size={20} strokeWidth={1.75} />
          <span>Deliveries</span>
        </NavLink>

        <NavLink to="/delivery/route" className={({ isActive }) => `bottom-tab-item ${isActive ? 'active' : ''}`}>
          <Navigation size={20} strokeWidth={1.75} />
          <span>Route</span>
        </NavLink>

        <NavLink to="/delivery/status" className={({ isActive }) => `bottom-tab-item ${isActive ? 'active' : ''}`}>
          <Truck size={20} strokeWidth={1.75} />
          <span>Status</span>
        </NavLink>

        <button 
          type="button" 
          className={`bottom-tab-item ${showMoreSheet ? 'active' : ''}`}
          onClick={() => setShowMoreSheet(prev => !prev)}
          aria-label="More navigation options"
        >
          <div className="tab-icon-wrap">
            <MoreHorizontal size={20} strokeWidth={1.75} />
            {unreadCount > 0 && <span className="tab-badge-dot" />}
          </div>
          <span>More</span>
        </button>
      </nav>

      {/* More Bottom Sheet */}
      {showMoreSheet && (
        <div className="bottom-sheet-backdrop" onClick={() => setShowMoreSheet(false)}>
          <div className="bottom-sheet-content" onClick={e => e.stopPropagation()}>
            <div className="sheet-header">
              <span className="sheet-title dl-heading">Navigation & Account</span>
              <button 
                type="button" 
                className="sheet-close-btn" 
                onClick={() => setShowMoreSheet(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="sheet-links-grid">
              <NavLink 
                to="/delivery/pickup" 
                className="sheet-link-tile" 
                onClick={() => setShowMoreSheet(false)}
              >
                <Package size={22} className="sheet-tile-icon" />
                <span>Pickup Routine</span>
              </NavLink>

              <NavLink 
                to="/delivery/history" 
                className="sheet-link-tile" 
                onClick={() => setShowMoreSheet(false)}
              >
                <FileText size={22} className="sheet-tile-icon" />
                <span>Delivery History</span>
              </NavLink>

              <NavLink 
                to="/delivery/notifications" 
                className="sheet-link-tile" 
                onClick={() => setShowMoreSheet(false)}
              >
                <div className="relative">
                  <Bell size={22} className="sheet-tile-icon" />
                  {unreadCount > 0 && <span className="sheet-notif-badge">{unreadCount}</span>}
                </div>
                <span>Notifications</span>
              </NavLink>

              <NavLink 
                to="/delivery/profile" 
                className="sheet-link-tile" 
                onClick={() => setShowMoreSheet(false)}
              >
                <User size={22} className="sheet-tile-icon" />
                <span>Fleet Profile</span>
              </NavLink>

              <NavLink 
                to="/delivery/help" 
                className="sheet-link-tile" 
                onClick={() => setShowMoreSheet(false)}
              >
                <HelpCircle size={22} className="sheet-tile-icon" />
                <span>Help & Dispatch</span>
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeliveryBottomNav;
