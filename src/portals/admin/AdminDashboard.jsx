import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  ShoppingBag, Truck, CheckCircle, Clock, Users, Store, 
  Layers, ChevronRight, AlertCircle, RefreshCw, Boxes, ArrowRight,
  Zap, Navigation, TrendingUp, ShieldAlert, ArrowUpRight
} from 'lucide-react';
import { findSuitableOrderGroups } from '../../utils/aggregationUtils';
import StatusBadge from '../../components/common/StatusBadge';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { orders, deliveryBatches, deliveryAgents, customers, vendors } = useAppContext();
  const navigate = useNavigate();
  const [activeTableTab, setActiveTableTab] = useState('orders'); // 'orders' | 'batches'

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

  // Pipeline configuration with semantic progress styling
  const pipelineSteps = [
    { label: 'Waiting Aggregation', count: waitingAggregationCount, path: '/admin/order-aggregation', color: '#D97706', bg: '#FEF3C7' },
    { label: 'Suitable to Group', count: suitableToGroupCount, path: '/admin/order-aggregation', color: '#0284C7', bg: '#E0F2FE' },
    { label: 'Batch Created', count: groupedBatchCreatedCount, path: '/admin/delivery-management', color: '#7C3AED', bg: '#EDE9FE' },
    { label: 'Agent Assigned', count: agentAssignedCount, path: '/admin/delivery-management', color: '#2563EB', bg: '#DBEAFE' },
    { label: 'Out for Delivery', count: outForDeliveryCount, path: '/admin/routes', color: '#4F46E5', bg: '#EEF2FF' },
    { label: 'Delivered', count: completedCount, path: '/admin/orders', color: '#059669', bg: '#D1FAE5' }
  ];

  const availableAgentsCount = deliveryAgents.filter(a => a.status === 'Available').length;
  const activeSellersCount = vendors.filter(v => v.status === 'Active' && v.isOpen).length;

  return (
    <div className="page-container admin-dashboard-page">
      {/* Dashboard Top Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h2>
            Central Logistics Command Tower
            <span className="telemetry-tag">
              <span className="telemetry-pulse" /> LIVE MESH
            </span>
          </h2>
          <p className="page-subtitle">
            Global real-time telemetry across multi-seller networks, automated order batching, and coordinated local fleet dispatch.
          </p>
        </div>
        
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => navigate('/admin/routes')}>
            <Navigation size={16} /> Live Route Mesh
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/admin/order-aggregation')}>
            <Boxes size={16} /> Run Aggregation Hub
          </button>
        </div>
      </div>

      {/* 8 Metric KPI Command Grid */}
      <div className="command-kpi-grid">
        <div className="kpi-command-card" onClick={() => navigate('/admin/sellers')} role="button" tabIndex={0}>
          <div className="kpi-header-row">
            <span className="kpi-label">Total Sellers</span>
            <div className="kpi-icon-squircle emerald">
              <Store size={18} />
            </div>
          </div>
          <div className="kpi-metric-number">{totalSellers}</div>
          <div className="kpi-meta-badge">
            <span className="meta-highlight">{activeSellersCount} open</span> • verified stores
          </div>
        </div>

        <div className="kpi-command-card" onClick={() => navigate('/admin/customers')} role="button" tabIndex={0}>
          <div className="kpi-header-row">
            <span className="kpi-label">Total Customers</span>
            <div className="kpi-icon-squircle indigo">
              <Users size={18} />
            </div>
          </div>
          <div className="kpi-metric-number">{totalCustomers}</div>
          <div className="kpi-meta-badge">
            <span className="meta-highlight">Active accounts</span> in network
          </div>
        </div>

        <div className="kpi-command-card" onClick={() => navigate('/admin/orders')} role="button" tabIndex={0}>
          <div className="kpi-header-row">
            <span className="kpi-label">Total Orders</span>
            <div className="kpi-icon-squircle purple">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="kpi-metric-number">{totalOrders}</div>
          <div className="kpi-meta-badge">
            <span className="meta-highlight">{orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()).length} placed</span> today
          </div>
        </div>

        <div className="kpi-command-card" onClick={() => navigate('/admin/orders')} role="button" tabIndex={0}>
          <div className="kpi-header-row">
            <span className="kpi-label">Active Orders</span>
            <div className="kpi-icon-squircle amber">
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-metric-number">{activeOrders}</div>
          <div className="kpi-meta-badge amber-tint">
            <span className="meta-highlight">{readyForDelivery} ready</span> for batching
          </div>
        </div>

        <div className="kpi-command-card" onClick={() => navigate('/admin/order-aggregation')} role="button" tabIndex={0}>
          <div className="kpi-header-row">
            <span className="kpi-label">Ready for Delivery</span>
            <div className="kpi-icon-squircle sky">
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="kpi-metric-number">{readyForDelivery}</div>
          <div className="kpi-meta-badge">
            Awaiting aggregation sweep
          </div>
        </div>

        <div className="kpi-command-card" onClick={() => navigate('/admin/order-aggregation')} role="button" tabIndex={0}>
          <div className="kpi-header-row">
            <span className="kpi-label">Aggregated Orders</span>
            <div className="kpi-icon-squircle teal">
              <Boxes size={18} />
            </div>
          </div>
          <div className="kpi-metric-number">{aggregatedOrders}</div>
          <div className="kpi-meta-badge">
            <span className="meta-highlight">{totalOrders > 0 ? Math.round((aggregatedOrders / totalOrders) * 100) : 0}%</span> aggregation rate
          </div>
        </div>

        <div className="kpi-command-card" onClick={() => navigate('/admin/delivery-management')} role="button" tabIndex={0}>
          <div className="kpi-header-row">
            <span className="kpi-label">Active Batches</span>
            <div className="kpi-icon-squircle orange">
              <Truck size={18} />
            </div>
          </div>
          <div className="kpi-metric-number">{activeDeliveries}</div>
          <div className="kpi-meta-badge">
            <span className="meta-highlight">{availableAgentsCount} agents</span> available
          </div>
        </div>

        <div className="kpi-command-card" onClick={() => navigate('/admin/delivery-management')} role="button" tabIndex={0}>
          <div className="kpi-header-row">
            <span className="kpi-label">Completed Deliveries</span>
            <div className="kpi-icon-squircle green">
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="kpi-metric-number">{completedDeliveries}</div>
          <div className="kpi-meta-badge emerald-tint">
            <span className="meta-highlight">100% SLA</span> accuracy
          </div>
        </div>
      </div>

      {/* Horizontal ORDER AGGREGATION PIPELINE Stepper / Funnel */}
      <div className="pipeline-command-card">
        <div className="pipeline-card-header">
          <div>
            <h3 className="card-title">
              <Boxes size={18} className="text-accent" />
              Order Aggregation Pipeline
            </h3>
            <p className="pipeline-desc">
              Central coordination lifecycle from ready order detection to cluster grouping and final fleet handover.
            </p>
          </div>
          <button 
            className="btn btn-outline btn-sm" 
            onClick={() => navigate('/admin/order-aggregation')}
          >
            Go to Aggregation Hub <ArrowRight size={14} />
          </button>
        </div>

        <div className="pipeline-funnel-track">
          {pipelineSteps.map((step, idx) => (
            <React.Fragment key={step.label}>
              <div 
                className="pipeline-funnel-node"
                onClick={() => navigate(step.path)}
                role="button"
                tabIndex={0}
                title={`Filter: ${step.label}`}
              >
                <div className="node-badge-circle" style={{ backgroundColor: step.bg, color: step.color }}>
                  <span className="node-count">{step.count}</span>
                </div>
                <span className="node-step-number">Stage 0{idx + 1}</span>
                <span className="node-step-label">{step.label}</span>
              </div>
              
              {idx < pipelineSteps.length - 1 && (
                <div className="pipeline-connector-line">
                  <div className="connector-pulse-runner" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Operational Overview & Prioritized Actions Required */}
      <div className="operational-panels-grid">
        {/* System Operational Overview */}
        <div className="card operational-telemetry-card">
          <div className="card-header">
            <h4 className="card-title">
              <Zap size={16} className="text-accent" />
              System Operational Telemetry
            </h4>
            <span className="badge-subtle">LIVE REAL-TIME</span>
          </div>
          <div className="card-body">
            <div className="telemetry-stat-row">
              <div className="telemetry-info">
                <span className="telemetry-name">Orders Placed Today</span>
                <span className="telemetry-detail">Customer checkout submissions</span>
              </div>
              <span className="telemetry-value-bold">
                {orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()).length}
              </span>
            </div>

            <div className="telemetry-stat-row">
              <div className="telemetry-info">
                <span className="telemetry-name">Orders Pending Seller Prep</span>
                <span className="telemetry-detail">Items currently in merchant fulfillment</span>
              </div>
              <span className="telemetry-value-bold text-amber">
                {orders.filter(o => ['PLACED', 'CONFIRMED', 'PREPARING'].includes(o.status || o.orderStatus)).length}
              </span>
            </div>

            <div className="telemetry-stat-row">
              <div className="telemetry-info">
                <div className="telemetry-title-flex">
                  <span className="telemetry-name">Delivery Fleet Availability</span>
                  <span className="telemetry-rate">{deliveryAgents.length > 0 ? Math.round((availableAgentsCount / deliveryAgents.length) * 100) : 0}% available</span>
                </div>
                <div className="mini-progress-track">
                  <div 
                    className="mini-progress-fill" 
                    style={{ width: `${deliveryAgents.length > 0 ? (availableAgentsCount / deliveryAgents.length) * 100 : 0}%` }} 
                  />
                </div>
              </div>
              <span className="telemetry-value-bold text-emerald">
                {availableAgentsCount} / {deliveryAgents.length}
              </span>
            </div>

            <div className="telemetry-stat-row">
              <div className="telemetry-info">
                <div className="telemetry-title-flex">
                  <span className="telemetry-name">Active Seller Stores Online</span>
                  <span className="telemetry-rate">{vendors.length > 0 ? Math.round((activeSellersCount / vendors.length) * 100) : 0}% operational</span>
                </div>
                <div className="mini-progress-track">
                  <div 
                    className="mini-progress-fill indigo" 
                    style={{ width: `${vendors.length > 0 ? (activeSellersCount / vendors.length) * 100 : 0}%` }} 
                  />
                </div>
              </div>
              <span className="telemetry-value-bold">
                {activeSellersCount} / {vendors.length}
              </span>
            </div>
          </div>
        </div>

        {/* Prioritized Actions Required */}
        <div className="card urgent-actions-card">
          <div className="card-header urgent-header">
            <h4 className="card-title text-amber-urgent">
              <AlertCircle size={18} />
              Actions Required
            </h4>
            <span className="urgent-badge-pill">
              {(suggestedGroups.length > 0 ? 1 : 0) + (groupedBatchCreatedCount > 0 ? 1 : 0) + (vendors.filter(v => v.status === 'Pending').length > 0 ? 1 : 0)} PENDING
            </span>
          </div>
          <div className="card-body urgent-body">
            <div className="urgent-items-list">
              {suggestedGroups.length > 0 && (
                <div 
                  className="urgent-action-row amber-border"
                  onClick={() => navigate('/admin/order-aggregation')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="urgent-icon-pill amber">
                    <Boxes size={16} />
                  </div>
                  <div className="urgent-text-block">
                    <span className="urgent-main-text">
                      <strong>{suggestedGroups.length} suggested order group(s)</strong> ready for batching
                    </span>
                    <span className="urgent-sub-text">High-compatibility cluster identified across local sectors</span>
                  </div>
                  <button className="btn btn-primary btn-sm">
                    Review Hub <ArrowRight size={13} />
                  </button>
                </div>
              )}

              {groupedBatchCreatedCount > 0 && (
                <div 
                  className="urgent-action-row blue-border"
                  onClick={() => navigate('/admin/delivery-management')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="urgent-icon-pill blue">
                    <Truck size={16} />
                  </div>
                  <div className="urgent-text-block">
                    <span className="urgent-main-text">
                      <strong>{groupedBatchCreatedCount} delivery batch(es)</strong> pending agent assignment
                    </span>
                    <span className="urgent-sub-text">Orders packaged and waiting for courier dispatch</span>
                  </div>
                  <button className="btn btn-secondary btn-sm">
                    Assign Agent <ArrowRight size={13} />
                  </button>
                </div>
              )}

              {vendors.filter(v => v.status === 'Pending').length > 0 && (
                <div 
                  className="urgent-action-row emerald-border"
                  onClick={() => navigate('/admin/sellers')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="urgent-icon-pill emerald">
                    <Store size={16} />
                  </div>
                  <div className="urgent-text-block">
                    <span className="urgent-main-text">
                      <strong>{vendors.filter(v => v.status === 'Pending').length} pending seller</strong> onboarding request(s)
                    </span>
                    <span className="urgent-sub-text">Merchant documentation awaiting compliance check</span>
                  </div>
                  <button className="btn btn-outline btn-sm">
                    Verify Store <ArrowRight size={13} />
                  </button>
                </div>
              )}

              {suggestedGroups.length === 0 && groupedBatchCreatedCount === 0 && vendors.filter(v => v.status === 'Pending').length === 0 && (
                <div className="empty-actions-box">
                  <CheckCircle size={32} className="text-emerald" />
                  <h4>All Systems Synchronized</h4>
                  <p>No blocking actions detected. Central order aggregation and fleet dispatch are running smoothly.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Centered Tab Switcher for Operational Activity Tables */}
      <div className="dashboard-tabs-center-wrapper">
        <div className="dashboard-segmented-tabs">
          <button 
            type="button"
            className={`dashboard-tab-btn ${activeTableTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTableTab('orders')}
          >
            <ShoppingBag size={16} />
            <span>Recent Orders Across Sellers</span>
            <span className="tab-counter-badge">{orders.length}</span>
          </button>
          <button 
            type="button"
            className={`dashboard-tab-btn ${activeTableTab === 'batches' ? 'active' : ''}`}
            onClick={() => setActiveTableTab('batches')}
          >
            <Truck size={16} />
            <span>Active Delivery Batches</span>
            <span className="tab-counter-badge">{deliveryBatches.length}</span>
          </button>
        </div>
      </div>

      {/* Active High-Density Operational Activity Table */}
      <div className="dashboard-tab-content">
        {activeTableTab === 'orders' ? (
          <div className="table-card">
            <div className="card-header">
              <h3 className="card-title">
                <ShoppingBag size={17} className="text-accent" />
                Recent Orders Across Sellers
              </h3>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/orders')}>
                View All Orders <ArrowUpRight size={13} />
              </button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Seller</th>
                    <th>Customer</th>
                    <th>Order Status</th>
                    <th>Aggregation</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 8).map(o => (
                    <tr key={o.id}>
                      <td>
                        <span className="order-id-chip">{o.orderId || o.id}</span>
                      </td>
                      <td>
                        <div className="seller-name-cell">
                          <span className="seller-name">{o.vendorName || o.sellerName}</span>
                        </div>
                      </td>
                      <td>
                        <span className="customer-name">{o.customerName}</span>
                      </td>
                      <td>
                        <StatusBadge status={o.status || o.orderStatus} />
                      </td>
                      <td>
                        <span className="aggregation-tag">
                          {o.aggregationStatus || 'Unassigned'}
                        </span>
                      </td>
                      <td>
                        <span className="monetary-amount">₹{Number(o.total || 0).toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="table-card">
            <div className="card-header">
              <h3 className="card-title">
                <Truck size={17} className="text-accent" />
                Active Delivery Batches
              </h3>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/delivery-management')}>
                Manage Batches <ArrowUpRight size={13} />
              </button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Batch ID</th>
                    <th>Orders</th>
                    <th>Window</th>
                    <th>Assigned Fleet</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryBatches.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-state-box">
                        <p>No delivery batches created yet.</p>
                      </td>
                    </tr>
                  ) : (
                    deliveryBatches.map(b => (
                      <tr key={b.id}>
                        <td>
                          <span className="batch-id-chip">{b.batchId || b.id}</span>
                        </td>
                        <td>
                          <span className="batch-order-count">
                            {b.orderCount || b.orderIds?.length || 1} orders bundled
                          </span>
                        </td>
                        <td>
                          <span className="window-time-badge">{b.deliverySlot}</span>
                        </td>
                        <td>
                          {b.agentName ? (
                            <div className="agent-cell">
                              <span className="agent-dot-active" />
                              <span>{b.agentName}</span>
                            </div>
                          ) : (
                            <span className="unassigned-fleet-chip">Unassigned</span>
                          )}
                        </td>
                        <td>
                          <StatusBadge status={b.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
