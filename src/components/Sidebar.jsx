import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Truck, Layers, Users, Bell, Settings, HelpCircle, LogOut, Map } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>MicroLogi</h1>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section">
          <NavLink to="/dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/orders" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <ShoppingBag size={20} />
            <span>Orders</span>
          </NavLink>
          <NavLink to="/products" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Package size={20} />
            <span>Products</span>
          </NavLink>
          <NavLink to="/inventory" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Layers size={20} />
            <span>Inventory</span>
          </NavLink>
          <NavLink to="/deliveries" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Truck size={20} />
            <span>Deliveries</span>
          </NavLink>
          <NavLink to="/order-aggregation" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Map size={20} />
            <span>Order Aggregation</span>
          </NavLink>
          <NavLink to="/customers" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            <span>Customers</span>
          </NavLink>
          <NavLink to="/notifications" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Bell size={20} />
            <span>Notifications</span>
          </NavLink>
        </div>

        <div className="nav-divider"></div>

        <div className="nav-section">
          <NavLink to="/settings" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
          <NavLink to="/help" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <HelpCircle size={20} />
            <span>Help & Support</span>
          </NavLink>
          <NavLink to="/login" className="nav-item text-danger mt-auto">
            <LogOut size={20} />
            <span>Logout</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
