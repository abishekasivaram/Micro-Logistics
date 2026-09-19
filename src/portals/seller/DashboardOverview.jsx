import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { ShoppingBag, Truck, CheckCircle, Clock, Package, AlertTriangle, Store, DollarSign, ArrowRight, Eye, Layers, Brain, Map, MapPin, Zap, Activity, Info, X, TrendingUp } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import OrderDetailsModal from '../../components/common/OrderDetailsModal';
import './DashboardOverview.css';

const DashboardOverview = () => {
  const { orders, deliveryGroups, products, currentUser, updateOrderStatus, updateSellerProfile } = useAppContext();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);

  const sellerId = currentUser?.role === 'vendor' ? currentUser.id : null;
  const sellerOrders = orders.filter(o => currentUser?.role === 'admin' || o.vendorId === sellerId);

  const totalOrders = sellerOrders.length;
  const newOrders = sellerOrders.filter(o => (o.orderStatus || o.status) === 'PLACED').length;
  const preparingOrders = sellerOrders.filter(o => (o.orderStatus || o.status) === 'PREPARING').length;
  const readyOrders = sellerOrders.filter(o => (o.orderStatus || o.status) === 'READY_FOR_DELIVERY').length;
  const completedOrders = sellerOrders.filter(o => (o.orderStatus || o.status) === 'DELIVERED').length;
  
  const todayOrders = sellerOrders.filter(o => {
    const oDate = new Date(o.date).toDateString();
    return oDate === new Date().toDateString();
  }).length;

  const todayRevenue = sellerOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const actionRequiredOrders = sellerOrders.filter(o => ['PLACED', 'CONFIRMED', 'PREPARING'].includes(o.orderStatus || o.status));

  const toggleStoreOpen = () => {
    updateSellerProfile({ isOpen: !currentUser?.isOpen });
  };

  // --- AI Delivery Coordinator Mock Logic ---
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const { createDeliveryBatch } = useAppContext();
  
  // Find orders waiting for aggregation
  const waitingOrders = sellerOrders.filter(o => o.aggregationStatus === 'Waiting for Aggregation');
  
  // Mock suggested batch data
  const suggestedBatch = {
    orderCount: waitingOrders.length > 0 ? Math.min(waitingOrders.length, 4) : 4,
    area: 'RS Puram',
    window: '10:00 AM – 11:30 AM',
    vehicle: 'Van',
    distance: 8.4,
    individualCost: 120,
    aggregatedCost: 75,
    saving: 45,
    savingPercent: 37.5,
    orders: waitingOrders.length > 0 ? waitingOrders.slice(0, 4) : [
      { id: 'ORD-1021', customerName: 'John Doe', total: 450 },
      { id: 'ORD-1022', customerName: 'Jane Smith', total: 320 },
      { id: 'ORD-1025', customerName: 'Mike Johnson', total: 890 },
      { id: 'ORD-1027', customerName: 'Sarah Williams', total: 150 }
    ]
  };

  // Helper to determine priority
  const getOrderPriority = (order) => {
    const status = order.orderStatus || order.status;
    if (status === 'PREPARING' || order.deliveryTimeSlot?.includes('Fast')) return 'URGENT';
    if (status === 'READY_FOR_DELIVERY') return 'NORMAL';
    return 'FLEXIBLE';
  };

  const handleCreateBatch = () => {
    if (waitingOrders.length > 0) {
      const orderIds = waitingOrders.slice(0, 4).map(o => o.id);
      createDeliveryBatch(orderIds, {
        estimatedDistance: suggestedBatch.distance,
        estimatedTime: 32
      });
    }
    setIsBatchModalOpen(false);
  };

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header" style={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge" style={{ backgroundColor: '#059669', color: '#ffffff', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '12px' }}>
              SELLER DASHBOARD
            </span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Store ID: {sellerId || 'N/A'}</span>
          </div>
          <h2>{currentUser?.shopName || currentUser?.name || 'Local Seller Store'}</h2>
          <p>Smarter Local Orders. Better Delivery Coordination.</p>
        </div>

        {/* Store Status Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', padding: '12px 18px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <Store size={20} className={currentUser?.isOpen !== false ? "text-success" : "text-danger"} />
          <div>
            <span style={{ display: 'block', fontSize: '11px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' }}>Store Status</span>
            <strong style={{ fontSize: '14px', color: currentUser?.isOpen !== false ? "#059669" : "#dc2626" }}>
              {currentUser?.isOpen !== false ? "OPEN FOR ORDERS" : "STORE CLOSED"}
            </strong>
          </div>
          <button 
            className={`btn ${currentUser?.isOpen !== false ? 'btn-outline text-danger' : 'btn-primary'}`}
            style={{ fontSize: '12px', padding: '4px 10px', marginLeft: '8px' }}
            onClick={toggleStoreOpen}
          >
            {currentUser?.isOpen !== false ? "Close Store" : "Open Store"}
          </button>
        </div>
      </div>

      {/* Expanded KPIs Grid */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="kpi-card">
          <div className="kpi-icon bg-primary-light text-primary">
            <ShoppingBag size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Total Orders</span>
            <span className="kpi-value">{totalOrders}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">New Orders</span>
            <span className="kpi-value">{newOrders}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#fed7aa', color: '#c2410c' }}>
            <Package size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Preparing</span>
            <span className="kpi-value">{preparingOrders}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <Truck size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Ready for Delivery</span>
            <span className="kpi-value">{readyOrders}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
            <CheckCircle size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Completed</span>
            <span className="kpi-value">{completedOrders}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
            <DollarSign size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Total Revenue</span>
            <span className="kpi-value">₹{todayRevenue.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* AI Features Row */}
      <div className="ai-top-grid">
        <div className="ai-card">
          <div className="ai-card-title">
            <Brain size={24} />
            AI Delivery Coordinator
          </div>
          <p style={{ color: '#4b5563', marginBottom: '16px', fontSize: '14px' }}>
            <strong>{suggestedBatch.orderCount} nearby orders detected</strong><br/>
            Delivery Area: {suggestedBatch.area}<br/>
            Delivery Window: {suggestedBatch.window}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={16} className="text-secondary" />
              <span>Suggested Vehicle: <strong>{suggestedBatch.vehicle}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} className="text-secondary" />
              <span>Total Distance: <strong>{suggestedBatch.distance} km</strong></span>
            </div>
          </div>

          <div className="ai-savings-box">
            <div>
              <div style={{ fontSize: '12px', color: '#166534' }}>Estimated Delivery Cost: <strong>₹{suggestedBatch.aggregatedCost}</strong></div>
              <div style={{ fontSize: '12px', color: '#166534' }}>Individual Delivery Cost: <span style={{ textDecoration: 'line-through' }}>₹{suggestedBatch.individualCost}</span></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#166534', textTransform: 'uppercase', fontWeight: 'bold' }}>Potential Saving</div>
              <div className="ai-savings-value">₹{suggestedBatch.saving} ({suggestedBatch.savingPercent}%)</div>
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            onClick={() => setIsBatchModalOpen(true)}
          >
            <Zap size={16} /> Create Delivery Batch
          </button>
        </div>

        <div className="chart-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={18} className="text-warning" /> Smart Alerts</h3>
          <div className="smart-alerts-list">
            <div className="smart-alert-item">
              <Info size={16} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div><strong>{suggestedBatch.orderCount} orders</strong> have the same delivery area.</div>
            </div>
            <div className="smart-alert-item" style={{ borderLeftColor: '#f59e0b', backgroundColor: '#fffbeb' }}>
              <Clock size={16} color="#f59e0b" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>Order <strong>ORD-1021</strong> has been waiting for aggregation.</div>
            </div>
            <div className="smart-alert-item" style={{ borderLeftColor: '#10b981', backgroundColor: '#ecfdf5' }}>
              <TrendingUp size={16} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>High delivery demand detected in <strong>RS Puram</strong>.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Row */}
      <div className="insights-grid">
        <div className="chart-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}><Map size={18} className="text-secondary" /> Top Delivery Zones</h3>
          <div className="zone-bar-container">
            {[
              { name: 'RS Puram', count: 28, max: 30 },
              { name: 'Gandhipuram', count: 21, max: 30 },
              { name: 'Saibaba Colony', count: 15, max: 30 },
              { name: 'Peelamedu', count: 12, max: 30 }
            ].map(z => (
              <div key={z.name} className="zone-item">
                <div className="zone-header"><span>{z.name}</span><span>{z.count} orders</span></div>
                <div className="zone-track">
                  <div className="zone-fill" style={{ width: `${(z.count / z.max) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}><Activity size={18} className="text-secondary" /> Seller Performance</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b', fontSize: '13px' }}>On-Time Delivery</span>
              <strong style={{ color: '#059669' }}>94%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b', fontSize: '13px' }}>Average Preparation</span>
              <strong>18 min</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b', fontSize: '13px' }}>Completed Orders</span>
              <strong>126</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', fontSize: '13px' }}>Customer Rating</span>
              <strong>⭐ 4.6/5</strong>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}><Brain size={18} className="text-secondary" /> AI Demand Forecast</h3>
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', marginTop: '16px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '13px', color: '#334155', marginBottom: '12px', lineHeight: '1.5' }}>
              High grocery demand expected today between <strong>6:00 PM – 8:00 PM</strong>.
            </p>
            <div style={{ backgroundColor: '#e0e7ff', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #4f46e5' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#4338ca', fontWeight: 'bold' }}>Suggested Action</span>
              <p style={{ fontSize: '12px', color: '#312e81', margin: '4px 0 0 0' }}>Prepare additional fast-moving products.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Requiring Action Widget */}
      {actionRequiredOrders.length > 0 && (
        <div className="chart-card" style={{ marginTop: '24px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} className="text-warning" />
              <h3 style={{ margin: 0 }}>Orders Requiring Action ({actionRequiredOrders.length})</h3>
            </div>
            <button className="btn-link" style={{ fontSize: '13px', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }} onClick={() => navigate('/orders')}>
              Manage Orders →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {actionRequiredOrders.slice(0, 3).map(ord => (
              <div key={ord.id} style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{ord.id || ord.orderId}</strong>
                  <StatusBadge status={ord.orderStatus || ord.status} />
                </div>
                <div style={{ fontSize: '12px', color: '#4b5563' }}>
                  Customer: <strong>{ord.customerName}</strong><br />
                  Slot: <strong>{ord.deliveryTimeSlot || 'Standard'}</strong>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  {(ord.orderStatus || ord.status) === 'PLACED' && (
                    <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '11px', flex: 1 }} onClick={() => updateOrderStatus(ord.id, 'CONFIRMED')}>
                      Confirm Order
                    </button>
                  )}
                  {(ord.orderStatus || ord.status) === 'CONFIRMED' && (
                    <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '11px', flex: 1 }} onClick={() => updateOrderStatus(ord.id, 'PREPARING')}>
                      Start Prep
                    </button>
                  )}
                  {(ord.orderStatus || ord.status) === 'PREPARING' && (
                    <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '11px', flex: 1, backgroundColor: '#10b981', borderColor: '#10b981' }} onClick={() => updateOrderStatus(ord.id, 'READY_FOR_DELIVERY')}>
                      Mark Ready
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tables Row: Recent Seller Orders & Aggregation Visibility */}
      <div className="dashboard-charts" style={{ marginTop: '24px' }}>
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Recent Orders</h3>
            <button className="btn-link" style={{ fontSize: '13px', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }} onClick={() => navigate('/orders')}>
              View All
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sellerOrders.length === 0 ? (
                <tr><td colSpan="6" className="empty-state">No recent seller orders.</td></tr>
              ) : (
                [...sellerOrders].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map(o => {
                  const priority = getOrderPriority(o);
                  return (
                    <tr key={o.id}>
                      <td className="font-medium">{o.id || o.orderId}</td>
                      <td>{o.customerName || 'Customer'}</td>
                      <td>
                        <span className={`priority-badge ${priority === 'URGENT' ? 'priority-urgent' : priority === 'NORMAL' ? 'priority-normal' : 'priority-flexible'}`}>
                          {priority}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={o.orderStatus || o.status} />
                      </td>
                      <td className="font-medium">₹{(o.total || 0).toFixed(2)}</td>
                      <td>
                        <button className="icon-btn-small" onClick={() => setSelectedOrder(o)}>
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Aggregation & Delivery Coordination Status */}
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Delivery Coordination Status</h3>
            <button className="btn-link" style={{ fontSize: '13px', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }} onClick={() => navigate('/order-aggregation')}>
              Aggregation View
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Delivery Window</th>
                <th>Aggregation Status</th>
              </tr>
            </thead>
            <tbody>
              {sellerOrders.length === 0 ? (
                <tr><td colSpan="3" className="empty-state">No delivery activity.</td></tr>
              ) : (
                sellerOrders.slice(0, 5).map(o => (
                  <tr key={o.id}>
                    <td className="font-medium">{o.id || o.orderId}</td>
                    <td>{o.deliveryTimeSlot || 'Standard Window'}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#e0e7ff', color: '#3730a3', fontSize: '11px', fontWeight: '600' }}>
                        {o.aggregationStatus || 'Waiting for Aggregation'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Timeline Modal */}
      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      {/* Batch Creation Modal */}
      {isBatchModalOpen && (
        <div className="batch-modal-overlay" onClick={() => setIsBatchModalOpen(false)}>
          <div className="batch-modal-content" onClick={e => e.stopPropagation()}>
            <div className="batch-modal-header">
              <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={20} color="#4f46e5" /> Delivery Batch #B102</h3>
              <button className="icon-btn-small" onClick={() => setIsBatchModalOpen(false)}><X size={20} /></button>
            </div>
            
            <div className="batch-modal-section">
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#475569' }}>Orders Included ({suggestedBatch.orderCount})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {suggestedBatch.orders.map(o => (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', backgroundColor: 'white', padding: '8px 12px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontWeight: '500' }}>{o.id || o.orderId}</span>
                    <span style={{ color: '#64748b' }}>{o.customerName || 'Customer'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="batch-modal-section">
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#475569' }}>Delivery Logistics</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div><span style={{ color: '#64748b' }}>Area:</span> <br/><strong>{suggestedBatch.area}</strong></div>
                <div><span style={{ color: '#64748b' }}>Window:</span> <br/><strong>{suggestedBatch.window}</strong></div>
                <div><span style={{ color: '#64748b' }}>Total Distance:</span> <br/><strong>{suggestedBatch.distance} km</strong></div>
                <div><span style={{ color: '#64748b' }}>Estimated Time:</span> <br/><strong>32 min</strong></div>
              </div>
            </div>

            <div className="batch-modal-section" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#166534' }}>Cost Breakdown</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: '#166534' }}>Estimated Cost:</span>
                <strong style={{ color: '#166534' }}>₹{suggestedBatch.aggregatedCost}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid #bbf7d0', paddingTop: '8px' }}>
                <span style={{ color: '#166534', fontWeight: '600' }}>Potential Saving:</span>
                <strong style={{ color: '#166534', fontSize: '15px' }}>₹{suggestedBatch.saving}</strong>
              </div>
            </div>

            <div className="batch-modal-actions">
              <button className="btn btn-outline" onClick={() => setIsBatchModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateBatch}>Confirm Batch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;

