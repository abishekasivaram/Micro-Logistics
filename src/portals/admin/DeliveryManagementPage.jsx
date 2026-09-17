import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  Truck, UserCheck, Navigation, Layers, CheckCircle, 
  Clock, X, ChevronRight, User, AlertCircle, Play, Eye,
  MapPin, Calendar, Check, ArrowRight, ShieldCheck, Box
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import './DeliveryManagementPage.css';

const DeliveryManagementPage = () => {
  const { deliveryBatches, deliveryAgents, assignAgentToBatch, updateBatchStatus, orders } = useAppContext();
  const navigate = useNavigate();

  const [assigningBatch, setAssigningBatch] = useState(null);

  // Status progression workflow
  const handleNextStatus = (batch) => {
    let next = 'Assigned';
    if (batch.status === 'Pending Assignment') next = 'Assigned';
    else if (batch.status === 'Assigned') next = 'Pickup in Progress';
    else if (batch.status === 'Pickup in Progress') next = 'Out for Delivery';
    else if (batch.status === 'Out for Delivery') next = 'Completed';

    updateBatchStatus(batch.id, next);
  };

  const getInitials = (name) => {
    if (!name) return 'DA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="page-container delivery-mgmt-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h2>
            Delivery Batch Dispatch & Fleet Coordination
            <span className="telemetry-tag">
              <span className="telemetry-pulse" /> {deliveryBatches.length} BATCHES
            </span>
          </h2>
          <p className="page-subtitle">
            Fleet mission control: assign field agents, track aggregated pickup stops, monitor live corridor transits, and mark completion.
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => navigate('/admin/routes')}>
            <Navigation size={16} /> Route Coordination Mesh
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/admin/order-aggregation')}>
            <Layers size={16} /> Aggregate New Orders
          </button>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="mission-batches-grid">
        {deliveryBatches.length === 0 ? (
          <div className="card empty-mission-state">
            <Truck size={42} className="text-secondary" />
            <h4>No Active Dispatch Missions</h4>
            <p>
              When ready orders are consolidated in the Smart Aggregation Hub, new batches will automatically generate here for courier dispatch.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/admin/order-aggregation')}>
              Open Smart Aggregation Hub
            </button>
          </div>
        ) : (
          deliveryBatches.map(b => {
            const isUnassigned = !b.agentId || b.status === 'Pending Assignment';
            const orderCount = b.orderCount || b.orderIds?.length || 1;

            return (
              <div key={b.id} className="mission-card">
                {/* Top Accent Strip */}
                <div className={`mission-status-strip ${b.status?.toLowerCase().replace(/\s+/g, '-')}`} />

                {/* Card Header */}
                <div className="mission-card-header">
                  <div>
                    <div className="mission-type-label">DISPATCH MISSION</div>
                    <h3 className="mission-id-title">{b.batchId || b.id}</h3>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                {/* Logistics Schedule Info */}
                <div className="mission-schedule-block">
                  <div className="schedule-item">
                    <Calendar size={13} className="text-accent" />
                    <span>{b.deliveryDate || 'Today'}</span>
                  </div>
                  <div className="schedule-item">
                    <Clock size={13} className="text-accent" />
                    <span className="font-semibold">{b.deliverySlot}</span>
                  </div>
                </div>

                {/* Route Corridors Overview */}
                <div className="mission-corridors-box">
                  <div className="corridor-row">
                    <div className="corridor-dot pickup" />
                    <div className="corridor-text">
                      <span className="corridor-label">Pickup Corridor ({b.sellerNames?.length || 1} Vendors)</span>
                      <span className="corridor-value">{b.pickupLocations?.join(' • ') || 'Multiple Merchant Hubs'}</span>
                    </div>
                  </div>
                  <div className="corridor-divider-vertical" />
                  <div className="corridor-row">
                    <div className="corridor-dot delivery" />
                    <div className="corridor-text">
                      <span className="corridor-label">Dropoff Zone ({orderCount} Deliveries)</span>
                      <span className="corridor-value">{b.deliveryLocations?.join(' • ') || 'Local Customer Sector'}</span>
                    </div>
                  </div>
                </div>

                {/* Agent Assignment Card */}
                <div className={`mission-agent-card ${isUnassigned ? 'unassigned' : 'assigned'}`}>
                  <div className="agent-profile-row">
                    <div className="agent-avatar-squircle">
                      {isUnassigned ? <User size={16} /> : getInitials(b.agentName)}
                    </div>
                    <div className="agent-meta">
                      <span className="agent-lead-label">Assigned Courier</span>
                      <span className="agent-name-display">
                        {b.agentName || <span className="text-amber font-semibold">Unassigned Fleet Driver</span>}
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    className={`btn btn-sm ${isUnassigned ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setAssigningBatch(b)}
                  >
                    {isUnassigned ? 'Assign Fleet' : 'Reassign'}
                  </button>
                </div>

                {/* Constituent Orders List */}
                <div className="mission-orders-panel">
                  <div className="orders-panel-header">
                    <Box size={13} />
                    <span>Constituent Consignments ({orderCount})</span>
                  </div>
                  <div className="orders-items-stack">
                    {b.orderIds?.map(id => {
                      const matched = orders.find(o => o.id === id || o.orderId === id);
                      return (
                        <div key={id} className="order-item-chip">
                          <span className="order-chip-code">{id}</span>
                          <span className="order-chip-name">{matched?.customerName || 'Customer'}</span>
                          <span className="order-chip-vendor">{matched?.vendorName || 'Merchant'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Route Telemetry */}
                <div className="mission-telemetry-row">
                  <div className="telemetry-col">
                    <span className="telemetry-lbl">Distance</span>
                    <span className="telemetry-data">{b.estimatedDistance || 4.5} km</span>
                  </div>
                  <div className="telemetry-separator" />
                  <div className="telemetry-col">
                    <span className="telemetry-lbl">Transit Est.</span>
                    <span className="telemetry-data">{b.estimatedTime || 35} mins</span>
                  </div>
                  <div className="telemetry-separator" />
                  <div className="telemetry-col">
                    <span className="telemetry-lbl">Payload</span>
                    <span className="telemetry-data">{orderCount} units</span>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="mission-card-actions">
                  <button 
                    className="btn btn-outline" 
                    style={{ flex: 1 }} 
                    onClick={() => navigate('/admin/routes')}
                  >
                    <Navigation size={14} /> View Route Mesh
                  </button>

                  {b.status !== 'Completed' && b.status !== 'Delivered' && (
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: 1.2 }} 
                      onClick={() => handleNextStatus(b)}
                    >
                      Progress State <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Assign Agent Modal */}
      {assigningBatch && (
        <div className="modal-backdrop-command" onClick={() => setAssigningBatch(null)}>
          <div className="modal-dialog-card" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-title-with-icon">
                <div className="modal-icon-badge">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3>Dispatch Mission Assignment</h3>
                  <span className="modal-subtitle">Batch {assigningBatch.batchId || assigningBatch.id}</span>
                </div>
              </div>
              <button className="modal-close-trigger" onClick={() => setAssigningBatch(null)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-dialog-body">
              <p className="modal-lead-text">
                Assign a field driver for delivery slot <strong>{assigningBatch.deliverySlot}</strong> ({assigningBatch.orderCount || assigningBatch.orderIds?.length} orders).
              </p>

              <div className="agent-selection-scroll">
                {deliveryAgents.map(a => {
                  const isAvailable = a.status === 'Available' || a.availability === 'Available';
                  const isCurrentlyAssigned = assigningBatch.agentId === a.id;

                  return (
                    <div 
                      key={a.id} 
                      className={`agent-candidate-card ${isCurrentlyAssigned ? 'current-assigned' : ''}`}
                    >
                      <div className="candidate-left">
                        <div className="avatar-squircle">
                          {getInitials(a.name)}
                        </div>
                        <div className="candidate-info">
                          <span className="candidate-name">{a.name}</span>
                          <span className="candidate-meta">
                            {a.vehicle || 'Scooter'} • {a.currentArea || 'Central'} • {a.phone}
                          </span>
                        </div>
                      </div>

                      <div className="candidate-right">
                        <StatusBadge status={a.status || 'Available'} />
                        <button 
                          className="btn btn-sm btn-primary"
                          disabled={isCurrentlyAssigned}
                          onClick={() => {
                            assignAgentToBatch(assigningBatch.id, a.id);
                            setAssigningBatch(null);
                          }}
                        >
                          {isCurrentlyAssigned ? 'Assigned' : 'Select'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-dialog-footer">
              <button className="btn btn-outline" onClick={() => setAssigningBatch(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryManagementPage;
