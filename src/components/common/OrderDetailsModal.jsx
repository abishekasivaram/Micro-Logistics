import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Store, Calendar, Clock, Package, CheckCircle, Truck, Key } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from './StatusBadge';
import './OrderDetailsModal.css';

const STEPS = [
  { key: 'PLACED', label: 'Order Placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'READY_FOR_DELIVERY', label: 'Ready for Delivery' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' }
];

const OrderDetailsModal = ({ order, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [deliveryOtp, setDeliveryOtp] = useState(null);

  useEffect(() => {
    if (!order) return;
    const ordId = order.orderCode || order.id || order.orderId;
    if (ordId) {
      api.get(`/delivery/orders/${ordId}/otp`)
        .then(res => {
          if (res.data?.success && res.data.data?.otp) {
            setDeliveryOtp(res.data.data.otp);
          }
        })
        .catch(() => {});
    }
  }, [order]);

  if (!order) return null;

  const currentStatus = (order.orderStatus || order.status || 'PLACED').toUpperCase();

  const getStepIndex = (statusKey) => {
    switch (statusKey) {
      case 'PLACED': return 0;
      case 'CONFIRMED': return 1;
      case 'PREPARING': return 2;
      case 'READY_FOR_DELIVERY': return 3;
      case 'ASSIGNED': return 4;
      case 'OUT_FOR_DELIVERY': return 5;
      case 'DELIVERED': return 6;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="order-modal-container" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="order-modal-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 id="order-modal-title">Order Details</h3>
            <span className="modal-subtitle">{order.id || order.orderId}</span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Status Timeline */}
          {!isCancelled ? (
            <div className="timeline-wrapper">
              <h4 className="section-title">Order Timeline</h4>
              <div className="timeline-steps">
                {STEPS.map((step, index) => {
                  const isDone = index <= currentStepIdx;
                  const isCurrent = index === currentStepIdx;
                  return (
                    <div key={step.key} className={`timeline-step ${isDone ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}>
                      <div className="step-icon">
                        {isDone ? <CheckCircle size={14} /> : index + 1}
                      </div>
                      <span className="step-label">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="cancelled-banner">
              <span className="badge badge-cancelled">Order Cancelled</span>
            </div>
          )}

          {/* Secret Delivery PIN for Handover */}
          {deliveryOtp && (
            <div style={{
              margin: '16px 0',
              padding: '14px 18px',
              borderRadius: '12px',
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0
                }}>
                  <Key size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Delivery Verification PIN
                  </div>
                  <div style={{ fontSize: '12px', color: '#166534' }}>
                    Provide this 4-digit code to the delivery courier to confirm receipt
                  </div>
                </div>
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '22px',
                fontWeight: '900',
                letterSpacing: '0.2em',
                color: '#15803d',
                padding: '6px 14px',
                background: '#fff',
                borderRadius: '8px',
                border: '1px solid #bbf7d0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                whiteSpace: 'nowrap'
              }}>
                {deliveryOtp}
              </div>
            </div>
          )}

          <div className="order-details-grid">
            <div className="details-card">
              <h4>Seller & Logistics</h4>
              <div className="info-row">
                <Store size={16} className="text-secondary" />
                <span><strong>Seller:</strong> {order.vendorName || 'Local Seller'}</span>
              </div>
              <div className="info-row">
                <MapPin size={16} className="text-secondary" />
                <span><strong>Pickup:</strong> {order.pickupLocation || 'Seller Warehouse'}</span>
              </div>
              <div className="info-row">
                <Truck size={16} className="text-secondary" />
                <span><strong>Aggregation Status:</strong> {order.aggregationStatus || 'Pending'}</span>
              </div>
              {order.assignedAgent && (
                <div className="info-row">
                  <Truck size={16} className="text-secondary" />
                  <span><strong>Agent:</strong> {order.assignedAgent}</span>
                </div>
              )}
            </div>

            <div className="details-card">
              <h4>Delivery Information</h4>
              <div className="info-row">
                <MapPin size={16} className="text-secondary" />
                <span><strong>Delivery Address:</strong> {order.deliveryLocation || 'Customer Address'}</span>
              </div>
              <div className="info-row">
                <Calendar size={16} className="text-secondary" />
                <span><strong>Date:</strong> {order.deliveryDate || new Date(order.date).toLocaleDateString()}</span>
              </div>
              <div className="info-row">
                <Clock size={16} className="text-secondary" />
                <span><strong>Time Window:</strong> {order.deliveryTimeSlot || 'Standard Delivery'}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="items-section">
            <h4>Ordered Items</h4>
            <table className="modal-items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items && order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Package size={16} className="text-secondary" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{item.qty}</td>
                    <td style={{ textAlign: 'right' }}>₹{(item.price || 0).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>₹{((item.price || 0) * item.qty).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Amount:</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    ₹{(order.total || 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <StatusBadge status={currentStatus} />
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OrderDetailsModal;
