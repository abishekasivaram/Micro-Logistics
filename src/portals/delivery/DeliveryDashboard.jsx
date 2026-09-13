import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import DeliveryBatchCard from '../../components/delivery/DeliveryBatchCard';
import { Truck, PackageCheck, Map, Clock } from 'lucide-react';

const DeliveryDashboard = () => {
  const { currentUser, getAgentBatches } = useAppContext();
  
  // Data Isolation: Only get batches for the current agent
  const myBatches = getAgentBatches(currentUser?.id);
  
  const activeBatches = myBatches.filter(b => b.status !== 'Completed' && b.status !== 'Delivered');
  const completedBatches = myBatches.filter(b => b.status === 'Completed' || b.status === 'Delivered');
  
  const activeBatch = activeBatches.length > 0 ? activeBatches[0] : null;
  const upcomingBatches = activeBatches.slice(1);
  
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2>Good Morning, {currentUser?.name}</h2>
          <p className="text-secondary">{today} | Status: <strong className="text-primary">{currentUser?.availability || 'Available'}</strong></p>
        </div>
      </div>

      <div className="dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div className="stat-card card text-center" style={{ padding: '20px' }}>
          <PackageCheck size={24} className="text-primary mb-2 mx-auto" />
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{completedBatches.length}</div>
          <div className="text-secondary text-sm">Completed Today</div>
        </div>
        <div className="stat-card card text-center" style={{ padding: '20px' }}>
          <Truck size={24} className="text-warning mb-2 mx-auto" />
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{activeBatches.length}</div>
          <div className="text-secondary text-sm">Active Batches</div>
        </div>
        <div className="stat-card card text-center" style={{ padding: '20px' }}>
          <Map size={24} className="text-info mb-2 mx-auto" />
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{myBatches.reduce((acc, b) => acc + (b.pickupLocations?.length || 0), 0)}</div>
          <div className="text-secondary text-sm">Total Pickups</div>
        </div>
      </div>

      <div className="dashboard-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="main-col">
          <h3 style={{ marginBottom: '15px' }}>Current Active Batch</h3>
          {activeBatch ? (
            <DeliveryBatchCard batch={activeBatch} />
          ) : (
            <div className="card text-center text-secondary" style={{ padding: '40px' }}>
              <Truck size={40} className="mx-auto mb-3 opacity-50" />
              <p>No active delivery batch assigned.</p>
              <p className="text-sm">You are currently {currentUser?.availability}.</p>
            </div>
          )}
        </div>
        
        <div className="side-col">
          <h3 style={{ marginBottom: '15px' }}>Quick Actions</h3>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/delivery/deliveries" className="btn btn-outline text-left">
              View All My Deliveries
            </Link>
            <Link to="/delivery/pickup" className="btn btn-outline text-left" disabled={!activeBatch}>
              Start / View Pickups
            </Link>
            <Link to="/delivery/route" className="btn btn-outline text-left" disabled={!activeBatch}>
              View Current Route
            </Link>
            <Link to="/delivery/status" className="btn btn-outline text-left" disabled={!activeBatch}>
              Update Delivery Status
            </Link>
          </div>

          {upcomingBatches.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '15px', fontSize: '1.1rem' }}>Upcoming Batches</h3>
              {upcomingBatches.map(b => (
                <div key={b.id} className="card" style={{ padding: '10px 15px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Batch {b.batchId}</strong>
                    <span className="text-secondary text-sm"><Clock size={12}/> {b.deliverySlot}</span>
                  </div>
                  <div className="text-sm text-secondary" style={{ marginTop: '5px' }}>
                    {b.orderCount} Orders | {b.deliveryLocations?.length} Locations
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
