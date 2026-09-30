import React, { useEffect } from 'react';
import { 
  X, Phone, MessageSquare, Navigation, CheckCircle2, Clock, 
  MapPin, ShoppingBag, CreditCard, ShieldCheck, AlertCircle, ExternalLink 
} from 'lucide-react';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import './OrderDrawer.css';

const OrderDrawer = ({ order, isOpen, onClose, onUpdateStatus }) => {
  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const rawPhone = (order.phone || '+919840123456').replace(/\D/g, '');
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.address || 'Chennai')}`;
  const whatsappUrl = `https://wa.me/${rawPhone}?text=${encodeURIComponent(`Hello ${order.customerName || 'Customer'}, this is David your MicroLogi delivery agent regarding your order ${order.orderCode || order.id}.`)}`;

  return (
    <div className="dl-drawer-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <div className="dl-drawer-content" onClick={e => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="dl-drawer-header">
          <div>
            <div className="drawer-batch-badge">
              <span>{order.batchId || 'BATCH-4082'}</span>
              <span className="dot-divider">•</span>
              <span>Stop #{order.sequence || 1}</span>
            </div>
            <h2 id="drawer-title" className="drawer-order-id dl-heading">{order.orderCode || order.id}</h2>
          </div>
          <button 
            type="button" 
            className="drawer-close-btn" 
            onClick={onClose}
            aria-label="Close order details drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Bar */}
        <div className="drawer-status-bar">
          <DeliveryStatusBadge status={order.status} size="lg" />
          <div className="drawer-time-slot">
            <Clock size={15} />
            <span>{order.timeSlot || '9:00 AM – 1:00 PM'}</span>
          </div>
        </div>

        {/* Action Buttons Strip */}
        <div className="drawer-actions-strip">
          <a href={`tel:${order.phone || '+919840123456'}`} className="drawer-action-btn btn-call" title="Call Customer">
            <Phone size={17} />
            <span>Call</span>
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="drawer-action-btn btn-whatsapp" title="WhatsApp Message">
            <MessageSquare size={17} />
            <span>WhatsApp</span>
          </a>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="drawer-action-btn btn-nav" title="Open GPS Navigation">
            <Navigation size={17} />
            <span>Navigate</span>
          </a>
        </div>

        {/* Drawer Body Scroll */}
        <div className="dl-drawer-body">
          {/* Customer & Address Card */}
          <div className="drawer-card">
            <div className="drawer-card-title">Customer & Destination</div>
            <div className="customer-info-row">
              <div className="customer-avatar-badge">
                {(order.customerName || 'U').charAt(0)}
              </div>
              <div className="customer-details">
                <div className="customer-name">{order.customerName}</div>
                <div className="customer-phone">{order.phone || '+91 98402 33441'}</div>
              </div>
            </div>

            <div className="delivery-address-box">
              <MapPin size={18} className="address-pin-icon" />
              <div className="address-text">{order.address}</div>
            </div>

            {order.notes && (
              <div className="delivery-notes-callout">
                <AlertCircle size={15} className="notes-icon" />
                <span><strong>Customer Note:</strong> {order.notes}</span>
              </div>
            )}
          </div>

          {/* Payment & COD Card */}
          <div className="drawer-card">
            <div className="drawer-card-title">Billing & Payment</div>
            <div className="billing-row">
              <div className="billing-item">
                <span className="billing-label">Payment Mode</span>
                <span className="billing-val">{order.paymentMode || (order.codAmount > 0 ? 'Cash on Delivery' : 'Prepaid UPI')}</span>
              </div>
              <div className="billing-item">
                <span className="billing-label">Amount to Collect</span>
                <span className={`billing-val dl-tabular ${order.codAmount > 0 ? 'cod-highlight' : 'paid-tag'}`}>
                  {order.codAmount > 0 ? `₹${order.codAmount} (COD)` : '₹0 (Paid)'}
                </span>
              </div>
            </div>
          </div>

          {/* Manifest Items List */}
          <div className="drawer-card">
            <div className="drawer-card-title">
              <div className="title-with-count">
                <ShoppingBag size={16} />
                <span>Aggregated Order Items</span>
                <span className="items-counter">{order.items?.length || 1} items</span>
              </div>
            </div>

            <div className="items-manifest-list">
              {Array.isArray(order.items) ? (
                order.items.map((item, idx) => (
                  <div key={idx} className="manifest-item-row">
                    <div className="item-seq-dot">{idx + 1}</div>
                    <div className="item-name-text">{typeof item === 'string' ? item : item.name}</div>
                    <div className="item-qty-badge">1x</div>
                  </div>
                ))
              ) : (
                <div className="manifest-item-row">
                  <div className="item-seq-dot">1</div>
                  <div className="item-name-text">{order.items || 'Aggregated logistics parcel'}</div>
                </div>
              )}
            </div>

            {order.vendorName && (
              <div className="source-merchant-row">
                <span className="merchant-label">Fulfilled by Hub:</span>
                <span className="merchant-name">{order.vendorName}</span>
              </div>
            )}
          </div>

          {/* Proof of Delivery / OTP Section */}
          {order.status === 'DELIVERED' && (
            <div className="drawer-card proof-card">
              <div className="drawer-card-title text-success">
                <ShieldCheck size={16} />
                <span>Proof of Delivery Verified</span>
              </div>
              <p className="pod-timestamp">Delivered at {order.deliveredAt || '10:14 AM'}</p>
              {order.otpVerified && (
                <div className="pod-badge">
                  <CheckCircle2 size={15} /> OTP Verification Code Verified
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="dl-drawer-footer">
          {order.status !== 'DELIVERED' && order.status !== 'FAILED' && onUpdateStatus && (
            <button 
              type="button" 
              className="dl-btn dl-btn-primary w-full"
              onClick={() => onUpdateStatus(order)}
            >
              Update Order Status
            </button>
          )}
          <button type="button" className="dl-btn dl-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDrawer;
