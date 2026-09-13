import React from 'react';
import { MapPin, ArrowDown } from 'lucide-react';

const RouteStopCard = ({ stopNumber, type, name, location, isLast }) => {
  const isPickup = type === 'pickup';
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card" style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: '15px', 
        padding: '15px',
        borderLeft: `4px solid ${isPickup ? '#007bff' : '#28a745'}`
      }}>
        <div style={{ 
          backgroundColor: isPickup ? '#e6f2ff' : '#e6f9ed', 
          color: isPickup ? '#007bff' : '#28a745',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          flexShrink: 0
        }}>
          {stopNumber}
        </div>
        
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
            <span style={{ 
              fontSize: '0.75rem', 
              textTransform: 'uppercase', 
              fontWeight: 'bold', 
              color: isPickup ? '#007bff' : '#28a745' 
            }}>
              {isPickup ? 'Pickup' : 'Delivery'}
            </span>
          </div>
          <h4 style={{ margin: '0 0 5px 0' }}>{name}</h4>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', fontSize: '0.85rem', color: '#555' }}>
            <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
            <span>{location}</span>
          </div>
        </div>
      </div>
      
      {!isLast && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5px 0' }}>
          <ArrowDown size={20} color="#ccc" />
        </div>
      )}
    </div>
  );
};

export default RouteStopCard;
