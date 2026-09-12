import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ShoppingBag, Search, Filter, Eye, X, Calendar, MapPin, Store, User } from 'lucide-react';
import { getHumanReadableStatus, getStatusBadgeClass } from '../../utils/aggregationUtils';
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
    const matchesSearch = (o.id || '').toLowerCase().includes(sTerm) ||
                          (o.orderId || '').toLowerCase().includes(sTerm) ||
                          (o.customerName || '').toLowerCase().includes(sTerm) ||
                          (o.vendorName || o.sellerName || '').toLowerCase().includes(sTerm);
    
    const matchesSeller = sellerFilter === 'ALL' || o.vendorId === sellerFilter || o.sellerId === sellerFilter;
    const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter || o.orderStatus === orderStatusFilter;
    const matchesAgg = aggregationFilter === 'ALL' || o.aggregationStatus === aggregationFilter;

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
              {sellersList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                <th>Seller</th>
                <th>Customer</th>
                <th>Pickup & Delivery</th>
                <th>Delivery Window</th>
                <th>Order Status</th>
                <th>Aggregation Status</th>
                <th>Assigned Agent</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr><td colSpan="9" className="empty-state">No central orders match your search and filter criteria.</td></tr>
              ) : (
                filteredOrders.map(o => (
                  <tr key={o.id}>
                    <td className="font-medium">{o.orderId || o.id}</td>
                    <td>{o.vendorName || o.sellerName || 'Local Seller'}</td>
                    <td>{o.customerName}</td>
                    <td style={{ fontSize: '12px', maxWidth: '200px' }}>
                      <div style={{ color: '#475569' }}><strong>From:</strong> {o.pickupLocation}</div>
                      <div style={{ color: '#0284c7' }}><strong>To:</strong> {o.deliveryLocation}</div>
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      <div>{o.deliveryDate}</div>
                      <div className="text-secondary">{o.deliveryTimeSlot}</div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(o.status || o.orderStatus)}`}>
                        {getHumanReadableStatus(o.status || o.orderStatus)}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-secondary" style={{ fontSize: '11px' }}>
                        {o.aggregationStatus || 'Waiting'}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      {o.assignedAgent || <span className="text-warning">Unassigned</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-sm btn-outline" onClick={() => setSelectedOrder(o)}>
                        <Eye size={14} /> Details
                      </button>
                    </td>
                  </tr>
                ))
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
