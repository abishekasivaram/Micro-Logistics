import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';
import { Search, Calendar as CalendarIcon, Filter } from 'lucide-react';

const DeliveryHistoryPage = () => {
  const { currentUser, getAgentBatches, getAgentOrders } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data Isolation
  const myBatches = getAgentBatches(currentUser?.id);
  const completedBatches = myBatches.filter(b => b.status === 'Completed' || b.status === 'Delivered');
  
  // Get orders that belong to completed batches
  const completedBatchIds = completedBatches.map(b => b.id);
  const myCompletedOrders = getAgentOrders(currentUser?.id).filter(o => completedBatchIds.includes(o.batchId));
  
  const filteredOrders = myCompletedOrders.filter(o => {
    const searchLower = searchTerm.toLowerCase();
    return o.id.toLowerCase().includes(searchLower) || 
           (o.batchId && o.batchId.toLowerCase().includes(searchLower)) ||
           o.customerName.toLowerCase().includes(searchLower);
  });

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2>Delivery History</h2>
          <p className="text-secondary">View your past completed deliveries</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '5px 15px', borderRadius: '4px', border: '1px solid #ddd' }}>
            <Search size={18} className="text-secondary" style={{ marginRight: '10px' }} />
            <input 
              type="text" 
              placeholder="Search Order ID, Batch..." 
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '200px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="data-table" style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>Order ID</th>
              <th style={{ padding: '15px' }}>Batch ID</th>
              <th style={{ padding: '15px' }}>Seller</th>
              <th style={{ padding: '15px' }}>Delivery Area</th>
              <th style={{ padding: '15px' }}>Date</th>
              <th style={{ padding: '15px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '15px', fontWeight: '500' }}>{order.id}</td>
                  <td style={{ padding: '15px' }}>{order.batchId}</td>
                  <td style={{ padding: '15px' }}>{order.vendorName}</td>
                  <td style={{ padding: '15px' }}>{order.deliveryLocation}</td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#666' }}>
                      <CalendarIcon size={14} /> {order.deliveryDate}
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-secondary" style={{ padding: '30px' }}>
                  No completed deliveries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveryHistoryPage;
