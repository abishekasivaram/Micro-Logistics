import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  let badgeStyle = {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    textTransform: 'capitalize'
  };

  switch (normalized) {
    case 'DELIVERED':
      badgeStyle.backgroundColor = '#d1fae5';
      badgeStyle.color = '#065f46';
      break;
    case 'READY_FOR_DELIVERY':
    case 'READY':
      badgeStyle.backgroundColor = '#e0e7ff';
      badgeStyle.color = '#3730a3';
      break;
    case 'PREPARING':
    case 'IN_PROGRESS':
      badgeStyle.backgroundColor = '#fef3c7';
      badgeStyle.color = '#92400e';
      break;
    case 'ASSIGNED':
    case 'OUT_FOR_DELIVERY':
      badgeStyle.backgroundColor = '#dbeafe';
      badgeStyle.color = '#1e40af';
      break;
    case 'CONFIRMED':
      badgeStyle.backgroundColor = '#e0f2fe';
      badgeStyle.color = '#0369a1';
      break;
    case 'PLACED':
      badgeStyle.backgroundColor = '#f3f4f6';
      badgeStyle.color = '#374151';
      break;
    case 'CANCELLED':
    case 'REJECTED':
      badgeStyle.backgroundColor = '#fee2e2';
      badgeStyle.color = '#991b1b';
      break;
    default:
      badgeStyle.backgroundColor = '#f3f4f6';
      badgeStyle.color = '#4b5563';
  }

  return (
    <span style={badgeStyle}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export default StatusBadge;
