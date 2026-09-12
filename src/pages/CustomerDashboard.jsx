import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ShoppingBag, Truck, CheckCircle, Clock, Package, Navigation, User, Store, ArrowRight, Eye, Calendar } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import OrderDetailsModal from '../components/OrderDetailsModal';
import './DashboardOverview.css';

const CustomerDashboard = () => {
  const { orders, vendors, currentUser } = useAppContext();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);

  const customerId = currentUser?.id || 'c1';
  const customerOrders = orders.filter(o => o.customerId === customerId || o.customerName === currentUser?.name);
  
  const totalOrders = customerOrders.length;
  const pendingOrders = customerOrders.filter(o => ['PLACED', 'CONFIRMED', 'PREPARING'].includes(o.orderStatus || o.status)).length;
  const activeDeliveries = customerOrders.filter(o => ['READY_FOR_DELIVERY', 'ASSIGNED', 'OUT_FOR_DELIVERY'].includes(o.orderStatus || o.status)).length;
  const completedOrders = customerOrders.filter(o => (o.orderStatus || o.status) === 'DELIVERED').length;

  const currentDelivery = customerOrders.find(o => ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'ASSIGNED', 'OUT_FOR_DELIVERY'].includes(o.orderStatus || o.status));

  return (
    <div className="page-container">

      {/* Customer Quick Navigation Cards */}
      <div className="dashboard-charts" style={{ gridTemplateColumns: '1fr 2fr', marginBottom: '24px' }}>
        <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', overflow: 'hidden' }}>
               {currentUser?.avatar ? (
                 <img src={currentUser.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               ) : (
                 <User size={24} />
               )}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px' }}>{currentUser?.name || 'Customer'}</h3>
              <p className="text-secondary" style={{ margin: 0, fontSize: '13px' }}>{currentUser?.email || 'customer@example.com'}</p>
            </div>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 0 }} />
          <div style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
            <strong>Default Delivery Address:</strong><br />
            {currentUser?.address || '101 Anna Nagar East, Chennai'}<br />
            📞 {currentUser?.phone || '9876543210'}
          </div>
        </div>

        <div className="chart-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', alignItems: 'center' }}>
          <button className="btn btn-primary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 12px', gap: '8px', borderRadius: '12px' }} onClick={() => navigate('/browse-sellers')}>
             <Store size={22} />
             <span>Browse Sellers</span>
          </button>
          <button className="btn btn-outline" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 12px', gap: '8px', borderRadius: '12px' }} onClick={() => navigate('/products')}>
             <Package size={22} />
             <span>View Products</span>
          </button>
          <button className="btn btn-outline" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 12px', gap: '8px', borderRadius: '12px' }} onClick={() => navigate('/track-delivery')}>
             <Navigation size={22} />
             <span>Track Delivery</span>
          </button>
          <button className="btn btn-outline" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 12px', gap: '8px', borderRadius: '12px' }} onClick={() => navigate('/cart')}>
             <ShoppingBag size={22} />
             <span>View Cart</span>
          </button>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon bg-primary-light text-primary">
            <ShoppingBag size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Total Orders</span>
            <span className="kpi-value">{totalOrders}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Pending Orders</span>
            <span className="kpi-value">{pendingOrders}</span>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
            <Truck size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Active Deliveries</span>
            <span className="kpi-value">{activeDeliveries}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
            <CheckCircle size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Delivered Orders</span>
            <span className="kpi-value">{completedOrders}</span>
          </div>
        </div>
      </div>

      {/* Current Active Delivery Banner */}
      {currentDelivery && (
        <div className="chart-card" style={{ marginTop: '24px', backgroundColor: '#e0f2fe', borderColor: '#bae6fd' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Active Delivery</span>
              <h3 style={{ margin: '4px 0', fontSize: '18px', color: '#0c4a6e' }}>Order {currentDelivery.id || currentDelivery.orderId} from {currentDelivery.vendorName}</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#0369a1' }}>
                📅 Scheduled: <strong>{currentDelivery.deliveryDate || 'Today'}</strong> | 🕒 Window: <strong>{currentDelivery.deliveryTimeSlot || 'Standard Slot'}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <StatusBadge status={currentDelivery.orderStatus || currentDelivery.status} />
              <button className="btn btn-primary" onClick={() => navigate('/track-delivery')}>
                Track Live Map <ArrowRight size={16} style={{ marginLeft: '4px' }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Local Sellers Carousel/Grid */}
      <div className="chart-card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Recommended Local Sellers</h3>
          <button className="btn-link" style={{ fontSize: '13px', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }} onClick={() => navigate('/browse-sellers')}>
            View All Sellers →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {vendors.slice(0, 3).map(v => (
            <div key={v.id} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img src={v.logo} alt={v.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px' }}>{v.name}</h4>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{v.category}</span>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: '#4b5563', margin: 0, height: '36px', overflow: 'hidden' }}>{v.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#6b7280' }}>
                <span>⏱ {v.prepTime}</span>
                <span>⭐ {v.rating} / 5</span>
              </div>
              <button className="btn btn-outline w-full" style={{ fontSize: '13px', padding: '6px' }} onClick={() => navigate('/products')}>
                View Products
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="dashboard-charts" style={{ gridTemplateColumns: '1fr', marginTop: '24px' }}>
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Your Recent Orders</h3>
            <button className="btn-link" style={{ fontSize: '13px', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }} onClick={() => navigate('/orders')}>
              View All Orders →
            </button>
          </div>
          
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Seller</th>
                <th>Delivery Date & Slot</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {customerOrders.length === 0 ? (
                 <tr><td colSpan="6" className="empty-state">You have no recent orders. Start browsing sellers to place an order!</td></tr>
              ) : (
                [...customerOrders].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map(o => (
                  <tr key={o.id}>
                    <td className="font-medium">{o.id || o.orderId}</td>
                    <td>{o.vendorName || 'Local Seller'}</td>
                    <td>
                      <div style={{ fontSize: '13px' }}>
                        <div>{o.deliveryDate || new Date(o.date).toLocaleDateString()}</div>
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>{o.deliveryTimeSlot || 'Standard'}</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={o.orderStatus || o.status} />
                    </td>
                    <td className="font-medium">₹{(o.total || 0).toFixed(2)}</td>
                    <td>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '4px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => setSelectedOrder(o)}
                      >
                        <Eye size={14} /> View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Timeline Modal */}
      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};

export default CustomerDashboard;

