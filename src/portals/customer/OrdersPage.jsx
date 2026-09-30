import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  Search, Filter, Eye, Navigation, Check, X, Store, 
  Truck, Package, CheckCircle, ArrowRight, Zap, Download, Plus
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import OrderDetailsModal from '../../components/common/OrderDetailsModal';
import './OrdersPage.css';
import '../customer/CustomerOrdersPage.css';

const OrdersPage = () => {
  const { orders, currentUser, updateOrderStatus } = useAppContext();
  const navigate = useNavigate();

  const isCustomer = currentUser?.role === 'customer';
  const isSeller = currentUser?.role === 'vendor';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [viewingOrder, setViewingOrder] = useState(null);

  const userOrders = orders.filter(order => {
    if (isCustomer) return order.customerId === currentUser?.id || order.customerName === currentUser?.name;
    if (isSeller) return order.vendorId === currentUser?.id || order.vendorName === currentUser?.name;
    return true;
  });

  const filteredOrders = userOrders.filter(order => {
    const matchesSearch =
      (order.id || order.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status mapping for tabs
    const currentSt = order.orderStatus || order.status;
    let matchesStatus = true;
    if (statusFilter === 'New') matchesStatus = ['PLACED'].includes(currentSt);
    else if (statusFilter === 'Preparing') matchesStatus = ['CONFIRMED', 'PREPARING'].includes(currentSt);
    else if (statusFilter === 'Ready') matchesStatus = ['READY_FOR_DELIVERY', 'ASSIGNED'].includes(currentSt);
    else if (statusFilter === 'Completed') matchesStatus = ['DELIVERED'].includes(currentSt);

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
      setSelectedOrders(filteredOrders.map(o => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const newCount = userOrders.filter(o => ['PLACED'].includes(o.orderStatus || o.status)).length;
  const prepCount = userOrders.filter(o => ['CONFIRMED', 'PREPARING'].includes(o.orderStatus || o.status)).length;
  const readyCount = userOrders.filter(o => ['READY_FOR_DELIVERY', 'ASSIGNED'].includes(o.orderStatus || o.status)).length;
  const compCount = userOrders.filter(o => ['DELIVERED'].includes(o.orderStatus || o.status)).length;

  const readyForBatch = userOrders.filter(o => ['READY_FOR_DELIVERY', 'ASSIGNED'].includes(o.orderStatus || o.status) && o.deliveryLocation?.includes('RS Puram'));

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getEnterpriseStatusBadge = (status) => {
    if (['PLACED'].includes(status)) return <span className="status-badge status-new">New Order</span>;
    if (['CONFIRMED', 'PREPARING'].includes(status)) return <span className="status-badge status-prep">Preparing</span>;
    if (['READY_FOR_DELIVERY', 'ASSIGNED'].includes(status)) return <span className="status-badge status-ready">Ready</span>;
    if (['OUT_FOR_DELIVERY'].includes(status)) return <span className="status-badge status-ready">In Transit</span>;
    if (['DELIVERED'].includes(status)) return <span className="status-badge status-complete">Completed</span>;
    if (['CANCELLED'].includes(status)) return <span className="status-badge status-cancel">Cancelled</span>;
    return <span className="status-badge status-new">{status}</span>;
  };

  if (isCustomer) {
    // Preserve customer code identically (using previous snippet for customer logic)
    const customerTabs = ['All', 'Active', 'Delivered', 'Cancelled'];
    const activeTab = statusFilter === 'All' ? 'All' : statusFilter;
    const activeCustomerOrders = userOrders.filter(order => {
      const st = order.orderStatus || order.status || 'PLACED';
      if (activeTab === 'All') return true;
      if (activeTab === 'Active') return ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'ASSIGNED', 'OUT_FOR_DELIVERY'].includes(st);
      if (activeTab === 'Delivered') return st === 'DELIVERED';
      if (activeTab === 'Cancelled') return st === 'CANCELLED';
      return true;
    });

    const getTimelineIndex = (status) => {
      const s = status || 'PLACED';
      if (s === 'PLACED') return 0;
      if (['CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY'].includes(s)) return 1;
      if (['ASSIGNED', 'OUT_FOR_DELIVERY'].includes(s)) return 2;
      if (s === 'DELIVERED') return 3;
      return 0; // Default or Cancelled
    };

    return (
      <div className="customer-orders-page page-container">
        <div className="customer-orders-header">
          <h2>My Orders</h2>
          <p>Track your local purchases and smart deliveries.</p>
        </div>
        <div className="orders-tabs">
          {customerTabs.map(tab => (
            <button key={tab} className={`order-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setStatusFilter(tab === 'Active' ? 'Active' : tab)}>{tab}</button>
          ))}
        </div>
        <div>
          {activeCustomerOrders.length === 0 ? (
            <div className="empty-state card" style={{ padding: '64px', textAlign: 'center', background: 'white', borderRadius: '16px' }}>
              <Package size={48} color="#94a3b8" style={{ margin: '0 auto 16px auto' }} />
              <h3 style={{ fontSize: '18px', margin: '0 0 8px 0', color: '#1e293b' }}>No Orders Found</h3>
              <button className="btn btn-primary" onClick={() => navigate('/browse-sellers')}>Start Shopping</button>
            </div>
          ) : (
            activeCustomerOrders.map(order => {
              const currentSt = order.orderStatus || order.status || 'PLACED';
              const stepIndex = getTimelineIndex(currentSt);
              const itemsCount = order.items ? order.items.reduce((s, i) => s + (i.qty || 1), 0) : 0;
              return (
                <div key={order.id} className="customer-order-card">
                   <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div className="order-info-col">
                        <h3>Order {order.id || order.orderId}</h3>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Store size={14} /> {order.vendorName} • {itemsCount} items</p>
                      </div>
                      <div className="order-total-col" style={{ textAlign: 'right' }}>
                        <span>Total Amount</span>
                        <strong>₹{(order.total || 0).toFixed(2)}</strong>
                      </div>
                    </div>
                    {currentSt !== 'CANCELLED' ? (
                      <div className="order-timeline-visual">
                         <div className={`timeline-step ${stepIndex >= 0 ? 'completed' : ''} ${stepIndex === 0 ? 'active' : ''}`}><div className="timeline-icon"><Check size={14} /></div><span className="timeline-label">Placed</span></div>
                         <div className={`timeline-step ${stepIndex >= 1 ? 'completed' : ''} ${stepIndex === 1 ? 'active' : ''}`}><div className="timeline-icon"><Package size={14} /></div><span className="timeline-label">Preparing</span></div>
                         <div className={`timeline-step ${stepIndex >= 2 ? 'completed' : ''} ${stepIndex === 2 ? 'active' : ''}`}><div className="timeline-icon"><Truck size={14} /></div><span className="timeline-label">Out for Delivery</span></div>
                         <div className={`timeline-step ${stepIndex >= 3 ? 'completed' : ''} ${stepIndex === 3 ? 'active' : ''}`}><div className="timeline-icon"><CheckCircle size={14} /></div><span className="timeline-label">Delivered</span></div>
                      </div>
                    ) : (
                      <div style={{ padding: '16px', background: '#fef2f2', color: '#b91c1c', borderRadius: '12px', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><X size={18} /> Order Cancelled</div>
                    )}
                    <div className="customer-order-actions">
                      <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setViewingOrder(order)}>View Details</button>
                    </div>
                   </div>
                </div>
              );
            })
          )}
        </div>
        {viewingOrder && <OrderDetailsModal order={viewingOrder} onClose={() => setViewingOrder(null)} />}
      </div>
    );
  }

  // SELLER VIEW
  return (
    <div className="orders-page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">Process incoming orders and manage dispatch.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary"><Download size={16} /> Export</button>
          <button className="btn btn-primary"><Plus size={16} /> Create Order</button>
        </div>
      </div>

      <div className="tabs-row">
        <button className={`tab-item ${statusFilter === 'All' ? 'active' : ''}`} onClick={() => setStatusFilter('All')}>
          All Orders <span className="tab-count">{userOrders.length}</span>
        </button>
        <button className={`tab-item ${statusFilter === 'New' ? 'active' : ''}`} onClick={() => setStatusFilter('New')}>
          New <span className="tab-count">{newCount}</span>
        </button>
        <button className={`tab-item ${statusFilter === 'Preparing' ? 'active' : ''}`} onClick={() => setStatusFilter('Preparing')}>
          Preparing <span className="tab-count">{prepCount}</span>
        </button>
        <button className={`tab-item ${statusFilter === 'Ready' ? 'active' : ''}`} onClick={() => setStatusFilter('Ready')}>
          Ready <span className="tab-count">{readyCount}</span>
        </button>
        <button className={`tab-item ${statusFilter === 'Completed' ? 'active' : ''}`} onClick={() => setStatusFilter('Completed')}>
          Completed <span className="tab-count">{compCount}</span>
        </button>
      </div>

      {readyForBatch.length > 1 && (
        <div className="batch-banner">
          <div className="batch-banner-text">
            <Zap size={20} color="var(--primary)" />
            <span><strong>{readyForBatch.length} orders ready</strong> for RS Puram. Combine for delivery to save ₹85.</span>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/order-aggregation')}>Create Batch</button>
        </div>
      )}

      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th style={{ width: '40px', paddingRight: 0 }}>
                <input type="checkbox" onChange={handleSelectAll} checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0} />
              </th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Status</th>
              <th>Delivery Slot</th>
              <th style={{ textAlign: 'right' }}>Total</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No orders match this filter.</td></tr>
            ) : (
              filteredOrders.map(order => {
                const currentSt = order.orderStatus || order.status || 'PLACED';
                const itemsCount = order.items ? order.items.reduce((s, i) => s + (i.qty || 1), 0) : 0;
                
                return (
                  <tr key={order.id} style={{ background: selectedOrders.includes(order.id) ? 'var(--bg)' : 'transparent' }}>
                    <td style={{ paddingRight: 0 }}>
                      <input type="checkbox" checked={selectedOrders.includes(order.id)} onChange={() => toggleSelectOrder(order.id)} />
                    </td>
                    <td><span className="order-id-link" onClick={() => setViewingOrder(order)}>{order.id || order.orderId}</span></td>
                    <td>
                      <div className="customer-cell">
                        <div className="avatar-circle">{getInitials(order.customerName)}</div>
                        <span className="customer-name">{order.customerName || 'Customer'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="items-tooltip-trigger" title={order.items?.map(i => `${i.qty}x ${i.name}`).join(', ')}>
                        {itemsCount} items
                      </span>
                    </td>
                    <td>{getEnterpriseStatusBadge(currentSt)}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: '500' }}>{order.deliveryDate || 'Today'}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.deliveryTimeSlot || 'ASAP'}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '500', fontFeatureSettings: '"tnum"' }}>₹{(order.total || 0).toFixed(2)}</td>
                    <td className="action-cell">
                      {currentSt === 'PLACED' && <button className="btn btn-primary" onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}>Accept</button>}
                      {currentSt === 'CONFIRMED' && <button className="btn btn-secondary" onClick={() => updateOrderStatus(order.id, 'PREPARING')}>Start Prep</button>}
                      {currentSt === 'PREPARING' && <button className="btn btn-primary" onClick={() => updateOrderStatus(order.id, 'READY_FOR_DELIVERY')}>Mark Ready</button>}
                      {['READY_FOR_DELIVERY', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(currentSt) && (
                        <button className="btn btn-outline" onClick={() => setViewingOrder(order)}>View</button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {filteredOrders.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg)', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div>Showing {filteredOrders.length} orders</div>
            <div>Rows per page: 20 ▾</div>
          </div>
        )}
      </div>

      {viewingOrder && <OrderDetailsModal order={viewingOrder} onClose={() => setViewingOrder(null)} />}
    </div>
  );
};

export default OrdersPage;
