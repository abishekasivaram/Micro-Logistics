import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import api from '../../services/api';
import MapPlaceholder from '../../components/common/MapPlaceholder';
import StatusBadge from '../../components/common/StatusBadge';
import { Navigation, Clock, MapPin, User, Phone, CheckCircle, Package, Calendar, Sparkles, Key } from 'lucide-react';
import './TrackDeliveryPage.css';

const TrackDeliveryPage = () => {
  const { orders, currentUser } = useAppContext();

  // Find customer's active or recent orders
  const customerOrders = orders.filter(o => o.customerId === currentUser?.id || o.customerName === currentUser?.name || currentUser?.role === 'admin' || currentUser?.role === 'vendor');
  
  const [selectedOrderId, setSelectedOrderId] = useState(
    customerOrders[0]?.id || customerOrders[0]?.orderId || ''
  );

  const activeOrder = customerOrders.find(o => (o.id === selectedOrderId || o.orderId === selectedOrderId)) || customerOrders[0];

  const status = (activeOrder?.orderStatus || activeOrder?.status || 'PLACED').toUpperCase();

  const [orderOtp, setOrderOtp] = useState('1234');

  useEffect(() => {
    if (!activeOrder) return;
    const ordId = activeOrder.id || activeOrder.orderCode || activeOrder.orderId;
    if (ordId) {
      api.get(`/delivery/orders/${ordId}/otp`)
        .then(res => {
          if (res.data.success && res.data.data?.otp) {
            setOrderOtp(res.data.data.otp);
          }
        })
        .catch(() => {
          setOrderOtp('1234');
        });
    }
  }, [activeOrder]);

  const getProgressPercentage = (st) => {
    switch (st) {
      case 'PLACED': return 15;
      case 'CONFIRMED': return 35;
      case 'PREPARING': return 50;
      case 'READY_FOR_DELIVERY': return 70;
      case 'ASSIGNED': return 80;
      case 'OUT_FOR_DELIVERY': return 90;
      case 'DELIVERED': return 100;
      default: return 10;
    }
  };

  const progressPct = getProgressPercentage(status);

  return (
    <div className="customer-track-page page-container">
      <div className="track-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Live Tracking</h2>
          <p>Monitor your smart aggregated delivery route in real-time.</p>
        </div>

        {customerOrders.length > 1 && (
          <div className="order-select-header-box">
            <label htmlFor="track-select-order" style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>Select Order:</label>
            <select 
              id="track-select-order"
              aria-label="Select order to track"
              value={selectedOrderId} 
              onChange={e => setSelectedOrderId(e.target.value)}
            >
              {customerOrders.map(o => (
                <option key={o.id} value={o.id || o.orderId}>
                  {o.id || o.orderId} - {o.vendorName} (₹{o.total?.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!activeOrder ? (
        <div className="empty-state-card" style={{ textAlign: 'center', padding: '64px 24px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', marginTop: '24px' }}>
          <Package size={56} color="#94a3b8" style={{ margin: '0 auto 20px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '20px', margin: '0 0 12px', color: '#1e293b' }}>No Active Deliveries</h3>
          <p style={{ color: '#64748b', maxWidth: '450px', margin: '0 auto 32px', lineHeight: '1.6' }}>
            You don't have any active deliveries right now. Discover fresh products from neighborhood sellers and place your first smart order!
          </p>
          <Link to="/browse-sellers" className="btn btn-primary" style={{ padding: '12px 24px' }}>
            Browse Local Sellers
          </Link>
        </div>
      ) : (
      /* Main Track Layout */
      <div className="tracking-layout-grid">
        
        {/* Left Column: Interactive Map Placeholder */}
        <div className="map-column">
          <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <MapPlaceholder 
              pickupLocation={activeOrder.pickupLocation || "Seller Hub, Chennai"}
              deliveryLocation={activeOrder.deliveryLocation || "Customer Address, Chennai"}
              agentName={activeOrder.assignedAgent || "Muthu Vel"}
              status={status}
              estimatedTime={status === 'DELIVERED' ? 'Delivered' : '20-25 mins'}
            />
          </div>

          <div className="tracking-status-banner">
            <div className="progress-top-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                  <Navigation size={16} />
                </div>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                  {activeOrder.deliveryStatus || status.replace(/_/g, ' ')}
                </span>
              </div>
              <StatusBadge status={status} />
            </div>

            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progressPct}%` }}></div>
            </div>

            <div className="progress-steps-labels">
              <span style={{ color: progressPct >= 15 ? '#4f46e5' : '#94a3b8' }}>Placed</span>
              <span style={{ color: progressPct >= 50 ? '#4f46e5' : '#94a3b8' }}>Prepared</span>
              <span style={{ color: progressPct >= 70 ? '#4f46e5' : '#94a3b8' }}>Grouped</span>
              <span style={{ color: progressPct >= 90 ? '#4f46e5' : '#94a3b8' }}>Out for Delivery</span>
              <span style={{ color: progressPct >= 100 ? '#10b981' : '#94a3b8' }}>Delivered</span>
            </div>
          </div>
        </div>

        {/* Right Column: Driver & Delivery Details Card */}
        <div className="info-column">
          <div className="info-card">
            <h3>Delivery Summary</h3>
            <div className="info-card-id">{activeOrder.id || activeOrder.orderId}</div>

            <div className="detail-list">
              <div className="d-item">
                <Package size={18} color="#64748b" />
                <div>
                  <span className="d-label">Seller Location</span>
                  <strong className="d-val">{activeOrder.vendorName || 'Local Seller'}</strong>
                </div>
              </div>

              <div className="d-item">
                <MapPin size={18} color="#64748b" />
                <div>
                  <span className="d-label">Destination Address</span>
                  <strong className="d-val">{activeOrder.deliveryLocation}</strong>
                </div>
              </div>

              <div className="d-item">
                <Calendar size={18} color="#64748b" />
                <div>
                  <span className="d-label">Delivery Date & Window</span>
                  <strong className="d-val">{activeOrder.deliveryDate || 'Today'} ({activeOrder.deliveryTimeSlot || '9 AM - 1 PM'})</strong>
                </div>
              </div>

              <div className="d-item">
                <Clock size={18} color="#64748b" />
                <div>
                  <span className="d-label">Estimated Delivery Time</span>
                  <strong className="d-val" style={{ color: '#4f46e5' }}>
                    {status === 'DELIVERED' ? 'Successfully Delivered' : 'Estimated 20-25 mins'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Delivery Verification PIN */}
            {status !== 'DELIVERED' && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(6, 182, 212, 0.08))',
                border: '1px solid rgba(79, 70, 229, 0.25)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6366f1', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Key size={13} /> Delivery Handover PIN
                  </span>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                    Provide this code to your courier at doorstep
                  </p>
                </div>
                <div style={{
                  background: '#4f46e5',
                  color: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '800',
                  letterSpacing: '0.18em',
                  fontFamily: 'monospace'
                }}>
                  {orderOtp}
                </div>
              </div>
            )}

            {/* Assigned Delivery Agent */}
            <div className="agent-card-box">
              <div className="agent-avatar">
                <User size={24} />
              </div>
              <div className="agent-info">
                <span className="agent-role-tag">Assigned Delivery Partner</span>
                <strong className="agent-name">{activeOrder.assignedAgent || 'Muthu Vel'}</strong>
                <span className="agent-phone"><Phone size={14} /> +91 99887 76655</span>
              </div>
            </div>

            <div className="map-notice-footer">
              <Sparkles size={16} />
              <span>Smart Aggregated Route Active</span>
            </div>
          </div>
        </div>

      </div>
      )}
    </div>
  );
};

export default TrackDeliveryPage;
