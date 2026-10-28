import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  ShoppingBag, Truck, Clock, Package, AlertTriangle, 
  MapPin, Plus, Store, Bell, ArrowRight,
  ShieldCheck, Info, BellOff, ChevronRight
} from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import './DashboardOverview.css';

const DEFAULT_SELLER_NOTIFICATIONS = [
  {
    id: 'sn-0',
    title: 'Low Stock Alert: Aashirvaad Atta',
    message: 'You have 2 units of Aashirvaad Atta left in inventory. Restock soon to avoid fulfillment delays.',
    type: 'alert',
    date: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    isRead: false
  },
  {
    id: 'sn-1',
    title: 'New Customer Order #ORD-1001',
    message: 'Order ORD-1001 was placed by Priya Rajan (2x items, ₹89.00). Packing SLA target is 15 minutes.',
    type: 'order',
    date: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    isRead: false
  },
  {
    id: 'sn-2',
    title: 'Batch Dispatch Assigned to Courier',
    message: 'Batch #B-8041 has been assigned to driver David Anand for scheduled courier pickup.',
    type: 'delivery',
    date: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    isRead: false
  },
  {
    id: 'sn-3',
    title: 'New Customer Order #ORD-1002',
    message: 'Sivakumar R placed an order for Ponni Boiled Rice (₹320.00). Stage ready for driver pickup.',
    type: 'order',
    date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isRead: true
  }
];

