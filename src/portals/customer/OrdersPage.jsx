import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Search, Filter, Map as MapIcon, Eye, Navigation, Check, X, Clock, Play, AlertCircle } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import OrderDetailsModal from '../../components/common/OrderDetailsModal';
import './OrdersPage.css';

const OrdersPage = () => {
  const { orders, customers, vendors, currentUser, updateOrderStatus } = useAppContext();
  const navigate = useNavigate();

  const isCustomer = currentUser?.role === 'customer';
  const isSeller = currentUser?.role === 'vendor';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [viewingOrder, setViewingOrder] = useState(null);

  // Filter orders based on user role
  const userOrders = orders.filter(order => {
    if (isCustomer) {
      return order.customerId === currentUser?.id || order.customerName === currentUser?.name;
    }
    if (isSeller) {
      return order.vendorId === currentUser?.id || order.vendorName === currentUser?.name;
    }
    return true; // Admin sees all
  });

  const filteredOrders = userOrders.filter(order => {
    const matchesSearch =
      (order.id || order.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || (order.orderStatus || order.status) === statusFilter;
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
          <h2>{isCustomer ? 'My Orders' : isSeller ? 'Seller Order Management' : 'All Platform Orders'}</h2>
          <p>
            {isCustomer
              ? 'Track order progress, view delivery slots, and monitor live tracking.'
              : isSeller
                ? 'Confirm incoming customer orders, update prep status, and release for delivery coordination.'
                : 'System-wide order management and fulfillment overview.'}
          </p>
        </div>

        <div className="header-actions">
          {selectedOrders.length > 0 && (
            <button className="btn btn-primary flex items-center gap-2" onClick={handleAggregate}>
              <MapIcon size={18} /> Aggregate {selectedOrders.length} Orders
            </button>
          )}
          {isCustomer && (
            <button className="btn btn-primary" onClick={() => navigate('/browse-sellers')}>
              + Place New Order
            </button>
          )}
        </div>
      </div>

      <div className="controls-bar card">
        <div className="search-box">
          <Search size={18} className="text-secondary" />
          <input
            type="text"
            placeholder={isCustomer ? "Search by Order ID or Seller..." : "Search by Order ID, Customer or Seller..."}
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

      {/* ORDERS TABLE */}
      <div className="table-container card">
        <table className="data-table">
          <thead>
            <tr>
              {!isCustomer && (
                <th>
                  <input type="checkbox" onChange={handleSelectAll} />
                </th>
              )}
              <th>Order ID</th>
              {isCustomer ? <th>Seller</th> : <th>Customer</th>}
              <th>Order Items</th>
              <th>Delivery Date & Slot</th>
              <th>Amount</th>
              <th>Order Status</th>
              <th>Delivery Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={isCustomer ? "8" : "9"} className="empty-state">
                  No orders found. {isCustomer ? 'Explore local sellers to place an order!' : ''}
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => {
                const currentSt = order.orderStatus || order.status || 'PLACED';
                const itemsCount = order.items ? order.items.reduce((s, i) => s + (i.qty || 1), 0) : 0;

                return (
                  <tr key={order.id} className={selectedOrders.includes(order.id) ? 'selected-row' : ''}>
                    {!isCustomer && (
                      <td>
                        <input
                          type="checkbox"
                          disabled={!!order.deliveryGroupId}
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleSelectOrder(order.id)}
                        />
                      </td>
                    )}

                    <td className="font-medium">{order.id || order.orderId}</td>

                    {isCustomer ? (
                      <td className="font-medium">{order.vendorName || 'Local Seller'}</td>
                    ) : (
                      <td>
                        <div className="customer-info">
                          <span className="font-medium">{order.customerName || 'Customer'}</span>
                          <small className="text-secondary">{order.deliveryLocation}</small>
                        </div>
                      </td>
                    )}

                    <td>
                      <span className="font-medium">{itemsCount} items</span>
                      <small style={{ display: 'block', color: '#6b7280' }}>
                        {order.items && order.items[0] ? order.items[0].name : 'Products'}
                      </small>
                    </td>

                    <td>
                      <div style={{ fontSize: '13px' }}>
                        <div>📅 {order.deliveryDate || new Date(order.date).toLocaleDateString()}</div>
                        <span style={{ fontSize: '11px', color: '#4b5563', fontWeight: '500' }}>🕒 {order.deliveryTimeSlot || 'Standard Slot'}</span>
                      </div>
                    </td>

                    <td className="font-medium text-primary">₹{(order.total || 0).toFixed(2)}</td>

                    <td>
                      <StatusBadge status={currentSt} />
                    </td>

                    <td>
                      <span style={{ fontSize: '12px', color: '#4b5563', fontWeight: '500' }}>
                        {order.deliveryStatus || 'Pending'}
                      </span>
                    </td>

                    <td>
                      {isCustomer ? (
                        <div className="flex gap-2">
                          <button
                            className="btn btn-outline"
                            style={{ padding: '4px 8px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => setViewingOrder(order)}
                          >
                            <Eye size={14} /> Details
                          </button>

                          {['READY_FOR_DELIVERY', 'ASSIGNED', 'OUT_FOR_DELIVERY'].includes(currentSt) && (
                            <button
                              className="btn btn-primary"
                              style={{ padding: '4px 8px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => navigate('/track-delivery')}
                            >
                              <Navigation size={14} /> Track
                            </button>
                          )}

                          {currentSt === 'PLACED' && (
                            <button
                              className="btn btn-outline text-danger"
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                              onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      ) : (
                        /* SELLER ACTION BUTTONS */
                        <div className="flex gap-1 flex-wrap">
                          {currentSt === 'PLACED' && (
                            <button
                              className="btn btn-primary"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                            >
                              Confirm
                            </button>
                          )}

                          {currentSt === 'CONFIRMED' && (
                            <button
                              className="btn btn-outline"
                              style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#fef3c7', color: '#92400e' }}
                              onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                            >
                              Start Prep
                            </button>
                          )}

                          {currentSt === 'PREPARING' && (
                            <button
                              className="btn btn-primary"
                              style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#10b981', borderColor: '#10b981' }}
                              onClick={() => updateOrderStatus(order.id, 'READY_FOR_DELIVERY')}
                            >
                              Mark Ready
                            </button>
                          )}

                          {['PLACED', 'CONFIRMED'].includes(currentSt) && (
                            <button
                              className="btn btn-outline text-danger"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                            >
                              Reject
                            </button>
                          )}

                          <button
                            className="icon-btn-small"
                            style={{ padding: '4px' }}
                            onClick={() => setViewingOrder(order)}
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Timeline Modal */}
      {viewingOrder && (
        <OrderDetailsModal order={viewingOrder} onClose={() => setViewingOrder(null)} />
      )}
    </div>
  );
};

export default OrdersPage;
