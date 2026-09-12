import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  LayoutDashboard, ShoppingBag, Package, Truck, Layers, Users, Bell, 
  Settings, HelpCircle, LogOut, Map, User, Navigation, Calendar, 
  Store, BarChart3, ShoppingCart, FileText
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { currentUser, setCurrentUser, cart, notifications } = useAppContext();
  const navigate = useNavigate();
  const role = currentUser?.role || 'vendor'; 
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = (e) => {
    e.preventDefault();
    setCurrentUser(null);
    navigate('/login');
  };

  // Render Admin Links (12 Complete Items)
  const renderAdminLinks = () => (
    <>
      <NavLink to="/admin-dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/admin/sellers" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Store size={20} />
        <span>Sellers</span>
      </NavLink>
      <NavLink to="/admin/customers" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Users size={20} />
        <span>Customers</span>
      </NavLink>
      <NavLink to="/admin/orders" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <ShoppingBag size={20} />
        <span>Orders</span>
      </NavLink>
      <NavLink to="/admin/order-aggregation" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Map size={20} />
        <span>Order Aggregation</span>
      </NavLink>
      <NavLink to="/admin/delivery-management" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Truck size={20} />
        <span>Delivery Management</span>
      </NavLink>
      <NavLink to="/admin/delivery-agents" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Navigation size={20} />
        <span>Delivery Agents</span>
      </NavLink>
      <NavLink to="/admin/routes" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Layers size={20} />
        <span>Routes / Coordination</span>
      </NavLink>
      <NavLink to="/admin/notifications" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Bell size={20} />
        <span>Notifications</span>
        {unreadNotifCount > 0 && <span className="nav-badge">{unreadNotifCount}</span>}
      </NavLink>
      <NavLink to="/admin/analytics" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <BarChart3 size={20} />
        <span>Analytics</span>
      </NavLink>
      <NavLink to="/admin/reports" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <FileText size={20} />
        <span>Reports</span>
      </NavLink>
      <NavLink to="/admin/settings" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Settings size={20} />
        <span>Settings</span>
      </NavLink>
    </>
  );

  // Render Customer Links
  const renderCustomerLinks = () => (
    <>
      <NavLink to="/customer-dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/browse-sellers" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Store size={20} />
        <span>Browse Sellers</span>
      </NavLink>
      <NavLink to="/products" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Package size={20} />
        <span>Products</span>
      </NavLink>
      <NavLink to="/cart" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <ShoppingCart size={20} />
        <span>Cart</span>
        {cartItemCount > 0 && <span className="nav-badge">{cartItemCount}</span>}
      </NavLink>
      <NavLink to="/orders" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <ShoppingBag size={20} />
        <span>My Orders</span>
      </NavLink>
      <NavLink to="/track-delivery" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Navigation size={20} />
        <span>Track Delivery</span>
      </NavLink>
      <NavLink to="/delivery-schedule" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Calendar size={20} />
        <span>Delivery Schedule</span>
      </NavLink>
      <NavLink to="/notifications" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Bell size={20} />
        <span>Notifications</span>
      </NavLink>
      <NavLink to="/profile" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <User size={20} />
        <span>Profile</span>
      </NavLink>
    </>
  );

  // Render Seller / Vendor Links
  const renderVendorLinks = () => (
    <>
      <NavLink to="/vendor-dashboard" className={({isActive}) => `nav-item ${isActive || window.location.pathname === '/dashboard' ? 'active' : ''}`}>
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/products" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Package size={20} />
        <span>Products</span>
      </NavLink>
      <NavLink to="/orders" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <ShoppingBag size={20} />
        <span>Orders</span>
      </NavLink>
      <NavLink to="/deliveries" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Truck size={20} />
        <span>Delivery Coordination</span>
      </NavLink>
      <NavLink to="/order-aggregation" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Map size={20} />
        <span>Aggregation Status</span>
      </NavLink>
      <NavLink to="/seller-analytics" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <BarChart3 size={20} />
        <span>Analytics</span>
      </NavLink>
      <NavLink to="/business-profile" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Store size={20} />
        <span>Business Profile</span>
      </NavLink>
      <NavLink to="/notifications" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
        <Bell size={20} />
        <span>Notifications</span>
      </NavLink>
    </>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>MicroLogi</h1>
        <span style={{ fontSize: '12px', opacity: 0.8, display: 'block', textTransform: 'capitalize' }}>
          {role === 'vendor' ? 'Seller Panel' : `${role} Panel`}
        </span>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section">
          {role === 'admin' && renderAdminLinks()}
          {role === 'customer' && renderCustomerLinks()}
          {role === 'vendor' && renderVendorLinks()}
        </div>

        <div className="nav-divider"></div>

        <div className="nav-section">
          {role !== 'admin' && (
            <>
              <NavLink to="/settings" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                <Settings size={20} />
                <span>Settings</span>
              </NavLink>
              <NavLink to="/help" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                <HelpCircle size={20} />
                <span>Help & Support</span>
              </NavLink>
            </>
          )}
          <Link to="/login" onClick={handleLogout} className="nav-item text-danger mt-auto">
            <LogOut size={20} />
            <span>Logout</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
