import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  Map, Layers, CheckCircle, Clock, Truck, AlertCircle, 
  ArrowRight, ShieldCheck, Info, X, Zap, ChevronRight,
  Sparkles, Check, MapPin, Navigation, Calendar, Box, Boxes
} from 'lucide-react';
import { findSuitableOrderGroups } from '../../utils/aggregationUtils';
import StatusBadge from '../../components/common/StatusBadge';
import OrderDetailsModal from '../../components/common/OrderDetailsModal';
import './OrderAggregationPage.css';

// SVG Circular Progress Ring Component
const CircularProgressRing = ({ score, size = 72, strokeWidth = 6 }) => {
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
          stroke={progress >= 90 ? '#10B981' : progress >= 75 ? '#6366F1' : '#F59E0B'}
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
    { number: '03', title: 'AI Recommendation', subtitle: `${suggestedGroups.length} available`, status: 'active' },
    { number: '04', title: 'Batch Handover', subtitle: 'Pending approval', status: 'upcoming' },
    { number: '05', title: 'Fleet Dispatch', subtitle: 'Agent assignment', status: 'upcoming' }
  ];

  return (
    <div className="page-container aggregation-hub-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h2>
            Smart Order Aggregation Hub
            <span className="telemetry-tag">
              <span className="telemetry-pulse" /> CLUSTER ENGINE
            </span>
          </h2>
          <p className="page-subtitle">
            Autonomous multi-seller order clustering based on temporal windows, pickup density, dropoff corridors, and courier vehicle constraints.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => navigate('/admin/delivery-management')}>
            <Truck size={16} /> View Active Batches
          </button>
        </div>
      </div>

      {/* Styled Stepper Workflow Breadcrumb */}
      <div className="workflow-stepper-card">
        <div className="stepper-header-label">
          <Sparkles size={16} className="text-accent" />
          <span>Aggregation Orchestration Workflow</span>
        </div>

        <div className="stepper-track-container">
          {workflowStages.map((stage, idx) => (
            <React.Fragment key={stage.number}>
              <div className={`stepper-node ${stage.status}`}>
                <div className="stepper-badge">
                  {stage.status === 'completed' ? (
                    <Check size={14} className="check-svg" />
                  ) : (
                    <span>{stage.number}</span>
                  )}
                </div>
                <div className="stepper-text">
                  <span className="stepper-title">{stage.title}</span>
                  <span className="stepper-sub">{stage.subtitle}</span>
                </div>
              </div>

              {idx < workflowStages.length - 1 && (
                <div className={`stepper-connector ${idx < 2 ? 'completed' : idx === 2 ? 'active' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Section 1: Hero Batch Recommendations */}
      <div className="recommendations-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">
              <Zap size={18} className="text-accent" />
              Algorithmic Batch Recommendations ({suggestedGroups.length})
            </h3>
            <p className="section-subtitle">
              High-confidence order bundles mathematically optimized for unified local courier routing.
            </p>
          </div>
          <span className="ai-badge-chip">
            <Sparkles size={13} /> AI SCORING ACTIVE
          </span>
        </div>

        {suggestedGroups.length === 0 ? (
          <div className="card empty-recommendations-card">
            <Info size={36} className="text-accent-secondary" />
            <h4>No Multi-Order Clusters Available</h4>
            <p>
              As sellers mark additional orders ready within overlapping delivery slots and nearby sectors, high-compatibility bundles will automatically populate here.
            </p>
          </div>
        ) : (
          <div className="hero-recommendations-grid">
            {suggestedGroups.map((group) => (
              <div key={group.id} className="hero-batch-card">
                {/* Hero Header Row */}
                <div className="hero-batch-header">
                  <div className="batch-meta-left">
                    <div className="batch-badge-row">
                      <span className="batch-code-tag">{group.id}</span>
                      <span className="recommendation-pill-label">
                        <Sparkles size={11} /> {group.recommendationLabel}
                      </span>
                    </div>
                    <h3 className="batch-hero-title">
                      {group.deliveryArea} Regional Bundle
                    </h3>
                    <div className="batch-time-window">
                      <Calendar size={13} />
                      <span>{group.deliveryDate}</span>
                      <span className="separator">•</span>
                      <Clock size={13} />
                      <span>{group.deliveryTimeSlot}</span>
                    </div>
                  </div>

                  {/* Circular Compatibility Progress Ring */}
                  <div className="batch-score-ring-container">
                    <CircularProgressRing score={group.compatibilityScore} />
                  </div>
                </div>

                {/* Logistics Corridors (Pickup vs Dropoff) */}
                <div className="logistics-corridors-grid">
                  <div className="corridor-box pickup">
                    <div className="corridor-header">
                      <MapPin size={14} className="text-amber" />
                      <span>Pickup Corridor</span>
                    </div>
                    <p className="corridor-address">{group.pickupArea}</p>
                    <div className="corridor-sub">
                      <span>{group.orders.length} Merchant Source(s)</span>
                    </div>
                  </div>

                  <div className="corridor-box delivery">
                    <div className="corridor-header">
                      <Navigation size={14} className="text-indigo" />
                      <span>Destination Sector</span>
                    </div>
                    <p className="corridor-address">{group.deliveryArea}</p>
                    <div className="corridor-sub">
                      <span>{group.orders.length} Dropoff Destination(s)</span>
                    </div>
                  </div>
                </div>

                {/* Scoring Rationale Checklist */}
                <div className="scoring-rationale-box">
                  <div className="rationale-header">
                    <ShieldCheck size={14} className="text-emerald" />
                    <span>Clustering & Routing Rationale:</span>
                  </div>
                  <div className="rationale-checklist">
                    {group.reasons.map((reason, idx) => (
                      <div key={idx} className="rationale-check-pill">
                        <div className="check-icon-circle">
                          <Check size={11} />
                        </div>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bundled Orders Chips */}
                <div className="bundled-orders-row">
                  <span className="bundled-orders-label">Bundled Orders ({group.orderCount}):</span>
                  <div className="order-chips-list">
                    {group.orders.map(o => (
                      <button 
                        key={o.id} 
                        className="bundled-order-chip"
                        onClick={() => setSelectedOrderDetails(o)}
                        title="Click to view full order details"
                      >
                        <Box size={12} />
                        <span className="order-chip-id">{o.orderId || o.id}</span>
                        <span className="order-chip-vendor">({o.vendorName})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bottom Telemetry Metrics Bar */}
                <div className="batch-telemetry-bar">
                  <div className="batch-metric-item">
                    <span className="metric-title">Est. Distance</span>
                    <span className="metric-val">{group.estimatedDistance} km</span>
                  </div>
                  <div className="batch-metric-divider" />
                  <div className="batch-metric-item">
                    <span className="metric-title">Est. Drive Time</span>
                    <span className="metric-val">{group.estimatedTime} mins</span>
                  </div>
                  <div className="batch-metric-divider" />
                  <div className="batch-metric-item">
                    <span className="metric-title">Courier Capacity</span>
                    <span className="metric-val">{group.orderCount} / 5 slots</span>
                  </div>
                </div>

                {/* Primary CTA Command Action */}
                <div className="hero-batch-cta-row">
                  <button 
                    className="btn btn-primary btn-hero-confirm"
                    onClick={() => setConfirmingGroup(group)}
                  >
                    <Boxes size={16} /> Confirm Delivery Batch Creation <ArrowRight size={15} />
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
              <Clock size={17} className="text-accent" />
              Ready Orders Awaiting Consolidation ({readyOrders.length})
            </h3>
            <p className="card-subtitle-small">
              Orders confirmed by merchants and prepared for pickup routing.
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
                  <td colSpan="7" className="empty-state-box">
                    <p>No unbatched orders currently waiting in queue.</p>
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
                      <span className="status-pill status-pending">
                        <span className="pill-dot" />
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
      {confirmingGroup && (
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
                You are about to bundle <strong>{confirmingGroup.orderCount} independent customer orders</strong> into a single coordinated route in <strong>{confirmingGroup.deliveryArea}</strong>.
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
        </div>
      )}

      {/* Reusable Order Details Modal */}
      {selectedOrderDetails && (
        <OrderDetailsModal order={selectedOrderDetails} onClose={() => setSelectedOrderDetails(null)} />
      )}
    </div>
  );
};

export default OrderAggregationPage;
