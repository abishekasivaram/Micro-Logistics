import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, Map as MapIcon, ChevronRight } from 'lucide-react';
import '../customer/OrdersPage.css'; // Reusing table styles

const DeliveriesPage = () => {
  const { deliveryBatches = [], deliveryAgents = [], orders = [], customers = [], updateBatchStatus } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  // Enrich delivery groups
  const enrichedGroups = deliveryBatches.map(group => {
    const groupOrders = (group.orderIds || []).map(id => orders.find(o => o.id === id)).filter(Boolean);
    const agent = deliveryAgents.find(da => da.id === group.agentId);
    
    // Get unique customers in this delivery
    const uniqueCustomerIds = [...new Set(groupOrders.map(o => o.customerId))];
    const groupCustomers = uniqueCustomerIds.map(id => customers.find(c => c.id === id)).filter(Boolean);
    
    return {
      ...group,
      personnel: agent,
      orders: groupOrders,
      customers: groupCustomers
    };
  });

  const filteredGroups = enrichedGroups.filter(g => 
    g.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (g.personnel && g.personnel.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Delivery Management</h2>
          <p>Track active deliveries and manage personnel assignments.</p>
        </div>
      </div>

      <div className="controls-bar card">
        <div className="search-box">
          <Search size={18} className="text-secondary" />
          <input 
            type="text" 
            placeholder="Search by ID or Agent..." 
            aria-label="Search deliveries by ID or Agent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Delivery ID</th>
              <th>Agent</th>
              <th>Orders</th>
              <th>Destinations</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.length === 0 ? (
              <tr><td colSpan="6" className="empty-state">No delivery groups found.</td></tr>
            ) : (
              filteredGroups.map(group => (
                <tr key={group.id}>
                  <td className="font-medium">{group.id}</td>
                  <td>
                    {group.personnel ? (
                      <div className="customer-info">
                        <span>{group.personnel.name}</span>
                        <small className="text-secondary">{group.personnel.phone}</small>
                      </div>
                    ) : (
                      <span className="text-secondary">Unassigned</span>
                    )}
                  </td>
                  <td>{group.orders.length} orders</td>
                  <td>
                    <div className="customer-info">
                      {group.customers.map(c => <span key={c.id} style={{fontSize: '12px'}}>{c.name}</span>)}
                    </div>
                  </td>
                  <td>
                    <select 
                      aria-label={`Update status for delivery ${group.id}`}
                      className={`status-badge badge-${group.status.replace(/\s+/g, '-').toLowerCase()}`}
                      value={group.status}
                      onChange={(e) => updateBatchStatus(group.id, e.target.value)}
                      disabled={group.status === 'Delivered' || group.status === 'Completed'}
                    >
                      <option value="Pending Assignment">Pending Assignment</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Pickup in Progress">Pickup in Progress</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td>
                    <button className="icon-btn-small" title="View Route"><MapIcon size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveriesPage;
