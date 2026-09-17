import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = String(status).toUpperCase().replace(/\s+/g, '_');

  let variant = 'neutral';
  let label = status.replace(/_/g, ' ');

  switch (normalized) {
    case 'DELIVERED':
    case 'COMPLETED':
    case 'ACTIVE':
    case 'ONLINE':
    case 'AVAILABLE':
    case 'VERIFIED':
      variant = 'success';
      break;

    case 'READY_FOR_DELIVERY':
    case 'READY':
    case 'ASSIGNED':
    case 'IN_TRANSIT':
    case 'OUT_FOR_DELIVERY':
    case 'IN_PROGRESS':
    case 'CONFIRMED':
    case 'DISPATCHED':
      variant = 'progress';
      break;

    case 'WAITING_AGGREGATION':
    case 'PENDING_ASSIGNMENT':
    case 'PENDING':
    case 'PREPARING':
    case 'PLACED':
    case 'SUITABLE_TO_GROUP':
    case 'LOW_STOCK':
      variant = 'pending';
      break;

    case 'CANCELLED':
    case 'REJECTED':
    case 'SUSPENDED':
    case 'FAILED':
    case 'BUSY':
      variant = 'danger';
      break;

    case 'OFFLINE':
    case 'INACTIVE':
    default:
      variant = 'neutral';
      break;
  }

  // Proper title casing for display
  const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();

  return (
    <span className={`status-pill status-${variant}`} title={`Status: ${formattedLabel}`}>
      <span className="pill-dot" />
      {formattedLabel}
    </span>
  );
};

export default StatusBadge;
