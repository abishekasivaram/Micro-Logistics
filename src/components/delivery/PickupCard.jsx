import React from 'react';
import { Store, CheckCircle, Package } from 'lucide-react';

const PickupCard = ({ location, seller, orders, onConfirm, isConfirmed }) => {
  return (
    <div className={`card ${isConfirmed ? 'bg-light' : ''}`} style={{ marginBottom: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Store size={20} className={isConfirmed ? "text-success" : "text-primary"} />
          <h4 style={{ margin: 0 }}>{seller}</h4>
        </div>
        {isConfirmed && <CheckCircle size={20} className="text-success" />}
      </div>
      
      <div style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#555' }}>
        <div><strong>Location:</strong> {location}</div>
        <div style={{ marginTop: '8px' }}>
          <strong>Orders to Pickup:</strong>
          <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
            {orders.map(o => (
              <li key={o.id}>{o.id} - {o.items?.length || 1} items</li>
            ))}
          </ul>
        </div>
      </div>
      
      {!isConfirmed && (
        <button 
          className="btn btn-primary w-full"
          onClick={onConfirm}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
        >
          <Package size={16} /> Confirm Pickup
        </button>
      )}
      {isConfirmed && (
        <div className="text-center text-success" style={{ fontWeight: '500', fontSize: '0.9rem' }}>
          Pickup Confirmed
        </div>
      )}
    </div>
  );
};

export default PickupCard;
