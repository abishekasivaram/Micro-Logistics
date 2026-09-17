import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  Map, Layers, CheckCircle2, Clock, Truck, AlertCircle, 
  ArrowRight, ShieldCheck, Info, X, Zap, ChevronRight,
  Sparkles, Check, MapPin, Navigation, Calendar, Box, Boxes,
  ArrowUpRight, Compass, Shield, RefreshCw, Cpu, Activity
} from 'lucide-react';
import { findSuitableOrderGroups } from '../../utils/aggregationUtils';
import StatusBadge from '../../components/common/StatusBadge';
import OrderDetailsModal from '../../components/common/OrderDetailsModal';
import './OrderAggregationPage.css';

// SVG Circular Progress Ring Component
const CircularProgressRing = ({ score, size = 68, strokeWidth = 5 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="circular-score-wrapper" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="circular-score-svg">
        <circle
          className="score-ring-bg"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="score-ring-fill"
          stroke={progress >= 90 ? '#10B981' : progress >= 75 ? '#4F46E5' : '#F59E0B'}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="score-inner-content">
        <span className="score-percentage-text">{progress}%</span>
        <span className="score-caption-text">MATCH</span>
      </div>
    </div>
  );
};

const OrderAggregationPage = () => {
  const { orders, deliveryAgents, deliveryBatches, createDeliveryBatch, adminSettings } = useAppContext();
  const navigate = useNavigate();

  const [confirmingGroup, setConfirmingGroup] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [isReScanning, setIsReScanning] = useState(false);
  const [reScanNotice, setReScanNotice] = useState(null);

  const handleManualRescan = () => {
    setIsReScanning(true);
    setReScanNotice(null);
    setTimeout(() => {
      setIsReScanning(false);
      setReScanNotice(`Algorithm sweep completed: Analyzed ${orders.length} orders across active transit sectors.`);
      setTimeout(() => setReScanNotice(null), 4000);
    }, 750);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && confirmingGroup) {
        setConfirmingGroup(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmingGroup]);

  // 1. Ready & Unbatched Orders
  const readyOrders = orders.filter(o => 
    ['READY_FOR_DELIVERY', 'PREPARING', 'PLACED', 'CONFIRMED'].includes(o.status || o.orderStatus) &&
    !o.batchId &&
    (!o.aggregationStatus || o.aggregationStatus === 'Waiting for Aggregation' || o.aggregationStatus === 'Suitable for Grouping' || o.aggregationStatus === 'Unassigned')
  );

  // 2. Generate Smart Aggregation Suggestions
  const suggestedGroups = findSuitableOrderGroups(orders, deliveryAgents, adminSettings);

  // 3. Confirm Delivery Batch Action
  const handleConfirmBatch = (group) => {
    createDeliveryBatch(group.orderIds, {
      estimatedDistance: group.estimatedDistance,
      estimatedTime: group.estimatedTime,
      compatibilityScore: group.compatibilityScore
    });
    setConfirmingGroup(null);
    navigate('/admin/delivery-management');
  };

  // Workflow Stages
  const workflowStages = [
    { number: '01', title: 'Ready Orders', subtitle: `${readyOrders.length} detected`, status: 'completed' },
    { number: '02', title: 'Spatial Clustering', subtitle: 'Proximity matched', status: 'completed' },
    { number: '03', title: 'Batch Recommendations', subtitle: `${suggestedGroups.length} available`, status: 'active' },
    { number: '04', title: 'Batch Authorization', subtitle: 'Pending approval', status: 'upcoming' },
    { number: '05', title: 'Fleet Dispatch', subtitle: 'Driver assignment', status: 'upcoming' }
  ];

  return (
    <div className="page-container aggregation-hub-page">
      {/* Header Banner */}
      <div className="aggregation-hero-banner">
        <div className="hero-banner-info">
          <div className="hero-status-pill">
            <span className="hero-status-dot" />
            <span>Automated Cluster Engine</span>
          </div>
          <h1 className="hero-page-title">
            Order Aggregation Hub
          </h1>
          <p className="hero-page-subtitle">
            Intelligent multi-seller order consolidation based on delivery windows, spatial pickup clusters, and courier load limits.
          </p>
        </div>

        <div className="hero-banner-actions">
          <button className="btn btn-outline" onClick={() => navigate('/admin/delivery-management')}>
            <Truck size={16} /> View Active Batches
          </button>
        </div>
      </div>

      {/* Styled Stepper Workflow Breadcrumb Ribbon */}
      <div className="workflow-stepper-card">
        <div className="stepper-header-row">
          <div className="stepper-title-flex">
            <div className="stepper-icon-pill">
              <Sparkles size={15} />
            </div>
            <span className="stepper-headline">Aggregation Pipeline Progression</span>
          </div>
          <span className="stepper-meta-note">Stage 3 of 5 active</span>
        </div>

        <div className="stepper-track-ribbon">
          {workflowStages.map((stage, idx) => (
            <React.Fragment key={stage.number}>
              <div className={`stepper-node-pill ${stage.status}`}>
                <div className="stepper-node-badge">
                  {stage.status === 'completed' ? (
                    <Check size={13} className="check-icon" />
                  ) : (
                    <span>{stage.number}</span>
                  )}
                </div>
                <div className="stepper-node-content">
                  <span className="stepper-node-title">{stage.title}</span>
                  <span className="stepper-node-sub">{stage.subtitle}</span>
                </div>
              </div>

              {idx < workflowStages.length - 1 && (
                <div className="stepper-node-divider">
                  <ChevronRight size={15} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Section 1: Hero Batch Recommendations */}
      <div className="recommendations-container">
        <div className="recommendations-section-header">
          <div className="rec-header-titles">
            <div className="rec-title-row">
              <div className="rec-icon-badge">
                <Boxes size={18} />
              </div>
              <h2 className="rec-section-title">
                Recommended Delivery Batches ({suggestedGroups.length})
              </h2>
            </div>
            <p className="rec-section-subtitle">
              High-confidence multi-order bundles mathematically grouped for optimal courier efficiency.
            </p>
          </div>
          <div className="rec-badge-group">
            <span className="ai-status-pill">
              <Sparkles size={12} /> Optimization Engine Active
            </span>
          </div>
        </div>

        {suggestedGroups.length === 0 ? (
          <div className="premium-empty-cluster-card">
            {/* Visual Radar / Constellation Graphic */}
            <div className="empty-cluster-visual">
              <div className="visual-radar-pulse outer-ring" />
              <div className="visual-radar-pulse mid-ring" />
              <div className="empty-cluster-icon-squircle">
                <Boxes size={30} className="cluster-hero-icon" />
                <span className="live-radar-beacon" />
              </div>
            </div>

            {/* Content & Heading */}
            <div className="empty-cluster-content">
              <h3 className="empty-cluster-headline">
                No Multi-Order Clusters Available
              </h3>
              <p className="empty-cluster-description">
                The algorithmic clustering engine is continuously monitoring incoming merchant orders across city corridors. High-confidence multi-order batches will automatically synthesize here once two or more shipments align on delivery timeframes, spatial pickup clusters, and courier load limits.
              </p>

              {reScanNotice && (
                <div className="rescan-feedback-banner">
                  <Sparkles size={14} className="text-emerald" />
                  <span>{reScanNotice}</span>
                </div>
              )}
            </div>



            {/* Quick Command Actions */}
            <div className="empty-cluster-actions">
              <button 
                className={`btn btn-outline empty-action-btn ${isReScanning ? 'scanning' : ''}`}
                onClick={handleManualRescan}
                disabled={isReScanning}
              >
                <RefreshCw size={14} className={isReScanning ? 'animate-spin' : ''} />
                {isReScanning ? 'Evaluating Proximity Matrices...' : 'Force Cluster Re-Scan'}
              </button>

              <button 
                className="btn btn-outline empty-action-btn"
                onClick={() => navigate('/admin/orders')}
              >
                <Layers size={14} />
                Inspect Central Orders Registry
              </button>

              <button 
                className="btn btn-primary empty-action-btn"
                onClick={() => navigate('/admin/delivery-management')}
              >
                <Truck size={14} />
                View Active Delivery Batches <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="recommendations-cards-stack">
            {suggestedGroups.map((group) => (
              <div key={group.id} className="premium-batch-card">
                {/* Batch Header Bar */}
                <div className="batch-card-topbar">
                  <div className="batch-top-left">
                    <div className="batch-tags-row">
                      <span className="batch-ref-chip">{group.id}</span>
                      <span className="batch-confidence-tag">
                        <Sparkles size={12} /> {group.recommendationLabel || 'Recommended Bundle'}
                      </span>
                    </div>
                    <h3 className="batch-main-title">
                      {group.deliveryArea} Regional Delivery Bundle
                    </h3>
                    <div className="batch-schedule-meta">
                      <Calendar size={13} />
                      <span>{group.deliveryDate}</span>
                      <span className="dot-sep">•</span>
                      <Clock size={13} />
                      <span>{group.deliveryTimeSlot}</span>
                    </div>
                  </div>

                  {/* Circular Compatibility Score Ring */}
                  <div className="batch-score-block">
                    <CircularProgressRing score={group.compatibilityScore} />
                  </div>
                </div>

                {/* Logistics Corridors (Pickup & Delivery Corridor) */}
                <div className="transit-corridors-panel">
                  <div className="corridor-segment pickup-segment">
                    <div className="segment-top-label">
                      <MapPin size={13} className="text-amber" />
                      <span>Pickup Corridor</span>
                    </div>
                    <div className="segment-address-text">{group.pickupArea}</div>
                    <div className="segment-source-badge">
                      {group.orders.length} Merchant Source(s)
                    </div>
                  </div>

                  <div className="corridor-transit-arrow">
                    <div className="transit-distance-tag">
                      <Navigation size={12} />
                      <span>{group.estimatedDistance} km • ~{group.estimatedTime}m</span>
                    </div>
                    <div className="transit-line" />
                  </div>

                  <div className="corridor-segment delivery-segment">
                    <div className="segment-top-label">
                      <Navigation size={13} className="text-indigo" />
                      <span>Destination Sector</span>
                    </div>
                    <div className="segment-address-text">{group.deliveryArea}</div>
                    <div className="segment-source-badge">
                      {group.orders.length} Dropoff Location(s)
                    </div>
                  </div>
                </div>

                {/* Clustering & Routing Rationale */}
                <div className="rationale-section-box">
                  <div className="rationale-top-header">
                    <ShieldCheck size={14} className="text-emerald" />
                    <span>Clustering & Routing Rationale:</span>
                  </div>
                  <div className="rationale-tags-wrap">
                    {group.reasons.map((reason, idx) => (
                      <div key={idx} className="rationale-check-tag">
                        <Check size={12} className="check-svg-emerald" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bundled Orders Chips */}
                <div className="bundled-orders-bar">
                  <span className="bundled-bar-label">Bundled Orders ({group.orderCount}):</span>
                  <div className="bundled-chips-wrap">
                    {group.orders.map(o => (
                      <button 
                        key={o.id} 
                        className="order-bundle-pill-btn"
                        onClick={() => setSelectedOrderDetails(o)}
                        title="Click to view order details"
                      >
                        <Box size={12} />
                        <span className="pill-order-id">{o.orderId || o.id}</span>
                        <span className="pill-vendor-name">({o.vendorName})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bottom Footer: Stats + Primary Action */}
                <div className="batch-card-footer">
                  <div className="batch-metrics-quick-summary">
                    <div className="metric-cell">
                      <span className="metric-title-txt">Est. Distance</span>
                      <span className="metric-val-txt">{group.estimatedDistance} km</span>
                    </div>
                    <div className="metric-cell-sep" />
                    <div className="metric-cell">
                      <span className="metric-title-txt">Est. Drive Time</span>
                      <span className="metric-val-txt">{group.estimatedTime} mins</span>
                    </div>
                    <div className="metric-cell-sep" />
                    <div className="metric-cell">
                      <span className="metric-title-txt">Courier Capacity</span>
                      <span className="metric-val-txt">{group.orderCount} / 5 slots</span>
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary btn-confirm-batch"
                    onClick={() => setConfirmingGroup(group)}
                  >
                    <Boxes size={16} /> Confirm Delivery Batch <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Ready Orders Queue Table */}
      <div className="table-card ready-queue-card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Clock size={16} className="text-accent" />
              Ready Orders Awaiting Aggregation ({readyOrders.length})
            </h3>
            <p className="card-subtitle-small">
              Orders packaged and prepared by local merchants, queued for spatial cluster routing.
            </p>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Seller & Pickup</th>
                <th>Customer & Address</th>
                <th>Delivery Window</th>
                <th>Prep Status</th>
                <th>Aggregation Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {readyOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table-container-cell">
                    <div className="premium-table-empty-state">
                      <div className="table-empty-icon-bubble">
                        <Box size={24} />
                      </div>
                      <div className="table-empty-text-wrap">
                        <h4 className="table-empty-title">Queue Synchronized & Clear</h4>
                        <p className="table-empty-desc">
                          All merchant packaged orders have been processed, aggregated into delivery batches, or dispatched to active fleet couriers.
                        </p>
                      </div>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => navigate('/admin/orders')}
                      >
                        Inspect Central Orders
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                readyOrders.map(o => (
                  <tr key={o.id}>
                    <td>
                      <span className="order-id-chip">{o.orderId || o.id}</span>
                    </td>
                    <td>
                      <div className="seller-pickup-cell">
                        <span className="seller-cell-name">{o.vendorName || o.sellerName}</span>
                        <span className="pickup-location-muted">{o.pickupLocation}</span>
                      </div>
                    </td>
                    <td>
                      <div className="customer-delivery-cell">
                        <span className="customer-cell-name">{o.customerName}</span>
                        <span className="delivery-location-text">{o.deliveryLocation}</span>
                      </div>
                    </td>
                    <td>
                      <div className="delivery-window-cell">
                        <span>{o.deliveryDate}</span>
                        <span className="window-time">{o.deliveryTimeSlot}</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={o.status || o.orderStatus} />
                    </td>
                    <td>
                      <span className="aggregation-tag">
                        {o.aggregationStatus || 'Waiting for Sweep'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => setSelectedOrderDetails(o)}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal before creating batch */}
      {/* Confirmation Modal before creating batch - Mounted via Portal to document.body for full viewport backdrop blur */}
      {confirmingGroup && createPortal(
        <div 
          className="modal-backdrop-command" 
          onClick={() => setConfirmingGroup(null)}
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="confirm-batch-title"
        >
          <div className="modal-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-title-with-icon">
                <div className="modal-icon-badge">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 id="confirm-batch-title">Authorize Delivery Batch</h3>
                  <span className="modal-subtitle">Commit consolidated route to dispatch queue</span>
                </div>
              </div>
              <button 
                className="modal-close-trigger" 
                aria-label="Close dialog" 
                onClick={() => setConfirmingGroup(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-dialog-body">
              <p className="modal-lead-text">
                You are about to bundle <strong>{confirmingGroup.orderCount} customer orders</strong> into a single coordinated route in <strong>{confirmingGroup.deliveryArea}</strong>.
              </p>
              
              <div className="modal-summary-panel">
                <div className="summary-row">
                  <span className="summary-lbl">Target Orders:</span>
                  <span className="summary-val font-mono">{confirmingGroup.orderIds.join(', ')}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-lbl">Delivery Slot:</span>
                  <span className="summary-val">{confirmingGroup.deliveryTimeSlot}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-lbl">Est. Distance:</span>
                  <span className="summary-val">{confirmingGroup.estimatedDistance} km</span>
                </div>
                <div className="summary-row">
                  <span className="summary-lbl">Compatibility:</span>
                  <span className="summary-val text-emerald font-bold">{confirmingGroup.compatibilityScore}%</span>
                </div>
              </div>

              <div className="modal-notice-banner">
                <Info size={16} className="notice-icon" />
                <span>
                  The newly created batch will be registered as <strong>"Pending Assignment"</strong>. You can dispatch an available fleet agent immediately from the Delivery Management console.
                </span>
              </div>
            </div>

            <div className="modal-dialog-footer">
              <button className="btn btn-outline" onClick={() => setConfirmingGroup(null)}>
                Dismiss
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => handleConfirmBatch(confirmingGroup)}
              >
                <Boxes size={16} /> Confirm & Dispatch Batch
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Reusable Order Details Modal */}
      {selectedOrderDetails && (
        <OrderDetailsModal order={selectedOrderDetails} onClose={() => setSelectedOrderDetails(null)} />
      )}
    </div>
  );
};

export default OrderAggregationPage;
