import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  Truck, UserCheck, Navigation, Layers, CheckCircle, 
  Clock, X, ChevronRight, User, AlertCircle, Play, Eye
} from 'lucide-react';
import { getStatusBadgeClass } from '../utils/aggregationUtils';
import './DeliveryManagementPage.css';
import './DashboardOverview.css';

const DeliveryManagementPage = () => {
  const { deliveryBatches, deliveryAgents, assignAgentToBatch, updateBatchStatus, orders } = useAppContext();
  const navigate = useNavigate();

  const [assigningBatch, setAssigningBatch] = useState(null);
  const [selectedBatchDetails, setSelectedBatchDetails] = useState(null);

  // Status progression workflow
  const handleNextStatus = (batch) => {
    let next = 'Assigned';
    if (batch.status === 'Pending Assignment') next = 'Assigned';
    else if (batch.status === 'Assigned') next = 'Pickup in Progress';
    else if (batch.status === 'Pickup in Progress') next = 'Out for Delivery';
    else if (batch.status === 'Out for Delivery') next = 'Completed';

    updateBatchStatus(batch.id, next);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Delivery Batch Management</h2>
          <p>Assign available delivery agents, monitor pickup status, track active delivery batches, and complete multi-order routes.</p>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="batch-grid">
        {deliveryBatches.length === 0 ? (
          <div className="card" style={{ padding: '32px', textAlign: 'center', gridColumn: '1 / -1' }}>
            <Truck size={36} className="text-secondary" style={{ marginBottom: '8px' }} />
            <h4>No Active Delivery Batches</h4>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Create delivery batches from suitable ready orders on the Order Aggregation page.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/admin/order-aggregation')} style={{ marginTop: '12px' }}>
              Go to Order Aggregation Hub
            </button>
          </div>
        ) : (
          deliveryBatches.map(b => {
            const batchOrders = orders.filter(o => b.orderIds?.includes(o.id));
            const isUnassigned = !b.agentId || b.status === 'Pending Assignment';

            return (
              <div key={b.id} className="batch-card">
                <div>
                  <div className="batch-header">
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>DELIVERY BATCH</span>
                      <h4 style={{ margin: '2px 0 0', fontSize: '18px', color: '#0f172a' }}>{b.batchId || b.id}</h4>
                    </div>
                    <span className={`badge ${getStatusBadgeClass(b.status)}`}>
                      {b.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', color: '#475569', marginBottom: '12px' }}>
                    <div><strong>Window:</strong> {b.deliverySlot} ({b.deliveryDate})</div>
                    <div><strong>Pickups ({b.sellerNames?.length || 1}):</strong> {b.pickupLocations?.join(' | ')}</div>
                    <div><strong>Est. Route:</strong> {b.estimatedDistance || 4.2} km ({b.estimatedTime || 30} mins)</div>
                  </div>

                  {/* Agent Card */}
                  <div style={{ padding: '10px 12px', background: isUnassigned ? '#fffbeb' : '#f0fdf4', borderRadius: '8px', border: `1px solid ${isUnassigned ? '#fef3c7' : '#bbf7d0'}`, marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={16} className={isUnassigned ? 'text-warning' : 'text-success'} />
                        <strong>Agent:</strong> {b.agentName || <span className="text-warning">Unassigned</span>}
                      </span>
                      {isUnassigned ? (
                        <button className="btn btn-sm btn-primary" onClick={() => setAssigningBatch(b)}>
                          Assign Agent
                        </button>
                      ) : (
                        <button className="btn btn-sm btn-outline" onClick={() => setAssigningBatch(b)}>
                          Change Agent
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bundled Orders */}
                  <div className="batch-orders-list">
                    <strong style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#475569' }}>
                      Constituent Orders ({b.orderCount || b.orderIds?.length}):
                    </strong>
                    {b.orderIds?.map(id => (
                      <div key={id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' }}>
                        <span className="font-medium">{id}</span>
                        <span className="text-secondary">{orders.find(o => o.id === id)?.customerName || 'Customer'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate('/admin/routes')}>
                    <Navigation size={14} /> View Route
                  </button>

                  {b.status !== 'Completed' && b.status !== 'Delivered' && (
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleNextStatus(b)}>
                      Progress Status <ChevronRight size={14} />
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
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck className="text-primary" size={22} /> Assign Delivery Agent to Batch {assigningBatch.batchId || assigningBatch.id}
              </h3>
              <button className="modal-close" onClick={() => setAssigningBatch(null)}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '13px', color: '#475569', marginTop: 0 }}>
                Select an available driver for delivery window <strong>{assigningBatch.deliverySlot}</strong> ({assigningBatch.orderCount} orders).
              </p>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {deliveryAgents.map(agent => {
                  const isAvail = agent.status === 'Available' || agent.availability === 'Available';
                  const capacityRem = (agent.capacity || 5) - (agent.currentOrders || 0);

                  return (
                    <div key={agent.id} className="agent-select-card" style={{ opacity: isAvail ? 1 : 0.65 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '15px' }}>{agent.name}</strong>
                          <span className={`badge ${isAvail ? 'badge-success' : 'badge-secondary'}`}>{agent.status}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          <span>Area: {agent.currentArea}</span> | <span>Vehicle: {agent.vehicle}</span> | <span>⭐ {agent.rating || 4.8}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: capacityRem > 0 ? '#16a34a' : '#dc2626', marginTop: '2px' }}>
                          Available Capacity: <strong>{capacityRem} orders remaining</strong>
                        </div>
                      </div>

                      <button 
                        className="btn btn-sm btn-primary" 
                        disabled={!isAvail} 
                        onClick={() => {
                          assignAgentToBatch(assigningBatch.id, agent.id);
                          setAssigningBatch(null);
                        }}
                      >
                        Assign Batch
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setAssigningBatch(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryManagementPage;
