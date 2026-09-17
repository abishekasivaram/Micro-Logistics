import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, Eye, Filter, ArrowUpDown, ShoppingBag, Store, User, Calendar, ExternalLink } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import OrderDetailsModal from '../../components/common/OrderDetailsModal';

const AdminCentralOrdersPage = () => {
  const { orders, vendors } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [sellerFilter, setSellerFilter] = useState('ALL');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [aggregationFilter, setAggregationFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const sellersList = vendors.map(v => ({ id: v.id, name: v.name || v.shopName }));

  const filteredOrders = orders.filter(o => {
    const sTerm = searchTerm.toLowerCase();
    
    const orderId = o.id || o.orderId || '';
    const customerName = o.customerName || '';
    const vendorName = o.vendorName || o.sellerName || '';
    
    const matchesSearch = 
      orderId.toLowerCase().includes(sTerm) ||
      customerName.toLowerCase().includes(sTerm) ||
      vendorName.toLowerCase().includes(sTerm);
    
    const vendorIdMatch = o.vendorId || o.sellerId || '';
    const matchesSeller = sellerFilter === 'ALL' || vendorIdMatch === sellerFilter;
    
    const statusMatch = o.status || o.orderStatus || '';
    const matchesStatus = orderStatusFilter === 'ALL' || statusMatch === orderStatusFilter;
    
    const aggMatch = o.aggregationStatus || '';
    const matchesAgg = aggregationFilter === 'ALL' || aggMatch === aggregationFilter;

    return matchesSearch && matchesSeller && matchesStatus && matchesAgg;
  });

  const getInitials = (name) => {
    if (!name) return 'CU';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h2>
            Central Order Management
            <span className="telemetry-tag">
              <span className="telemetry-pulse" /> {filteredOrders.length} ORDERS
            </span>
          </h2>
          <p className="page-subtitle">
            Global real-time transaction telemetry and tracking across all participating local sellers and customers.
          </p>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div className="table-filter-bar" style={{ margin: 0 }}>
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by Order ID, Seller, Customer..."
              aria-label="Search orders by Order ID, Seller, or Customer"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select 
              aria-label="Filter orders by seller" 
              className="form-select" 
              value={sellerFilter} 
              onChange={e => setSellerFilter(e.target.value)}
            >
              <option value="ALL">All Merchants ({sellersList.length})</option>
              {sellersList.map(s => <option key={s.id} value={s.id}>{s.name || 'Unknown Seller'}</option>)}
            </select>

            <select 
              aria-label="Filter orders by status" 
              className="form-select" 
              value={orderStatusFilter} 
              onChange={e => setOrderStatusFilter(e.target.value)}
            >
              <option value="ALL">All Lifecycle States</option>
              <option value="PLACED">Placed</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
              <option value="ASSIGNED">Assigned for Delivery</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
            </select>

            <select 
              aria-label="Filter orders by aggregation status" 
              className="form-select" 
              value={aggregationFilter} 
              onChange={e => setAggregationFilter(e.target.value)}
            >
              <option value="ALL">All Aggregation States</option>
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
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order Ref</th>
              <th>Customer</th>
              <th>Seller & Merchant</th>
              <th>Manifest Items</th>
              <th>Total Amount</th>
              <th>Delivery Schedule</th>
              <th>Lifecycle Status</th>
              <th>Aggregation</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-state-box">
                  <h4>No matching orders found</h4>
                  <p>Try resetting the search terms or state filter options above.</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((o, idx) => {
                const currentSt = o.status || o.orderStatus || 'PLACED';
                const itemsCount = o.items ? o.items.reduce((s, i) => s + (i.qty || 1), 0) : 0;
                
                return (
                  <tr key={o.id || o.orderId || `order-${idx}`}>
                    <td>
                      <span className="order-id-chip">{o.orderId || o.id || 'N/A'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div className="avatar-squircle">
                          {getInitials(o.customerName)}
                        </div>
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>
                          {o.customerName || 'Customer'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>
                          {o.vendorName || o.sellerName || 'Local Seller'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {o.pickupLocation || 'Local Merchant Corridor'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>{itemsCount} items</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {o.items && o.items[0] ? o.items[0].name : 'Direct dispatch items'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="monetary-amount" style={{ color: '#4F46E5', fontSize: '0.9375rem' }}>
                        ₹{Number(o.total || 0).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8125rem' }}>
                        <span style={{ fontWeight: 500 }}>{o.deliveryDate || 'Today'}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {o.deliveryTimeSlot || 'Standard Corridor'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={currentSt} />
                    </td>
                    <td>
                      <span className="aggregation-tag">
                        {o.aggregationStatus || 'Unassigned'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => setSelectedOrder(o)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Table Footer */}
        <div className="table-footer">
          <span>Showing {filteredOrders.length} of {orders.length} total orders across platform</span>
          <span style={{ fontFamily: 'var(--font-family-mono)' }}>TELEMETRY STATUS: SYNCHRONIZED</span>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};

export default AdminCentralOrdersPage;
