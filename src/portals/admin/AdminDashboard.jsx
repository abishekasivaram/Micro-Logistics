import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  ShoppingBag, Truck, CheckCircle, Clock, Users, Store, 
  Layers, ChevronRight, AlertCircle, RefreshCw, Layers3, ArrowRight
} from 'lucide-react';
import { findSuitableOrderGroups, getHumanReadableStatus, getStatusBadgeClass } from '../../utils/aggregationUtils';
import './AdminDashboard.css';
import '../seller/DashboardOverview.css';

const AdminDashboard = () => {
  const { orders, deliveryBatches, deliveryAgents, products, customers, vendors } = useAppContext();
  const navigate = useNavigate();

  // 1. Top 8 KPIs
  const totalSellers = vendors.length;
  const totalCustomers = customers.length;
  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status || o.orderStatus)).length;
  const readyForDelivery = orders.filter(o => (o.status === 'READY_FOR_DELIVERY' || o.orderStatus === 'READY_FOR_DELIVERY')).length;
  const aggregatedOrders = orders.filter(o => o.batchId || ['Grouped', 'Batch Created', 'Assigned', 'Out for Delivery', 'Delivered'].includes(o.aggregationStatus)).length;
  const activeDeliveries = deliveryBatches.filter(b => ['Pending Assignment', 'Assigned', 'Pickup in Progress', 'Out for Delivery'].includes(b.status)).length;
  const completedDeliveries = deliveryBatches.filter(b => b.status === 'Completed' || b.status === 'Delivered').length;

  // 2. Aggregation pipeline counts
  const waitingAggregationCount = orders.filter(o => (o.status === 'READY_FOR_DELIVERY' || o.orderStatus === 'READY_FOR_DELIVERY') && !o.batchId).length;
  const suggestedGroups = findSuitableOrderGroups(orders, deliveryAgents);
  const suitableToGroupCount = suggestedGroups.reduce((sum, g) => sum + g.orderCount, 0);
  const groupedBatchCreatedCount = deliveryBatches.filter(b => b.status === 'Pending Assignment').length;
  const agentAssignedCount = deliveryBatches.filter(b => b.status === 'Assigned').length;
  const outForDeliveryCount = orders.filter(o => o.status === 'OUT_FOR_DELIVERY' || o.orderStatus === 'OUT_FOR_DELIVERY').length;
  const completedCount = orders.filter(o => o.status === 'DELIVERED' || o.orderStatus === 'DELIVERED').length;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2>Central Logistics Admin Dashboard</h2>
            <span className="badge badge-primary">SYSTEM ADMIN</span>
          </div>
          <p>Global oversight of sellers, customers, smart order aggregation, and delivery coordination.</p>
        </div>
      </div>

      {/* 8 Top KPI Grid */}
      <div className="admin-kpi-grid">
        <div className="kpi-card-sm" onClick={() => navigate('/admin/sellers')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
            <Store size={22} />
          </div>
          <div>
            <span className="kpi-label">Total Sellers</span>
            <span className="kpi-value">{totalSellers}</span>
          </div>
        </div>

        <div className="kpi-card-sm" onClick={() => navigate('/admin/customers')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
            <Users size={22} />
          </div>
          <div>
            <span className="kpi-label">Total Customers</span>
            <span className="kpi-value">{totalCustomers}</span>
          </div>
        </div>

        <div className="kpi-card-sm" onClick={() => navigate('/admin/orders')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce' }}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <span className="kpi-label">Total Orders</span>
            <span className="kpi-value">{totalOrders}</span>
          </div>
        </div>

        <div className="kpi-card-sm" onClick={() => navigate('/admin/orders')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
            <Clock size={22} />
          </div>
          <div>
            <span className="kpi-label">Active Orders</span>
            <span className="kpi-value">{activeOrders}</span>
          </div>
        </div>

        <div className="kpi-card-sm" onClick={() => navigate('/admin/order-aggregation')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <span className="kpi-label">Ready for Delivery</span>
            <span className="kpi-value">{readyForDelivery}</span>
          </div>
        </div>

        <div className="kpi-card-sm" onClick={() => navigate('/admin/order-aggregation')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon" style={{ backgroundColor: '#ccfbf1', color: '#0f766e' }}>
            <Layers size={22} />
          </div>
          <div>
            <span className="kpi-label">Aggregated Orders</span>
            <span className="kpi-value">{aggregatedOrders}</span>
          </div>
        </div>

        <div className="kpi-card-sm" onClick={() => navigate('/admin/delivery-management')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon" style={{ backgroundColor: '#ffedd5', color: '#c2410c' }}>
            <Truck size={22} />
          </div>
          <div>
            <span className="kpi-label">Active Batches</span>
            <span className="kpi-value">{activeDeliveries}</span>
          </div>
        </div>

        <div className="kpi-card-sm" onClick={() => navigate('/admin/delivery-management')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <span className="kpi-label">Completed Deliveries</span>
            <span className="kpi-value">{completedDeliveries}</span>
          </div>
        </div>
      </div>

      {/* Visual ORDER AGGREGATION PIPELINE */}
      <div className="pipeline-card">
        <div className="pipeline-header">
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers3 size={20} className="text-primary" /> Order Aggregation Pipeline
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              Central coordination lifecycle from ready order detection to final delivery.
            </p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/admin/order-aggregation')} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Go to Aggregation Hub <ArrowRight size={14} />
          </button>
        </div>

        <div className="pipeline-steps">
          <div className="pipeline-step" onClick={() => navigate('/admin/order-aggregation')}>
            <span className="pipeline-step-count">{waitingAggregationCount}</span>
            <span className="pipeline-step-label">Waiting Aggregation</span>
          </div>

          <span className="pipeline-arrow">→</span>

          <div className="pipeline-step" onClick={() => navigate('/admin/order-aggregation')}>
            <span className="pipeline-step-count">{suitableToGroupCount}</span>
            <span className="pipeline-step-label">Suitable to Group</span>
          </div>

          <span className="pipeline-arrow">→</span>

          <div className="pipeline-step" onClick={() => navigate('/admin/delivery-management')}>
            <span className="pipeline-step-count">{groupedBatchCreatedCount}</span>
            <span className="pipeline-step-label">Batch Created</span>
          </div>

          <span className="pipeline-arrow">→</span>

          <div className="pipeline-step" onClick={() => navigate('/admin/delivery-management')}>
            <span className="pipeline-step-count">{agentAssignedCount}</span>
            <span className="pipeline-step-label">Agent Assigned</span>
          </div>

          <span className="pipeline-arrow">→</span>

          <div className="pipeline-step" onClick={() => navigate('/admin/routes')}>
            <span className="pipeline-step-count">{outForDeliveryCount}</span>
            <span className="pipeline-step-label">Out for Delivery</span>
          </div>

          <span className="pipeline-arrow">→</span>

          <div className="pipeline-step" onClick={() => navigate('/admin/orders')}>
            <span className="pipeline-step-count" style={{ color: '#16a34a' }}>{completedCount}</span>
            <span className="pipeline-step-label">Completed</span>
          </div>
        </div>
      </div>

      {/* Operational Overview Grid */}
      <div className="op-overview-grid">
        {/* Today's Operational Status */}
        <div className="op-card">
          <h4 style={{ margin: '0 0 12px', fontSize: '15px' }}>System Operational Overview</h4>
          <div className="op-list">
            <div className="op-item">
              <span>Orders Placed Today</span>
              <strong className="font-semibold">{orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()).length}</strong>
            </div>
            <div className="op-item">
              <span>Orders Pending Seller Prep</span>
              <strong className="font-semibold">{orders.filter(o => ['PLACED', 'CONFIRMED', 'PREPARING'].includes(o.status || o.orderStatus)).length}</strong>
            </div>
            <div className="op-item">
              <span>Available Delivery Agents</span>
              <strong className="font-semibold text-success">{deliveryAgents.filter(a => a.status === 'Available').length} / {deliveryAgents.length}</strong>
            </div>
            <div className="op-item">
              <span>Active Seller Stores</span>
              <strong className="font-semibold">{vendors.filter(v => v.status === 'Active' && v.isOpen).length} / {vendors.length}</strong>
            </div>
          </div>
        </div>

        {/* Action Required */}
        <div className="op-card">
          <h4 style={{ margin: '0 0 12px', fontSize: '15px', color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={18} /> Actions Required
          </h4>
          <div className="op-list">
            {suggestedGroups.length > 0 && (
              <div className="op-item" onClick={() => navigate('/admin/order-aggregation')} style={{ cursor: 'pointer', borderLeft: '4px solid #3b82f6' }}>
                <span>⚡ {suggestedGroups.length} suggested order group(s) ready to batch</span>
                <span className="badge badge-primary">Review</span>
              </div>
            )}
            {deliveryBatches.filter(b => b.status === 'Pending Assignment').length > 0 && (
              <div className="op-item" onClick={() => navigate('/admin/delivery-management')} style={{ cursor: 'pointer', borderLeft: '4px solid #f59e0b' }}>
                <span>🛵 {deliveryBatches.filter(b => b.status === 'Pending Assignment').length} batch(es) pending agent assignment</span>
                <span className="badge badge-warning">Assign Agent</span>
              </div>
            )}
            {vendors.filter(v => v.status === 'Pending').length > 0 && (
              <div className="op-item" onClick={() => navigate('/admin/sellers')} style={{ cursor: 'pointer', borderLeft: '4px solid #10b981' }}>
                <span>🏪 {vendors.filter(v => v.status === 'Pending').length} pending seller onboarding request(s)</span>
                <span className="badge badge-success">Verify</span>
              </div>
            )}
            {suggestedGroups.length === 0 && deliveryBatches.filter(b => b.status === 'Pending Assignment').length === 0 && vendors.filter(v => v.status === 'Pending').length === 0 && (
              <div className="empty-state" style={{ padding: '12px' }}>
                All central operations are currently running smoothly.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="dashboard-charts">
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3>Recent Orders Across Sellers</h3>
            <button className="btn btn-sm btn-outline" onClick={() => navigate('/admin/orders')}>View All</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Seller</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Aggregation</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(o => (
                <tr key={o.id}>
                  <td className="font-medium">{o.orderId || o.id}</td>
                  <td>{o.vendorName || o.sellerName}</td>
                  <td>{o.customerName}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(o.status || o.orderStatus)}`}>
                      {getHumanReadableStatus(o.status || o.orderStatus)}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-secondary" style={{ fontSize: '11px' }}>
                      {o.aggregationStatus || 'Unassigned'}
                    </span>
                  </td>
                  <td>₹{o.total?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3>Active Delivery Batches</h3>
            <button className="btn btn-sm btn-outline" onClick={() => navigate('/admin/delivery-management')}>Manage Batches</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Orders</th>
                <th>Delivery Window</th>
                <th>Assigned Agent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveryBatches.length === 0 ? (
                <tr><td colSpan="5" className="empty-state">No delivery batches created yet.</td></tr>
              ) : (
                deliveryBatches.slice(0, 5).map(b => (
                  <tr key={b.id}>
                    <td className="font-medium">{b.batchId || b.id}</td>
                    <td>{b.orderCount || b.orderIds?.length} order(s)</td>
                    <td style={{ fontSize: '12px' }}>{b.deliverySlot}</td>
                    <td>{b.agentName || <span className="text-warning">Unassigned</span>}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
