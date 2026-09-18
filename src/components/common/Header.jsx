import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ConfirmationModal from './ConfirmationModal';
import { 
  Search, Bell, ShoppingCart, User, Check, X, Menu, Shield, 
  Settings, LogOut, ChevronDown, ExternalLink, Activity, Radio
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './Header.css';

const Header = ({ onMenuClick }) => {
  const { currentUser, setCurrentUser, notifications, cart, markNotificationAsRead, markAllNotificationsAsRead } = useAppContext();
  const navigate = useNavigate();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  const roleLabel = currentUser?.role === 'vendor' 
    ? 'Seller' 
    : currentUser?.role === 'customer' 
    ? 'Customer' 
    : currentUser?.role === 'delivery_partner'
    ? 'Delivery Fleet'
    : 'System Administrator';

  const userGreetingName = currentUser?.shopName || currentUser?.name || (currentUser?.role === 'vendor' ? 'Seller' : currentUser?.role === 'delivery_partner' ? 'Delivery Partner' : 'System Admin');

  // Compute Initials
  const getInitials = (name) => {
    if (!name) return 'SA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="header-command-bar">
      {/* Left side: Greeting and Live Telemetry Indicator */}
      <div className="header-left">
        <button className="mobile-menu-trigger" onClick={onMenuClick} aria-label="Open sidebar navigation">
          <Menu size={20} />
        </button>
        
        <div className="header-brand-info">
          <div className="header-title-row">
            <h2 className="header-headline">Welcome back, SuperAdmin</h2>
          </div>
        </div>
      </div>

      {/* Right side: Actions, Notifications, and Polished Profile Chip */}
      <div className="header-right">
        {currentUser?.role === 'customer' && (
          <button 
            className="command-icon-btn cart-btn" 
            onClick={() => navigate('/cart')}
            title="Shopping Cart"
            aria-label="View Shopping Cart"
          >
            <ShoppingCart size={18} />
            {cartItemCount > 0 && <span className="cart-badge-counter">{cartItemCount}</span>}
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="dropdown-container" ref={notifRef}>
          <button 
            className={`command-icon-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            title="Notifications"
            aria-label="Toggle notifications menu"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="pulse-indicator-dot" />}
          </button>

          {showNotifMenu && (
            <div className="command-dropdown notif-menu">
              <div className="command-dropdown-header">
                <div className="dropdown-title-group">
                  <span className="dropdown-title">Notifications</span>
                  {unreadCount > 0 && <span className="dropdown-count-pill">{unreadCount} new</span>}
                </div>
                {unreadCount > 0 && (
                  <button 
                    className="btn-text-link" 
                    onClick={markAllNotificationsAsRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notif-scroll-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty-state">
                    <Check size={24} className="empty-check-icon" />
                    <p>All caught up! No new notifications.</p>
                  </div>
                ) : (
                  notifications.slice(0, 5).map(n => (
                    <div 
                      key={n.id} 
                      className={`notif-item-row ${!n.isRead ? 'is-unread' : ''}`}
                      onClick={() => markNotificationAsRead(n.id)}
                    >
                      <div className="notif-item-dot" />
                      <div className="notif-item-body">
                        <p className="notif-message-text">{n.message}</p>
                        <span className="notif-timestamp">
                          {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="command-dropdown-footer">
                <Link to="/admin/notifications" onClick={() => setShowNotifMenu(false)} className="view-all-link">
                  View Notification Center <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Chip & Dropdown */}
        <div className="dropdown-container" ref={profileRef}>
          <div 
            className="user-command-chip"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            role="button"
            tabIndex={0}
          >
            <div className="user-avatar-squircle">
              {currentUser?.avatar || currentUser?.logo ? (
                <img 
                  src={currentUser?.avatar || currentUser?.logo} 
                  alt="Avatar" 
                  className="avatar-image"
                />
              ) : (
                <span>{getInitials(userGreetingName)}</span>
              )}
            </div>
            
            <div className="user-text-column">
              <span className="user-display-name">{userGreetingName}</span>
              <span className="user-role-badge">{roleLabel}</span>
            </div>

            <ChevronDown size={14} className={`chevron-indicator ${showProfileMenu ? 'open' : ''}`} />
          </div>

          {showProfileMenu && (
            <div className="command-dropdown profile-menu">
              <div className="profile-menu-header">
                <div className="menu-user-name">{userGreetingName}</div>
                <div className="menu-user-role">{currentUser?.email || 'admin@micrologi.com'}</div>
              </div>
              <div className="menu-divider" />
              <div className="profile-menu-items">
                <button 
                  className="profile-menu-item"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/admin/settings');
                  }}
                >
                  <Settings size={16} />
                  <span>Control Settings</span>
                </button>
                <button 
                  className="profile-menu-item"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/admin/analytics');
                  }}
                >
                  <Activity size={16} />
                  <span>Telemetry Log</span>
                </button>
                <div className="menu-divider" />
                <button 
                  className="profile-menu-item text-danger"
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowLogoutModal(true);
                  }}
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Professional Logout Warning Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Sign Out of Control Tower?"
        message="Are you sure you want to end your active session? You will be returned to the secure login gateway."
        subjectName={userGreetingName}
        subjectInfo={`Active Account: ${currentUser?.email || 'admin@micrologi.com'} | Role: ${roleLabel}`}
        confirmText="Confirm Sign Out"
        cancelText="Stay Logged In"
        variant="danger"
        badgeText="SECURITY PROTOCOL"
        icon={LogOut}
      />
    </header>
  );
};

export default Header;
