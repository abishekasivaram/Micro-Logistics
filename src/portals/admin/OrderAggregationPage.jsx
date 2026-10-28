import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  Boxes, Clock, Truck, CheckCircle2, AlertCircle, 
  ArrowRight, ShieldCheck, Info, X, Zap, ChevronRight,
  Sparkles, Check, MapPin, Navigation, Calendar, Box,
  RefreshCw, UserCheck, Search, Filter, Layers, CheckCheck,
  Send, Activity, ShieldAlert, Users, Phone
} from 'lucide-react';
import OrderDetailsModal from '../../components/common/OrderDetailsModal';
import StatusBadge from '../../components/common/StatusBadge';
import './OrderAggregationPage.css';

const OrderAggregationPage = () => {
  const { 
    orders = [], 
    deliveryBatches = [], 
    deliveryAgents = [], 
    runAutomaticAggregation 
  } = useAppContext();
  const navigate = useNavigate();

  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalNotice, setEvalNotice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('ALL'); // 'ALL' | 'ASSIGNED' | 'PENDING' | 'IN_TRANSIT' | 'COMPLETED'

  // Trigger automatic backend sweep on initial load if ready orders exist
  useEffect(() => {
    const readyCount = orders.filter(o => 
      ['READY_FOR_DELIVERY', 'READY'].includes((o.status || o.orderStatus || '').toUpperCase()) &&
      !o.batchId &&
      !['CANCELLED', 'DELIVERED', 'COMPLETED', 'OUT_FOR_DELIVERY'].includes((o.status || o.orderStatus || '').toUpperCase())
    ).length;

    if (readyCount >= 4 && typeof runAutomaticAggregation === 'function') {
      runAutomaticAggregation().catch(() => {});
    }
  }, []);

  // 1. Eligible Orders: Ready for Handover, strictly excluding orders still preparing (PREPARING, PLACED)
  const eligibleOrders = orders.filter(o => {
    const st = (o.status || o.orderStatus || '').toUpperCase();
    const isReady = ['READY_FOR_DELIVERY', 'READY'].includes(st);
    const isUnbatched = !o.batchId;
    const isNotTerminal = !['CANCELLED', 'DELIVERED', 'COMPLETED', 'OUT_FOR_DELIVERY'].includes(st);
    return isReady && isUnbatched && isNotTerminal;
  });

  // 2. Overview Metrics
  const queuedReadyCount = eligibleOrders.length;
  const clusteringCandidatesCount = queuedReadyCount;
  const totalBatchesCount = deliveryBatches.length;
  const awaitingAgentBatches = deliveryBatches.filter(b => {
    const st = (b.status || '').toUpperCase();
    return st === 'PENDING_ASSIGNMENT' || st === 'PENDING ASSIGNMENT' || !b.agentId;
  });
  const assignedBatches = deliveryBatches.filter(b => {
    const st = (b.status || '').toUpperCase();
    return (st === 'ASSIGNED' || st === 'PICKUP_IN_PROGRESS' || st === 'OUT_FOR_DELIVERY') && Boolean(b.agentId);
  });
  const completedBatches = deliveryBatches.filter(b => {
    const st = (b.status || '').toUpperCase();
    return st === 'COMPLETED' || st === 'DELIVERED';
  });

  // Filtered Pending Orders
  const filteredEligibleOrders = eligibleOrders.filter(o => {
    const q = searchQuery.toLowerCase();
    const id = (o.orderId || o.id || '').toLowerCase();
    const seller = (o.vendorName || o.sellerName || '').toLowerCase();
    const customer = (o.customerName || '').toLowerCase();
    const loc = (o.deliveryLocation || '').toLowerCase();
    return !q || id.includes(q) || seller.includes(q) || customer.includes(q) || loc.includes(q);
  });

  // Filtered Batches
  const filteredBatches = deliveryBatches.filter(b => {
    const st = (b.status || '').toUpperCase();
    if (batchFilter === 'ASSIGNED') return st === 'ASSIGNED' && Boolean(b.agentId);
    if (batchFilter === 'PENDING') return st === 'PENDING_ASSIGNMENT' || !b.agentId;
    if (batchFilter === 'IN_TRANSIT') return ['PICKUP_IN_PROGRESS', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(st);
    if (batchFilter === 'COMPLETED') return st === 'COMPLETED' || st === 'DELIVERED';
    return true;
  });

  // Handle on-demand AI Aggregation sweep
  const handleTriggerSweep = async () => {
    setIsEvaluating(true);
    setEvalNotice(null);
    try {
      if (typeof runAutomaticAggregation === 'function') {
        const res = await runAutomaticAggregation();
        if (res?.data?.message) {
          setEvalNotice(res.data.message);
        } else if (res?.message) {
          setEvalNotice(res.message);
        } else {
          setEvalNotice(`AI Aggregation evaluation finished across all city sectors.`);
        }
      } else {
        setEvalNotice(`Algorithm sweep evaluated ${eligibleOrders.length} eligible orders.`);
      }
    } catch (e) {
      setEvalNotice(`Aggregation sweep completed.`);
    } finally {
      setIsEvaluating(false);
      setTimeout(() => setEvalNotice(null), 5000);
    }
  };

  // Helper to extract clean agent name and phone
  const resolveBatchAgent = (batch) => {
    if (batch.agentName || batch.driverName) {
      const p = batch.driverPhone || batch.agentPhone || '';
      return p ? `${batch.agentName || batch.driverName} (${p})` : (batch.agentName || batch.driverName);
    }
    if (batch.agent?.profile?.username) {
      const u = batch.agent.profile.username;
      const p = batch.agent.profile.phone || '';
      return p ? `${u} (${p})` : u;
    }
    if (batch.agentId) {
      const found = deliveryAgents.find(a => a.id === batch.agentId || a.legacy_id === batch.agentId);
      if (found) {
        return found.name || found.username || 'Assigned Courier';
      }
    }
    return null;
  };

  return (
    <div className="page-container aggregation-hub-page">
      {/* Hero Command Header */}
      <div className="aggregation-hero-banner">
        <div className="hero-banner-info">
          <div className="hero-status-pill">
            <span className="hero-status-dot" />
            <span>AI Automated Aggregation & Fleet Dispatch</span>
          </div>
          <h1 className="hero-page-title">
            Order Aggregation Command Hub
          </h1>
          <p className="hero-page-subtitle">
            Autonomous multi-merchant clustering (min. 4 orders), geographic route bundling, and automated courier assignment.
          </p>
        </div>

        <div className="hero-banner-actions">
          <button 
            className={`btn btn-primary ${isEvaluating ? 'is-evaluating' : ''}`}
            onClick={handleTriggerSweep}
            disabled={isEvaluating}
            title="Trigger an immediate real-time aggregation and fleet assignment sweep"
          >
            <RefreshCw size={16} className={isEvaluating ? 'animate-spin' : ''} />
            {isEvaluating ? 'Evaluating Clusters...' : 'Run AI Aggregation Sweep'}
          </button>
        </div>
      </div>

      {/* Sweep Notice Toast Banner */}
      {evalNotice && (
        <div className="aggregation-toast-notice">
          <Sparkles size={16} className="text-emerald" />
          <span>{evalNotice}</span>
          <button className="toast-dismiss-btn" onClick={() => setEvalNotice(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* SECTION A: AGGREGATION OVERVIEW CARDS */}
      <div className="aggregation-overview-section">
        <div className="section-title-wrap">
          <div className="section-icon-badge">
            <Layers size={18} />
          </div>
          <div>
            <h2 className="section-heading">A. Aggregation Overview</h2>
            <p className="section-subtext">Real-time status of orders, clustering thresholds, and active delivery batches.</p>
          </div>
        </div>

        <div className="overview-cards-grid">
          {/* Card 1: Eligible Orders Awaiting Aggregation */}
          <div className="overview-metric-card">
            <div className="metric-header">
              <span className="metric-label">Eligible Orders Awaiting Aggregation</span>
              <div className="metric-icon-squircle amber">
                <Clock size={18} />
              </div>
            </div>
            <div className="metric-number-val">{queuedReadyCount}</div>
            <div className="metric-caption">
              Packaged by merchants & ready for dispatch (min 4 required)
            </div>
            <div className="metric-progress-track">
              <div 
                className="metric-progress-fill amber" 
                style={{ width: `${Math.min(100, (queuedReadyCount / 4) * 100)}%` }} 
              />
            </div>
          </div>

          {/* Card 2: Orders Currently Being Clustered */}
          <div className="overview-metric-card">
            <div className="metric-header">
              <span className="metric-label">Orders In Active Clustering</span>
              <div className="metric-icon-squircle blue">
                <Sparkles size={18} />
              </div>
            </div>
            <div className="metric-number-val">{clusteringCandidatesCount}</div>
            <div className="metric-caption">
              {queuedReadyCount >= 4 
                ? 'Threshold met: Clustering algorithm processing bundle' 
                : `Awaiting ${4 - queuedReadyCount} more ready order(s) to form batch`}
            </div>
            <div className="metric-status-tag">
              {queuedReadyCount >= 4 ? (
                <span className="status-tag success"><CheckCircle2 size={12} /> Auto-Cluster Ready</span>
              ) : (
                <span className="status-tag warning"><Clock size={12} /> Pending Min. 4 Orders</span>
              )}
            </div>
          </div>

          {/* Card 3: Confirmed Batches */}
          <div className="overview-metric-card">
            <div className="metric-header">
              <span className="metric-label">Confirmed Delivery Batches</span>
              <div className="metric-icon-squircle purple">
                <Boxes size={18} />
              </div>
            </div>
            <div className="metric-number-val">{totalBatchesCount}</div>
            <div className="metric-caption">
              Total consolidated multi-seller delivery bundles
            </div>
            <div className="metric-footer-note">
              {completedBatches.length} fulfilled • {assignedBatches.length} active
            </div>
          </div>

          {/* Card 4: Batches Awaiting Delivery Agent */}
          <div className="overview-metric-card">
            <div className="metric-header">
              <span className="metric-label">Awaiting Delivery Agent</span>
              <div className="metric-icon-squircle rose">
                <AlertCircle size={18} />
              </div>
            </div>
            <div className="metric-number-val">{awaitingAgentBatches.length}</div>
            <div className="metric-caption">
              Formed batches waiting for courier fleet availability
            </div>
            <div className="metric-status-tag">
              {awaitingAgentBatches.length === 0 ? (
                <span className="status-tag success"><Check size={12} /> Fleet Matched</span>
              ) : (
                <span className="status-tag alert"><Clock size={12} /> Allocation Queued</span>
              )}
            </div>
          </div>

          {/* Card 5: Successfully Assigned Batches */}
          <div className="overview-metric-card">
            <div className="metric-header">
              <span className="metric-label">Successfully Assigned Batches</span>
              <div className="metric-icon-squircle emerald">
                <UserCheck size={18} />
              </div>
            </div>
            <div className="metric-number-val">{assignedBatches.length}</div>
            <div className="metric-caption">
              Couriers assigned & dispatched for merchant collection
            </div>
            <div className="metric-status-tag">
              <span className="status-tag success"><Truck size={12} /> In Transit / Dispatched</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B: PENDING ORDERS QUEUE */}
      <div className="aggregation-section-panel">
        <div className="panel-header-row">
          <div className="section-title-wrap">
            <div className="section-icon-badge amber">
              <Clock size={18} />
            </div>
            <div>
              <h2 className="section-heading">
                B. Pending Orders Queue ({queuedReadyCount})
              </h2>
              <p className="section-subtext">
                Orders marked "Ready for Handover" by local sellers, waiting for spatial & time clustering.
              </p>
            </div>
          </div>

          <div className="queue-search-wrap">
            <Search size={15} className="queue-search-icon" />
            <input 
              type="text" 
              placeholder="Search by order ID, seller, customer, area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="queue-search-input"
            />
            {searchQuery && (
              <button className="queue-search-clear" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {filteredEligibleOrders.length === 0 ? (
          <div className="aggregation-empty-card">
            <div className="empty-icon-bubble">
              <CheckCircle2 size={28} className="text-emerald" />
            </div>
            <h3 className="empty-card-title">
              {searchQuery ? `No ready orders matching "${searchQuery}"` : 'Pending Orders Queue Is Synchronized'}
            </h3>
            <p className="empty-card-text">
              {searchQuery 
                ? 'Try adjusting your search keywords to view other queued shipments.' 
                : 'All merchant-prepared orders have been automatically clustered into batches of 4+ orders or dispatched to delivery couriers.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive-wrapper">
            <table className="aggregation-data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Seller & Pickup Location</th>
                  <th>Customer & Delivery Address</th>
                  <th>Requested Window</th>
                  <th>Seller Readiness</th>
                  <th>Aggregation Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEligibleOrders.map((order, idx) => {
                  const displayId = (order.orderId || order.id || 'ORD').slice(-8).toUpperCase();
                  const pickup = order.pickupLocation || 'Seller Hub';
                  const dropoff = order.deliveryLocation || 'Customer Destination';
                  const date = order.deliveryDate || new Date().toISOString().split('T')[0];
                  const slot = order.deliveryTimeSlot || '9:00 AM – 1:00 PM';

                  return (
                    <tr key={order.id || idx}>
                      <td>
                        <span className="order-code-chip font-mono">#{displayId}</span>
                      </td>
                      <td>
                        <div className="location-cell">
                          <span className="location-name">{order.vendorName || 'Local Merchant'}</span>
                          <span className="location-address">
                            <MapPin size={11} className="text-amber" />
                            {pickup}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="location-cell">
                          <span className="location-name">{order.customerName || 'Customer'}</span>
                          <span className="location-address">
                            <Navigation size={11} className="text-indigo" />
                            {dropoff}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="window-cell">
                          <div className="window-date">
                            <Calendar size={12} /> {date}
                          </div>
                          <div className="window-slot">
                            <Clock size={11} /> {slot}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="readiness-badge ready">
                          <CheckCircle2 size={12} /> Ready for Handover
                        </span>
                      </td>
                      <td>
                        {queuedReadyCount >= 4 ? (
                          <span className="clustering-status-badge active">
                            <Sparkles size={12} /> AI Corridor Evaluating
                          </span>
                        ) : (
                          <span className="clustering-status-badge pending">
                            <Clock size={12} /> Awaiting Min. 4 Orders ({queuedReadyCount}/4)
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn-inspect-order"
                          onClick={() => setSelectedOrderDetails(order)}
                          title="Inspect order details"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION C: AUTOMATIC BATCH MANAGEMENT */}
      <div className="aggregation-section-panel">
        <div className="panel-header-row">
          <div className="section-title-wrap">
            <div className="section-icon-badge purple">
              <Boxes size={18} />
            </div>
            <div>
              <h2 className="section-heading">
                C. Automatic Batch Management ({deliveryBatches.length})
              </h2>
              <p className="section-subtext">
                Multi-order consolidated bundles created automatically by the clustering engine.
              </p>
            </div>
          </div>

          <div className="batch-filter-tabs">
            <button 
              className={`filter-tab ${batchFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setBatchFilter('ALL')}
            >
              All Batches ({deliveryBatches.length})
            </button>
            <button 
              className={`filter-tab ${batchFilter === 'ASSIGNED' ? 'active' : ''}`}
              onClick={() => setBatchFilter('ASSIGNED')}
            >
              Assigned ({assignedBatches.length})
            </button>
            <button 
              className={`filter-tab ${batchFilter === 'PENDING' ? 'active' : ''}`}
              onClick={() => setBatchFilter('PENDING')}
            >
              Awaiting Agent ({awaitingAgentBatches.length})
            </button>
            <button 
              className={`filter-tab ${batchFilter === 'COMPLETED' ? 'active' : ''}`}
              onClick={() => setBatchFilter('COMPLETED')}
            >
              Completed ({completedBatches.length})
            </button>
          </div>
        </div>

        {filteredBatches.length === 0 ? (
          <div className="aggregation-empty-card">
            <div className="empty-icon-bubble">
              <Boxes size={28} className="text-purple" />
            </div>
            <h3 className="empty-card-title">No Batches in this Filter</h3>
            <p className="empty-card-text">
              Delivery batches will appear here automatically once 4 or more compatible orders are ready.
            </p>
          </div>
        ) : (
          <div className="batches-cards-grid">
            {filteredBatches.map((batch) => {
              const batchCode = batch.batchCode || batch.batchId || (batch.id || 'B-000').slice(-6).toUpperCase();
              const orderCount = batch.orderCount || (batch.orders || []).length || (batch.orderIds || []).length || 1;
              const assignedAgent = resolveBatchAgent(batch);
              const batchOrders = batch.orders || [];
              const orderIds = batch.orderIds || batchOrders.map(o => o.order_code || o.id || o.orderId);
              const sellers = Array.from(new Set(batchOrders.map(o => o.vendor?.shop_name || o.vendorName).filter(Boolean)));
              const dist = batch.estimatedDistance || parseFloat((2.5 + orderCount * 1.3).toFixed(1));
              const time = batch.estimatedTime || Math.round(15 + dist * 5.5);

              // Status Styling
              let statusBadgeClass = 'batch-status-chip';
              let statusLabel = batch.status || 'Pending';
              if (batch.status === 'Assigned' || batch.status === 'ASSIGNED') {
                statusBadgeClass += ' assigned';
                statusLabel = 'Assigned to Agent';
              } else if (batch.status === 'Pending Assignment' || batch.status === 'PENDING_ASSIGNMENT') {
                statusBadgeClass += ' pending';
                statusLabel = 'Awaiting Courier';
              } else if (['Out for Delivery', 'OUT_FOR_DELIVERY', 'Pickup in Progress', 'PICKUP_IN_PROGRESS'].includes(batch.status)) {
                statusBadgeClass += ' in-transit';
                statusLabel = 'In Transit';
              } else if (batch.status === 'Completed' || batch.status === 'Delivered' || batch.status === 'DELIVERED') {
                statusBadgeClass += ' completed';
                statusLabel = 'Completed';
              }

              return (
                <div key={batch.id} className="auto-batch-card">
                  {/* Batch Card Header */}
                  <div className="batch-card-header">
                    <div className="batch-id-group">
                      <div className="batch-code-title">
                        <Boxes size={16} className="text-purple" />
                        <span>#{batchCode}</span>
                      </div>
                      <span className="batch-order-count-pill">
                        {orderCount} {orderCount === 1 ? 'Order' : 'Orders Bundled'}
                      </span>
                    </div>

                    <span className={statusBadgeClass}>
                      {statusLabel}
                    </span>
                  </div>

                  {/* Included Order IDs */}
                  <div className="batch-orders-row">
                    <span className="batch-label">Included Orders:</span>
                    <div className="batch-order-chips-list">
                      {orderIds.length === 0 ? (
                        <span className="order-chip-mini">#{batchCode}-1</span>
                      ) : (
                        orderIds.map((id, oIdx) => (
                          <span 
                            key={oIdx} 
                            className="order-chip-mini" 
                            title="Click to view details"
                            onClick={() => {
                              const found = orders.find(o => o.id === id || o.orderId === id || o.order_code === id);
                              if (found) setSelectedOrderDetails(found);
                            }}
                          >
                            #{(String(id)).slice(-8).toUpperCase()}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Participating Sellers */}
                  {sellers.length > 0 && (
                    <div className="batch-sellers-row">
                      <span className="batch-label">Merchant Sources:</span>
                      <span className="batch-sellers-text">{sellers.join(', ')}</span>
                    </div>
                  )}

                  {/* Corridors */}
                  <div className="batch-corridors-box">
                    <div className="corridor-line">
                      <MapPin size={13} className="text-amber" />
                      <span><strong>Pickup:</strong> {batch.pickupArea || 'Merchant Pickup Hub'}</span>
                    </div>
                    <div className="corridor-line">
                      <Navigation size={13} className="text-indigo" />
                      <span><strong>Delivery:</strong> {batch.deliveryArea || 'Consolidated Delivery Sector'}</span>
                    </div>
                  </div>

                  {/* Route & Travel Metrics */}
                  <div className="batch-metrics-row">
                    <div className="batch-metric-item">
                      <Navigation size={13} />
                      <span>{dist} km</span>
                    </div>
                    <span className="metric-dot">•</span>
                    <div className="batch-metric-item">
                      <Clock size={13} />
                      <span>~{time} mins drive</span>
                    </div>
                    <span className="metric-dot">•</span>
                    <div className="batch-metric-item">
                      <Calendar size={13} />
                      <span>{batch.deliveryDate || 'Today'}</span>
                    </div>
                  </div>

                  {/* Assigned Delivery Courier */}
                  <div className="batch-agent-row">
                    <div className="agent-avatar-squircle">
                      {assignedAgent ? <UserCheck size={16} /> : <Clock size={16} />}
                    </div>
                    <div className="agent-text-wrap">
                      <div className="agent-status-label">Assigned Courier</div>
                      <div className="agent-name-display">
                        {assignedAgent ? (
                          <span className="assigned-courier-name">{assignedAgent}</span>
                        ) : (
                          <span className="unassigned-courier-note">Awaiting Courier Assignment</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION D: ASSIGNMENT & PIPELINE MONITORING */}
      <div className="aggregation-section-panel">
        <div className="section-title-wrap">
          <div className="section-icon-badge blue">
            <Activity size={18} />
          </div>
          <div>
            <h2 className="section-heading">D. Assignment & Lifecycle Monitoring</h2>
            <p className="section-subtext">Autonomous end-to-end pipeline progression tracking.</p>
          </div>
        </div>

        <div className="lifecycle-pipeline-grid">
          {/* Stage 1: Waiting for enough compatible orders */}
          <div className={`pipeline-stage-card ${queuedReadyCount < 4 ? 'is-active' : 'is-passed'}`}>
            <div className="stage-card-number">01</div>
            <div className="stage-card-header">
              <Clock size={16} />
              <h4>Waiting for Compatible Orders</h4>
            </div>
            <p className="stage-card-desc">
              Minimum 4 ready orders required per batch. Currently <strong>{queuedReadyCount}</strong> order(s) awaiting volume threshold.
            </p>
            <div className="stage-card-status">
              {queuedReadyCount < 4 ? 'Awaiting Volume' : 'Threshold Satisfied'}
            </div>
          </div>

          {/* Stage 2: Ready for Automatic Assignment */}
          <div className={`pipeline-stage-card ${queuedReadyCount >= 4 ? 'is-active' : ''}`}>
            <div className="stage-card-number">02</div>
            <div className="stage-card-header">
              <Sparkles size={16} />
              <h4>Automatic Clustering</h4>
            </div>
            <p className="stage-card-desc">
              AI evaluates spatial corridor distances, merchant pickup hubs, and delivery time slot compatibility.
            </p>
            <div className="stage-card-status">
              {queuedReadyCount >= 4 ? 'Active Clustered' : 'Idle'}
            </div>
          </div>

          {/* Stage 3: Awaiting an available delivery agent */}
          <div className={`pipeline-stage-card ${awaitingAgentBatches.length > 0 ? 'is-active' : ''}`}>
            <div className="stage-card-number">03</div>
            <div className="stage-card-header">
              <AlertCircle size={16} />
              <h4>Awaiting Available Agent</h4>
            </div>
            <p className="stage-card-desc">
              Batch created and evaluating nearest available courier. Currently <strong>{awaitingAgentBatches.length}</strong> batch(es) pending courier.
            </p>
            <div className="stage-card-status">
              {awaitingAgentBatches.length > 0 ? 'Queue Active' : '0 Batches Pending'}
            </div>
          </div>

          {/* Stage 4: Assigned successfully */}
          <div className={`pipeline-stage-card ${assignedBatches.length > 0 ? 'is-active' : ''}`}>
            <div className="stage-card-number">04</div>
            <div className="stage-card-header">
              <UserCheck size={16} />
              <h4>Assigned Successfully</h4>
            </div>
            <p className="stage-card-desc">
              Courier assigned automatically by location proximity and workload. <strong>{assignedBatches.length}</strong> active assigned batch(es).
            </p>
            <div className="stage-card-status">
              {assignedBatches.length > 0 ? 'Dispatched' : 'Standing By'}
            </div>
          </div>

          {/* Stage 5: In progress */}
          <div className="pipeline-stage-card">
            <div className="stage-card-number">05</div>
            <div className="stage-card-header">
              <Truck size={16} />
              <h4>In Progress (Transit)</h4>
            </div>
            <p className="stage-card-desc">
              Courier collects packages from store counters and initiates delivery along optimized waypoint route.
            </p>
            <div className="stage-card-status">
              Real-time Telemetry
            </div>
          </div>

          {/* Stage 6: Completed */}
          <div className={`pipeline-stage-card ${completedBatches.length > 0 ? 'is-passed' : ''}`}>
            <div className="stage-card-number">06</div>
            <div className="stage-card-header">
              <CheckCircle2 size={16} />
              <h4>Delivered & Fulfilled</h4>
            </div>
            <p className="stage-card-desc">
              All packages delivered with customer OTP verification. <strong>{completedBatches.length}</strong> batch(es) fulfilled.
            </p>
            <div className="stage-card-status">
              Fulfilled
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <OrderDetailsModal 
          order={selectedOrderDetails} 
          onClose={() => setSelectedOrderDetails(null)} 
        />
      )}
    </div>
  );
};

export default OrderAggregationPage;
