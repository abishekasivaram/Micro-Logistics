import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, Eye } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import OrderDetailsModal from '../../components/common/OrderDetailsModal';
import '../seller/DashboardOverview.css';

const AdminCentralOrdersPage = () => {
  const { orders, vendors } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [sellerFilter, setSellerFilter] = useState('ALL');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [aggregationFilter, setAggregationFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const sellersList = vendors.map(v => ({ id: v.id, name: v.name }));

  const filteredOrders = orders.filter(o => {
    const sTerm = searchTerm.toLowerCase();
    
    // Fallbacks for missing string values to avoid runtime exceptions
    const orderId = o.id || o.orderId || '';
    const customerName = o.customerName || '';
    const vendorName = o.vendorName || o.sellerName || '';
    
    const matchesSearch = 
      orderId.toLowerCase().includes(sTerm) ||
      customerName.toLowerCase().includes(sTerm) ||
      vendorName.toLowerCase().includes(sTerm);
    
    // Explicit null/undefined checks for filters.
    // If a filter is ALL, we accept it regardless of the field's presence.
    const vendorIdMatch = o.vendorId || o.sellerId || '';
    const matchesSeller = sellerFilter === 'ALL' || vendorIdMatch === sellerFilter;
    
    const statusMatch = o.status || o.orderStatus || '';
    const matchesStatus = orderStatusFilter === 'ALL' || statusMatch === orderStatusFilter;
    
    const aggMatch = o.aggregationStatus || '';
    const matchesAgg = aggregationFilter === 'ALL' || aggMatch === aggregationFilter;

    return matchesSearch && matchesSeller && matchesStatus && matchesAgg;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Central Order Management</h2>
          <p>Global monitor for all customer orders placed across participating local sellers.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by Order ID, Seller, Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select className="form-control" value={sellerFilter} onChange={e => setSellerFilter(e.target.value)} style={{ width: 'auto' }}>
              <option value="ALL">All Sellers</option>
              {sellersList.map(s => <option key={s.id} value={s.id}>{s.name || 'Unknown Seller'}</option>)}
            </select>

            <select className="form-control" value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)} style={{ width: 'auto' }}>
              <option value="ALL">All Order Statuses</option>
              <option value="PLACED">Order Placed</option>
              <option value="CONFIRMED">Order Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
              <option value="ASSIGNED">Assigned for Delivery</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
            </select>

            <select className="form-control" value={aggregationFilter} onChange={e => setAggregationFilter(e.target.value)} style={{ width: 'auto' }}>
              <option value="ALL">All Aggregation Statuses</option>
              <option value="Waiting for Aggregation">Waiting for Aggregation</option>
              <option value="Suitable for Grouping">Suitable for Grouping</option>
              <option value="Batch Created">Batch Created</option>
              <option value="Assigned">Assigned</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Central Orders Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Seller / Shop</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Order Date</th>
                <th>Order Status</th>
                <th>Delivery Status</th>
                <th>Aggregation Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr><td colSpan="10" className="empty-state">No central orders match your search and filter criteria.</td></tr>
              ) : (
                filteredOrders.map(o => {
                  const currentSt = o.status || o.orderStatus || 'PLACED';
                  const itemsCount = o.items ? o.items.reduce((s, i) => s + (i.qty || 1), 0) : 0;
                  
                  return (
                    <tr key={o.id || Math.random()}>
                      <td className="font-medium">{o.orderId || o.id || 'N/A'}</td>
                      <td>{o.customerName || 'Customer'}</td>
                      <td>{o.vendorName || o.sellerName || 'Local Seller'}</td>
                      <td>
                        <span className="font-medium">{itemsCount} items</span>
                        <small style={{ display: 'block', color: '#6b7280' }}>
                          {o.items && o.items[0] ? o.items[0].name : 'N/A'}
                        </small>
                      </td>
                      <td className="font-medium text-primary">₹{(o.total || 0).toFixed(2)}</td>
                      <td>
                        <div style={{ fontSize: '13px' }}>
                          <div>📅 {o.deliveryDate ? o.deliveryDate : (o.date ? new Date(o.date).toLocaleDateString() : 'N/A')}</div>
                          <span style={{ fontSize: '11px', color: '#4b5563', fontWeight: '500' }}>🕒 {o.deliveryTimeSlot || 'Standard Slot'}</span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={currentSt} />
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: '#4b5563', fontWeight: '500' }}>
                          {o.deliveryStatus || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-secondary" style={{ fontSize: '11px' }}>
                          {o.aggregationStatus || 'Not Assigned'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-sm btn-outline" onClick={() => setSelectedOrder(o)}>
                          <Eye size={14} /> Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reusable Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};

export default AdminCentralOrdersPage;
