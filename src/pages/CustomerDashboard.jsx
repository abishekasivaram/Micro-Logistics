import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ShoppingBag, Truck, CheckCircle, Clock, Package, Navigation, User } from 'lucide-react';
import './DashboardOverview.css';

const CustomerDashboard = () => {
  const { orders, deliveryGroups, currentUser } = useAppContext();
  const navigate = useNavigate();

  // For mock purposes, assume the first customer 'c1' if no actual customer relation is set
  const customerId = 'c1'; 
  
  const customerOrders = orders.filter(o => o.customerId === customerId);
  const totalOrders = customerOrders.length;
  const pendingOrders = customerOrders.filter(o => ['PLACED', 'CONFIRMED', 'PREPARING'].includes(o.status)).length;
  const completedOrders = customerOrders.filter(o => o.status === 'DELIVERED').length;
  
  // Find deliveries related to this customer's orders
  const activeDeliveries = deliveryGroups.filter(g => {
    const isCustomerGroup = g.orderIds.some(id => customerOrders.some(o => o.id === id));
    const isActive = ['READY', 'ASSIGNED', 'OUT_FOR_DELIVERY'].includes(g.status);
    return isCustomerGroup && isActive;
  }).length;

  return (
    <div className="page-container">
      <div className="page-header" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '8px' }}>
        <div>
          <h2>Welcome back, {currentUser?.name || 'Customer'}!</h2>
          <p>Here's an overview of your recent activity and orders.</p>
        </div>
      </div>

      {/* Profile & Quick Actions */}
      <div className="dashboard-charts" style={{ gridTemplateColumns: '1fr 2fr', marginBottom: '24px' }}>
        <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
               <User size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{currentUser?.name || 'Customer Profile'}</h3>
              <p className="text-secondary" style={{ margin: 0, fontSize: '14px' }}>Premium Member</p>
            </div>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />
          <p className="text-secondary" style={{ fontSize: '14px' }}>101 Anna Nagar East, Chennai<br/>+91 9876543210</p>
        </div>

        <div className="chart-card" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn-primary" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px', gap: '8px' }} onClick={() => navigate('/products')}>
             <Package size={24} />
             Browse Products
          </button>
          <button className="btn btn-outline" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px', gap: '8px' }} onClick={() => navigate('/orders')}>
             <ShoppingBag size={24} />
             View Orders
          </button>
          <button className="btn btn-outline" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px', gap: '8px' }} onClick={() => navigate('/deliveries')}>
             <Navigation size={24} />
             Track Delivery
          </button>
        </div>
      </div>

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
            <span className="kpi-label">Completed Orders</span>
            <span className="kpi-value">{completedOrders}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-charts" style={{ gridTemplateColumns: '1fr', marginTop: '24px' }}>
        <div className="chart-card">
          <h3>Your Recent Orders</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {customerOrders.length === 0 ? (
                 <tr><td colSpan="4" className="empty-state">You have no recent orders.</td></tr>
              ) : (
                [...customerOrders].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map(o => (
                  <tr key={o.id}>
                    <td className="font-medium">{o.id}</td>
                    <td>{new Date(o.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="font-medium">₹{o.total.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
