import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  ShoppingBag, Truck, CheckCircle, Clock, Package, AlertTriangle, 
  DollarSign, MapPin, ChevronRight, TrendingUp, Copy, Check, Plus, 
  ArrowUpRight, Flame, Store, Sparkles, Navigation, Eye, ExternalLink,
  ShieldCheck, ArrowRight, Zap, RefreshCw, UserCheck
} from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import OrderDetailsModal from '../../components/common/OrderDetailsModal';
import './DashboardOverview.css';

const DashboardOverview = () => {
  const { orders = [], currentUser, updateSellerProfile, updateOrderStatus } = useAppContext();
  const navigate = useNavigate();

  const [isStoreClosedModalOpen, setIsStoreClosedModalOpen] = useState(false);
  const [storeStatus, setStoreStatus] = useState(currentUser?.isOpen !== false);
  const [copiedId, setCopiedId] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [copiedOrderId, setCopiedOrderId] = useState(null);

  const sellerId = currentUser?.role === 'vendor' ? currentUser.id : 'v1';
  const displayId = sellerId.length > 12 ? `${sellerId.slice(0, 8)}...${sellerId.slice(-4)}` : sellerId;

  // Filter orders for this seller
  const sellerOrders = orders.filter(o => currentUser?.role === 'admin' || o.vendorId === sellerId);
  const totalOrders = sellerOrders.length;
  
  const getStatus = (o) => (o.orderStatus || o.status || 'PLACED').toUpperCase();

  const newOrders = sellerOrders.filter(o => ['PLACED', 'PENDING', 'NEW'].includes(getStatus(o))).length;
  const readyOrders = sellerOrders.filter(o => ['READY_FOR_DELIVERY', 'READY'].includes(getStatus(o))).length;
  const completedOrders = sellerOrders.filter(o => ['DELIVERED', 'COMPLETED'].includes(getStatus(o))).length;
  const todayRevenue = sellerOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const handleCopyId = () => {
    navigator.clipboard.writeText(sellerId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyOrderId = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const getCustomerInitials = (name, index = 0) => {
    if (!name || name.toLowerCase() === 'customer' || name.toLowerCase() === 'priyarajan') {
      const sampleInitials = ['PR', 'KM', 'AK', 'DS'];
      return sampleInitials[index % sampleInitials.length];
    }
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const formatCustomerName = (name, index = 0) => {
    if (!name || name.toLowerCase() === 'customer' || name.toLowerCase() === 'priyarajan') {
      const sampleNames = ['Priya Rajan', 'Kavitha Mohan', 'Arun Kumar', 'Deepak Soundar'];
      return sampleNames[index % sampleNames.length];
    }
    return name
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const toggleStatus = (targetOpen) => {
    if (!targetOpen) {
      setIsStoreClosedModalOpen(true);
    } else {
      setStoreStatus(true);
      updateSellerProfile({ isOpen: true });
    }
  };

  const confirmCloseStore = () => {
    setStoreStatus(false);
    updateSellerProfile({ isOpen: false });
    setIsStoreClosedModalOpen(false);
  };

  // Active orders in flight needing seller attention
  const rawActionableOrders = sellerOrders
    .filter(o => !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(getStatus(o)));

  const actionableOrders = rawActionableOrders.length > 0 ? rawActionableOrders : sellerOrders.slice(0, 3);

  const packingCount = actionableOrders.filter(o => ['PLACED', 'PENDING', 'NEW', 'PREPARING', 'CONFIRMED'].includes(getStatus(o))).length;
  const readyCount = actionableOrders.filter(o => ['READY_FOR_DELIVERY', 'READY'].includes(getStatus(o))).length;
  const transitCount = actionableOrders.filter(o => ['ASSIGNED', 'OUT_FOR_DELIVERY', 'IN_TRANSIT'].includes(getStatus(o))).length;

  const filteredOrders = actionableOrders.filter(o => {
    const s = getStatus(o);
    if (orderFilter === 'PACKING') return ['PLACED', 'PENDING', 'NEW', 'PREPARING', 'CONFIRMED'].includes(s);
    if (orderFilter === 'READY') return ['READY_FOR_DELIVERY', 'READY'].includes(s);
    if (orderFilter === 'TRANSIT') return ['ASSIGNED', 'OUT_FOR_DELIVERY', 'IN_TRANSIT'].includes(s);
    return true;
  });

  return (
    <div className="seller-dashboard-page">
      {/* Header Profile & Store Status Banner */}
      <div className="seller-header-card">
        <div className="seller-identity-block">
          <div className="seller-avatar-badge">
            <Store size={26} strokeWidth={2.2} />
          </div>
          <div className="seller-title-column">
            <div className="seller-tags-row">
              <span className="seller-role-pill">Verified Merchant</span>
              <div className="seller-id-chip" onClick={handleCopyId} title="Click to copy Store ID">
                ID: {displayId} {copiedId ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
              </div>
              <span className="seller-location-pill">
                <MapPin size={11} /> RS Puram East Hub
              </span>
            </div>
            <h1 className="seller-store-name">
              {currentUser?.shopName || currentUser?.name || 'Kannan Dept Store'}
            </h1>
          </div>
        </div>

        {/* Live Operational Ticker */}
        <div className="seller-telemetry-ticker">
          <div className="ticker-item">
            <span className="ticker-label">Fleet Status</span>
            <span className="ticker-val active">
              <span className="pulse-dot"></span> AI Pooled (Live)
            </span>
          </div>
          <div className="ticker-divider"></div>
          <div className="ticker-item">
            <span className="ticker-label">Hours Today</span>
            <span className="ticker-val">07:00 AM – 10:00 PM</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="seller-header-actions">
          {/* Store Open / Closed Switch */}
          <div className="store-status-toggle-wrap">
            <button 
              className={`status-toggle-btn ${storeStatus ? 'active open' : ''}`}
              onClick={() => toggleStatus(true)}
              title="Store is online and accepting incoming customer orders"
            >
              <span className="status-dot-indicator open"></span>
              Accepting Orders
            </button>
            <button 
              className={`status-toggle-btn ${!storeStatus ? 'active closed' : ''}`}
              onClick={() => toggleStatus(false)}
              title="Pause incoming orders temporarily"
            >
              <span className="status-dot-indicator closed"></span>
              Paused
            </button>
          </div>

          <button 
            className="orders-action-btn primary"
            onClick={() => navigate('/seller/products')}
          >
            <Plus size={15} /> Add Product
          </button>
        </div>
      </div>

      {/* KPI Bento Grid (5 cleanly balanced cards) */}
      <div className="seller-kpi-grid">
        <div className="seller-kpi-card" onClick={() => navigate('/seller/analytics')}>
          <div className="kpi-top-row">
            <div className="kpi-icon-wrap" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
              <DollarSign size={20} />
            </div>
            <span className="kpi-delta-pill positive">
              <ArrowUpRight size={12} /> +14.2%
            </span>
          </div>
          <div className="kpi-value-block">
            <div className="kpi-main-number">
              ₹{todayRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div className="kpi-metric-title">Gross Volume (Today)</div>
          </div>
          <div className="kpi-subtext">Direct seller disbursements</div>
        </div>

        <div className="seller-kpi-card" onClick={() => navigate('/seller/orders')}>
          <div className="kpi-top-row">
            <div className="kpi-icon-wrap" style={{ background: '#fef3c7', color: '#b45309' }}>
              <ShoppingBag size={20} />
            </div>
            <span className="kpi-delta-pill positive">{completedOrders} Fulfilled</span>
          </div>
          <div className="kpi-value-block">
            <div className="kpi-main-number">{totalOrders}</div>
            <div className="kpi-metric-title">Total Orders Handled</div>
          </div>
          <div className="kpi-subtext">{totalOrders - completedOrders} in active fulfillment</div>
        </div>

        <div className="seller-kpi-card" onClick={() => navigate('/seller/orders')}>
          <div className="kpi-top-row">
            <div className="kpi-icon-wrap" style={{ background: '#fee2e2', color: '#dc2626' }}>
              <Flame size={20} />
            </div>
            {newOrders > 0 ? (
              <span className="kpi-delta-pill warning">⚡ Action Needed</span>
            ) : (
              <span className="kpi-delta-pill positive">✓ All Clear</span>
            )}
          </div>
          <div className="kpi-value-block">
            <div className="kpi-main-number">{newOrders}</div>
            <div className="kpi-metric-title">Incoming / Needs Prep</div>
          </div>
          <div className="kpi-subtext">Awaiting kitchen confirmation</div>
        </div>

        <div className="seller-kpi-card" onClick={() => navigate('/seller/orders')}>
          <div className="kpi-top-row">
            <div className="kpi-icon-wrap" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <Package size={20} />
            </div>
            <span className="kpi-delta-pill neutral">Awaiting Driver</span>
          </div>
          <div className="kpi-value-block">
            <div className="kpi-main-number">{readyOrders}</div>
            <div className="kpi-metric-title">Ready for Pickup</div>
          </div>
          <div className="kpi-subtext">Packed and staged at counter</div>
        </div>

        <div className="seller-kpi-card" onClick={() => navigate('/seller/orders')}>
          <div className="kpi-top-row">
            <div className="kpi-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
              <CheckCircle size={20} />
            </div>
            <span className="kpi-delta-pill positive">Target Met</span>
          </div>
          <div className="kpi-value-block">
            <div className="kpi-main-number">98.4%</div>
            <div className="kpi-metric-title">On-Time Handover SLA</div>
          </div>
          <div className="kpi-subtext">Optimal fulfillment velocity</div>
        </div>
      </div>

      {/* Main Two-Column Layout: Active Orders Feed on Left, Store Intel on Right */}
      <div className="seller-main-layout">
        {/* Left Column: Live Orders Feed */}
        <div className="live-orders-feed-card">
          <div className="feed-header-panel">
            <div className="feed-header-left">
              <div className="feed-header-badge-row">
                <span className="live-radar-badge">
                  <span className="live-radar-dot" /> LIVE DISPATCH
                </span>
                <span className="live-orders-count-pill">
                  {actionableOrders.length} In Progress
                </span>
              </div>
              <h3 className="section-card-title">
                <ShoppingBag size={20} color="var(--primary)" />
                Active Orders In-Flight
              </h3>
              <p className="feed-subtitle">
                Real-time queue synchronized with AI route clustering & courier handover.
              </p>
            </div>

            <button 
              className="view-all-hub-btn"
              onClick={() => navigate('/seller/orders')}
              title="Open full dedicated orders management portal"
            >
              <span>Full Orders Hub</span>
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Quick Filter Segmented Pills */}
          <div className="feed-filter-bar">
            <button
              className={`filter-tab-pill ${orderFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setOrderFilter('ALL')}
            >
              All Active ({actionableOrders.length})
            </button>
            <button
              className={`filter-tab-pill ${orderFilter === 'PACKING' ? 'active' : ''}`}
              onClick={() => setOrderFilter('PACKING')}
            >
              <Package size={12} /> Prep & Pack ({packingCount})
            </button>
            <button
              className={`filter-tab-pill ${orderFilter === 'READY' ? 'active' : ''}`}
              onClick={() => setOrderFilter('READY')}
            >
              <CheckCircle size={12} /> Ready at Hub ({readyCount})
            </button>
            <button
              className={`filter-tab-pill ${orderFilter === 'TRANSIT' ? 'active' : ''}`}
              onClick={() => setOrderFilter('TRANSIT')}
            >
              <Truck size={12} /> In Transit ({transitCount})
            </button>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="feed-empty-state">
              <div className="feed-empty-icon">
                <CheckCircle size={32} color="#059669" />
              </div>
              <div className="feed-empty-title">
                {orderFilter === 'ALL' ? 'All Live Orders Completed!' : `No Orders in ${orderFilter} Stage`}
              </div>
              <p className="feed-empty-desc">
                {orderFilter === 'ALL' 
                  ? 'Your packing counter is completely clear. New incoming orders will alert here in real-time.' 
                  : 'There are no active orders matching this filter stage right now. Switch tabs to see other orders.'}
              </p>
            </div>
          ) : (
            <div className="feed-items-list">
              {filteredOrders.map((order, idx) => {
                const status = getStatus(order);
                const displayCode = (order.id || '').slice(-8).toUpperCase();
                const itemsCount = (order.items || []).reduce((acc, i) => acc + (i.qty || i.quantity || 1), 0);
                const firstItemName = order.items?.[0]?.name || order.items?.[0]?.product?.name || 'Aavin Green Milk 500ml';
                const customerDisplayName = formatCustomerName(order.customerName, idx);
                const customerInitials = getCustomerInitials(order.customerName, idx);

                const isPending = ['PLACED', 'PENDING', 'NEW'].includes(status);
                const isPreparing = ['PREPARING', 'CONFIRMED'].includes(status);
                const isReady = ['READY_FOR_DELIVERY', 'READY'].includes(status);
                const isTransit = ['ASSIGNED', 'OUT_FOR_DELIVERY', 'IN_TRANSIT'].includes(status);

                const isStep1Done = true;
                const isStep2Done = isReady || isTransit;
                const isStep2Active = isPreparing || isPending;
                const isStep3Done = isTransit;
                const isStep3Active = isReady;

                // Color themes for avatars
                const avatarGradients = [
                  'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                  'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)'
                ];
                const avatarBg = avatarGradients[idx % avatarGradients.length];

                return (
                  <div key={order.id || idx} className="feed-order-card">
                    {/* Top Identity & Status Bar */}
                    <div className="order-card-header">
                      <div className="customer-avatar-box" style={{ background: avatarBg }}>
                        <span className="customer-initials">{customerInitials}</span>
                        <span className={`customer-online-dot ${isTransit ? 'transit' : isReady ? 'ready' : 'active'}`} />
                      </div>

                      <div className="order-customer-info">
                        <div className="order-id-customer-row">
                          <span 
                            className="order-id-badge" 
                            onClick={(e) => handleCopyOrderId(e, order.id || displayCode)}
                            title="Click to copy Order ID"
                          >
                            #{displayCode} {copiedOrderId === (order.id || displayCode) ? <Check size={10} color="#10b981" /> : <Copy size={10} />}
                          </span>
                          <h4 className="order-customer-name">{customerDisplayName}</h4>
                          <span className="order-vip-chip">
                            <Sparkles size={11} /> {idx === 0 ? 'Priority SLA' : 'Standard 20m'}
                          </span>
                        </div>

                        <div className="order-destination-row">
                          <span className="order-destination-text">
                            <MapPin size={12} /> {order.deliveryAddress || '142 D.B. Road, RS Puram, Coimbatore'}
                          </span>
                          <span className="dot-sep">•</span>
                          <span className="order-slot-pill">
                            <Clock size={11} /> {order.deliveryTimeSlot || '10:00 AM – 1:00 PM'}
                          </span>
                        </div>
                      </div>

                      <div className="order-header-status-col">
                        {isTransit && (
                          <span className="order-status-badge transit">
                            <Truck size={12} className="pulse-icon" /> In Transit
                          </span>
                        )}
                        {isReady && (
                          <span className="order-status-badge ready">
                            <CheckCircle size={12} /> Ready for Pickup
                          </span>
                        )}
                        {isPreparing && (
                          <span className="order-status-badge preparing">
                            <Package size={12} /> Packing Items
                          </span>
                        )}
                        {isPending && (
                          <span className="order-status-badge pending">
                            <Clock size={12} /> Order Placed
                          </span>
                        )}

                        <div className="order-amount-tag">
                          ₹{(order.total || 44).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Items & Stepper */}
                    <div className="order-card-body">
                      <div className="order-items-preview-strip">
                        <div className="order-item-chip">
                          <Package size={13} color="var(--primary)" />
                          <span className="item-name-bold">{itemsCount}x {firstItemName}</span>
                          {order.items?.length > 1 && (
                            <span className="item-extra-count">+{order.items.length - 1} more items</span>
                          )}
                        </div>
                        <span className="payment-mode-pill">
                          <Check size={11} color="#059669" /> UPI Verified
                        </span>
                      </div>

                      {/* 3-Step Milestone Stepper */}
                      <div className="order-stepper-track">
                        <div className={`step-node ${isStep1Done ? 'completed' : 'current'}`}>
                          <span className="step-circle">{isStep1Done ? <Check size={11} /> : '1'}</span>
                          <span className="step-label">Order Confirmed</span>
                        </div>
                        <div className={`step-connector ${isStep2Done ? 'active' : ''}`} />
                        <div className={`step-node ${isStep2Done ? 'completed' : isStep2Active ? 'current' : 'pending'}`}>
                          <span className="step-circle">{isStep2Done ? <Check size={11} /> : '2'}</span>
                          <span className="step-label">Store Packaging</span>
                        </div>
                        <div className={`step-connector ${isStep3Done ? 'active' : ''}`} />
                        <div className={`step-node ${isStep3Done ? 'completed' : isStep3Active ? 'current' : 'pending'}`}>
                          <span className="step-circle">{isStep3Done ? <Truck size={11} /> : '3'}</span>
                          <span className="step-label">Courier Handover</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Fleet Info & Quick Actions */}
                    <div className="order-card-footer">
                      <div className="fleet-assignment-info">
                        {isTransit ? (
                          <div className="rider-assigned-pill">
                            <div className="rider-avatar-circle">
                              <Truck size={12} />
                            </div>
                            <span className="rider-text">
                              Courier: <strong>S. Rajesh</strong> (4.9 ★) • Vehicle: <strong>Hero Electric</strong>
                            </span>
                          </div>
                        ) : isReady ? (
                          <div className="ready-counter-pill">
                            <CheckCircle size={13} color="#059669" />
                            <span>Staged at: <strong>Counter Bay 2 (Ground Floor)</strong></span>
                          </div>
                        ) : (
                          <div className="prep-time-pill">
                            <Clock size={13} color="#d97706" />
                            <span>Target SLA: <strong>15 mins buffer</strong></span>
                          </div>
                        )}
                      </div>

                      <div className="order-card-actions">
                        {isPending && (
                          <button 
                            className="card-action-btn primary start-prep"
                            onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                          >
                            <Package size={13} /> Start Packing
                          </button>
                        )}

                        {isPreparing && (
                          <button 
                            className="card-action-btn primary mark-ready"
                            onClick={() => updateOrderStatus(order.id, 'READY_FOR_DELIVERY')}
                          >
                            <CheckCircle size={13} /> Mark Ready
                          </button>
                        )}

                        {isReady && (
                          <button 
                            className="card-action-btn primary handover"
                            onClick={() => updateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}
                          >
                            <Truck size={13} /> Handover to Courier
                          </button>
                        )}

                        {isTransit && (
                          <button 
                            className="card-action-btn secondary track"
                            onClick={() => navigate('/seller/deliveries')}
                            title="Open Live Fleet Tracking"
                          >
                            <Navigation size={13} /> Track Courier
                          </button>
                        )}

                        <button 
                          className="card-action-btn secondary slip"
                          onClick={() => setSelectedOrder(order)}
                          title="View order receipt & packing list"
                        >
                          <Eye size={13} /> Order Slip
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* AI Batch Aggregation & Fleet Telemetry Card */}
          <div className="ai-clustering-summary-card">
            <div className="ai-cluster-left">
              <div className="ai-cluster-icon-box">
                <Sparkles size={20} />
              </div>
              <div className="ai-cluster-text-col">
                <div className="ai-cluster-title-row">
                  <span className="ai-cluster-headline">MicroLogi AI Batch Aggregation Active</span>
                  <span className="ai-cluster-badge">Real-Time Routing</span>
                </div>
                <p className="ai-cluster-explanation">
                  Orders in the RS Puram delivery sector are dynamically pooled onto aggregated courier runs with neighborhood grocers, slashing delivery transit times by <strong>35%</strong> and boosting packing throughput.
                </p>
              </div>
            </div>

            <div className="ai-cluster-metrics">
              <div className="cluster-stat-pill">
                <span className="stat-label">Batch Density</span>
                <span className="stat-val">{actionableOrders.length} Orders Pooled</span>
              </div>
              <div className="cluster-stat-pill">
                <span className="stat-label">Prep Velocity</span>
                <span className="stat-val highlight">4.8 min avg</span>
              </div>
              <div className="cluster-stat-pill">
                <span className="stat-label">Nearby Fleet</span>
                <span className="stat-val green">3 Live Couriers</span>
              </div>
            </div>
          </div>
        </div>


        {/* Right Column: Alerts & Telemetry */}
        <div className="seller-side-column">
          {/* Smart Alerts & Notifications */}
          <div className="smart-alerts-card">
            <div className="section-card-title">
              <AlertTriangle size={18} color="#d97706" /> Store Alerts & Intel
            </div>

            <div className="alerts-scroll-list">
              <div className="alert-row-item">
                <div className="alert-icon-box" style={{ background: '#fee2e2', color: '#dc2626' }}>
                  <Package size={15} />
                </div>
                <div className="alert-main-text">
                  <div className="alert-item-title">Critical Stock Warning</div>
                  <div className="alert-item-desc">Aashirvaad Atta is down to 2 units in inventory.</div>
                  <div className="alert-item-time">5 minutes ago</div>
                </div>
              </div>

              <div className="alert-row-item">
                <div className="alert-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
                  <TrendingUp size={15} />
                </div>
                <div className="alert-main-text">
                  <div className="alert-item-title">Surge in RS Puram</div>
                  <div className="alert-item-desc">Order density in your delivery radius spiked +24% today.</div>
                  <div className="alert-item-time">45 minutes ago</div>
                </div>
              </div>

              <div className="alert-row-item">
                <div className="alert-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
                  <Clock size={15} />
                </div>
                <div className="alert-main-text">
                  <div className="alert-item-title">Target SLA Maintained</div>
                  <div className="alert-item-desc">Orders packed and dispatched consistently on schedule.</div>
                  <div className="alert-item-time">2 hours ago</div>
                </div>
              </div>
            </div>

            <button 
              className="view-all-link"
              style={{ marginTop: 'auto', paddingTop: '10px' }}
              onClick={() => navigate('/seller/notifications')}
            >
              View all store notifications <ChevronRight size={14} />
            </button>
          </div>

          {/* Top Delivery Zones */}
          <div className="telemetry-card">
            <h3 className="section-card-title">
              <MapPin size={18} color="var(--primary)" /> Top Delivery Zones
            </h3>

            <div className="zone-meter-list">
              <div className="zone-meter-item">
                <div className="zone-label-row">
                  <span>RS Puram</span>
                  <span>38 Orders (42%)</span>
                </div>
                <div className="zone-track-bg">
                  <div className="zone-progress-fill" style={{ width: '85%', background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }}></div>
                </div>
              </div>

              <div className="zone-meter-item">
                <div className="zone-label-row">
                  <span>Gandhipuram</span>
                  <span>24 Orders (26%)</span>
                </div>
                <div className="zone-track-bg">
                  <div className="zone-progress-fill" style={{ width: '60%', background: '#0284c7' }}></div>
                </div>
              </div>

              <div className="zone-meter-item">
                <div className="zone-label-row">
                  <span>Saibaba Colony</span>
                  <span>16 Orders (18%)</span>
                </div>
                <div className="zone-track-bg">
                  <div className="zone-progress-fill" style={{ width: '42%', background: '#059669' }}></div>
                </div>
              </div>

              <div className="zone-meter-item">
                <div className="zone-label-row">
                  <span>Peelamedu</span>
                  <span>12 Orders (14%)</span>
                </div>
                <div className="zone-track-bg">
                  <div className="zone-progress-fill" style={{ width: '30%', background: '#d97706' }}></div>
                </div>
              </div>
            </div>

            <div className="fleet-status-banner">
              <div className="fleet-status-title">
                ⚡ High Fleet Availability
              </div>
              <div className="fleet-status-desc">
                3 delivery agents are actively circulating in RS Puram sector.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Store Close */}
      <ConfirmationModal
        isOpen={isStoreClosedModalOpen}
        onClose={() => setIsStoreClosedModalOpen(false)}
        onConfirm={confirmCloseStore}
        title="Pause Store Orders?"
        message="Are you sure you want to stop receiving new orders on the customer app? Any active orders already in progress will still require fulfillment."
        confirmText="Yes, Pause Store"
        cancelText="Keep Open"
        variant="danger"
      />

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
};

export default DashboardOverview;
