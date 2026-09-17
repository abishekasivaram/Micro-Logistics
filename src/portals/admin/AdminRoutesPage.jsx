import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Layers, MapPin, Truck, Navigation, Clock, CheckCircle, Info, ChevronRight, User, Compass, Route } from 'lucide-react';
import MapPlaceholder from '../../components/common/MapPlaceholder';
import StatusBadge from '../../components/common/StatusBadge';
import './AdminRoutesPage.css';

const AdminRoutesPage = () => {
  const { deliveryBatches, orders, deliveryAgents } = useAppContext();
  
  const [selectedBatchId, setSelectedBatchId] = useState(deliveryBatches[0]?.id || null);

  const activeBatch = deliveryBatches.find(b => b.id === selectedBatchId || b.batchId === selectedBatchId) || deliveryBatches[0];
  const batchOrders = activeBatch ? orders.filter(o => activeBatch.orderIds?.includes(o.id)) : [];
  const assignedAgent = deliveryAgents.find(a => a.id === activeBatch?.agentId);

  // Build sequential route steps: Pickups first, then Drops
  const routeSteps = [];
  if (activeBatch) {
    // Pickups
    const pickups = activeBatch.sellerNames || ['Seller Hub'];
    pickups.forEach((seller, idx) => {
      routeSteps.push({
        type: 'pickup',
        title: `Stop ${idx + 1}: ${seller}`,
        role: 'Merchant Pickup',
        address: activeBatch.pickupLocations?.[idx] || 'Seller Store Location',
        time: `${10 + idx * 10} mins`
      });
    });

    // Drops
    batchOrders.forEach((ord, idx) => {
      const stepIdx = routeSteps.length + 1;
      routeSteps.push({
        type: 'drop',
        title: `Stop ${stepIdx}: ${ord.customerName}`,
        role: `Consignment Delivery (${ord.orderId || ord.id})`,
        address: ord.deliveryLocation,
        time: `${25 + idx * 12} mins`
      });
    });
  }

  return (
    <div className="page-container admin-routes-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h2>
            Route Coordination & Stop Sequencing Mesh
            <span className="telemetry-tag">
              <span className="telemetry-pulse" /> SPATIAL DISPATCH
            </span>
          </h2>
          <p className="page-subtitle">
            Autonomous multi-point waypoint optimization: sequential merchant pickup collection and consolidated customer delivery dropoffs.
          </p>
        </div>
      </div>

      <div className="routes-command-layout">
        {/* Left Column: Batch Selector & Route Sequence Timeline */}
        <div className="routes-sidebar-column">
          <div className="card selector-card">
            <label htmlFor="admin-routes-batch-select" className="routes-selector-label">
              <Route size={15} className="text-accent" /> Active Route Mission
            </label>
            <select 
              id="admin-routes-batch-select"
              className="form-select" 
              value={selectedBatchId || ''} 
              onChange={e => setSelectedBatchId(e.target.value)}
            >
              {deliveryBatches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.batchId || b.id} • {b.deliverySlot} ({b.orderCount || b.orderIds?.length} orders)
                </option>
              ))}
            </select>
          </div>

          {activeBatch && (
            <div className="card timeline-card">
              <div className="timeline-header">
                <div>
                  <span className="mission-tag-small">MISSION SEQUENCE</span>
                  <h4 className="timeline-title">Route Waypoints ({routeSteps.length} Stops)</h4>
                </div>
                <StatusBadge status={activeBatch.status} />
              </div>

              <div className="route-telemetry-summary">
                <div className="summary-telemetry-item">
                  <span className="lbl">Courier:</span>
                  <span className="val">{activeBatch.agentName || 'Unassigned'}</span>
                </div>
                <div className="summary-telemetry-item">
                  <span className="lbl">Corridor Distance:</span>
                  <span className="val">{activeBatch.estimatedDistance || 4.5} km</span>
                </div>
                <div className="summary-telemetry-item">
                  <span className="lbl">Est. Mission Time:</span>
                  <span className="val">{activeBatch.estimatedTime || 35} mins</span>
                </div>
              </div>

              <div className="sequence-timeline-track">
                {routeSteps.map((step, idx) => (
                  <div key={idx} className={`sequence-stop-item ${step.type}`}>
                    <div className="stop-marker-dot">
                      <span>{idx + 1}</span>
                    </div>
                    <div className="stop-content">
                      <div className="stop-title-row">
                        <span className="stop-title">{step.title}</span>
                        <span className="stop-eta-pill">~{step.time}</span>
                      </div>
                      <span className="stop-role-caption">{step.role}</span>
                      <span className="stop-address-text">{step.address}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dark Command Map Visualization */}
        <div className="routes-map-column">
          <div className="card map-viewport-card">
            <div className="card-header map-header-row">
              <div>
                <h3 className="card-title">
                  <Compass size={18} className="text-accent" />
                  Spatial Dispatch Simulation Mesh ({activeBatch?.batchId || 'B-1002'})
                </h3>
                <p className="card-subtitle-small">
                  Real-time geographic corridor telemetry from participating seller stores to destination dropoffs.
                </p>
              </div>
              <span className="telemetry-tag">
                <span className="telemetry-pulse" /> LIVE SIMULATION
              </span>
            </div>

            <div className="map-embed-container">
              <MapPlaceholder 
                pickupLocation={activeBatch?.pickupLocations?.[0] || '12 T. Nagar Main Rd'} 
                deliveryLocation={activeBatch?.deliveryLocations?.[0] || '101 Anna Nagar East'}
                status={activeBatch?.status || 'Assigned'}
                agentName={activeBatch?.agentName}
              />
            </div>

            <div className="map-system-notice">
              <Info size={15} className="text-accent" />
              <span>
                Simulated geospatial mesh rendered via vector corridor interpolation. Dynamic GPS telemetry stream active.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoutesPage;
