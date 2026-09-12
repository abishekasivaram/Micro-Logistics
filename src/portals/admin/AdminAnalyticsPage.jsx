import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { BarChart3, TrendingUp, Layers, Truck, MapPin, CheckCircle, Info } from 'lucide-react';
import './AdminAnalyticsPage.css';
import '../seller/DashboardOverview.css';

const AdminAnalyticsPage = () => {
  const { orders, deliveryBatches, deliveryAgents, vendors } = useAppContext();

  const totalOrders = orders.length;
  const aggregatedOrders = orders.filter(o => o.batchId || ['Grouped', 'Batch Created', 'Assigned', 'Out for Delivery', 'Delivered'].includes(o.aggregationStatus)).length;
  const nonAggregatedOrders = totalOrders - aggregatedOrders;
  const completedDeliveries = deliveryBatches.filter(b => b.status === 'Completed' || b.status === 'Delivered').length;

  // Mock distance savings calculation: 2.8 km saved per aggregated order
  const estimatedDistanceSaved = parseFloat((aggregatedOrders * 2.8).toFixed(1));
  const avgDeliveryTime = 32; // mins
  const agentUtilization = Math.round((deliveryAgents.filter(a => a.status === 'On Delivery' || a.currentOrders > 0).length / (deliveryAgents.length || 1)) * 100);

  // Chart 1: Volume by Area
  const areaCounts = {};
  orders.forEach(o => {
    const area = o.deliveryLocation ? o.deliveryLocation.split(',')[0].trim() : 'Central';
    areaCounts[area] = (areaCounts[area] || 0) + 1;
  });
  const maxAreaCount = Math.max(...Object.values(areaCounts), 1);

  // Chart 2: Volume by Seller
  const sellerCounts = {};
  vendors.forEach(v => {
    sellerCounts[v.name] = orders.filter(o => o.vendorId === v.id || o.vendorName === v.name).length;
  });
  const maxSellerCount = Math.max(...Object.values(sellerCounts), 1);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>System Analytics & Logistics Performance</h2>
          <p>Global insights into order aggregation efficiency, route distance savings, seller volume, and driver utilization.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="analytics-grid">
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>TOTAL SYSTEM ORDERS</span>
          <h3 style={{ margin: '4px 0 0', fontSize: '24px', color: '#1e293b' }}>{totalOrders}</h3>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>AGGREGATED ORDERS</span>
          <h3 style={{ margin: '4px 0 0', fontSize: '24px', color: '#2563eb' }}>{aggregatedOrders} ({Math.round((aggregatedOrders / (totalOrders || 1)) * 100)}%)</h3>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>ESTIMATED DISTANCE SAVED</span>
          <h3 style={{ margin: '4px 0 0', fontSize: '24px', color: '#16a34a' }}>{estimatedDistanceSaved} km</h3>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Mock Estimate</span>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>AGENT UTILIZATION</span>
          <h3 style={{ margin: '4px 0 0', fontSize: '24px', color: '#0891b2' }}>{agentUtilization}%</h3>
        </div>
      </div>

      {/* Mock Estimate Disclaimer Callout */}
      <div className="alert alert-info" style={{ marginBottom: '24px' }}>
        💡 <strong>Estimated Distance Saved Disclaimer:</strong> Distance savings and CO2 reductions are mock-calculated frontend estimates based on bundled delivery routes. Actual metrics will be measured after backend GPS tracking is connected.
      </div>

      {/* Visual Bar Charts */}
      <div className="dashboard-charts">
        {/* Chart 1: Volume by Area */}
        <div className="chart-card">
          <h3>Delivery Volume by Neighborhood</h3>
          <div className="chart-bar-container">
            {Object.keys(areaCounts).map(area => (
              <div key={area} className="chart-bar-item">
                <span className="chart-bar-label">{area}</span>
                <div className="chart-bar-track">
                  <div className="chart-bar-fill" style={{ width: `${(areaCounts[area] / maxAreaCount) * 100}%` }}></div>
                </div>
                <span className="chart-bar-value">{areaCounts[area]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Volume by Seller */}
        <div className="chart-card">
          <h3>Orders Processed per Local Seller</h3>
          <div className="chart-bar-container">
            {Object.keys(sellerCounts).map(seller => (
              <div key={seller} className="chart-bar-item">
                <span className="chart-bar-label">{seller}</span>
                <div className="chart-bar-track">
                  <div className="chart-bar-fill" style={{ width: `${(sellerCounts[seller] / maxSellerCount) * 100}%`, background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)' }}></div>
                </div>
                <span className="chart-bar-value">{sellerCounts[seller]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
