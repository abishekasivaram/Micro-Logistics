import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import DeliveryBatchCard from '../../components/delivery/DeliveryBatchCard';
import { Filter } from 'lucide-react';

const MyDeliveriesPage = () => {
  const { currentUser, getAgentBatches } = useAppContext();
  const [filter, setFilter] = useState('All');
  
  // Data Isolation
  const myBatches = getAgentBatches(currentUser?.id);
  
  const filteredBatches = myBatches.filter(b => {
    if (filter === 'All') return true;
    if (filter === 'Active') return b.status !== 'Completed' && b.status !== 'Delivered';
    if (filter === 'Completed') return b.status === 'Completed' || b.status === 'Delivered';
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>My Deliveries</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Filter size={18} className="text-secondary" />
          <select 
            className="form-control" 
            style={{ width: 'auto', display: 'inline-block' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Batches</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {filteredBatches.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px' }}>
          <p className="text-secondary">No deliveries found matching the filter.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredBatches.map(batch => (
            <DeliveryBatchCard key={batch.id} batch={batch} showAction={batch.status !== 'Completed' && batch.status !== 'Delivered'} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDeliveriesPage;
