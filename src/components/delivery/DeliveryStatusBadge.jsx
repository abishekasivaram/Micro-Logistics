import React from 'react';
import './DeliveryStatusBadge.css';

const STATUS_CONFIGS = {
  DELIVERED: { label: 'Delivered', variant: 'success', pulse: false },
  COMPLETED: { label: 'Completed', variant: 'success', pulse: false },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', variant: 'primary', pulse: true },
  IN_PROGRESS: { label: 'In Progress', variant: 'primary', pulse: true },
  PICKED_UP: { label: 'Picked Up', variant: 'info', pulse: false },
  COLLECTED: { label: 'Collected', variant: 'info', pulse: false },
  PENDING: { label: 'Pending Drop', variant: 'warning', pulse: false },
  ASSIGNED: { label: 'Assigned', variant: 'warning', pulse: false },
  ARRIVED: { label: 'Arrived at Stop', variant: 'info', pulse: true },
  FAILED: { label: 'Failed / Returned', variant: 'danger', pulse: false },
  CANCELLED: { label: 'Cancelled', variant: 'neutral', pulse: false },
  AVAILABLE: { label: 'Available', variant: 'success', pulse: true },
  'ON BREAK': { label: 'On Break', variant: 'warning', pulse: false },
  OFFLINE: { label: 'Offline', variant: 'neutral', pulse: false }
};

const DeliveryStatusBadge = ({ status = 'PENDING', size = 'md', className = '' }) => {
  const normalizedKey = String(status).toUpperCase();
  const config = STATUS_CONFIGS[normalizedKey] || {
    label: status.replace(/_/g, ' '),
    variant: 'neutral',
    pulse: false
  };

  return (
    <span className={`dl-badge dl-badge-${config.variant} dl-badge-${size} ${className}`}>
      <span className={`dl-badge-dot ${config.pulse ? 'has-pulse' : ''}`} />
      <span className="dl-badge-label">{config.label}</span>
    </span>
  );
};

export default DeliveryStatusBadge;
