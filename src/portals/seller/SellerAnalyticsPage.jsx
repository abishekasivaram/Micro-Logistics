import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Calendar, TrendingUp, TrendingDown, ChevronRight, ExternalLink, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import './SellerAnalyticsPage.css';

const Sparkline = ({ data, color, type }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 32;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  if (type === 'bar') {
    return (
      <svg className="sparkline-svg" viewBox={`0 0 ${width} ${height}`}>
        {data.map((val, i) => {
          const x = (i / (data.length - 1)) * width;
          const h = ((val - min) / range) * height;
          const y = height - h;
          return <rect key={i} x={x - 2} y={y} width="4" height={Math.max(h, 2)} fill={color} rx="1" />;
        })}
      </svg>
    );
  }

  return (
    <svg className="sparkline-svg" viewBox={`0 0 ${width} ${height}`}>
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />
      <polygon fill={`url(#grad-${color.replace('#','')})`} points={`0,${height} ${points} ${width},${height}`} opacity="0.1" />
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="1"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  );
};

const SellerAnalyticsPage = () => {
  const { orders, currentUser } = useAppContext();

  const sellerId = currentUser?.role === 'vendor' ? currentUser.id : null;
  const sellerOrders = orders.filter(o => currentUser?.role === 'admin' || o.vendorId === sellerId);

  const totalOrders = sellerOrders.length;
  const totalRevenue = sellerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const netRevenue = totalRevenue * 0.85; // Mock 15% platform fee

  // Mock data for sparklines
  const sparklineData = {
    gross: [1200, 1400, 1100, 1800, 1500, 2100, 2400],
    net: [1020, 1190, 935, 1530, 1275, 1785, 2040],
    orders: [4, 5, 3, 7, 5, 8, 10],
    aov: [300, 280, 366, 257, 300, 262, 240]
  };

  // Mock data for line chart
  const lineChartData = [2400, 1398, 9800, 3908, 4800, 3800, 4300, 2100, 6000, 5200, 7100, 6500];
  const maxLine = Math.max(...lineChartData);
  const linePoints = lineChartData.map((val, i) => {
    const x = (i / (lineChartData.length - 1)) * 100;
    const y = 100 - (val / maxLine) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="analytics-page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Track your revenue and order performance.</p>
        </div>
        <button className="date-picker-btn">
          <Calendar size={16} className="text-secondary" />
          Last 30 days
        </button>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-header">
            <div>
              <div className="metric-card-title">Gross Volume</div>
              <div className="metric-card-value">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <Sparkline data={sparklineData.gross} color="var(--primary)" />
          </div>
          <div className="metric-card-footer">
            <span className="delta-pill positive"><ArrowUpRight size={12}/> 12.5%</span>
            <span className="text-muted">vs previous 30 days</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <div>
              <div className="metric-card-title">Net Revenue</div>
              <div className="metric-card-value">₹{netRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <Sparkline data={sparklineData.net} color="var(--success)" />
          </div>
          <div className="metric-card-footer">
            <span className="delta-pill positive"><ArrowUpRight size={12}/> 14.2%</span>
            <span className="text-muted">vs previous 30 days</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <div>
              <div className="metric-card-title">Orders</div>
              <div className="metric-card-value">{totalOrders}</div>
            </div>
            <Sparkline data={sparklineData.orders} color="var(--info)" type="bar" />
          </div>
          <div className="metric-card-footer">
            <span className="delta-pill positive"><ArrowUpRight size={12}/> 8.4%</span>
            <span className="text-muted">vs previous 30 days</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <div>
              <div className="metric-card-title">Average Order Value</div>
              <div className="metric-card-value">₹{avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <Sparkline data={sparklineData.aov} color="var(--warning)" />
          </div>
          <div className="metric-card-footer">
            <span className="delta-pill negative"><ArrowDownRight size={12}/> 2.1%</span>
            <span className="text-muted">vs previous 30 days</span>
          </div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-panel">
          <h3 className="chart-panel-title">Revenue over time</h3>
          <div className="line-chart-area">
            <div className="chart-y-axis">
              <span>₹10k</span>
              <span>₹7.5k</span>
              <span>₹5k</span>
              <span>₹2.5k</span>
              <span>₹0</span>
            </div>
            <div className="chart-grid-lines">
              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>
            </div>
            <svg className="line-chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline fill="none" stroke="var(--primary)" strokeWidth="2" points={linePoints} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
              <polygon fill="url(#line-grad)" points={`0,100 ${linePoints} 100,100`} opacity="0.1" vectorEffect="non-scaling-stroke" />
              <defs>
                <linearGradient id="line-grad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="1"/>
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0"/>
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'absolute', bottom: '-24px', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Jan 1</span>
              <span>Jan 8</span>
              <span>Jan 15</span>
              <span>Jan 22</span>
              <span>Jan 31</span>
            </div>
          </div>
        </div>

        <div className="chart-panel">
          <h3 className="chart-panel-title">Orders by Category</h3>
          <div className="donut-chart-container">
            <svg className="donut-svg" viewBox="0 0 100 100">
              <circle className="donut-segment" cx="50" cy="50" r="34" stroke="var(--primary)" strokeDasharray="100 113.5" strokeDashoffset="0" />
              <circle className="donut-segment" cx="50" cy="50" r="34" stroke="var(--success)" strokeDasharray="50 163.5" strokeDashoffset="-100" />
              <circle className="donut-segment" cx="50" cy="50" r="34" stroke="var(--warning)" strokeDasharray="30 183.5" strokeDashoffset="-150" />
              <circle className="donut-segment" cx="50" cy="50" r="34" stroke="var(--info)" strokeDasharray="33.5 180" strokeDashoffset="-180" />
            </svg>
            <div className="donut-legend">
              <div className="legend-item">
                <div className="legend-label"><div className="legend-dot" style={{ background: 'var(--primary)' }}></div> Dairy</div>
                <strong>46%</strong>
              </div>
              <div className="legend-item">
                <div className="legend-label"><div className="legend-dot" style={{ background: 'var(--success)' }}></div> Vegetables</div>
                <strong>23%</strong>
              </div>
              <div className="legend-item">
                <div className="legend-label"><div className="legend-dot" style={{ background: 'var(--warning)' }}></div> Bakery</div>
                <strong>14%</strong>
              </div>
              <div className="legend-item">
                <div className="legend-label"><div className="legend-dot" style={{ background: 'var(--info)' }}></div> Others</div>
                <strong>17%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="payouts-panel">
        <div className="payouts-header">
          <h3 className="chart-panel-title" style={{ margin: 0 }}>Recent Payouts</h3>
          <button className="btn-link" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View all <ChevronRight size={14} />
          </button>
        </div>
        <table className="payouts-table">
          <thead>
            <tr>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Description</th>
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: '500', fontFeatureSettings: '"tnum"' }}>₹14,250.00</td>
              <td><span className="delta-pill positive" style={{ padding: '4px 8px', fontSize: '11px' }}>Paid</span></td>
              <td>Oct 24, 2023</td>
              <td className="text-muted">Payout to bank ending in ****4567</td>
              <td><ExternalLink size={16} className="text-muted" cursor="pointer" /></td>
            </tr>
            <tr>
              <td style={{ fontWeight: '500', fontFeatureSettings: '"tnum"' }}>₹8,430.50</td>
              <td><span className="delta-pill positive" style={{ padding: '4px 8px', fontSize: '11px' }}>Paid</span></td>
              <td>Oct 17, 2023</td>
              <td className="text-muted">Payout to bank ending in ****4567</td>
              <td><ExternalLink size={16} className="text-muted" cursor="pointer" /></td>
            </tr>
            <tr>
              <td style={{ fontWeight: '500', fontFeatureSettings: '"tnum"' }}>₹12,100.00</td>
              <td><span className="delta-pill positive" style={{ padding: '4px 8px', fontSize: '11px' }}>Paid</span></td>
              <td>Oct 10, 2023</td>
              <td className="text-muted">Payout to bank ending in ****4567</td>
              <td><ExternalLink size={16} className="text-muted" cursor="pointer" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerAnalyticsPage;
