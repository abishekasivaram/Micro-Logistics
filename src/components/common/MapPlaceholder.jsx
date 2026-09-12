import React from 'react';
import { MapPin, Navigation, Store, Home, ShieldCheck, Compass } from 'lucide-react';
import './MapPlaceholder.css';

const MapPlaceholder = ({ 
  pickupLocation = "12 T. Nagar Main Rd, Chennai",
  deliveryLocation = "101 Anna Nagar East, Chennai",
  agentName = "Muthu Vel (DA014)",
  status = "OUT_FOR_DELIVERY",
  estimatedTime = "25 mins"
}) => {
  const isDelivered = status === 'DELIVERED';

  return (
    <div className="map-placeholder-card">
      <div className="map-header">
        <div className="map-title-group">
          <Compass size={18} className="text-primary" />
          <span>Interactive Route Map (Logistics View)</span>
        </div>
        <div className="map-badge">
          <ShieldCheck size={14} />
          <span>Micro-Logistics Dispatch Mesh</span>
        </div>
      </div>

      <div className="map-canvas">
        <div className="map-grid-overlay"></div>

        {/* SVG Route Line */}
        <svg className="map-route-svg" viewBox="0 0 600 240">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          {/* Animated Route Path */}
          <path 
            d="M 80 120 C 180 40, 320 200, 520 120" 
            fill="none" 
            stroke="url(#routeGradient)" 
            strokeWidth="4" 
            strokeDasharray="8 6"
            className="route-line-anim"
          />
        </svg>

        {/* Pickup Node (Seller) */}
        <div className="map-node pickup-node" style={{ left: '60px', top: '95px' }}>
          <div className="node-icon seller-icon">
            <Store size={18} />
          </div>
          <div className="node-tooltip">
            <strong>Pickup Point (Seller)</strong>
            <span>{pickupLocation}</span>
          </div>
        </div>

        {/* Driver/Agent Pin on Route */}
        <div 
          className="map-node driver-node" 
          style={{ 
            left: isDelivered ? '500px' : '280px', 
            top: isDelivered ? '95px' : '130px' 
          }}
        >
          <div className="driver-pulse"></div>
          <div className="node-icon driver-icon">
            <Navigation size={18} />
          </div>
          <div className="node-tooltip driver-tooltip">
            <strong>{agentName}</strong>
            <span>ETA: {isDelivered ? 'Delivered' : estimatedTime}</span>
          </div>
        </div>

        {/* Delivery Node (Customer) */}
        <div className="map-node delivery-node" style={{ left: '500px', top: '95px' }}>
          <div className="node-icon customer-icon">
            <Home size={18} />
          </div>
          <div className="node-tooltip">
            <strong>Delivery Location</strong>
            <span>{deliveryLocation}</span>
          </div>
        </div>
      </div>

      <div className="map-footer">
        <div className="route-info-pill">
          <MapPin size={14} className="text-secondary" />
          <span><strong>From:</strong> {pickupLocation}</span>
        </div>
        <div className="route-arrow">➔</div>
        <div className="route-info-pill">
          <MapPin size={14} className="text-secondary" />
          <span><strong>To:</strong> {deliveryLocation}</span>
        </div>
      </div>
    </div>
  );
};

export default MapPlaceholder;
