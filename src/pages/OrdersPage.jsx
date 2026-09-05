import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Search, Filter, Map as MapIcon, ChevronRight } from 'lucide-react';
import './OrdersPage.css';

const OrdersPage = () => {
  const { orders, customers, vendors, updateOrderStatus } = useAppContext();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrders, setSelectedOrders] = useState([]);

  // Enrich order data
  const getEnrichedOrder = (order) => ({
    ...order,
    customer: customers.find(c => c.id === order.customerId) || {},
    vendor: vendors.find(v => v.id === order.vendorId) || {}
  });

  const enrichedOrders = orders.map(getEnrichedOrder);

  // Filtering
  const filteredOrders = enrichedOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.customer.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectOrder = (id) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(oid => oid !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Only select orders that are not already assigned to a group
      const unassignedIds = filteredOrders.filter(o => !o.deliveryGroupId).map(o => o.id);
      setSelectedOrders(unassignedIds);
    } else {
      setSelectedOrders([]);
    }
  };

  const handleAggregate = () => {
    if (selectedOrders.length === 0) return;
    // We could store in Context or pass via router state. We'll use router state here.
    navigate('/order-aggregation', { state: { preSelectedOrders: selectedOrders } });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Orders</h2>
          <p>Manage and track all customer orders.</p>
        </div>
        <div className="header-actions">
          {selectedOrders.length > 0 && (
            <button className="btn btn-primary flex items-center gap-2" onClick={handleAggregate}>
              <MapIcon size={18} /> Aggregate {selectedOrders.length} Orders
            </button>
          )}
          <button className="btn btn-outline">+ Create Order</button>
        </div>
      </div>

      <div className="controls-bar card">
        <div className="search-box">
          <Search size={18} className="text-secondary" />
          <input 
            type="text" 
            placeholder="Search by ID or customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={18} className="text-secondary" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Preparing">Preparing</option>
            <option value="Assigned">Assigned</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      <div className="table-container card">
        <table className="data-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" onChange={handleSelectAll} />
              </th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Vendor</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr><td colSpan="8" className="empty-state">No orders found.</td></tr>
            ) : (
              filteredOrders.map(order => {
                const isGrouped = !!order.deliveryGroupId;
                return (
                  <tr key={order.id} className={selectedOrders.includes(order.id) ? 'selected-row' : ''}>
                    <td>
                      <input 
                        type="checkbox" 
                        disabled={isGrouped}
                        checked={selectedOrders.includes(order.id)} 
                        onChange={() => toggleSelectOrder(order.id)} 
                      />
                    </td>
                    <td className="font-medium">{order.id}</td>
                    <td>
                      <div className="customer-info">
                        <span>{order.customer.name}</span>
                        <small className="text-secondary">{order.customer.address}</small>
                      </div>
                    </td>
                    <td>{order.vendor.name}</td>
                    <td>{order.items.reduce((sum, item) => sum + item.qty, 0)} items</td>
                    <td className="font-medium">${order.total.toFixed(2)}</td>
                    <td>
                      <select 
                        className={`status-badge badge-${order.status.toLowerCase()}`}
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        disabled={isGrouped && order.status !== 'Delivered'} // Simplify logic for mock
                      >
                        <option value="Pending">Pending</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Assigned" disabled>Assigned</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td>
                      <button className="icon-btn-small"><ChevronRight size={18} /></button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersPage;
