import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  ShoppingBag, Truck, CheckCircle2, Clock, Users, Store, 
  Layers, ChevronRight, AlertCircle, RefreshCw, Boxes, ArrowRight,
  Zap, Navigation, TrendingUp, ShieldAlert, ArrowUpRight,
  Sparkles, UserCheck, Send, CheckCircle, Package
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

  // Pipeline configuration with semantic progress styling and dedicated icons
  const pipelineSteps = [
    { 
      label: 'Waiting Aggregation', 
      count: waitingAggregationCount, 
      path: '/admin/order-aggregation', 
      stage: 'Stage 01',
      icon: Clock,
      color: '#D97706', 
      bg: '#FEF3C7',
      themeClass: 'theme-amber',
      desc: 'Pending clustering'
    },
    { 
      label: 'Suitable to Group', 
      count: suitableToGroupCount, 
      path: '/admin/order-aggregation', 
      stage: 'Stage 02',
      icon: Sparkles,
      color: '#0284C7', 
      bg: '#E0F2FE',
      themeClass: 'theme-sky',
      desc: 'Clustered by locality'
    },
    { 
      label: 'Batch Created', 
      count: groupedBatchCreatedCount, 
      path: '/admin/delivery-management', 
      stage: 'Stage 03',
      icon: Layers,
      color: '#7C3AED', 
      bg: '#EDE9FE',
      themeClass: 'theme-purple',
      desc: 'Bundled packages'
    },
    { 
      label: 'Agent Assigned', 
      count: agentAssignedCount, 
      path: '/admin/delivery-management', 
      stage: 'Stage 04',
      icon: UserCheck,
      color: '#2563EB', 
      bg: '#DBEAFE',
      themeClass: 'theme-blue',
      desc: 'Couriers dispatched'
    },
    { 
      label: 'Out for Delivery', 
      count: outForDeliveryCount, 
      path: '/admin/routes', 
      stage: 'Stage 05',
      icon: Send,
      color: '#E11D48', 
      bg: '#FFE4E6',
      themeClass: 'theme-rose',
      desc: 'Live transit route'
    },
    { 
      label: 'Delivered', 
      count: completedCount, 
      path: '/admin/orders', 
      stage: 'Stage 06',
      icon: CheckCircle2,
      color: '#059669', 
      bg: '#D1FAE5',
      themeClass: 'theme-emerald',
      desc: 'Fulfilled orders'
    }
  ];

  const availableAgentsCount = deliveryAgents.filter(a => a.status === 'Available').length;
  const activeSellersCount = vendors.filter(v => v.status === 'Active' && v.isOpen).length;
  const todayOrdersCount = orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()).length;
  const pendingPrepCount = orders.filter(o => ['PLACED', 'CONFIRMED', 'PREPARING'].includes(o.status || o.orderStatus)).length;
  const pendingSellersCount = vendors.filter(v => v.status === 'Pending').length;

  const fleetPct = deliveryAgents.length > 0 ? Math.round((availableAgentsCount / deliveryAgents.length) * 100) : 0;
  const sellerPct = vendors.length > 0 ? Math.round((activeSellersCount / vendors.length) * 100) : 0;

  const totalActionsCount = (suggestedGroups.length > 0 ? 1 : 0) + 
                            (groupedBatchCreatedCount > 0 ? 1 : 0) + 
                            (pendingSellersCount > 0 ? 1 : 0);

  return (
    <div className="page-container admin-dashboard-page">
      {/* Dashboard Top Header */}
      <div className="dashboard-hero-banner">
        <div className="hero-banner-content">
          <div className="hero-live-pill">
            <span className="hero-pulse-dot" />
            <span>Operations Live</span>
          </div>
          <h1 className="hero-banner-title">
            Logistics Command Center
          </h1>
          <p className="hero-banner-subtitle">
            Centralized orchestration across multi-seller networks, intelligent order batching, and fleet dispatch.
          </p>
        </div>
        
        <div className="hero-banner-actions">
          <button className="btn btn-outline" onClick={() => navigate('/admin/routes')}>
            <Navigation size={16} /> Route Map
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
            <span className="kpi-label">TOTAL SELLERS</span>
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
            <span className="kpi-label">TOTAL CUSTOMERS</span>
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
            <span className="kpi-label">TOTAL ORDERS</span>
            <div className="kpi-icon-squircle purple">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="kpi-metric-number">{totalOrders}</div>
          <div className="kpi-meta-badge">
            <span className="meta-highlight">{todayOrdersCount} placed</span> today
          </div>
        </div>

        <div className="kpi-command-card" onClick={() => navigate('/admin/orders')} role="button" tabIndex={0}>
          <div className="kpi-header-row">
            <span className="kpi-label">ACTIVE ORDERS</span>
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
            <span className="kpi-label">READY FOR DELIVERY</span>
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
            <span className="kpi-label">AGGREGATED ORDERS</span>
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
            <span className="kpi-label">ACTIVE BATCHES</span>
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
            <span className="kpi-label">COMPLETED DELIVERIES</span>
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

      {/* State-of-the-Art Order Aggregation Pipeline Flow Strip */}
      <div className="pipeline-command-card">
        <div className="pipeline-card-header">
          <div className="pipeline-title-group">
            <div className="pipeline-icon-badge">
              <Boxes size={18} />
            </div>
            <div>
              <h3 className="card-title">Order Aggregation Pipeline</h3>
              <p className="pipeline-desc">
                Central coordination lifecycle from ready order detection to cluster grouping and final fleet handover.
              </p>
            </div>
          </div>
          <button 
            className="btn-hub-pill" 
            onClick={() => navigate('/admin/order-aggregation')}
          >
            <span>Go to Aggregation Hub</span>
            <ArrowRight size={14} className="hub-arrow-icon" />
          </button>
        </div>

        <div className="pipeline-funnel-ribbon">
          {pipelineSteps.map((step, idx) => {
            const IconComp = step.icon;
            const hasCount = step.count > 0;
            return (
              <React.Fragment key={step.label}>
                <div 
                  className={`pipeline-ribbon-node ${step.themeClass} ${hasCount ? 'is-active' : 'is-idle'}`}
                >
                  <div className="node-stage-header">
                    <span className="node-stage-tag">{step.stage}</span>
                    <span 
                      className={`node-counter-pill ${hasCount ? 'has-active-count' : ''}`} 
                      style={hasCount ? { backgroundColor: step.bg, color: step.color } : {}}
                    >
                      {step.count}
                    </span>
                  </div>

                  <div className="node-body-flex">
                    <div 
                      className="node-icon-circle"
                      style={hasCount ? { color: step.color, backgroundColor: step.bg } : {}}
                    >
                      <IconComp size={16} />
                    </div>
                    <div className="node-text-column">
                      <span className="node-main-title">{step.label}</span>
                      <span className="node-sub-detail">{step.desc}</span>
                    </div>
                  </div>

                  <div className="node-bottom-status">
                    {hasCount ? (
                      <span className="status-pill-active" style={{ color: step.color }}>
                        <span className="pulse-dot-small" style={{ backgroundColor: step.color }} />
                        {step.count} in queue
                      </span>
                    ) : (
                      <span className="status-pill-idle">0 pending</span>
                    )}
                  </div>
                </div>

                {idx < pipelineSteps.length - 1 && (
                  <div 
                    className={`pipeline-ribbon-connector connector-${step.themeClass} ${hasCount ? 'is-active-connector' : ''}`}
                    style={{
                      '--connector-color': step.color,
                      '--connector-bg': step.bg,
                      '--next-color': pipelineSteps[idx + 1].color,
                      '--next-bg': pipelineSteps[idx + 1].bg
                    }}
                    aria-label={`Progress to ${pipelineSteps[idx + 1].label}`}
                  >
                    <div className="connector-chevron-arrow">
                      <ChevronRight size={10} strokeWidth={2.2} />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Operational Overview & Prioritized Actions Required */}
      <div className="operational-panels-grid">
        {/* System Operational Health */}
        <div className="card operational-health-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-title-icon-badge emerald">
                <Zap size={16} />
              </div>
              <h4 className="card-title">Operations & Fleet Capacity</h4>
            </div>
            <span className="live-status-pill">
              <span className="live-pulse-dot" /> Real-time
            </span>
          </div>

          <div className="card-body">
            {/* Quick Summary Stat Tiles */}
            <div className="health-tiles-grid">
              <div className="health-stat-tile">
                <span className="stat-tile-label">Orders Placed Today</span>
                <span className="stat-tile-number">{todayOrdersCount}</span>
                <span className="stat-tile-note">Customer checkout submissions</span>
              </div>
              <div className="health-stat-tile highlight-amber">
                <span className="stat-tile-label">Pending Merchant Fulfillment</span>
                <span className="stat-tile-number amber">{pendingPrepCount}</span>
                <span className="stat-tile-note">Items in merchant prep</span>
              </div>
            </div>

            {/* Delivery Fleet Availability Progress */}
            <div className="capacity-progress-group">
              <div className="progress-label-row">
                <span className="progress-title">Delivery Fleet Capacity</span>
                <span className="progress-metric-highlight emerald">
                  <strong>{availableAgentsCount} / {deliveryAgents.length}</strong> available ({fleetPct}%)
                </span>
              </div>
              <div className="precision-progress-track">
                <div 
                  className="precision-progress-fill emerald" 
                  style={{ width: `${fleetPct}%` }} 
                />
              </div>
            </div>

            {/* Active Seller Stores Online Progress */}
            <div className="capacity-progress-group">
              <div className="progress-label-row">
                <span className="progress-title">Active Merchant Stores</span>
                <span className="progress-metric-highlight indigo">
                  <strong>{activeSellersCount} / {vendors.length}</strong> online ({sellerPct}%)
                </span>
              </div>
              <div className="precision-progress-track">
                <div 
                  className="precision-progress-fill indigo" 
                  style={{ width: `${sellerPct}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Priority Actions Required */}
        <div className="card priority-actions-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-title-icon-badge amber">
                <AlertCircle size={16} />
              </div>
              <h4 className="card-title">Priority Action Queue</h4>
            </div>
            <span className={`priority-count-pill ${totalActionsCount > 0 ? 'glowing-amber' : ''}`}>
              {totalActionsCount} Pending
            </span>
          </div>

          <div className="card-body">
            <div className="priority-actions-list">
              {suggestedGroups.length > 0 && (
                <div 
                  className="priority-action-row amber-accent"
                  onClick={() => navigate('/admin/order-aggregation')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="action-row-icon amber">
                    <Boxes size={18} />
                  </div>
                  <div className="action-row-content">
                    <span className="action-row-headline">
                      <strong>{suggestedGroups.length} suggested order group(s)</strong> ready for batching
                    </span>
                    <span className="action-row-caption">High-compatibility cluster identified across local sectors</span>
                  </div>
                  <button className="btn btn-primary btn-sm action-btn">
                    Review Hub <ArrowRight size={13} />
                  </button>
                </div>
              )}

              {groupedBatchCreatedCount > 0 && (
                <div 
                  className="priority-action-row blue-accent"
                  onClick={() => navigate('/admin/delivery-management')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="action-row-icon blue">
                    <Truck size={18} />
                  </div>
                  <div className="action-row-content">
                    <span className="action-row-headline">
                      <strong>{groupedBatchCreatedCount} delivery batch(es)</strong> pending agent assignment
                    </span>
                    <span className="action-row-caption">Orders packaged and waiting for courier dispatch</span>
                  </div>
                  <button className="btn btn-secondary btn-sm action-btn">
                    Assign Agent <ArrowRight size={13} />
                  </button>
                </div>
              )}

              {pendingSellersCount > 0 && (
                <div 
                  className="priority-action-row emerald-accent"
                  onClick={() => navigate('/admin/sellers')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="action-row-icon emerald">
                    <Store size={18} />
                  </div>
                  <div className="action-row-content">
                    <span className="action-row-headline">
                      <strong>{pendingSellersCount} pending seller</strong> onboarding request(s)
                    </span>
                    <span className="action-row-caption">Merchant documentation awaiting compliance check</span>
                  </div>
                  <button className="btn btn-outline btn-sm action-btn">
                    Verify Store <ArrowRight size={13} />
                  </button>
                </div>
              )}

              {totalActionsCount === 0 && (
                <div className="priority-empty-state">
                  <CheckCircle2 size={36} className="text-emerald" />
                  <h4>All Systems Synchronized</h4>
                  <p>No blocking actions detected. Central order aggregation and fleet dispatch are running smoothly.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Integrated Tabbed Activity Data Grid */}
      <div className="card table-command-card">
        <div className="table-card-toolbar">
          <div className="table-segmented-tabs">
            <button 
              type="button"
              className={`table-tab-pill ${activeTableTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTableTab('orders')}
            >
              <ShoppingBag size={15} />
              <span>Recent Orders</span>
              <span className="tab-numeric-counter">{orders.length}</span>
            </button>
            <button 
              type="button"
              className={`table-tab-pill ${activeTableTab === 'batches' ? 'active' : ''}`}
              onClick={() => setActiveTableTab('batches')}
            >
              <Truck size={15} />
              <span>Delivery Batches</span>
              <span className="tab-numeric-counter">{deliveryBatches.length}</span>
            </button>
          </div>

          <div className="table-toolbar-meta">
            {activeTableTab === 'orders' ? (
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/orders')}>
                View All Orders <ArrowUpRight size={13} />
              </button>
            ) : (
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/delivery-management')}>
                Manage Batches <ArrowUpRight size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Orders Table */}
        {activeTableTab === 'orders' ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Seller</th>
                  <th>Customer</th>
                  <th>Order Status</th>
                  <th>Aggregation</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
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
                    <td style={{ textAlign: 'right' }}>
                      <span className="monetary-amount">₹{Number(o.total || 0).toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