const getTimeAgo = (dateStr) => {
  if (!dateStr) return 'Just now';
  const d = new Date(dateStr);
  const diff = Math.floor((new Date() - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const DashboardOverview = () => {
  const { 
    orders = [], 
    notifications: contextNotifications = [],
    currentUser, 
    updateSellerProfile,
    authLoading 
  } = useAppContext();
  const navigate = useNavigate();

  const [isStoreClosedModalOpen, setIsStoreClosedModalOpen] = useState(false);
  const [storeStatus, setStoreStatus] = useState(currentUser?.isOpen !== false);

  const sellerId = currentUser?.role === 'vendor' ? currentUser.id : null;

  // Filter orders for this seller (admins see all orders)
  const sellerOrders = useMemo(() => {
    return orders.filter(o => 
      currentUser?.role === 'admin' || 
      (sellerId && (o.vendorId === sellerId || o.vendor_id === sellerId))
    );
  }, [orders, currentUser, sellerId]);

  const getStatus = (o) => (o.orderStatus || o.status || 'PLACED').toUpperCase();

  // 1. Pending Orders: Waiting for seller action or confirmation
  const pendingOrdersCount = useMemo(() => {
    return sellerOrders.filter(o => ['PLACED', 'PENDING', 'NEW'].includes(getStatus(o))).length;
  }, [sellerOrders]);

  // 2. Orders in Progress: Packing, item prep, or store processing
  const inProgressOrdersCount = useMemo(() => {
    return sellerOrders.filter(o => ['PREPARING', 'CONFIRMED'].includes(getStatus(o))).length;
  }, [sellerOrders]);

  // 3. Orders to Deliver: Ready for pickup, awaiting courier assignment, or handover
  const toDeliverOrdersCount = useMemo(() => {
    return sellerOrders.filter(o => ['READY_FOR_DELIVERY', 'READY'].includes(getStatus(o))).length;
  }, [sellerOrders]);

  // 4. Total Orders: All lifetime orders handled
  const totalOrdersCount = sellerOrders.length;

  // Recent notifications (latest 3-5)
  const recentNotifications = useMemo(() => {
    const combined = contextNotifications && contextNotifications.length > 0
      ? contextNotifications
      : DEFAULT_SELLER_NOTIFICATIONS;
    return combined.slice(0, 5);
  }, [contextNotifications]);

  const unreadCount = useMemo(() => {
    return recentNotifications.filter(n => !n.isRead).length;
  }, [recentNotifications]);

  const toggleStatus = (targetOpen) => {
    if (!targetOpen) {
      setIsStoreClosedModalOpen(true);
    } else {
      setStoreStatus(true);
      if (updateSellerProfile) {
        updateSellerProfile({ isOpen: true });
      }
    }
  };

  const confirmCloseStore = () => {
    setStoreStatus(false);
    if (updateSellerProfile) {
      updateSellerProfile({ isOpen: false });
    }
    setIsStoreClosedModalOpen(false);
  };

  const shopName = currentUser?.shopName || currentUser?.name || 'Namma Chennai Naturals';
  const shopLocation = currentUser?.area 
    ? `${currentUser.area}, Chennai` 
    : (currentUser?.address ? (currentUser.address.includes('Chennai') ? currentUser.address : `${currentUser.address}, Chennai`) : 'T. Nagar Hub, Chennai');

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingBag size={16} className="notif-type-icon order" />;
      case 'delivery':
        return <Truck size={16} className="notif-type-icon delivery" />;
      case 'alert':
      case 'warning':
        return <AlertTriangle size={16} className="notif-type-icon alert" />;
      default:
        return <Info size={16} className="notif-type-icon system" />;
    }
  };

  if (authLoading) {
    return (
      <div className="seller-dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading seller dashboard...</p>
      </div>
    );
  }

  return (
    <div className="seller-dashboard-page">
      {/* ─── 1. Compact Seller Information Header ───────────────────────── */}
      <header className="seller-header-card">
        <div className="seller-identity-block">
          <div className="seller-avatar-badge">
            <Store size={26} />
          </div>

          <div className="seller-title-column">
            <div className="seller-tags-row">
              <span className="seller-verification-badge">
                <ShieldCheck size={13} /> Verified Merchant
              </span>
              <span className="seller-location-pill">
                <MapPin size={11} /> {shopLocation}
              </span>
            </div>
            <h1 className="seller-store-name">{shopName}</h1>
          </div>
        </div>

        <div className="seller-header-actions">
          {/* Open / Closed Store Toggle */}
          <div className="store-status-toggle-wrap">
            <button 
              className={`status-toggle-btn ${storeStatus ? 'active open' : ''}`}
              onClick={() => toggleStatus(true)}
              type="button"
              title="Store is active and receiving customer orders"
            >
              <span className="status-dot-indicator open" /> Open for Orders
            </button>
            <button 
              className={`status-toggle-btn ${!storeStatus ? 'active closed' : ''}`}
              onClick={() => toggleStatus(false)}
              type="button"
              title="Pause store to halt incoming order dispatch"
            >
              <span className="status-dot-indicator closed" /> Store Paused
            </button>
          </div>

          {/* Add Product Button */}
          <button 
            className="btn-add-product"
            onClick={() => navigate('/seller/products')}
            title="Add a new item to your store catalog"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </header>

      {/* ─── 2. Four Essential Summary Cards ───────────────────────────── */}
      <section className="seller-summary-grid">
        {/* Card 1: Pending Orders */}
        <div 
          className="seller-summary-card pending"
          onClick={() => navigate('/seller/orders')}
          role="button"
          tabIndex={0}
          title="Click to view pending orders needing action"
        >
          <div className="summary-card-top">
            <span className="summary-card-label">Pending Orders</span>
            <div className="summary-icon-box pending">
              <Clock size={20} />
            </div>
          </div>
          <div className="summary-card-count">{pendingOrdersCount}</div>
          <div className="summary-card-footer">
            <span className="summary-card-subtext">Waiting for store confirmation</span>
            <span className="summary-card-link">View <ChevronRight size={14} /></span>
          </div>
        </div>

        {/* Card 2: Orders in Progress */}
        <div 
          className="seller-summary-card in-progress"
          onClick={() => navigate('/seller/orders')}
          role="button"
          tabIndex={0}
          title="Click to view orders currently being packed"
        >
          <div className="summary-card-top">
            <span className="summary-card-label">Orders in Progress</span>
            <div className="summary-icon-box in-progress">
              <Package size={20} />
            </div>
          </div>
          <div className="summary-card-count">{inProgressOrdersCount}</div>
          <div className="summary-card-footer">
            <span className="summary-card-subtext">Packing & item preparation</span>
            <span className="summary-card-link">View <ChevronRight size={14} /></span>
          </div>
        </div>

        {/* Card 3: Orders to Deliver */}
        <div 
          className="seller-summary-card to-deliver"
          onClick={() => navigate('/seller/deliveries')}
          role="button"
          tabIndex={0}
          title="Click to view orders ready for courier pickup & handover"
        >
          <div className="summary-card-top">
            <span className="summary-card-label">Orders to Deliver</span>
            <div className="summary-icon-box to-deliver">
              <Truck size={20} />
            </div>
          </div>
          <div className="summary-card-count">{toDeliverOrdersCount}</div>
          <div className="summary-card-footer">
            <span className="summary-card-subtext">Ready for pickup & courier handover</span>
            <span className="summary-card-link">View <ChevronRight size={14} /></span>
          </div>
        </div>

        {/* Card 4: Total Orders */}
        <div 
          className="seller-summary-card total"
          onClick={() => navigate('/seller/orders')}
          role="button"
          tabIndex={0}
          title="Click to view complete order history"
        >
          <div className="summary-card-top">
            <span className="summary-card-label">Total Orders</span>
            <div className="summary-icon-box total">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="summary-card-count">{totalOrdersCount}</div>
          <div className="summary-card-footer">
            <span className="summary-card-subtext">Lifetime store fulfillments</span>
            <span className="summary-card-link">View <ChevronRight size={14} /></span>
          </div>
        </div>
      </section>

      {/* ─── 3. Recent Notifications Section ───────────────────────────── */}
      <section className="seller-notifications-card">
        <div className="notifications-header-row">
          <div className="notifications-title-group">
            <div className="notifications-icon-wrap">
              <Bell size={18} />
            </div>
            <div>
              <h2 className="notifications-title">Recent Notifications</h2>
              <p className="notifications-subtitle">Live store alerts, stock warnings, and courier milestones</p>
            </div>
            {unreadCount > 0 && (
              <span className="unread-counter-badge">{unreadCount} new</span>
            )}
          </div>

          <button 
            className="view-all-notifs-btn"
            onClick={() => navigate('/seller/notifications')}
            title="Go to the full Notifications page"
          >
            View All Notifications <ArrowRight size={14} />
          </button>
        </div>

        <div className="notifications-content">
          {recentNotifications.length === 0 ? (
            <div className="notifications-empty-box">
              <BellOff size={28} />
              <p className="empty-title">No new notifications.</p>
              <span className="empty-desc">Your store alerts, order updates, and delivery status logs will appear here in real time.</span>
            </div>
          ) : (
            <div className="notifications-list">
              {recentNotifications.map((notif, index) => (
                <div 
                  key={notif.id || index} 
                  className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                  onClick={() => navigate('/seller/notifications')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="notification-icon-col">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="notification-body">
                    <div className="notification-title-row">
                      <span className="notification-item-title">{notif.title || notif.message}</span>
                      <span className="notification-time">{getTimeAgo(notif.date || notif.createdAt)}</span>
                    </div>
                    {notif.title && notif.message && notif.title !== notif.message && (
                      <p className="notification-item-desc">{notif.message}</p>
                    )}
                  </div>
                  {!notif.isRead && <span className="notification-unread-dot" title="Unread" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Confirmation Modal for Store Pause */}
      <ConfirmationModal
        isOpen={isStoreClosedModalOpen}
        onClose={() => setIsStoreClosedModalOpen(false)}
        onConfirm={confirmCloseStore}
        title="Pause Store Operations?"
        message="Pausing your store stops new incoming customer orders from being routed to your packing counter. Existing active orders will remain in progress."
        confirmText="Confirm Pause"
        cancelText="Keep Open"
        type="warning"
      />
    </div>
  );
};

export default DashboardOverview;
