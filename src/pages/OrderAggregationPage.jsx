import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  Map, Layers, CheckCircle, Clock, Truck, AlertCircle, 
  ArrowRight, ShieldCheck, Info, X, Zap, ChevronRight
} from 'lucide-react';
import { findSuitableOrderGroups, getHumanReadableStatus, getStatusBadgeClass } from '../utils/aggregationUtils';
import OrderDetailsModal from '../components/OrderDetailsModal';
import './OrderAggregationPage.css';
import './DashboardOverview.css';

const OrderAggregationPage = () => {
  const { orders, deliveryAgents, deliveryBatches, createDeliveryBatch, adminSettings } = useAppContext();
  const navigate = useNavigate();

  const [confirmingGroup, setConfirmingGroup] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

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

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Smart Order Aggregation Hub</h2>
          <p>Automated grouping of compatible local orders based on delivery windows, pickup areas, customer proximity, and agent availability.</p>
        </div>
      </div>

      {/* Visual Workflow Steps Callout */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', tracking: '1px', color: '#93c5fd', fontWeight: '700' }}>
              CENTRAL LOGISTICS ENGINE
            </span>
            <h3 style={{ margin: '4px 0 0', color: '#ffffff' }}>Smart Order Aggregation Pipeline</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#cbd5e1', flexWrap: 'wrap' }}>
            <span className="badge badge-primary">1. Ready Orders</span> →
            <span className="badge badge-warning">2. Suggested Group</span> →
            <span className="badge badge-success">3. Confirm Batch</span> →
            <span className="badge badge-secondary">4. Assign Agent</span>
          </div>
        </div>
      </div>

      {/* Section 1: Suggested Groups (Recommendations) */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} className="text-primary" /> Suggested Order Groups ({suggestedGroups.length})
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              High-compatibility order bundles recommended for unified local delivery batches.
            </p>
          </div>
          <span className="mock-disclaimer-pill">Mock Aggregation Recommendation</span>
        </div>

        {suggestedGroups.length === 0 ? (
          <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
            <Info size={32} className="text-secondary" style={{ marginBottom: '8px' }} />
            <h4 style={{ margin: '0 0 4px' }}>No Suitable Aggregation Groups Detected</h4>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              New orders marked "Ready for Delivery" with matching time slots and nearby locations will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="aggregation-grid">
            {suggestedGroups.map((group) => (
              <div key={group.id} className="recommendation-card">
                <div>
                  <div className="recommendation-header">
                    <div>
                      <span className="mock-disclaimer-pill">{group.recommendationLabel}</span>
                      <h4 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Batch Recommendation {group.id}</h4>
                    </div>
                    <span className="badge-score">{group.compatibilityScore}% Compatibility</span>
                  </div>

                  <div style={{ fontSize: '13px', color: '#475569', marginBottom: '10px' }}>
                    <div><strong>Date & Time Slot:</strong> {group.deliveryDate} ({group.deliveryTimeSlot})</div>
                    <div><strong>Pickup Area:</strong> {group.pickupArea}</div>
                    <div><strong>Delivery Area:</strong> {group.deliveryArea}</div>
                  </div>

                  {/* Reasons Array */}
                  <div className="reasons-list">
                    <strong style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#475569' }}>Scoring Rationale:</strong>
                    {group.reasons.map((reason, idx) => (
                      <div key={idx} className="reason-item">
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bundled Orders */}
                  <div style={{ marginBottom: '16px' }}>
                    <strong style={{ fontSize: '13px', color: '#1e293b' }}>Bundled Orders ({group.orderCount}):</strong>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {group.orders.map(o => (
                        <span key={o.id} className="badge badge-secondary" style={{ cursor: 'pointer' }} onClick={() => setSelectedOrderDetails(o)}>
                          {o.orderId || o.id} ({o.vendorName})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="metrics-row">
                    <span>Est. Distance: <strong>{group.estimatedDistance} km</strong></span>
                    <span>Est. Time: <strong>{group.estimatedTime} mins</strong></span>
                    <span>Agent Cap Required: <strong>{group.orderCount} / 5</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setConfirmingGroup(group)}>
                    Confirm Delivery Batch
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Ready Orders Table */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px' }}>Ready Orders Queue ({readyOrders.length})</h3>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
              Orders ready for packaging or waiting to be matched into a delivery batch.
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Seller & Pickup</th>
                <th>Customer & Address</th>
                <th>Delivery Date</th>
                <th>Time Window</th>
                <th>Preparation Status</th>
                <th>Aggregation Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {readyOrders.length === 0 ? (
                <tr><td colSpan="8" className="empty-state">No unbatched ready orders in queue.</td></tr>
              ) : (
                readyOrders.map(o => (
                  <tr key={o.id}>
                    <td className="font-medium">{o.orderId || o.id}</td>
                    <td>
                      <div><strong style={{ color: '#1e293b' }}>{o.vendorName || o.sellerName}</strong></div>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{o.pickupLocation}</span>
                    </td>
                    <td>
                      <div><strong style={{ color: '#1e293b' }}>{o.customerName}</strong></div>
                      <span style={{ fontSize: '12px', color: '#0284c7' }}>{o.deliveryLocation}</span>
                    </td>
                    <td style={{ fontSize: '13px' }}>{o.deliveryDate}</td>
                    <td style={{ fontSize: '13px' }}>{o.deliveryTimeSlot}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(o.status || o.orderStatus)}`}>
                        {getHumanReadableStatus(o.status || o.orderStatus)}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-warning" style={{ fontSize: '11px' }}>
                        {o.aggregationStatus || 'Waiting'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-sm btn-outline" onClick={() => setSelectedOrderDetails(o)}>
                        Details
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
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck className="text-primary" size={22} /> Confirm Delivery Batch Creation
              </h3>
              <button className="modal-close" onClick={() => setConfirmingGroup(null)}><X size={20} /></button>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '14px', color: '#334155', marginTop: 0 }}>
                You are creating a new unified delivery batch for <strong>{confirmingGroup.orderCount} orders</strong> in <strong>{confirmingGroup.deliveryArea}</strong>.
              </p>
              
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                <div><strong>Orders:</strong> {confirmingGroup.orderIds.join(', ')}</div>
                <div><strong>Delivery Slot:</strong> {confirmingGroup.deliveryTimeSlot}</div>
                <div><strong>Est. Route Distance:</strong> {confirmingGroup.estimatedDistance} km</div>
                <div><strong>Compatibility Score:</strong> {confirmingGroup.compatibilityScore}%</div>
              </div>

              <div className="alert alert-info" style={{ fontSize: '13px', margin: 0 }}>
                💡 After confirmation, the batch will be created with status <strong>"Pending Assignment"</strong>. You can assign an available delivery agent on the Delivery Management page.
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setConfirmingGroup(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => handleConfirmBatch(confirmingGroup)}>
                Create Delivery Batch
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
