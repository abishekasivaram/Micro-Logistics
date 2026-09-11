import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Search, Filter, Map as MapIcon, ChevronRight, X } from 'lucide-react';
import './OrdersPage.css';

const OrdersPage = () => {
  const { orders, customers, vendors, updateOrderStatus } = useAppContext();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [viewingOrder, setViewingOrder] = useState(null); // For modal

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
      order.customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendor.name?.toLowerCase().includes(searchTerm.toLowerCase());
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
      // Only select orders that are not already assigned to a delivery group
      const unassignedIds = filteredOrders.filter(o => !o.deliveryGroupId).map(o => o.id);
      setSelectedOrders(unassignedIds);
    } else {
      setSelectedOrders([]);
    }
  };

  const handleAggregate = () => {
    if (selectedOrders.length === 0) return;
    navigate('/order-aggregation', { state: { preSelectedOrders: selectedOrders } });
  };

  const statusOptions = [
    'PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 
    'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
  ];

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
            placeholder="Search by ID, customer or vendor..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={18} className="text-secondary" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            {statusOptions.map(s => (
               <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
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
              <th>Date</th>
              <th>Customer</th>
              <th>Vendor</th>
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
                    <td>{new Date(order.date).toLocaleDateString()}</td>
                    <td>
                      <div className="customer-info">
                        <span>{order.customer.name}</span>
                        <small className="text-secondary">{order.customer.address}</small>
                      </div>
                    </td>
                    <td>{order.vendor.name}</td>
                    <td className="font-medium">₹{order.total.toFixed(2)}</td>
                    <td>
                      <select 
                        className={`status-badge badge-${order.status.toLowerCase()}`}
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        disabled={isGrouped && !['DELIVERED', 'CANCELLED'].includes(order.status)} 
                      >
                         {statusOptions.map(s => (
                           <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                         ))}
                      </select>
                    </td>
                    <td>
                      <button className="icon-btn-small" onClick={() => setViewingOrder(order)}>
                         <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {viewingOrder && (
        <div className="modal-overlay" onClick={() => setViewingOrder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details: {viewingOrder.id}</h3>
              <button className="icon-btn-small" onClick={() => setViewingOrder(null)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div className="detail-group">
                <p><strong>Date:</strong> {new Date(viewingOrder.date).toLocaleString()}</p>
                <p><strong>Status:</strong> <span className={`badge badge-${viewingOrder.status.toLowerCase()}`}>{viewingOrder.status.replace(/_/g, ' ')}</span></p>
              </div>
              <div className="detail-group">
                <h4>Customer</h4>
                <p>{viewingOrder.customer.name}</p>
                <p>{viewingOrder.customer.address}</p>
                <p>{viewingOrder.customer.phone}</p>
              </div>
              <div className="detail-group">
                <h4>Vendor</h4>
                <p>{viewingOrder.vendor.name}</p>
                <p>{viewingOrder.vendor.address}</p>
              </div>
              <div className="detail-group">
                <h4>Items</h4>
                <table className="mini-table">
                  <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
                  <tbody>
                    {viewingOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>{item.qty}</td>
                        <td>₹{item.price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="detail-total">
                <strong>Total Amount: </strong> ₹{viewingOrder.total.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
