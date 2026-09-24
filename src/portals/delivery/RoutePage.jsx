import React from 'react';
import { useAppContext } from '../../context/AppContext';
import RouteStopCard from '../../components/delivery/RouteStopCard';
import MapPlaceholder from '../../components/common/MapPlaceholder';
import { Navigation } from 'lucide-react';

const RoutePage = () => {
  const { currentUser, getAgentBatches, getAgentOrders } = useAppContext();
  
  // Data Isolation
  const myBatches = getAgentBatches(currentUser?.id);
  const activeBatches = myBatches.filter(b => b.status !== 'Completed' && b.status !== 'Delivered');
  const activeBatch = activeBatches.length > 0 ? activeBatches[0] : null;
  
  const myOrders = activeBatch ? getAgentOrders(currentUser?.id).filter(o => activeBatch.orderIds.includes(o.id)) : [];

  if (!activeBatch) {
    return (
      <div className="page-container">
        <h2>Delivery Route</h2>
        <div className="card text-center text-secondary" style={{ padding: '40px' }}>
          <p>No active delivery batch. You have no route assigned.</p>
        </div>
      </div>
    );
  }

  // Generate sequence of stops: Pickups first, then Deliveries
  const pickups = [];
  const deliveries = [];
  const processedSellers = new Set();

  myOrders.forEach(o => {
    if (!processedSellers.has(o.vendorId)) {
      pickups.push({
        type: 'pickup',
        id: `p_${o.vendorId}`,
        name: o.vendorName,
        location: o.pickupLocation
      });
      processedSellers.add(o.vendorId);
    }
    deliveries.push({
      type: 'delivery',
      id: `d_${o.id}`,
      name: o.customerName,
      location: o.deliveryLocation
    });
  });

  const routeStops = [...pickups, ...deliveries];

  const handleOpenNavigation = () => {
    const targetAddress = routeStops[0]?.location || activeBatch.deliveryArea || 'Chennai, Tamil Nadu';
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(targetAddress)}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Delivery Route</h2>
          <p className="text-secondary">Batch {activeBatch.batchId}</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleOpenNavigation}
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          title="Open Google Maps Directions"
        >
          <Navigation size={16} /> Open Navigation
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="route-list" style={{ order: 2 }}>
          <h3 style={{ marginBottom: '15px' }}>Route Sequence</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {routeStops.map((stop, index) => (
              <RouteStopCard 
                key={stop.id}
                stopNumber={index + 1}
                type={stop.type}
                name={stop.name}
                location={stop.location}
                isLast={index === routeStops.length - 1}
              />
            ))}
          </div>
        </div>

        <div className="route-map" style={{ order: 1 }}>
          <div style={{ position: 'sticky', top: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Map View</h3>
            <div className="card" style={{ padding: '0', overflow: 'hidden', height: '400px' }}>
              <MapPlaceholder height="100%" />
            </div>
            
            <div className="card" style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <span className="text-secondary text-sm">Estimated Distance</span>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>{activeBatch.estimatedDistance} km</strong>
              </div>
              <div>
                <span className="text-secondary text-sm">Estimated Time</span>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>{activeBatch.estimatedTime} mins</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePage;
