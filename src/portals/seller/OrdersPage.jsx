import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  ShoppingBag, Search, Clock, CheckCircle2, ChevronRight, 
  Printer, ArrowRight, ChefHat, Truck, MapPin, AlertCircle, 
  Copy, Check, Sparkles, Filter, X, Eye, PackageCheck
} from 'lucide-react';
import './OrdersPage.css';

const SellerOrdersPage = () => {
  const { orders, currentUser, updateOrderStatus, deliveryBatches = [] } = useAppContext();

  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState(null);

  // Scoped to seller
  const sellerId = currentUser?.role === 'vendor' ? currentUser.id : null;
  const sellerOrders = orders.filter(o => {
    if (currentUser?.role === 'admin') return true;
    if (sellerId) return o.vendorId === sellerId;
    return true; // demo view
  });

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getOrderStatus = (o) => (o.orderStatus || o.status || 'PLACED').toUpperCase();

  // Tab counts
  const placedCount = sellerOrders.filter(o => ['PLACED', 'PENDING', 'NEW'].includes(getOrderStatus(o))).length;
  const prepCount = sellerOrders.filter(o => ['PREPARING', 'CONFIRMED'].includes(getOrderStatus(o))).length;
  const readyCount = sellerOrders.filter(o => ['READY_FOR_DELIVERY', 'READY'].includes(getOrderStatus(o))).length;
  const outCount = sellerOrders.filter(o => ['ASSIGNED', 'OUT_FOR_DELIVERY', 'IN_TRANSIT'].includes(getOrderStatus(o))).length;
  const deliveredCount = sellerOrders.filter(o => ['DELIVERED', 'COMPLETED'].includes(getOrderStatus(o))).length;

  const filteredOrders = sellerOrders.filter(o => {
    const status = getOrderStatus(o);
    const orderId = (o.id || o.orderId || '').toLowerCase();
    const customer = (o.customerName || '').toLowerCase();
    const matchesSearch = orderId.includes(searchTerm.toLowerCase()) || customer.includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'NEW') return ['PLACED', 'PENDING', 'NEW'].includes(status);
    if (activeTab === 'PREPARING') return ['PREPARING', 'CONFIRMED'].includes(status);
    if (activeTab === 'READY') return ['READY_FOR_DELIVERY', 'READY'].includes(status);
    if (activeTab === 'OUT') return ['ASSIGNED', 'OUT_FOR_DELIVERY', 'IN_TRANSIT'].includes(status);
    if (activeTab === 'DELIVERED') return ['DELIVERED', 'COMPLETED'].includes(status);
    return true;
  });

  // Calculate elapsed time from mock or real timestamp
  const getElapsedMinutes = (order) => {
    if (order.createdAt) {
      const diff = Math.floor((new Date() - new Date(order.createdAt)) / 60000);
      return Math.max(1, diff);
    }
    // Stable pseudo-random based on id
    const num = (order.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (num % 25) + 3;
  };

  const advanceOrderStatus = (order) => {
    const current = getOrderStatus(order);
    if (['PLACED', 'PENDING', 'NEW'].includes(current)) {
      updateOrderStatus(order.id, 'PREPARING');
    } else if (['PREPARING', 'CONFIRMED'].includes(current)) {
      updateOrderStatus(order.id, 'READY_FOR_DELIVERY');
    } else if (['READY_FOR_DELIVERY', 'READY'].includes(current)) {
      updateOrderStatus(order.id, 'OUT_FOR_DELIVERY');
    }
  };

  return (
    <div className="seller-orders-page">
      {/* Header */}
      <div className="orders-header-row">
        <div className="orders-title-group">
          <div className="orders-title-badge">
            <ShoppingBag size={12} /> Live Orders & Dispatch
          </div>
          <h1 className="orders-title">Store Orders Management</h1>
          <p className="orders-subtitle">
            Track incoming customer requests, fulfill store items, and coordinate delivery handovers.
          </p>
        </div>

        <div className="orders-header-actions">
          <button 
            className="orders-action-btn"
            onClick={() => window.print()}
            title="Print Orders Summary"
          >
            <Printer size={15} /> Print Summary
          </button>
        </div>
      </div>

      {/* AI Aggregation Alert */}
      {placedCount > 0 && (
        <div className="batch-sync-banner">
          <div className="batch-sync-content">
            <div className="batch-sync-icon">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="batch-sync-title">AI Route Aggregation Active</div>
              <div className="batch-sync-desc">
                {placedCount} pending order(s) will be automatically combined with nearby merchant pickups to save up to 40% dispatch cost.
              </div>
            </div>
          </div>
          <button 
            className="orders-action-btn primary"
            onClick={() => setActiveTab('NEW')}
          >
            Fulfill Pending ({placedCount})
          </button>
        </div>
      )}

      {/* Pipeline Status Tabs */}
      <div className="orders-pipeline-tabs">
        <button 
          className={`pipeline-tab ${activeTab === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALL')}
        >
          All Orders <span className="pipeline-badge">{sellerOrders.length}</span>
        </button>
        <button 
          className={`pipeline-tab ${placedCount > 0 ? 'urgent' : ''} ${activeTab === 'NEW' ? 'active' : ''}`}
          onClick={() => setActiveTab('NEW')}
        >
          New Orders <span className="pipeline-badge">{placedCount}</span>
        </button>
        <button 
          className={`pipeline-tab ${activeTab === 'PREPARING' ? 'active' : ''}`}
          onClick={() => setActiveTab('PREPARING')}
        >
          Packing / In Prep <span className="pipeline-badge">{prepCount}</span>
        </button>
        <button 
          className={`pipeline-tab ${activeTab === 'READY' ? 'active' : ''}`}
          onClick={() => setActiveTab('READY')}
        >
          Ready for Pickup <span className="pipeline-badge">{readyCount}</span>
        </button>
        <button 
          className={`pipeline-tab ${activeTab === 'OUT' ? 'active' : ''}`}
          onClick={() => setActiveTab('OUT')}
        >
          Out with Partner <span className="pipeline-badge">{outCount}</span>
        </button>
        <button 
          className={`pipeline-tab ${activeTab === 'DELIVERED' ? 'active' : ''}`}
          onClick={() => setActiveTab('DELIVERED')}
        >
          Delivered <span className="pipeline-badge">{deliveredCount}</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="orders-toolbar">
        <div className="orders-search-box">
          <Search size={16} className="orders-search-icon" />
          <input 
            type="text" 
            className="orders-search-input"
            placeholder="Search by order ID, customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="orders-filter-group">
          <select className="orders-select" defaultValue="ALL">
            <option value="ALL">All Delivery Slots</option>
            <option value="MORNING">Morning (9 AM - 12 PM)</option>
            <option value="AFTERNOON">Afternoon (12 PM - 4 PM)</option>
            <option value="EVENING">Evening (4 PM - 8 PM)</option>
          </select>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="orders-empty-state">
          <div className="orders-empty-icon">
            <ShoppingBag size={28} />
          </div>
          <h3 className="orders-empty-title">No orders match this filter</h3>
          <p className="orders-empty-desc">
            {searchTerm 
              ? `No orders matching "${searchTerm}". Try another search keyword.`
              : 'There are currently no orders in this fulfillment stage.'}
          </p>
          {searchTerm && (
            <button 
              className="orders-action-btn"
              onClick={() => setSearchTerm('')}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map(order => {
            const status = getOrderStatus(order);
            const elapsed = getElapsedMinutes(order);
            const isUrgent = ['PLACED', 'PENDING', 'NEW'].includes(status) && elapsed > 10;
            const items = order.items || [];
            const displayCode = (order.id || order.orderId || 'ORD').slice(-8).toUpperCase();

            // Status Styling
            let cardClass = 'order-card';
            let badgeClass = 'order-status-badge';
            let statusLabel = status;

            if (['PLACED', 'PENDING', 'NEW'].includes(status)) {
              cardClass += isUrgent ? ' urgent' : '';
              badgeClass += ' status-badge-placed';
              statusLabel = 'Needs Prep';
            } else if (['PREPARING', 'CONFIRMED'].includes(status)) {
              cardClass += ' preparing';
              badgeClass += ' status-badge-preparing';
              statusLabel = 'In Packing';
            } else if (['READY_FOR_DELIVERY', 'READY'].includes(status)) {
              cardClass += ' ready';
              badgeClass += ' status-badge-ready';
              statusLabel = 'Ready for Driver';
            } else if (['DELIVERED', 'COMPLETED'].includes(status)) {
              cardClass += ' delivered';
              badgeClass += ' status-badge-delivered';
              statusLabel = 'Completed';
            }

            return (
              <div key={order.id} className={cardClass}>
                {/* Header */}
                <div className="order-card-header">
                  <div className="order-id-group">
                    <div 
                      className="order-id-code"
                      onClick={() => handleCopyId(order.id)}
                      title="Click to copy full Order ID"
                    >
                      #{displayCode}
                      {copiedId === order.id ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                    </div>
                    <div className="order-time-stamp">
                      <Clock size={12} />
                      {elapsed} mins ago
                      {isUrgent && <span style={{ color: '#ef4444', fontWeight: '700', marginLeft: '4px' }}>⚡ RUSH</span>}
                    </div>
                  </div>

                  <span className={badgeClass}>
                    {statusLabel}
                  </span>
                </div>

                {/* Customer Row */}
                <div className="order-customer-row">
                  <div className="customer-avatar">
                    {(order.customerName || 'C').charAt(0)}
                  </div>
                  <div className="customer-details">
                    <div className="customer-name">{order.customerName || 'Customer'}</div>
                    <div className="customer-address">
                      <MapPin size={11} />
                      {order.deliveryAddress || order.deliveryLocation || 'RS Puram, Coimbatore'}
                    </div>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="order-items-list">
                  {items.length === 0 ? (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>1x Standard Grocery Pack</div>
                  ) : (
                    items.map((item, idx) => (
                      <div key={idx} className="order-item-row">
                        <div className="order-item-desc">
                          <span className="order-item-qty">{item.qty || item.quantity || 1}x</span>
                          <span>{item.name || item.product?.name || `Item #${idx+1}`}</span>
                        </div>
                        <div className="order-item-price">
                          ₹{(item.price || item.product?.price || 0) * (item.qty || item.quantity || 1)}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* AI Batch Info */}
                {order.batchId ? (
                  <div className="order-batch-tag">
                    <Truck size={12} color="var(--primary)" />
                    Assigned to Batch #{order.batchId.slice(-6).toUpperCase()}
                  </div>
                ) : (
                  <div className="order-batch-tag">
                    <Sparkles size={12} color="#8b5cf6" />
                    Pooled in Micro-Batch (Pending Driver)
                  </div>
                )}

                {/* Footer Action */}
                <div className="order-footer-row">
                  <div className="order-total-block">
                    <span className="order-total-label">Total Amount</span>
                    <span className="order-total-amount">
                      ₹{(order.total || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="order-action-buttons">
                    <button 
                      className="btn-view-slip"
                      onClick={() => setSelectedOrderForSlip(order)}
                      title="View Kitchen Order Ticket / Packing Slip"
                    >
                      <Printer size={15} />
                    </button>

                    {/* Progression Workflow */}
                    {['PLACED', 'PENDING', 'NEW'].includes(status) && (
                      <button 
                        className="btn-status-advance btn-start-prep"
                        onClick={() => advanceOrderStatus(order)}
                      >
                        <ChefHat size={14} /> Start Prep
                      </button>
                    )}

                    {['PREPARING', 'CONFIRMED'].includes(status) && (
                      <button 
                        className="btn-status-advance btn-mark-ready"
                        onClick={() => advanceOrderStatus(order)}
                      >
                        <CheckCircle2 size={14} /> Mark Ready
                      </button>
                    )}

                    {['READY_FOR_DELIVERY', 'READY'].includes(status) && (
                      <button 
                        className="btn-status-advance btn-handover"
                        onClick={() => advanceOrderStatus(order)}
                      >
                        <Truck size={14} /> Handover
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Kitchen Ticket / Packing Slip Modal */}
      {selectedOrderForSlip && (
        <div className="slip-overlay" onClick={() => setSelectedOrderForSlip(null)}>
          <div className="slip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="slip-header">
              <div className="slip-title">
                <Printer size={18} /> Kitchen Packing Ticket
              </div>
              <button 
                className="btn-view-slip"
                onClick={() => setSelectedOrderForSlip(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="slip-body">
              <div className="slip-receipt-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #cbd5e1', paddingBottom: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>{currentUser?.shopName || 'Store Order'}</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Micro-Logistics Network</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontWeight: '700', fontSize: '13px' }}>
                      #{selectedOrderForSlip.id.slice(-8).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Slot: {selectedOrderForSlip.deliveryTimeSlot || 'Standard'}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '13px' }}>
                  <strong>Customer:</strong> {selectedOrderForSlip.customerName || 'Local Resident'}<br />
                  <strong>Address:</strong> {selectedOrderForSlip.deliveryAddress || 'Coimbatore'}
                </div>

                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
                  <div style={{ fontWeight: '700', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Itemized Checklist
                  </div>
                  {(selectedOrderForSlip.items || []).map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
                      <span>[  ] {item.qty || 1}x {item.name || item.product?.name || `Item ${i+1}`}</span>
                      <span>₹{((item.price || item.product?.price || 0) * (item.qty || 1)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '15px' }}>
                  <span>Total Amount</span>
                  <span>₹{(selectedOrderForSlip.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="slip-footer">
              <button 
                className="orders-action-btn"
                onClick={() => setSelectedOrderForSlip(null)}
              >
                Close
              </button>
              <button 
                className="orders-action-btn primary"
                onClick={() => window.print()}
              >
                <Printer size={14} /> Print Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrdersPage;
