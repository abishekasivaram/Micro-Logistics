import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import ConfirmationModal from './ConfirmationModal';
import { 
  LayoutDashboard, ShoppingBag, Package, Truck, Layers, Users, Bell, 
  Settings, HelpCircle, LogOut, Map, User, Navigation, Calendar, 
  Store, BarChart3, ShoppingCart, FileText, X, ChevronLeft, ChevronRight,
  Boxes, ShieldCheck, Activity, Cpu
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, setIsOpen, isCollapsed, toggleCollapse }) => {
  const { currentUser, setCurrentUser, cart, notifications } = useAppContext();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const role = currentUser?.role || 'admin'; 
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  const handleLinkClick = () => {
    if (setIsOpen) setIsOpen(false);
  };

  // Render Admin Grouped Links
  const renderAdminLinks = () => (
    <>
      {/* Overview */}
      <div className="nav-group">
        <div className="nav-group-title">Overview</div>
        <NavLink 
          to="/admin-dashboard" 
          className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
          title="Command Dashboard"
        >
          <div className="nav-icon-wrapper"><LayoutDashboard size={19} /></div>
          <span className="nav-label">Dashboard</span>
        </NavLink>
      </div>

      {/* Operations */}
      <div className="nav-group">
        <div className="nav-group-title">Operations</div>
        <NavLink 
          to="/admin/orders" 
          className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
          title="Central Orders"
        >
          <div className="nav-icon-wrapper"><ShoppingBag size={19} /></div>
          <span className="nav-label">Orders</span>
        </NavLink>
        <NavLink 
          to="/admin/order-aggregation" 
          className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
          title="Order Aggregation Hub"
        >
          <div className="nav-icon-wrapper"><Boxes size={19} /></div>
          <span className="nav-label">Aggregation Hub</span>
          <span className="nav-pill-pulse">AI</span>
        </NavLink>
        <NavLink 
          to="/admin/delivery-management" 
          className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
          title="Delivery Dispatch"
        >
          <div className="nav-icon-wrapper"><Truck size={19} /></div>
          <span className="nav-label">Delivery Batches</span>
        </NavLink>
        <NavLink 
          to="/admin/delivery-agents" 
          className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
          title="Delivery Fleet"
        >
          <div className="nav-icon-wrapper"><Navigation size={19} /></div>
          <span className="nav-label">Delivery Agents</span>
        </NavLink>
        <NavLink 
          to="/admin/routes" 
          className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
          title="Route Coordination"
        >
          <div className="nav-icon-wrapper"><Map size={19} /></div>
          <span className="nav-label">Routes Mesh</span>
        </NavLink>
      </div>

      {/* Network */}
      <div className="nav-group">
        <div className="nav-group-title">Network</div>
        <NavLink 
          to="/admin/sellers" 
          className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
          title="Seller Directory"
        >
          <div className="nav-icon-wrapper"><Store size={19} /></div>
          <span className="nav-label">Sellers</span>
        </NavLink>
        <NavLink 
          to="/admin/customers" 
          className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
          title="Customer Base"
        >
          <div className="nav-icon-wrapper"><Users size={19} /></div>
          <span className="nav-label">Customers</span>
        </NavLink>
      </div>

      {/* Intelligence & System */}
      <div className="nav-group">
        <div className="nav-group-title">Intelligence</div>
        <NavLink 
          to="/admin/analytics" 
          className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
          title="Telemetry & Analytics"
        >
          <div className="nav-icon-wrapper"><BarChart3 size={19} /></div>
          <span className="nav-label">Analytics</span>
        </NavLink>
        <NavLink 
          to="/admin/reports" 
          className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
          title="Export Reports"
        >
          <div className="nav-icon-wrapper"><FileText size={19} /></div>
          <span className="nav-label">Reports</span>
        </NavLink>
        <NavLink 
          to="/admin/notifications" 
          className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
          title="System Notifications"
        >
          <div className="nav-icon-wrapper"><Bell size={19} /></div>
          <span className="nav-label">Notifications</span>
          {unreadNotifCount > 0 && <span className="nav-badge">{unreadNotifCount}</span>}
        </NavLink>
        <NavLink 
          to="/admin/settings" 
          className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
          title="System Settings"
        >
          <div className="nav-icon-wrapper"><Settings size={19} /></div>
          <span className="nav-label">Settings</span>
        </NavLink>
      </div>
    </>
  );

  // Render Customer Links
  const renderCustomerLinks = () => (
    <div className="nav-group">
      <NavLink to="/customer-dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Dashboard">
        <div className="nav-icon-wrapper"><LayoutDashboard size={19} /></div>
        <span className="nav-label">Dashboard</span>
      </NavLink>
      <NavLink to="/browse-sellers" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Browse Sellers">
        <div className="nav-icon-wrapper"><Store size={19} /></div>
        <span className="nav-label">Browse Sellers</span>
      </NavLink>
      <NavLink to="/products" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Products">
        <div className="nav-icon-wrapper"><Package size={19} /></div>
        <span className="nav-label">Products</span>
      </NavLink>
      <NavLink to="/cart" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Cart">
        <div className="nav-icon-wrapper"><ShoppingCart size={19} /></div>
        <span className="nav-label">Cart</span>
        {cartItemCount > 0 && <span className="nav-badge">{cartItemCount}</span>}
      </NavLink>
      <NavLink to="/orders" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="My Orders">
        <div className="nav-icon-wrapper"><ShoppingBag size={19} /></div>
        <span className="nav-label">My Orders</span>
      </NavLink>
      <NavLink to="/track-delivery" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Track Delivery">
        <div className="nav-icon-wrapper"><Navigation size={19} /></div>
        <span className="nav-label">Track Delivery</span>
      </NavLink>
      <NavLink to="/delivery-schedule" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Delivery Schedule">
        <div className="nav-icon-wrapper"><Calendar size={19} /></div>
        <span className="nav-label">Delivery Schedule</span>
      </NavLink>
      <NavLink to="/notifications" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Notifications">
        <div className="nav-icon-wrapper"><Bell size={19} /></div>
        <span className="nav-label">Notifications</span>
        {unreadNotifCount > 0 && <span className="nav-badge">{unreadNotifCount}</span>}
      </NavLink>
      <NavLink to="/profile" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Profile">
        <div className="nav-icon-wrapper"><User size={19} /></div>
        <span className="nav-label">Profile</span>
      </NavLink>
    </div>
  );

  // Render Vendor Links
  const renderVendorLinks = () => (
    <div className="nav-group">
      <NavLink to="/vendor-dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Dashboard">
        <div className="nav-icon-wrapper"><LayoutDashboard size={19} /></div>
        <span className="nav-label">Dashboard</span>
      </NavLink>
      <NavLink to="/products" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Products">
        <div className="nav-icon-wrapper"><Package size={19} /></div>
        <span className="nav-label">Products</span>
      </NavLink>
      <NavLink to="/orders" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Orders">
        <div className="nav-icon-wrapper"><ShoppingBag size={19} /></div>
        <span className="nav-label">Orders</span>
      </NavLink>
      <NavLink to="/seller-analytics" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Analytics">
        <div className="nav-icon-wrapper"><BarChart3 size={19} /></div>
        <span className="nav-label">Analytics</span>
      </NavLink>
      <NavLink to="/business-profile" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Business Profile">
        <div className="nav-icon-wrapper"><Store size={19} /></div>
        <span className="nav-label">Business Profile</span>
      </NavLink>
      <NavLink to="/notifications" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Notifications">
        <div className="nav-icon-wrapper"><Bell size={19} /></div>
        <span className="nav-label">Notifications</span>
      </NavLink>
    </div>
  );

  // Render Delivery Partner Links
  const renderDeliveryPartnerLinks = () => (
    <div className="nav-group">
      <NavLink to="/delivery-dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Dashboard">
        <div className="nav-icon-wrapper"><LayoutDashboard size={19} /></div>
        <span className="nav-label">Dashboard</span>
      </NavLink>
      <NavLink to="/delivery/deliveries" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="My Deliveries">
        <div className="nav-icon-wrapper"><Package size={19} /></div>
        <span className="nav-label">My Deliveries</span>
      </NavLink>
      <NavLink to="/delivery/pickup" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Pickup">
        <div className="nav-icon-wrapper"><Store size={19} /></div>
        <span className="nav-label">Pickup</span>
      </NavLink>
      <NavLink to="/delivery/route" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Route">
        <div className="nav-icon-wrapper"><Navigation size={19} /></div>
        <span className="nav-label">Route</span>
      </NavLink>
      <NavLink to="/delivery/status" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Status">
        <div className="nav-icon-wrapper"><Truck size={19} /></div>
        <span className="nav-label">Status</span>
      </NavLink>
      <NavLink to="/delivery/history" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="History">
        <div className="nav-icon-wrapper"><FileText size={19} /></div>
        <span className="nav-label">History</span>
      </NavLink>
      <NavLink to="/delivery/notifications" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Notifications">
        <div className="nav-icon-wrapper"><Bell size={19} /></div>
        <span className="nav-label">Notifications</span>
        {unreadNotifCount > 0 && <span className="nav-badge">{unreadNotifCount}</span>}
      </NavLink>
      <NavLink to="/delivery/profile" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Profile">
        <div className="nav-icon-wrapper"><User size={19} /></div>
        <span className="nav-label">Profile</span>
      </NavLink>
    </div>
  );

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-row">
          <div className="brand-badge-icon">
            <Boxes size={22} className="brand-icon-svg" />
            <div className="brand-pulse-dot" />
          </div>
          
          {!isCollapsed && (
            <div className="brand-text-block">
              <div className="brand-name-title">MicroLogi</div>
              <div className="brand-tagline">
                <span className="status-live-dot" />
                CONTROL TOWER
              </div>
            </div>
          )}

          {/* Mobile close button */}
          <button 
            className="mobile-close-btn" 
            onClick={() => setIsOpen(false)} 
            aria-label="Close sidebar menu"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      
      {/* Navigation Sections */}
      <nav className="sidebar-nav" onClick={handleLinkClick}>
        {role === 'admin' && renderAdminLinks()}
        {role === 'customer' && renderCustomerLinks()}
        {role === 'vendor' && renderVendorLinks()}
        {role === 'delivery_partner' && renderDeliveryPartnerLinks()}

        {/* Bottom Utility Actions */}
        <div className="nav-bottom-group">
          <div className="nav-divider"></div>
          {role !== 'admin' && role !== 'delivery_partner' && (
            <>
              <NavLink to="/settings" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Settings">
                <div className="nav-icon-wrapper"><Settings size={18} /></div>
                <span className="nav-label">Settings</span>
              </NavLink>
              <NavLink to="/help" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Help & Support">
                <div className="nav-icon-wrapper"><HelpCircle size={18} /></div>
                <span className="nav-label">Help & Support</span>
              </NavLink>
            </>
          )}

          {role === 'delivery_partner' && (
            <NavLink to="/delivery/help" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} title="Help">
              <div className="nav-icon-wrapper"><HelpCircle size={18} /></div>
              <span className="nav-label">Help</span>
            </NavLink>
          )}

          <button onClick={handleLogoutClick} className="nav-item nav-logout-btn" title="Sign Out">
            <div className="nav-icon-wrapper"><LogOut size={18} /></div>
            <span className="nav-label">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Collapse Toggle Footer */}
      <div className="sidebar-footer">
        <button 
          className="collapse-toggle-btn" 
          onClick={toggleCollapse} 
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : (
            <>
              <ChevronLeft size={18} />
              <span className="collapse-text">Collapse Navigation</span>
            </>
          )}
        </button>
      </div>
      {/* Professional Logout Warning Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out of Control Tower?"
        message="Are you sure you want to end your active session? You will be returned to the secure login gateway."
        subjectName={currentUser?.name || currentUser?.shopName || 'System Administrator'}
        subjectInfo={`Active Account: ${currentUser?.email || 'admin@micrologi.com'} | Role: ${role.toUpperCase()}`}
        confirmText="Confirm Sign Out"
        cancelText="Stay Logged In"
        variant="danger"
        badgeText="SECURITY PROTOCOL"
        icon={LogOut}
      />
    </aside>
  );
};

export default Sidebar;
