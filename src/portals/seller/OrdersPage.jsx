import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  ShoppingBag, Search, Clock, CheckCircle2, ChevronRight, 
  Printer, ArrowRight, ChefHat, Truck, MapPin, AlertCircle, 
  Copy, Check, Sparkles, Filter, X, Eye, PackageCheck,
  ShieldCheck, CheckCheck, ArrowUpDown, UserCheck
} from 'lucide-react';
import { resolveOrderAddress, getAssignedCourier } from './sellerUtils';
import './OrdersPage.css';

const SellerOrdersPage = () => {
  const { orders, customers = [], currentUser, updateOrderStatus, deliveryBatches = [], deliveryAgents = [] } = useAppContext();

  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('LIFECYCLE');
  const [slotFilter, setSlotFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState(null);
  const [handoverModalOrder, setHandoverModalOrder] = useState(null);

  // Scoped to seller
  const sellerId = currentUser?.role === 'vendor' ? currentUser.id : null;
  const sellerOrders = orders.filter(o => {
    if (currentUser?.role === 'admin') return true;
    if (sellerId) return o.vendorId === sellerId || o.vendor_id === sellerId;
    return true; // demo view
  });

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getOrderStatus = (o) => (o.orderStatus || o.status || 'PLACED').toUpperCase();

  // Determine the exact granular lifecycle stage of each order
  const getOrderLifecycle = (order) => {
    const status = getOrderStatus(order);
    const delivStatus = (order.rawDeliveryStatus || order.deliveryStatus || '').toUpperCase();
    const courier = getAssignedCourier(order, deliveryBatches, deliveryAgents);

    if (['DELIVERED', 'COMPLETED'].includes(status)) {
      return { stage: 'DELIVERED', label: 'Delivered', courier };
    }
    if (['OUT_FOR_DELIVERY', 'IN_TRANSIT'].includes(status)) {
      return { stage: 'DISPATCHED', label: 'Dispatched (In Transit)', courier };
    }
    if (delivStatus.includes('PICKED_UP') || delivStatus.includes('HANDED')) {
      return { stage: 'HANDED_OVER', label: 'Handover Confirmed', courier };
    }
    if (['READY_FOR_DELIVERY', 'READY', 'ASSIGNED'].includes(status)) {
      if (courier) {
        return { stage: 'ASSIGNED_READY', label: 'Ready for Handover', courier };
      }
      return { stage: 'AWAITING_ASSIGNMENT', label: 'Ready for Handover', courier: null };
    }
    if (['PREPARING', 'CONFIRMED'].includes(status)) {
      return { stage: 'PREPARING', label: 'Preparing', courier: null };
    }
    return { stage: 'NEW', label: 'Needs Prep', courier: null };
  };

  // Tab counts
  const placedCount = sellerOrders.filter(o => getOrderLifecycle(o).stage === 'NEW').length;
  const prepCount = sellerOrders.filter(o => getOrderLifecycle(o).stage === 'PREPARING').length;
  const readyCount = sellerOrders.filter(o => ['AWAITING_ASSIGNMENT', 'ASSIGNED_READY'].includes(getOrderLifecycle(o).stage)).length;
  const handedOverCount = sellerOrders.filter(o => getOrderLifecycle(o).stage === 'HANDED_OVER').length;
  const dispatchedCount = sellerOrders.filter(o => getOrderLifecycle(o).stage === 'DISPATCHED').length;
  const deliveredCount = sellerOrders.filter(o => getOrderLifecycle(o).stage === 'DELIVERED').length;

  const filteredOrders = sellerOrders.filter(o => {
    const lifecycle = getOrderLifecycle(o);
    const orderId = (o.id || o.orderId || '').toLowerCase();
    const customer = (o.customerName || '').toLowerCase();
    const matchesSearch = orderId.includes(searchTerm.toLowerCase()) || customer.includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Delivery slot filter
    if (slotFilter !== 'ALL') {
      const slot = (o.deliveryTimeSlot || o.deliverySlot || '').toUpperCase();
      if (slotFilter === 'MORNING' && !slot.includes('9') && !slot.includes('MORNING')) return false;
      if (slotFilter === 'AFTERNOON' && !slot.includes('12') && !slot.includes('1') && !slot.includes('AFTERNOON')) return false;
      if (slotFilter === 'EVENING' && !slot.includes('4') && !slot.includes('EVENING')) return false;
    }

    if (activeTab === 'NEW') return lifecycle.stage === 'NEW';
    if (activeTab === 'PREPARING') return lifecycle.stage === 'PREPARING';
    if (activeTab === 'READY') return ['AWAITING_ASSIGNMENT', 'ASSIGNED_READY'].includes(lifecycle.stage);
    if (activeTab === 'HANDED_OVER') return lifecycle.stage === 'HANDED_OVER';
    if (activeTab === 'DISPATCHED') return lifecycle.stage === 'DISPATCHED';
    if (activeTab === 'DELIVERED') return lifecycle.stage === 'DELIVERED';
    return true;
  });

  // Calculate elapsed time from mock or real timestamp
  const getElapsedMinutes = (order) => {
    if (!order) return 5;
    const rawDate = order.createdAt || order.date || order.created_at;
    if (rawDate) {
      const diff = Math.floor((new Date() - new Date(rawDate)) / 60000);
      return Math.max(1, isNaN(diff) ? 5 : diff);
    }
    const num = String(order.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (num % 25) + 3;
  };

  // Stage rank for workflow-based sorting: Prep -> Mark Ready -> Handover Confirmed -> Dispatched -> Delivered
  const getStageRank = (order) => {
    if (!order) return 8;
    const lifecycle = getOrderLifecycle(order);
    switch (lifecycle.stage) {
      case 'NEW': return 1;                  // Needs Prep
      case 'PREPARING': return 2;            // Preparing / In Packing
      case 'ASSIGNED_READY': return 3;       // Ready & Courier Assigned (Immediate Handover Action)
      case 'AWAITING_ASSIGNMENT': return 4;  // Ready, Awaiting Admin Assignment
      case 'HANDED_OVER': return 5;          // Handed over at counter, awaiting driver route departure
      case 'DISPATCHED': return 6;           // Dispatched & In Transit
      case 'DELIVERED': return 7;            // Delivered
      default: return 8;
    }
  };

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'LIFECYCLE') {
      const rankA = getStageRank(a);
      const rankB = getStageRank(b);
      if (rankA !== rankB) return rankA - rankB;
      return getElapsedMinutes(b) - getElapsedMinutes(a);
    }
    if (sortBy === 'URGENT') {
      return getElapsedMinutes(b) - getElapsedMinutes(a);
    }
    if (sortBy === 'NEWEST') {
      const timeA = new Date(a.createdAt || a.date || a.created_at || 0).getTime();
      const timeB = new Date(b.createdAt || b.date || b.created_at || 0).getTime();
      return timeB - timeA;
    }
    if (sortBy === 'AMOUNT') {
      return (Number(b.total) || 0) - (Number(a.total) || 0);
    }
    return 0;
  });

  const advanceOrderStatus = (order, targetStatus = null) => {
    const current = getOrderStatus(order);
    if (targetStatus) {
      updateOrderStatus(order.id, targetStatus);
      return;
    }
    if (['PLACED', 'PENDING', 'NEW'].includes(current)) {
      updateOrderStatus(order.id, 'PREPARING');
    } else if (['PREPARING', 'CONFIRMED'].includes(current)) {
      updateOrderStatus(order.id, 'READY_FOR_DELIVERY');
    } else if (['READY_FOR_DELIVERY', 'READY', 'ASSIGNED'].includes(current)) {
      updateOrderStatus(order.id, 'PICKED_UP');
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
            Track customer requests, prepare store packages, verify courier handovers, and monitor dispatches.
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
            Start Preparing ({placedCount})
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
          Needs Prep <span className="pipeline-badge">{placedCount}</span>
        </button>
        <button 
          className={`pipeline-tab ${activeTab === 'PREPARING' ? 'active' : ''}`}
          onClick={() => setActiveTab('PREPARING')}
        >
          Preparing <span className="pipeline-badge">{prepCount}</span>
        </button>
        <button 
          className={`pipeline-tab ${activeTab === 'READY' ? 'active' : ''}`}
          onClick={() => setActiveTab('READY')}
        >
          Ready for Handover <span className="pipeline-badge">{readyCount}</span>
        </button>
        <button 
          className={`pipeline-tab ${activeTab === 'HANDED_OVER' ? 'active' : ''}`}
          onClick={() => setActiveTab('HANDED_OVER')}
        >
          Handover Confirmed <span className="pipeline-badge">{handedOverCount}</span>
        </button>
        <button 
          className={`pipeline-tab ${activeTab === 'DISPATCHED' ? 'active' : ''}`}
          onClick={() => setActiveTab('DISPATCHED')}
        >
          Dispatched <span className="pipeline-badge">{dispatchedCount}</span>
        </button>
        <button 
          className={`pipeline-tab ${activeTab === 'DELIVERED' ? 'active' : ''}`}
          onClick={() => setActiveTab('DELIVERED')}
        >
          Delivered <span className="pipeline-badge">{deliveredCount}</span>
        </button>
      </div>

      {/* Toolbar with Search and Sorting */}
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

        <div className="orders-filter-group" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select 
            className="orders-select" 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            title="Sort order fulfillment sequence"
          >
            <option value="LIFECYCLE">Sort: Prep → Ready → Handover → Dispatched</option>
            <option value="URGENT">Sort: Most Urgent First</option>
            <option value="NEWEST">Sort: Newest Orders</option>
            <option value="AMOUNT">Sort: Total Amount (High to Low)</option>
          </select>

          <select 
            className="orders-select" 
            value={slotFilter}
            onChange={(e) => setSlotFilter(e.target.value)}
          >
            <option value="ALL">All Delivery Slots</option>
            <option value="MORNING">Morning (9 AM - 12 PM)</option>
            <option value="AFTERNOON">Afternoon (12 PM - 4 PM)</option>
            <option value="EVENING">Evening (4 PM - 8 PM)</option>
          </select>
        </div>
      </div>

      {/* Orders Grid */}
      {sortedOrders.length === 0 ? (
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
          {sortedOrders.map((order, orderIdx) => {
            const lifecycle = getOrderLifecycle(order);
            const elapsed = getElapsedMinutes(order);
            const isUrgent = lifecycle.stage === 'NEW' && elapsed > 10;
            const items = order.items || [];
            const displayCode = String(order.id || order.orderId || 'ORD').slice(-8).toUpperCase();
            const courier = lifecycle.courier;

            // Status Styling
            let cardClass = 'order-card';
            let badgeClass = 'order-status-badge';

            if (lifecycle.stage === 'NEW') {
              cardClass += isUrgent ? ' urgent' : '';
              badgeClass += ' status-badge-placed';
            } else if (lifecycle.stage === 'PREPARING') {
              cardClass += ' preparing';
              badgeClass += ' status-badge-preparing';
            } else if (lifecycle.stage === 'AWAITING_ASSIGNMENT' || lifecycle.stage === 'ASSIGNED_READY') {
              cardClass += ' ready';
              badgeClass += courier ? ' status-badge-assigned' : ' status-badge-ready';
            } else if (lifecycle.stage === 'HANDED_OVER') {
              cardClass += ' ready';
              badgeClass += ' status-badge-handed-over';
            } else if (lifecycle.stage === 'DISPATCHED') {
              cardClass += ' dispatched';
              badgeClass += ' status-badge-dispatched';
            } else if (lifecycle.stage === 'DELIVERED') {
              cardClass += ' delivered';
              badgeClass += ' status-badge-delivered';
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
                    {lifecycle.label}
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
                      {resolveOrderAddress(order, orderIdx, customers)}
                    </div>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="order-items-list">
                  {items.length === 0 ? (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>1x Standard Grocery Pack</div>
                  ) : (
                    items.map((item, itemIdx) => (
                      <div key={itemIdx} className="order-item-row">
                        <div className="order-item-desc">
                          <span className="order-item-qty">{item.qty || item.quantity || 1}x</span>
                          <span>{item.name || item.product?.name || `Item #${itemIdx+1}`}</span>
                        </div>
                        <div className="order-item-price">
                          ₹{((Number(item.price || item.product?.price) || 0) * (Number(item.qty || item.quantity) || 1)).toFixed(2)}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Delivery Assignment / Batch Info Tag */}
                {courier ? (
                  <div className="order-batch-tag courier-assigned">
                    <UserCheck size={12} color="#2563eb" />
                    <span>Courier: <strong>{courier}</strong></span>
                  </div>
                ) : order.batchId ? (
                  <div className="order-batch-tag awaiting-assignment">
                    <Clock size={12} color="#d97706" />
                    <span>Batch #{String(order.batchId).slice(-6).toUpperCase()} · Waiting for Driver Assignment</span>
                  </div>
                ) : (
                  <div className="order-batch-tag awaiting-assignment">
                    <Sparkles size={12} color="#8b5cf6" />
                    <span>Awaiting Admin Aggregation & Driver Assignment</span>
                  </div>
                )}

                {/* Footer Action */}
                <div className="order-footer-row">
                  <div className="order-total-block">
                    <span className="order-total-label">Total Amount</span>
                    <span className="order-total-amount">
                      ₹{Number(order.total || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="order-action-buttons">
                    <button 
                      className="btn-view-slip"
                      onClick={() => setSelectedOrderForSlip({ ...order, deliveryLocation: resolveOrderAddress(order, orderIdx, customers), deliveryAddress: resolveOrderAddress(order, orderIdx, customers) })}
                      title="View Kitchen Order Ticket / Packing Slip"
                    >
                      <Printer size={15} />
                    </button>

                    {/* Step 1: Start Preparing */}
                    {lifecycle.stage === 'NEW' && (
                      <button 
                        className="btn-status-advance btn-start-prep"
                        onClick={() => advanceOrderStatus(order, 'PREPARING')}
                        title="Start preparing and packing store items"
                      >
                        <ChefHat size={14} /> Start Preparing
                      </button>
                    )}

                    {/* Step 2: Mark Ready for Handover */}
                    {lifecycle.stage === 'PREPARING' && (
                      <button 
                        className="btn-status-advance btn-mark-ready"
                        onClick={() => advanceOrderStatus(order, 'READY_FOR_DELIVERY')}
                        title="Mark items as packed and ready for handover"
                      >
                        <CheckCircle2 size={14} /> Mark Ready for Handover
                      </button>
                    )}

                    {/* Step 3A: Ready for Handover — Waiting for Courier Assignment (DISABLED) */}
                    {lifecycle.stage === 'AWAITING_ASSIGNMENT' && (
                      <button 
                        className="btn-status-advance btn-handover is-disabled"
                        disabled
                        title="Handover is locked until Admin assigns a delivery person to this order"
                      >
                        <Clock size={14} /> Confirm Handover
                      </button>
                    )}

                    {/* Step 3B: Ready for Handover — Courier Assigned (ENABLED) */}
                    {lifecycle.stage === 'ASSIGNED_READY' && (
                      <button 
                        className="btn-status-advance btn-handover"
                        onClick={() => setHandoverModalOrder(order)}
                        title={`Handover to assigned courier: ${courier}`}
                      >
                        <Truck size={14} /> Confirm Handover
                      </button>
                    )}

                    {/* Step 4: Handover Confirmed (Awaiting Courier Route Departure) */}
                    {lifecycle.stage === 'HANDED_OVER' && (
                      <div className="order-dispatched-indicator is-handed-over" title="Handed over to courier at store. Awaiting courier route departure.">
                        <CheckCheck size={13} /> Handover Confirmed
                      </div>
                    )}

                    {/* Step 5: Dispatched / In Transit */}
                    {lifecycle.stage === 'DISPATCHED' && (
                      <div className="order-dispatched-indicator" title="Delivery partner has collected parcel and is out for delivery">
                        <Truck size={13} /> Dispatched
                      </div>
                    )}

                    {/* Step 6: Delivered */}
                    {lifecycle.stage === 'DELIVERED' && (
                      <div className="order-completed-indicator" title="Order successfully delivered to customer">
                        <CheckCircle2 size={13} /> Delivered
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Courier Handover Modal (Enabled only after delivery person is assigned) */}
      {handoverModalOrder && (
        <div className="slip-overlay" onClick={() => setHandoverModalOrder(null)}>
          <div className="handover-modal" onClick={(e) => e.stopPropagation()}>
            <div className="handover-modal-header">
              <div className="handover-modal-title">
                <Truck size={20} color="#059669" />
                <span>Confirm Courier Handover</span>
              </div>
              <button 
                className="btn-view-slip"
                onClick={() => setHandoverModalOrder(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="handover-modal-body">
              <div className="handover-alert-box">
                <ShieldCheck size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Delivery Person Physical Collection</strong>
                  <p>Confirm that you have physically handed over this parcel to the verified delivery partner.</p>
                </div>
              </div>

              <div className="handover-order-card">
                <div className="handover-order-row">
                  <span className="handover-label">Order Code:</span>
                  <span className="handover-val mono">#{String(handoverModalOrder.id || handoverModalOrder.orderId || '').slice(-8).toUpperCase()}</span>
                </div>
                <div className="handover-order-row">
                  <span className="handover-label">Assigned Courier:</span>
                  <span className="handover-val" style={{ color: '#2563eb', fontWeight: '800' }}>
                    {getAssignedCourier(handoverModalOrder, deliveryBatches, deliveryAgents) || 'Assigned Delivery Partner'}
                  </span>
                </div>
                <div className="handover-order-row">
                  <span className="handover-label">Customer:</span>
                  <span className="handover-val">{handoverModalOrder.customerName || 'Customer'}</span>
                </div>
                <div className="handover-order-row">
                  <span className="handover-label">Delivery Destination:</span>
                  <span className="handover-val">{resolveOrderAddress(handoverModalOrder, 0, customers)}</span>
                </div>
                <div className="handover-order-row">
                  <span className="handover-label">Items:</span>
                  <span className="handover-val">
                    {(handoverModalOrder.items || []).map(i => `${i.qty || 1}x ${i.name || i.product?.name || 'Item'}`).join(', ') || 'Standard Grocery Pack'}
                  </span>
                </div>
                <div className="handover-order-row">
                  <span className="handover-label">Total Amount:</span>
                  <span className="handover-val highlight">₹{Number(handoverModalOrder.total || 0).toFixed(2)}</span>
                </div>
                {handoverModalOrder.batchId && (
                  <div className="handover-order-row">
                    <span className="handover-label">Batch Code:</span>
                    <span className="handover-val mono">Batch #{String(handoverModalOrder.batchId).slice(-6).toUpperCase()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="handover-modal-footer">
              <button 
                className="orders-action-btn"
                onClick={() => setHandoverModalOrder(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-status-advance btn-handover"
                style={{ padding: '8px 16px', fontSize: '13px' }}
                onClick={() => {
                  advanceOrderStatus(handoverModalOrder, 'PICKED_UP');
                  setHandoverModalOrder(null);
                }}
              >
                <CheckCircle2 size={15} /> Confirm Handover
              </button>
            </div>
          </div>
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
                      #{String(selectedOrderForSlip?.id || selectedOrderForSlip?.orderId || 'ORD').slice(-8).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Slot: {selectedOrderForSlip.deliveryTimeSlot || 'Standard'}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '13px' }}>
                  <strong>Customer:</strong> {selectedOrderForSlip.customerName || 'Local Resident'}<br />
                  <strong>Address:</strong> {selectedOrderForSlip.deliveryLocation || selectedOrderForSlip.deliveryAddress || '101, 2nd Avenue, Anna Nagar East, Chennai - 600102'}
                </div>

                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
                  <div style={{ fontWeight: '700', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Itemized Checklist
                  </div>
                  {(selectedOrderForSlip.items || []).map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
                      <span>[  ] {item.qty || 1}x {item.name || item.product?.name || `Item ${i+1}`}</span>
                      <span>₹{((Number(item.price || item.product?.price) || 0) * (Number(item.qty) || 1)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '15px' }}>
                  <span>Total Amount</span>
                  <span>₹{Number(selectedOrderForSlip.total || 0).toFixed(2)}</span>
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
