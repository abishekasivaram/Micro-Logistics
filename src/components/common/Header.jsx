import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import ConfirmationModal from './ConfirmationModal';
import { 
  Search, Bell, ShoppingCart, User, Check, X, Menu, Shield, 
  Settings, LogOut, ChevronDown, ExternalLink, Activity, Radio,
  Command, MapPin, Heart
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { getCustomerProfileByIdentifier } from '../../utils/customerDirectory';
import './Header.css';

const Header = ({ onMenuClick }) => {
  const { currentUser, setCurrentUser, notifications, cart, markNotificationAsRead, markAllNotificationsAsRead } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const getNotificationsPath = () => {
    if (currentUser?.role === 'vendor') return '/seller/notifications';
    if (currentUser?.role === 'customer') return '/notifications';
    if (currentUser?.role === 'delivery_partner') return '/delivery/notifications';
    return '/admin/notifications';
  };

  const getProfilePath = () => {
    if (currentUser?.role === 'vendor') return '/seller/business-profile';
    if (currentUser?.role === 'delivery_partner') return '/delivery/profile';
    return '/profile';
  };

  const getSettingsPath = () => {
    if (currentUser?.role === 'vendor') return '/settings';
    if (currentUser?.role === 'customer') return '/profile';
    if (currentUser?.role === 'delivery_partner') return '/delivery/profile';
    return '/admin/settings';
  };

  // Role-filtered notifications for header dropdown
  const roleFilteredNotifications = React.useMemo(() => {
    const role = currentUser?.role || 'admin';
    if (role === 'customer') {
      const filtered = (notifications || []).filter(n => {
        const msg = (n.message || '').toLowerCase();
        return !msg.includes('units left') && !msg.includes('units of') && !msg.includes('placed by') && !msg.includes('reorder threshold');
      });
      if (filtered.length > 0) return filtered;
      return [
        { id: 'hn-c1', message: 'Order #ORD-1092 from Amudham Daily has been confirmed.', date: new Date(Date.now() - 1000 * 60 * 15).toISOString(), isRead: false },
        { id: 'hn-c2', message: 'Agent DA014 is on the way with your delivery. ETA: 18 mins.', date: new Date(Date.now() - 1000 * 60 * 45).toISOString(), isRead: false },
        { id: 'hn-c3', message: 'Smart Aggregation saved you ₹25 on delivery fees!', date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), isRead: true }
      ];
    }
    if (role === 'vendor') {
      const filtered = (notifications || []).filter(n => {
        const msg = (n.message || '').toLowerCase();
        return msg.includes('order') || msg.includes('stock') || msg.includes('payout') || msg.includes('batch');
      });
      if (filtered.length > 0) return filtered;
      return [
        { id: 'hn-v1', message: 'Low Stock Alert: Aashirvaad Atta is down to 2 units.', date: new Date(Date.now() - 1000 * 60 * 5).toISOString(), isRead: false },
        { id: 'hn-v2', message: 'New Customer Order #ORD-1092 was placed by Rahul (₹340.00).', date: new Date(Date.now() - 1000 * 60 * 25).toISOString(), isRead: false },
        { id: 'hn-v3', message: 'Batch #B-8841 assigned to driver Rajesh Kumar for pickup.', date: new Date(Date.now() - 1000 * 60 * 60).toISOString(), isRead: true }
      ];
    }
    return notifications;
  }, [notifications, currentUser?.role]);

  const unreadCount = roleFilteredNotifications.filter(n => !n.isRead).length;
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (Number(item.product?.price || 0) * item.quantity), 0);

  const [wishlistCount, setWishlistCount] = useState(() => {
    try {
      const saved = localStorage.getItem('micrologi_wishlist');
      return saved ? JSON.parse(saved).length : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const handleWishlistChange = () => {
      try {
        const saved = localStorage.getItem('micrologi_wishlist');
        setWishlistCount(saved ? JSON.parse(saved).length : 0);
      } catch {
        setWishlistCount(0);
      }
    };
    window.addEventListener('storage', handleWishlistChange);
    window.addEventListener('wishlist-updated', handleWishlistChange);
    return () => {
      window.removeEventListener('storage', handleWishlistChange);
      window.removeEventListener('wishlist-updated', handleWishlistChange);
    };
  }, []);

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
      {/* Left side: Breadcrumb / Greeting */}
      <div className="header-left">
        <button className="mobile-menu-trigger" onClick={onMenuClick} aria-label="Open sidebar navigation">
          <Menu size={20} />
        </button>
        
        <div className="header-brand-info">
          {currentUser?.role === 'customer' ? (
            <div className="customer-header-nav-wrap">
              <div 
                className="customer-location-badge" 
                onClick={() => navigate('/customer-dashboard')} 
                title="Delivery location: Chennai"
                role="button"
                tabIndex={0}
              >
                <div className="location-pin-wrap">
                  <MapPin size={14} className="location-pin" />
                </div>
                <div className="location-text">
                  <span className="deliver-to-label">Deliver to</span>
                  <span className="address-snippet">
                    {currentUser?.address 
                      ? currentUser.address.split(',')[0] 
                      : (getCustomerProfileByIdentifier(currentUser?.legacy_id || currentUser?.username || currentUser?.email)?.address?.split(',')[0] || '101 Anna Nagar East')}
                  </span>
                </div>
              </div>
              <div className="customer-quick-links">
                <Link to="/customer-dashboard" className={`cust-nav-link ${location.pathname === '/customer-dashboard' || location.pathname === '/dashboard' ? 'active' : ''}`}>
                  Home
                </Link>
                <Link to="/browse-sellers" className={`cust-nav-link ${location.pathname === '/browse-sellers' || location.pathname === '/customer/browse-sellers' ? 'active' : ''}`}>
                  Stores
                </Link>
                <Link to="/products" className={`cust-nav-link ${location.pathname === '/products' ? 'active' : ''}`}>
                  Explore
                </Link>
                <Link to="/orders" className={`cust-nav-link ${location.pathname === '/orders' || location.pathname === '/customer/orders' ? 'active' : ''}`}>
                  Orders
                </Link>
                <Link to="/track-delivery" className={`cust-nav-link ${location.pathname === '/track-delivery' || location.pathname === '/customer/track-delivery' ? 'active' : ''}`}>
                  Track Live
                </Link>
              </div>
            </div>
          ) : location.pathname === '/vendor-dashboard' ? (
            <div className="breadcrumb">
              <span className="breadcrumb-item text-muted">Merchant Hub</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item active">Live Control Tower</span>
            </div>
          ) : (
            <div className="breadcrumb">
              <span className="breadcrumb-item text-muted">Dashboard</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item active">
                {location.pathname.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Center: Global Search */}
      {currentUser?.role === 'vendor' && (
        <div className="header-center">
          <div className="global-search-container">
            <Search size={16} className="search-icon" strokeWidth={1.75} />
            <input type="text" placeholder="Search orders, products..." className="global-search-input" />
            <div className="search-shortcut">
              <Command size={12} strokeWidth={2} /> K
            </div>
          </div>
        </div>
      )}

      {/* Right side: Actions, Notifications, and Polished Profile Chip */}
      <div className="header-right">
        {currentUser?.role === 'customer' && (
          <>
            <button 
              className="command-icon-btn customer-wishlist-btn" 
              onClick={() => navigate('/profile?tab=wishlist')}
              title="My Wishlist"
              aria-label="View Wishlist"
            >
              <Heart size={18} />
              {wishlistCount > 0 && <span className="cart-badge-counter">{wishlistCount}</span>}
            </button>

            <button 
              className="command-icon-btn customer-cart-pill-btn" 
              onClick={() => navigate('/cart')}
              title="Shopping Cart"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart size={18} />
              {cartItemCount > 0 ? (
                <span className="customer-cart-tag">
                  {cartItemCount} · ₹{cartTotal.toFixed(0)}
                </span>
              ) : null}
            </button>
          </>
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
                {roleFilteredNotifications.length === 0 ? (
                  <div className="notif-empty-state">
                    <Check size={24} className="empty-check-icon" />
                    <p>All caught up! No new notifications.</p>
                  </div>
                ) : (
                  roleFilteredNotifications.slice(0, 5).map(n => (
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
                <Link to={getNotificationsPath()} onClick={() => setShowNotifMenu(false)} className="view-all-link">
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
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
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
                    navigate(getProfilePath());
                  }}
                >
                  <User size={16} strokeWidth={1.75} />
                  <span>Profile</span>
                </button>
                <button 
                  className="profile-menu-item"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate(getSettingsPath());
                  }}
                >
                  <Settings size={16} strokeWidth={1.75} />
                  <span>Settings</span>
                </button>
                <div className="menu-divider" />
                <button 
                  className="profile-menu-item text-danger"
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowLogoutModal(true);
                  }}
                >
                  <LogOut size={16} strokeWidth={1.75} />
                  <span>Logout</span>
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
        title="Log Out of Control Tower?"
        message="Are you sure you want to end your active session? You will be returned to the secure login gateway."
        subjectName={userGreetingName}
        subjectInfo={`Active Account: ${currentUser?.email || 'admin@micrologi.com'} | Role: ${roleLabel}`}
        confirmText="Confirm Logout"
        cancelText="Stay Logged In"
        variant="danger"
        badgeText="SECURITY PROTOCOL"
        icon={LogOut}
      />
    </header>
  );
};

export default Header;
