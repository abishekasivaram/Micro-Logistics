import React from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, CheckCircle, XCircle, Truck, Clock, Layers } from 'lucide-react';
import './SellerAnalyticsPage.css';

const SellerAnalyticsPage = () => {
  const { orders, products, currentUser } = useAppContext();

  const sellerId = currentUser?.role === 'vendor' ? currentUser.id : 'v1';
  const sellerOrders = orders.filter(o => o.vendorId === sellerId || currentUser?.role === 'admin');

  const totalOrders = sellerOrders.length;
  const completedOrders = sellerOrders.filter(o => (o.orderStatus || o.status) === 'DELIVERED').length;
  const cancelledOrders = sellerOrders.filter(o => (o.orderStatus || o.status) === 'CANCELLED').length;
  
  const totalRevenue = sellerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const aggregatedOrders = sellerOrders.filter(o => o.aggregationStatus === 'Grouped' || o.deliveryGroupId).length;

  // Mock bar height percentages for daily order distribution
  const dailyMetrics = [
    { day: 'Mon', count: 12, rev: 1450 },
    { day: 'Tue', count: 18, rev: 2300 },
    { day: 'Wed', count: 15, rev: 1890 },
    { day: 'Thu', count: 22, rev: 3100 },
    { day: 'Fri', count: 28, rev: 4200 },
    { day: 'Sat', count: 35, rev: 5400 },
    { day: 'Sun', count: 30, rev: 4800 },
  ];

  const maxCount = Math.max(...dailyMetrics.map(d => d.count));

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Seller Revenue & Logistics Analytics</h2>
          <p>Performance insights, fulfillment distribution, and delivery aggregation metrics.</p>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="kpi-card">
          <div className="kpi-icon bg-primary-light text-primary">
            <DollarSign size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Gross Revenue</span>
            <span className="kpi-value">₹{totalRevenue.toFixed(2)}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
            <TrendingUp size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Avg Order Value</span>
            <span className="kpi-value">₹{avgOrderValue.toFixed(2)}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
            <CheckCircle size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Completed Rate</span>
            <span className="kpi-value">
              {totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 100}%
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <Layers size={24} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Orders Aggregated</span>
            <span className="kpi-value">{aggregatedOrders}</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="analytics-grid">
        
        {/* Daily Orders Bar Chart */}
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Weekly Order Volume Trend</h3>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Estimated Weekly Performance</span>
          </div>

          <div className="bar-chart-container">
            {dailyMetrics.map((item, idx) => {
              const heightPct = Math.round((item.count / maxCount) * 100);
              return (
                <div key={idx} className="bar-column">
                  <div className="bar-tooltip">₹{item.rev} ({item.count} orders)</div>
                  <div className="bar-wrapper">
                    <div className="bar-fill" style={{ height: `${heightPct}%` }}></div>
                  </div>
                  <span className="bar-label">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Metrics Side Card */}
        <div className="chart-card">
          <h3 style={{ marginBottom: '16px' }}>Delivery Aggregation Efficiency</h3>
          
          <div className="metrics-list">
            <div className="metric-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} className="text-secondary" />
                <span>Average Preparation Time</span>
              </div>
              <strong>18 mins</strong>
            </div>

            <div className="metric-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={16} className="text-secondary" />
                <span>Average Delivery Time</span>
              </div>
              <strong>24 mins</strong>
            </div>

            <div className="metric-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} className="text-secondary" />
                <span>Window Grouping Ratio</span>
              </div>
              <strong className="text-success">85% Coordinated</strong>
            </div>
          </div>

          <div className="distribution-progress-box">
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>Fulfillment Status Distribution</span>
            <div className="distr-bar-bg">
              <div className="distr-fill completed" style={{ width: `${totalOrders > 0 ? (completedOrders/totalOrders)*100 : 70}%` }}></div>
              <div className="distr-fill preparing" style={{ width: '20%' }}></div>
              <div className="distr-fill cancelled" style={{ width: `${totalOrders > 0 ? (cancelledOrders/totalOrders)*100 : 10}%` }}></div>
            </div>
            <div className="distr-legend">
              <span><span className="dot dot-completed"></span> Delivered</span>
              <span><span className="dot dot-preparing"></span> Processing</span>
              <span><span className="dot dot-cancelled"></span> Cancelled</span>
            </div>
          </div>
        </div>

      </div>

      {/* Top Products Performance Table */}
      <div className="chart-card" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Top Selling Products</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Stock Status</th>
              <th>Estimated Sales</th>
            </tr>
          </thead>
          <tbody>
            {products.slice(0, 5).map(p => (
              <tr key={p.id}>
                <td className="font-medium">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={p.image} alt={p.name} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                    <span>{p.name}</span>
                  </div>
                </td>
                <td>{p.category}</td>
                <td className="font-medium">₹{p.price.toFixed(2)}</td>
                <td>
                  <span className={`badge badge-${p.status.replace(/\s+/g, '').toLowerCase()}`}>{p.status}</span>
                </td>
                <td className="font-medium text-primary">₹{(p.price * 15).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerAnalyticsPage;
