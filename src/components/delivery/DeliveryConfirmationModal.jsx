import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle } from 'lucide-react';
import './DeliveryConfirmationModal.css';

const DeliveryConfirmationModal = ({ order, onClose, onConfirm }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleConfirm = () => {
    // Demo OTP check as per instructions
    if (otp === '1234') {
      onConfirm(order.id);
    } else {
      setError('Invalid OTP. For this demo, use 1234.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-card" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="confirm-modal-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="confirm-modal-title">Confirm Delivery</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="order-summary-box">
            <strong>Order ID:</strong> {order.id}<br/>
            <strong>Customer:</strong> {order.customerName}<br/>
            <strong>Location:</strong> {order.deliveryLocation}
          </div>

          <div className="otp-section">
            <label htmlFor="otp">Enter Delivery OTP (Demo: 1234)</label>
            <div className="otp-input-wrapper">
              <ShieldAlert size={18} className="text-warning" />
              <input 
                type="text" 
                id="otp"
                maxLength="4"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                placeholder="____"
                className="otp-input"
              />
            </div>
            {error && <p className="text-danger mt-2" style={{ fontSize: '0.85rem' }}>{error}</p>}
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline flex-1" onClick={onClose}>Cancel</button>
          <button 
            className="btn btn-primary flex-1" 
            onClick={handleConfirm}
            disabled={otp.length < 4}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
          >
            <CheckCircle size={16} /> Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryConfirmationModal;
