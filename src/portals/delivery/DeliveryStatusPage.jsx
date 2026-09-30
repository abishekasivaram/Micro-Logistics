import React, { useState } from 'react';
import { 
  Truck, CheckCircle2, XCircle, Clock, MapPin, Phone, 
  ShieldCheck, AlertTriangle, Camera, Check, RotateCcw, X, Key, Edit3 
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import PageHeader from '../../components/delivery/PageHeader';
import DeliveryStatusBadge from '../../components/delivery/DeliveryStatusBadge';
import EmptyState from '../../components/delivery/EmptyState';
import './DeliveryStatusPage.css';

const DeliveryStatusPage = () => {
  const { orders, updateOrderStatus, hasBatch, setSelectedOrderForDrawer, addToast } = useDelivery();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalType, setModalType] = useState(null); // 'delivered' | 'failed'

  // Delivered Modal Inputs
  const [otpInput, setOtpInput] = useState('');
  const [podNotes, setPodNotes] = useState('');
  const [signatureDone, setSignatureDone] = useState(false);
  const [photoProof, setPhotoProof] = useState(null);

  // Failed Modal Inputs
  const [failureReason, setFailureReason] = useState('Customer unavailable after calling');
  const [failureNotes, setFailureNotes] = useState('');

  // Active orders that can still be updated
  const activeOrders = (orders || []).filter(o => o.status !== 'DELIVERED');

  const openDeliveredModal = (order) => {
    setSelectedOrder(order);
    setModalType('delivered');
    setOtpInput('');
    setPodNotes('');
    setSignatureDone(false);
    setPhotoProof(null);
  };

  const openFailedModal = (order) => {
    setSelectedOrder(order);
    setModalType('failed');
    setFailureReason('Customer unavailable after calling');
    setFailureNotes('');
  };

  const handleConfirmDelivered = () => {
    if (!selectedOrder) return;
    updateOrderStatus(selectedOrder.id, 'DELIVERED', {
      otpVerified: otpInput.length >= 4 || signatureDone,
      notes: podNotes,
      photo: photoProof
    });
    setModalType(null);
    setSelectedOrder(null);
  };

  const handleConfirmFailed = () => {
    if (!selectedOrder) return;
    updateOrderStatus(selectedOrder.id, 'FAILED', {
      failureReason,
      notes: failureNotes
    });
    setModalType(null);
    setSelectedOrder(null);
  };

  if (!hasBatch || activeOrders.length === 0) {
    return (
      <div className="dl-status-page">
        <PageHeader
          breadcrumbs={['Operations', 'Workflow']}
          title="Delivery Status"
          subtitle="Real-time order handoff and proof-of-delivery verification"
        />
        <EmptyState
          icon={CheckCircle2}
          title="No orders to update"
          description="All assigned deliveries for the current batch are completed, or no active batch is assigned."
        />
      </div>
    );
  }

  return (
    <div className="dl-status-page">
      <PageHeader
        breadcrumbs={['Operations', 'Workflow']}
        title="Delivery Status"
        subtitle={`Update statuses for ${activeOrders.length} pending drops with OTP or photo proof`}
        badge={`${activeOrders.length} Drops Pending`}
      />

      {/* Orders Grid with Thumb-Friendly Status Selectors */}
      <div className="status-orders-list">
        {activeOrders.map(order => (
          <div key={order.id} className="dl-card status-order-card">
            {/* Order Card Top Banner */}
            <div className="status-card-top">
              <div className="order-id-group">
                <span className="order-code dl-heading">{order.orderCode || order.id}</span>
                <span className="order-slot-pill"><Clock size={12} /> {order.timeSlot}</span>
              </div>
              <DeliveryStatusBadge status={order.status} size="sm" />
            </div>

            {/* Customer Details */}
            <div className="order-recipient-row">
              <div className="recipient-info">
                <h3 className="recipient-name">{order.customerName}</h3>
                <p className="recipient-address">
                  <MapPin size={14} className="address-pin" />
                  <span>{order.address}</span>
                </p>
              </div>

              <div className="recipient-payment-pill">
                <span className="pay-mode-label">{order.paymentMode || 'Prepaid'}</span>
                <span className={`pay-amount dl-tabular ${order.codAmount > 0 ? 'is-cod' : 'is-paid'}`}>
                  {order.codAmount > 0 ? `Collect ₹${order.codAmount}` : 'Paid Online'}
                </span>
              </div>
            </div>

            {/* Large Thumb-Friendly Status Selector Strip */}
            <div className="status-selector-strip" role="group" aria-label="Order status actions">
              {/* Button 1: Picked Up */}
              <button
                type="button"
                className={`thumb-status-btn btn-picked ${order.status === 'PICKED_UP' ? 'active' : ''}`}
                onClick={() => updateOrderStatus(order.id, 'PICKED_UP')}
              >
                <span className="btn-status-indicator" />
                <span className="btn-label">Picked Up</span>
              </button>

              {/* Button 2: Out for Delivery */}
              <button
                type="button"
                className={`thumb-status-btn btn-out ${order.status === 'OUT_FOR_DELIVERY' ? 'active' : ''}`}
                onClick={() => updateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}
              >
                <Truck size={16} />
                <span className="btn-label">Out for Delivery</span>
              </button>

              {/* Button 3: Delivered (Modal Trigger) */}
              <button
                type="button"
                className="thumb-status-btn btn-delivered"
                onClick={() => openDeliveredModal(order)}
              >
                <CheckCircle2 size={16} />
                <span className="btn-label">Delivered...</span>
              </button>

              {/* Button 4: Failed (Modal Trigger) */}
              <button
                type="button"
                className="thumb-status-btn btn-failed"
                onClick={() => openFailedModal(order)}
              >
                <XCircle size={16} />
                <span className="btn-label">Failed...</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delivered Confirmation Modal (OTP / Signature / Photo Proof) */}
      {modalType === 'delivered' && selectedOrder && (
        <div className="status-modal-backdrop" onClick={() => setModalType(null)}>
          <div className="status-modal-card" onClick={e => e.stopPropagation()}>
            <div className="status-modal-header">
              <div className="modal-title-box">
                <CheckCircle2 size={20} className="text-success" />
                <h3 className="modal-title dl-heading">Confirm Delivery</h3>
              </div>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setModalType(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="status-modal-body">
              <div className="modal-order-summary">
                <span className="sum-order-id">{selectedOrder.orderCode || selectedOrder.id}</span>
                <span className="sum-customer">{selectedOrder.customerName}</span>
                <span className="sum-amount dl-tabular">
                  {selectedOrder.codAmount > 0 ? `Collected ₹${selectedOrder.codAmount} COD` : 'Prepaid'}
                </span>
              </div>

              {/* 4-Digit OTP Input */}
              <div className="form-group-block">
                <label className="input-label" htmlFor="otp-input-field">
                  <Key size={14} /> Enter 4-Digit Customer OTP
                </label>
                <input
                  id="otp-input-field"
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 4821"
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  className="dl-otp-input dl-tabular"
                />
                <span className="input-hint">OTP was sent to customer's WhatsApp & SMS</span>
              </div>

              {/* Digital Signature Pad Simulator */}
              <div className="form-group-block">
                <label className="input-label">
                  <Edit3 size={14} /> Or Collect Customer Signature
                </label>
                <div 
                  className={`signature-canvas-box ${signatureDone ? 'is-signed' : ''}`}
                  onClick={() => setSignatureDone(prev => !prev)}
                >
                  {signatureDone ? (
                    <div className="signature-signed-text">
                      <Check size={18} className="text-success" />
                      <span>Signature Captured: {selectedOrder.customerName}</span>
                    </div>
                  ) : (
                    <div className="signature-placeholder">
                      <span>Click or tap to simulate digital signature</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Photo Proof Simulator */}
              <div className="form-group-block">
                <label className="input-label">
                  <Camera size={14} /> Photo Proof of Delivery (Optional)
                </label>
                <div 
                  className={`photo-upload-box ${photoProof ? 'has-photo' : ''}`}
                  onClick={() => setPhotoProof('https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300')}
                >
                  <Camera size={18} />
                  <span>{photoProof ? 'Photo Attached (Front Door drop)' : 'Click to attach photo proof'}</span>
                </div>
              </div>

              {/* Delivery Notes */}
              <div className="form-group-block">
                <label className="input-label" htmlFor="pod-notes-field">Delivery Remarks / Handoff Notes</label>
                <input
                  id="pod-notes-field"
                  type="text"
                  placeholder="e.g. Handed directly to customer or security"
                  value={podNotes}
                  onChange={e => setPodNotes(e.target.value)}
                  className="dl-text-input"
                />
              </div>
            </div>

            <div className="status-modal-footer">
              <button
                type="button"
                className="dl-btn dl-btn-primary w-full"
                onClick={handleConfirmDelivered}
              >
                <CheckCircle2 size={16} /> Complete & Mark Delivered
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Failed Delivery Modal (Requires Reason) */}
      {modalType === 'failed' && selectedOrder && (
        <div className="status-modal-backdrop" onClick={() => setModalType(null)}>
          <div className="status-modal-card" onClick={e => e.stopPropagation()}>
            <div className="status-modal-header">
              <div className="modal-title-box">
                <AlertTriangle size={20} className="text-danger" />
                <h3 className="modal-title dl-heading">Record Failed Delivery</h3>
              </div>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setModalType(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="status-modal-body">
              <p className="failed-warning-text">
                Please verify customer contact attempts before marking as failed. Parcels must be returned to the dispatch hub.
              </p>

              {/* Reason Selector */}
              <div className="form-group-block">
                <label className="input-label" htmlFor="failure-reason-select">Failure Reason (Required)</label>
                <select
                  id="failure-reason-select"
                  className="dl-select-input"
                  value={failureReason}
                  onChange={e => setFailureReason(e.target.value)}
                >
                  <option value="Customer unavailable after calling">Customer unavailable after calling</option>
                  <option value="Wrong delivery address / Gate inaccessible">Wrong delivery address / Gate inaccessible</option>
                  <option value="Customer refused package">Customer refused package</option>
                  <option value="Package damaged in transit">Package damaged in transit</option>
                  <option value="Other reason">Other operational issue</option>
                </select>
              </div>

              {/* Failure Details */}
              <div className="form-group-block">
                <label className="input-label" htmlFor="failure-notes-field">Additional Details / Notes</label>
                <textarea
                  id="failure-notes-field"
                  rows={3}
                  className="dl-textarea-input"
                  placeholder="Describe calls made, instructions from customer, etc."
                  value={failureNotes}
                  onChange={e => setFailureNotes(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="status-modal-footer">
              <button
                type="button"
                className="dl-btn dl-btn-secondary"
                onClick={() => setModalType(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dl-btn dl-btn-primary bg-danger"
                onClick={handleConfirmFailed}
              >
                Confirm Failed Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryStatusPage;
