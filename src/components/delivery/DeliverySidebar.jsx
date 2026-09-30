import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Store, Navigation, Truck,
  FileText, Bell, User, HelpCircle, LogOut, ChevronLeft, ChevronRight,
  Boxes, ShieldCheck, Check
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import ConfirmationModal from '../common/ConfirmationModal';
import './DeliverySidebar.css';

const DeliverySidebar = ({ isCollapsed, toggleCollapse, isOpenMobile, setIsOpenMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, agentProfile } = useDelivery();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const unreadNotifCount = (notifications || []).filter(n => !n.isRead).length;

  const handleLinkClick = () => {
    if (setIsOpenMobile) setIsOpenMobile(false);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    navigate('/login');
  };

  return (
    <>
      <aside className={`dl-sidebar ${isCollapsed ? 'is-collapsed' : ''} ${isOpenMobile ? 'is-open-mobile' : ''}`}>
        {/* Brand Header */}
        <div className="dl-sidebar-brand">
          <div className="brand-logo-container">
            <div className="brand-icon-box">
              <Boxes size={22} className="brand-box-svg" />
              <span className="brand-live-pulse" />
            </div>
            {!isCollapsed && (
              <div className="brand-info">
                <span className="brand-title dl-heading">MicroLogi</span>
                <span className="brand-badge-pill">
                  <span className="badge-pulse-dot" />
                  CONTROL TOWER
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="dl-sidebar-nav" onClick={handleLinkClick}>
          {/* Operations Group */}
          <div className="nav-section-group">
            {!isCollapsed && <div className="nav-group-heading">Operations</div>}

            <NavLink
              to="/delivery"
              end
              className={({ isActive }) => `dl-nav-item ${isActive ? 'is-active' : ''}`}
              title={isCollapsed ? 'Dashboard' : undefined}
            >
              <div className="nav-item-icon">
                <LayoutDashboard size={19} strokeWidth={1.75} />
              </div>
              {!isCollapsed && <span className="nav-item-label">Dashboard</span>}
            </NavLink>

            <NavLink
              to="/delivery/deliveries"
              className={({ isActive }) => `dl-nav-item ${isActive ? 'is-active' : ''}`}
              title={isCollapsed ? 'My Deliveries' : undefined}
            >
              <div className="nav-item-icon">
                <Package size={19} strokeWidth={1.75} />
              </div>
              {!isCollapsed && <span className="nav-item-label">My Deliveries</span>}
            </NavLink>

            <NavLink
              to="/delivery/pickup"
              className={({ isActive }) => `dl-nav-item ${isActive ? 'is-active' : ''}`}
              title={isCollapsed ? 'Pickup' : undefined}
            >
              <div className="nav-item-icon">
                <Store size={19} strokeWidth={1.75} />
              </div>
              {!isCollapsed && <span className="nav-item-label">Pickup Routine</span>}
            </NavLink>

            <NavLink
              to="/delivery/route"
              className={({ isActive }) => `dl-nav-item ${isActive ? 'is-active' : ''}`}
              title={isCollapsed ? 'Route & Map' : undefined}
            >
              <div className="nav-item-icon">
                <Navigation size={19} strokeWidth={1.75} />
              </div>
              {!isCollapsed && <span className="nav-item-label">Route</span>}
            </NavLink>

            <NavLink
              to="/delivery/status"
              className={({ isActive }) => `dl-nav-item ${isActive ? 'is-active' : ''}`}
              title={isCollapsed ? 'Delivery Status' : undefined}
            >
              <div className="nav-item-icon">
                <Truck size={19} strokeWidth={1.75} />
              </div>
              {!isCollapsed && <span className="nav-item-label">Status Update</span>}
            </NavLink>
          </div>

          {/* Account Group */}
          <div className="nav-section-group">
            {!isCollapsed && <div className="nav-group-heading">Account & Fleet</div>}

            <NavLink
              to="/delivery/history"
              className={({ isActive }) => `dl-nav-item ${isActive ? 'is-active' : ''}`}
              title={isCollapsed ? 'Delivery History' : undefined}
            >
              <div className="nav-item-icon">
                <FileText size={19} strokeWidth={1.75} />
              </div>
              {!isCollapsed && <span className="nav-item-label">History</span>}
            </NavLink>

            <NavLink
              to="/delivery/notifications"
              className={({ isActive }) => `dl-nav-item ${isActive ? 'is-active' : ''}`}
              title={isCollapsed ? 'Notifications' : undefined}
            >
              <div className="nav-item-icon">
                <Bell size={19} strokeWidth={1.75} />
              </div>
              {!isCollapsed && <span className="nav-item-label">Notifications</span>}
              {unreadNotifCount > 0 && (
                <span className="nav-badge-counter">{unreadNotifCount}</span>
              )}
            </NavLink>

            <NavLink
              to="/delivery/profile"
              className={({ isActive }) => `dl-nav-item ${isActive ? 'is-active' : ''}`}
              title={isCollapsed ? 'Profile & Vehicle' : undefined}
            >
              <div className="nav-item-icon">
                <User size={19} strokeWidth={1.75} />
              </div>
              {!isCollapsed && <span className="nav-item-label">Profile & Vehicle</span>}
            </NavLink>
          </div>

          {/* Bottom Actions */}
          <div className="nav-section-bottom">
            <div className="nav-divider-line" />

            <NavLink
              to="/delivery/help"
              className={({ isActive }) => `dl-nav-item ${isActive ? 'is-active' : ''}`}
              title={isCollapsed ? 'Help & Support' : undefined}
            >
              <div className="nav-item-icon">
                <HelpCircle size={19} strokeWidth={1.75} />
              </div>
              {!isCollapsed && <span className="nav-item-label">Help & Dispatch</span>}
            </NavLink>

            <button
              type="button"
              className="dl-nav-item nav-logout-btn"
              onClick={() => setShowLogoutModal(true)}
              title={isCollapsed ? 'Sign Out' : undefined}
            >
              <div className="nav-item-icon text-danger">
                <LogOut size={19} strokeWidth={1.75} />
              </div>
              {!isCollapsed && <span className="nav-item-label text-danger">Sign Out</span>}
            </button>
          </div>
        </nav>

        {/* Sidebar Footer Collapse Toggle */}
        <div className="dl-sidebar-footer">
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : (
              <>
                <ChevronLeft size={18} />
                <span className="collapse-btn-text">Collapse View</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out of Delivery Fleet?"
        message="Are you sure you want to end your active shift? Make sure all pending cash and parcel updates are recorded."
        subjectName={agentProfile?.name || 'David Anand (Da1)'}
        subjectInfo={`Active Agent: ${agentProfile?.agentCode || 'DA-4091'} • Vehicle: ${agentProfile?.vehicle?.plateNumber || 'TN-01-AB-1234'}`}
        confirmText="Confirm Sign Out"
        cancelText="Stay on Shift"
        variant="danger"
        badgeText="CONTROL TOWER SECURITY"
        icon={LogOut}
      />
    </>
  );
};

export default DeliverySidebar;
