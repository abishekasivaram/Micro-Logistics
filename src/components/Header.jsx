import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell, ShoppingCart, User, Check, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './Header.css';

const Header = () => {
  const { currentUser, notifications, cart, markNotificationAsRead, markAllNotificationsAsRead } = useAppContext();
  const navigate = useNavigate();
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const roleLabel = currentUser?.role === 'vendor' 
    ? 'Seller' 
    : currentUser?.role === 'customer' 
    ? 'Customer' 
    : 'Admin';

  const userGreetingName = currentUser?.name || (currentUser?.role === 'vendor' ? 'Seller' : 'User');

  return (
    <header className="header">
      <div className="header-greeting">
        <h2>Welcome, {userGreetingName} 👋</h2>
        <p>
          {currentUser?.role === 'customer' 
            ? "Explore local sellers and track your delivery orders." 
            : currentUser?.role === 'vendor'
            ? "Manage orders, products, and delivery coordination status."
            : "Platform administrative overview and settings."}
        </p>
      </div>

      <div className="header-actions">
        {currentUser?.role === 'customer' && (
          <button 
            className="icon-btn cart-btn" 
            onClick={() => navigate('/cart')}
            title="View Shopping Cart"
          >
            <ShoppingCart size={20} />
            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </button>
        )}

        <div className="notif-wrapper" style={{ position: 'relative' }}>
          <button 
            className="icon-btn" 
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-dot"></span>}
          </button>

          {showNotifMenu && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px' }}>Notifications</h4>
                  {unreadCount > 0 && <span className="unread-badge">{unreadCount} new</span>}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {unreadCount > 0 && (
                    <button 
                      className="btn-link" 
                      onClick={markAllNotificationsAsRead}
                      style={{ fontSize: '12px', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                    >
                      Mark all read
                    </button>
                  )}
                  <button className="btn-link" onClick={() => setShowNotifMenu(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="notif-dropdown-list">
                {notifications.length === 0 ? (
                  <p className="notif-empty">No notifications yet.</p>
                ) : (
                  notifications.slice(0, 5).map(n => (
                    <div 
                      key={n.id} 
                      className={`notif-dropdown-item ${!n.isRead ? 'unread' : ''}`}
                      onClick={() => markNotificationAsRead(n.id)}
                    >
                      <div className="notif-content">
                        <p>{n.message}</p>
                        <span className="notif-time">{new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {!n.isRead && <span className="notif-mark-dot" title="Unread"></span>}
                    </div>
                  ))
                )}
              </div>

              <div className="notif-dropdown-footer">
                <Link to="/notifications" onClick={() => setShowNotifMenu(false)}>
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        <div 
          className="user-profile" 
          onClick={() => {
            if (currentUser?.role === 'customer') navigate('/profile');
            else if (currentUser?.role === 'vendor') navigate('/business-profile');
            else navigate('/settings');
          }}
        >
          <div className="avatar">
            {currentUser?.avatar || currentUser?.logo ? (
              <img 
                src={currentUser?.avatar || currentUser?.logo} 
                alt="Avatar" 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : (
              <User size={20} />
            )}
          </div>
          <div className="user-info">
            <span className="user-name">{currentUser?.name || 'User'}</span>
            <span className="user-role">{roleLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

