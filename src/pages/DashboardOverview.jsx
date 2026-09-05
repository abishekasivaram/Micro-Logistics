import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ShoppingBag, Truck, CheckCircle, Clock } from 'lucide-react';
import './DashboardOverview.css';

const DashboardOverview = () => {
  const { orders, deliveryGroups } = useAppContext();

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
  
  const activeDeliveries = deliveryGroups.filter(g => g.status !== 'Delivered').length;
  const completedDeliveries = deliveryGroups.filter(g => g.status === 'Delivered').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p>Key metrics and performance at a glance.</p>
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
            <span className="kpi-label">Completed Deliveries</span>
            <span className="kpi-value">{completedDeliveries}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>Recent Orders</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(o => (
                <tr key={o.id}>
                  <td className="font-medium">{o.id}</td>
                  <td>
                    <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span>
                  </td>
                  <td>${o.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="chart-card">
          <h3>Delivery Status Summary</h3>
          <div className="mock-chart">
            {/* Visual representation of delivery distribution */}
            <div className="chart-bar"><div className="bar-fill bg-success" style={{width: '60%'}}></div><span>Delivered (60%)</span></div>
            <div className="chart-bar"><div className="bar-fill bg-primary" style={{width: '30%'}}></div><span>In Transit (30%)</span></div>
            <div className="chart-bar"><div className="bar-fill bg-warning" style={{width: '10%'}}></div><span>Pending (10%)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
