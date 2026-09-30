import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Menu, Search, Bell, Moon, Sun, ChevronDown, Check, 
  ExternalLink, User, Settings, LogOut, Radio, Shield, Circle
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import ConfirmationModal from '../common/ConfirmationModal';
import './DeliveryTopbar.css';

const ROUTE_TITLES = {
  '/delivery': { breadcrumb: 'Control Tower', title: 'Live Dashboard' },
  '/delivery-dashboard': { breadcrumb: 'Control Tower', title: 'Live Dashboard' },
  '/delivery/deliveries': { breadcrumb: 'Operations', title: 'My Deliveries' },
  '/delivery/pickup': { breadcrumb: 'Operations', title: 'Pickup Routine' },
  '/delivery/route': { breadcrumb: 'Operations', title: 'Delivery Route' },
  '/delivery/status': { breadcrumb: 'Operations', title: 'Status Updates' },
  '/delivery/history': { breadcrumb: 'Account', title: 'Delivery History' },
  '/delivery/notifications': { breadcrumb: 'Account', title: 'Notifications Center' },
  '/delivery/profile': { breadcrumb: 'Account', title: 'Fleet Profile & Vehicle' },
  '/delivery/help': { breadcrumb: 'Support', title: 'Help & Dispatch Center' }
};

const DeliveryTopbar = ({ onOpenMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    theme, toggleTheme, agentProfile, updateAgentAvailability, 
    notifications, markNotificationAsRead, markAllNotificationsAsRead, 
    isLiveConnected, setIsCmdOpen 
  } = useDelivery();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const routeMeta = ROUTE_TITLES[location.pathname] || {
    breadcrumb: 'Delivery Fleet',
    title: 'Control Tower'
  };

  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  const handleLogout = () => {
    setShowLogoutModal(false);
    navigate('/login');
  };

  const availability = agentProfile?.availability || 'Available';

  return (
    <>
      <header className="dl-topbar dl-glass">
        {/* Left Side: Mobile Menu Button & Dynamic Page Identity */}
        <div className="topbar-left">
          <button 
            type="button" 
            className="mobile-hamburger-btn" 
            onClick={onOpenMobileMenu}
            aria-label="Open mobile navigation menu"
          >
            <Menu size={20} />
          </button>

          <div className="topbar-identity">
            <span className="topbar-breadcrumb">{routeMeta.breadcrumb}</span>
            <h1 className="topbar-page-title dl-heading">{routeMeta.title}</h1>
          </div>
        </div>

        {/* Center: Global Search Command Palette Trigger */}
        <div className="topbar-center">
          <button 
            type="button" 
            className="topbar-search-trigger"
            onClick={() => setIsCmdOpen(true)}
            aria-label="Search orders, actions, or navigation (Ctrl+K)"
          >
            <Search size={15} className="search-icon" />
            <span className="search-placeholder">Search orders, stops, commands...</span>
            <kbd className="search-shortcut-badge">⌘K</kbd>
          </button>
        </div>

        {/* Right Side: Telemetry, Theme Toggle, Notifications, User Menu */}
        <div className="topbar-right">
          {/* Live Online Telemetry Pill */}
          <div className="telemetry-pill" title="Live GPS & Dispatch Sync Connected">
            <span className={`telemetry-dot ${isLiveConnected ? 'is-connected' : 'is-disconnected'}`} />
            <span className="telemetry-label">{isLiveConnected ? 'Fleet Live' : 'Offline'}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            className="topbar-icon-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications Dropdown */}
          <div className="topbar-dropdown-anchor" ref={notifRef}>
            <button
              type="button"
              className={`topbar-icon-btn ${unreadCount > 0 ? 'has-badge' : ''}`}
              onClick={() => setShowNotifDropdown(prev => !prev)}
              aria-label="View notifications"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="notif-badge-indicator" />}
            </button>

            {showNotifDropdown && (
              <div className="topbar-dropdown-menu notif-dropdown-menu">
                <div className="dropdown-header">
                  <div className="notif-header-title">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="notif-count-chip">{unreadCount} new</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      type="button" 
                      className="dropdown-text-action"
                      onClick={markAllNotificationsAsRead}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="notif-dropdown-list">
                  {notifications.length === 0 ? (
                    <div className="notif-dropdown-empty">
                      <Check size={20} className="empty-check text-success" />
                      <p>You're all caught up!</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map(item => (
                      <div
                        key={item.id}
                        className={`notif-dropdown-item ${!item.isRead ? 'is-unread' : ''}`}
                        onClick={() => {
                          markNotificationAsRead(item.id);
                          setShowNotifDropdown(false);
                          navigate('/delivery/notifications');
                        }}
                      >
                        <div className="notif-item-indicator" />
                        <div className="notif-item-body">
                          <p className="notif-item-title">{item.title}</p>
                          <p className="notif-item-desc">{item.description}</p>
                          <span className="notif-item-time">{item.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="dropdown-footer">
                  <Link 
                    to="/delivery/notifications" 
                    className="view-all-notifs-link"
                    onClick={() => setShowNotifDropdown(false)}
                  >
                    <span>View all notifications</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu with Availability Switch */}
          <div className="topbar-dropdown-anchor" ref={userRef}>
            <div
              className="user-profile-chip"
              onClick={() => setShowUserDropdown(prev => !prev)}
              role="button"
              tabIndex={0}
              aria-label="User account menu"
            >
              <div className="user-avatar-circle">
                {agentProfile?.avatar ? (
                  <img src={agentProfile.avatar} alt={agentProfile.name} className="avatar-img" />
                ) : (
                  <span>{(agentProfile?.name || 'Da1').charAt(0)}</span>
                )}
                <span className={`avatar-status-ring status-${availability.toLowerCase().replace(/\s+/g, '-')}`} />
              </div>

              <div className="user-meta-column">
                <span className="user-name-text">{agentProfile?.name || 'David Anand (Da1)'}</span>
                <span className="user-fleet-role">Delivery Fleet • {availability}</span>
              </div>

              <ChevronDown size={14} className={`chip-chevron ${showUserDropdown ? 'is-open' : ''}`} />
            </div>

            {showUserDropdown && (
              <div className="topbar-dropdown-menu user-dropdown-menu">
                <div className="user-menu-header">
                  <div className="menu-agent-name">{agentProfile?.name || 'David Anand'}</div>
                  <div className="menu-agent-code">{agentProfile?.agentCode || 'DA-4091'} • {agentProfile?.email}</div>
                </div>

                {/* Quick Availability Switch */}
                <div className="availability-switch-section">
                  <span className="switch-section-label">Availability Status</span>
                  <div className="status-options-grid">
                    {['Available', 'On Break', 'Offline'].map(statusOption => (
                      <button
                        key={statusOption}
                        type="button"
                        className={`status-option-btn ${availability === statusOption ? 'active' : ''}`}
                        onClick={() => updateAgentAvailability(statusOption)}
                      >
                        <span className={`option-dot dot-${statusOption.toLowerCase().replace(/\s+/g, '-')}`} />
                        <span>{statusOption}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="dropdown-divider" />

                <div className="user-menu-links">
                  <Link
                    to="/delivery/profile"
                    className="user-menu-item"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <User size={16} />
                    <span>Fleet Profile & Vehicle</span>
                  </Link>

                  <Link
                    to="/delivery/help"
                    className="user-menu-item"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <Shield size={16} />
                    <span>Dispatch Support</span>
                  </Link>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    className="user-menu-item text-danger"
                    onClick={() => {
                      setShowUserDropdown(false);
                      setShowLogoutModal(true);
                    }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Sign Out of Delivery Fleet?"
        message="Are you sure you want to end your active shift? Make sure all pending cash and parcel updates are recorded."
        subjectName={agentProfile?.name || 'David Anand (Da1)'}
        subjectInfo={`Active Agent: ${agentProfile?.agentCode || 'DA-4091'} • Role: DELIVERY FLEET`}
        confirmText="Confirm Sign Out"
        cancelText="Stay on Shift"
        variant="danger"
        badgeText="CONTROL TOWER SECURITY"
        icon={LogOut}
      />
    </>
  );
};

export default DeliveryTopbar;
