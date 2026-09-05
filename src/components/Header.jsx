import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-greeting">
        <h2>Good morning, Vendor 👋</h2>
        <p>Here's what's happening with your deliveries today.</p>
      </div>

      <div className="header-actions">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search orders, products..." />
        </div>

        <button className="icon-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <div className="user-profile">
          <div className="avatar">
            <User size={20} />
          </div>
          <div className="user-info">
            <span className="user-name">Fresh Mart</span>
            <span className="user-role">Vendor</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
