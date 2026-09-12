import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ShoppingBag, Truck, CheckCircle, Clock, Package, AlertTriangle, Store, DollarSign, ArrowRight, Eye, Layers } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import OrderDetailsModal from '../components/OrderDetailsModal';
import './DashboardOverview.css';

const DashboardOverview = () => {
  const { orders, deliveryGroups, products, currentUser, updateOrderStatus, updateSellerProfile } = useAppContext();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);

  const sellerId = currentUser?.role === 'vendor' ? currentUser.id : 'v1';
  const sellerOrders = orders.filter(o => o.vendorId === sellerId || currentUser?.role === 'admin');

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

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header" style={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge" style={{ backgroundColor: '#059669', color: '#ffffff', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '12px' }}>
              SELLER DASHBOARD
            </span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Store ID: {sellerId}</span>
          </div>
          <h2>{currentUser?.name || 'Local Seller Store'}</h2>
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
                <th>Status</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sellerOrders.length === 0 ? (
                <tr><td colSpan="5" className="empty-state">No recent seller orders.</td></tr>
              ) : (
                [...sellerOrders].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map(o => (
                  <tr key={o.id}>
                    <td className="font-medium">{o.id || o.orderId}</td>
                    <td>{o.customerName || 'Customer'}</td>
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
                ))
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
    </div>
  );
};

export default DashboardOverview;

