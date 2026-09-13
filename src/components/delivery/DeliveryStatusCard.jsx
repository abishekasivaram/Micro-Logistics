import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { Package, MapPin, ChevronRight, CheckCircle, Navigation } from 'lucide-react';

const DeliveryStatusCard = ({ order, onProgress }) => {
  const getNextAction = () => {
    switch(order.status) {
      case 'ASSIGNED':
      case 'READY_FOR_DELIVERY':
        return { label: 'Start Pickup', target: 'PICKUP_PENDING', icon: <Package size={16}/> };
      case 'PICKUP_PENDING':
        return { label: 'Confirm Picked Up', target: 'PICKED_UP', icon: <CheckCircle size={16}/> };
      case 'PICKED_UP':
        return { label: 'Out for Delivery', target: 'OUT_FOR_DELIVERY', icon: <Navigation size={16}/> };
      case 'OUT_FOR_DELIVERY':
        return { label: 'Mark Arrived', target: 'ARRIVED', icon: <MapPin size={16}/> };
      case 'ARRIVED':
        return { label: 'Confirm Delivery', target: 'DELIVERED', icon: <CheckCircle size={16}/>, requireModal: true };
      default:
        return null;
    }
  };

  const action = getNextAction();

  return (
    <div className="card" style={{ marginBottom: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h4 style={{ margin: 0 }}>Order {order.id}</h4>
        <StatusBadge status={order.status} />
      </div>
      
      <div style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
        <div style={{ marginBottom: '5px' }}><strong>Customer:</strong> {order.customerName}</div>
        <div style={{ marginBottom: '5px' }}><strong>Delivery:</strong> {order.deliveryLocation}</div>
        <div style={{ marginBottom: '5px' }}><strong>Seller:</strong> {order.vendorName}</div>
      </div>
      
      {action && (
        <button 
          className="btn btn-primary w-full"
          onClick={() => onProgress(order, action)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {action.icon} {action.label} <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
};

export default DeliveryStatusCard;
