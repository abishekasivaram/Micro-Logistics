import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import MapPlaceholder from '../../components/common/MapPlaceholder';
import StatusBadge from '../../components/common/StatusBadge';
import { Navigation, Clock, MapPin, User, Phone, CheckCircle, Package, Calendar } from 'lucide-react';
import './TrackDeliveryPage.css';

const TrackDeliveryPage = () => {
  const { orders, currentUser } = useAppContext();

  // Find customer's active or recent orders
  const customerOrders = orders.filter(o => o.customerId === currentUser?.id || o.customerName === currentUser?.name || currentUser?.role === 'admin' || currentUser?.role === 'vendor');
  
  const [selectedOrderId, setSelectedOrderId] = useState(
    customerOrders[0]?.id || customerOrders[0]?.orderId || 'ORD-1025'
  );

  const activeOrder = customerOrders.find(o => (o.id === selectedOrderId || o.orderId === selectedOrderId)) || customerOrders[0] || {
    id: 'ORD-1025',
    vendorName: 'Sri Lakshmi Organics',
    pickupLocation: '45 Adyar Bridge Rd, Chennai',
    deliveryLocation: '101 Anna Nagar East, Chennai',
    deliveryDate: '2026-09-12',
    deliveryTimeSlot: '9:00 AM – 1:00 PM',
    orderStatus: 'READY_FOR_DELIVERY',
    deliveryStatus: 'Grouped & Assigned',
    assignedAgent: 'Muthu Vel (DA014)',
    total: 890.00
  };

  const status = (activeOrder.orderStatus || activeOrder.status || 'PLACED').toUpperCase();

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
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Real-Time Delivery Tracking</h2>
          <p>Live map position, assigned driver info, and delivery route progress.</p>
        </div>

        {customerOrders.length > 1 && (
          <div className="order-select-header-box">
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#4b5563' }}>Select Order:</label>
            <select 
              value={selectedOrderId} 
              onChange={e => setSelectedOrderId(e.target.value)}
              className="filter-select"
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

      {/* Main Track Layout */}
      <div className="tracking-layout-grid">
        
        {/* Left Column: Interactive Map Placeholder */}
        <div className="map-column">
          <MapPlaceholder 
            pickupLocation={activeOrder.pickupLocation || "Seller Hub, Chennai"}
            deliveryLocation={activeOrder.deliveryLocation || "Customer Address, Chennai"}
            agentName={activeOrder.assignedAgent || "Muthu Vel (DA014)"}
            status={status}
            estimatedTime={status === 'DELIVERED' ? 'Delivered' : '20-25 mins'}
          />

          <div className="tracking-status-banner">
            <div className="progress-top-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Navigation size={18} className="text-primary" />
                <span className="font-medium" style={{ fontSize: '15px' }}>
                  Status: {activeOrder.deliveryStatus || status.replace(/_/g, ' ')}
                </span>
              </div>
              <StatusBadge status={status} />
            </div>

            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progressPct}%` }}></div>
            </div>

            <div className="progress-steps-labels">
              <span>Placed</span>
              <span>Prepared</span>
              <span>Grouped</span>
              <span>Out for Delivery</span>
              <span>Delivered</span>
            </div>
          </div>
        </div>

        {/* Right Column: Driver & Delivery Details Card */}
        <div className="info-column">
          <div className="info-card">
            <h3>Order & Driver Summary</h3>
            <div className="info-card-id">{activeOrder.id || activeOrder.orderId}</div>

            <div className="detail-list">
              <div className="d-item">
                <Package size={18} className="text-secondary" />
                <div>
                  <span className="d-label">Seller Hub</span>
                  <strong className="d-val">{activeOrder.vendorName || 'Local Seller'}</strong>
                </div>
              </div>

              <div className="d-item">
                <MapPin size={18} className="text-secondary" />
                <div>
                  <span className="d-label">Destination Address</span>
                  <strong className="d-val">{activeOrder.deliveryLocation}</strong>
                </div>
              </div>

              <div className="d-item">
                <Calendar size={18} className="text-secondary" />
                <div>
                  <span className="d-label">Delivery Date & Window</span>
                  <strong className="d-val">{activeOrder.deliveryDate || 'Today'} ({activeOrder.deliveryTimeSlot || '9 AM - 1 PM'})</strong>
                </div>
              </div>

              <div className="d-item">
                <Clock size={18} className="text-secondary" />
                <div>
                  <span className="d-label">Estimated Delivery Time</span>
                  <strong className="d-val text-primary">
                    {status === 'DELIVERED' ? 'Successfully Delivered' : 'Estimated 20-25 mins'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Assigned Delivery Agent */}
            <div className="agent-card-box">
              <div className="agent-avatar">
                <User size={20} />
              </div>
              <div className="agent-info">
                <span className="agent-role-tag">Assigned Delivery Partner</span>
                <strong className="agent-name">{activeOrder.assignedAgent || 'Muthu Vel (DA014)'}</strong>
                <span className="agent-phone"><Phone size={12} /> +91 9988776655</span>
              </div>
            </div>

            <div className="map-notice-footer">
              <CheckCircle size={14} className="text-success" />
              <span>Micro-Logistics Route Protection Active</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrackDeliveryPage;
