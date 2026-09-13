import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { MapPin, Package, Clock, Calendar } from 'lucide-react';
import './DeliveryBatchCard.css';

const DeliveryBatchCard = ({ batch, showAction = true }) => {
  return (
    <div className="delivery-batch-card card">
      <div className="batch-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0' }}>Batch {batch.batchId}</h3>
          <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
            <Calendar size={14} /> {batch.deliveryDate}
          </span>
        </div>
        <StatusBadge status={batch.status} />
      </div>
      
      <div className="batch-body" style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Package size={16} />
            <span>{batch.orderCount} Orders</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={16} />
            <span>{batch.deliverySlot}</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <MapPin size={16} style={{ color: '#007bff', marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem' }}>Pickups ({batch.pickupLocations.length})</strong>
              <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>{batch.sellerNames.join(', ')}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <MapPin size={16} style={{ color: '#28a745', marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem' }}>Deliveries</strong>
              <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>{batch.deliveryLocations.length} locations</span>
            </div>
          </div>
        </div>
      </div>
      
      {showAction && (
        <div className="batch-footer">
          <Link to={`/delivery/pickup`} className="btn btn-primary w-full text-center" style={{ display: 'block' }}>
            View Details
          </Link>
        </div>
      )}
    </div>
  );
};

export default DeliveryBatchCard;
