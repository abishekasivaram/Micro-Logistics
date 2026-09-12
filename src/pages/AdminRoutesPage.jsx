import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Layers, MapPin, Truck, Navigation, Clock, CheckCircle, Info, ChevronRight } from 'lucide-react';
import MapPlaceholder from '../components/MapPlaceholder';
import './AdminRoutesPage.css';
import './DashboardOverview.css';

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
        title: `Pickup #${idx + 1}: ${seller}`,
        address: activeBatch.pickupLocations?.[idx] || 'Seller Store Location',
        time: `${10 + idx * 10} mins`
      });
    });

    // Drops
    batchOrders.forEach((ord, idx) => {
      routeSteps.push({
        type: 'drop',
        title: `Drop #${idx + 1}: ${ord.customerName} (${ord.orderId || ord.id})`,
        address: ord.deliveryLocation,
        time: `${25 + idx * 12} mins`
      });
    });
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Route Planning & Multi-Stop Delivery Coordination</h2>
          <p>Sequential pickup-and-drop route optimization for grouped local delivery batches.</p>
        </div>
      </div>

      <div className="routes-layout">
        {/* Batch Selector & Sequence Sidebar */}
        <div>
          <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
            <label className="form-label" style={{ fontWeight: '600' }}>Select Delivery Batch</label>
            <select 
              className="form-control" 
              value={selectedBatchId || ''} 
              onChange={e => setSelectedBatchId(e.target.value)}
            >
              {deliveryBatches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.batchId || b.id} — {b.deliverySlot} ({b.orderCount || b.orderIds?.length} orders)
                </option>
              ))}
            </select>
          </div>

          {activeBatch && (
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '16px' }}>Route Sequence ({routeSteps.length} Stops)</h4>
                <span className="badge badge-primary">{activeBatch.status}</span>
              </div>

              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                <div>Assigned Agent: <strong>{activeBatch.agentName || 'Unassigned'}</strong></div>
                <div>Est. Distance: <strong>{activeBatch.estimatedDistance || 4.5} km</strong></div>
                <div>Est. Total Duration: <strong>{activeBatch.estimatedTime || 35} mins</strong></div>
              </div>

              <div className="sequence-timeline">
                {routeSteps.map((step, idx) => (
                  <div key={idx} className={`sequence-node ${step.type}`}>
                    <strong style={{ fontSize: '13px', display: 'block', color: '#1e293b' }}>{step.title}</strong>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>{step.address}</span>
                    <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '600', display: 'block', marginTop: '2px' }}>ETA: ~{step.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map Visualization Canvas */}
        <div>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Navigation size={20} className="text-primary" /> Visual Route Path ({activeBatch?.batchId || 'B-1002'})
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Simulated multi-point navigation from local seller hubs to customer destinations.
                </p>
              </div>
            </div>

            {/* Map Placeholder Canvas */}
            <div style={{ height: '420px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
              <MapPlaceholder 
                pickupLocation={activeBatch?.pickupLocations?.[0] || '12 T. Nagar Main Rd'} 
                deliveryLocation={activeBatch?.deliveryLocations?.[0] || '101 Anna Nagar East'}
                status={activeBatch?.status || 'Assigned'}
                agentName={activeBatch?.agentName}
              />
            </div>

            <div className="alert alert-info" style={{ margin: '16px 0 0', fontSize: '12px' }}>
              💡 <strong>Note:</strong> Map visualization is a frontend simulation. Real-time GPS and routing engine integration will be connected during backend deployment.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoutesPage;
