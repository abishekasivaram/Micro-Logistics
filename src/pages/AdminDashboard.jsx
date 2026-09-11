import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ShoppingBag, Truck, CheckCircle, Clock, Users, Store, AlertTriangle, ShieldAlert } from 'lucide-react';
import './DashboardOverview.css';
import { mockUsers } from '../data/sampleData';

const AdminDashboard = () => {
  const { orders, deliveryGroups, products, customers, vendors } = useAppContext();

  // Admin specific KPIs
  const totalUsers = mockUsers.length + customers.length + vendors.length; // Approximate using mock data
  const totalCustomers = customers.length;
  const totalVendors = vendors.length;

  // System wide Orders KPIs
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => ['PLACED', 'CONFIRMED', 'PREPARING'].includes(o.status)).length;
  
  // Delivery KPIs
  const activeDeliveries = deliveryGroups.filter(g => ['READY', 'ASSIGNED', 'OUT_FOR_DELIVERY'].includes(g.status)).length;
  const completedDeliveries = deliveryGroups.filter(g => g.status === 'DELIVERED').length;
  
  // Inventory KPIs
  const lowStockProducts = products.filter(p => ['Low Stock', 'Out of Stock'].includes(p.status)).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>System Administration Dashboard</h2>
          <p>Global overview of all operations, users, and deliveries.</p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
            <Users size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Total Users</span>
            <span className="kpi-value">{totalUsers}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
            <Store size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Active Vendors</span>
            <span className="kpi-value">{totalVendors}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon bg-primary-light text-primary">
            <ShoppingBag size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Global Orders</span>
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
          <div className="kpi-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <Truck size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Active Deliveries</span>
            <span className="kpi-value">{activeDeliveries}</span>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Low Stock Alerts</span>
            <span className="kpi-value">{lowStockProducts}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>Recent Global Orders</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vendor</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {[...orders].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map(o => {
                const vendor = vendors.find(v => v.id === o.vendorId);
                return (
                  <tr key={o.id}>
                    <td className="font-medium">{o.id}</td>
                    <td className="text-secondary">{vendor?.name || 'Unknown'}</td>
                    <td>
                      <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status.replace(/_/g, ' ')}</span>
                    </td>
                    <td>₹{o.total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="chart-card">
          <h3>Recent Delivery Activity</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Group ID</th>
                <th>Orders</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveryGroups.length === 0 ? (
                 <tr><td colSpan="3" className="empty-state">No recent delivery activity.</td></tr>
              ) : (
                [...deliveryGroups].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map(g => (
                  <tr key={g.id}>
                    <td className="font-medium">{g.id}</td>
                    <td>{g.orderIds.length} orders</td>
                    <td>
                      <span className={`badge badge-${g.status.toLowerCase()}`}>{g.status.replace(/_/g, ' ')}</span>
                    </td>
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

export default AdminDashboard;
