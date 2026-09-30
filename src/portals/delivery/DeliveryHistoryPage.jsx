import React, { useState, useMemo } from 'react';
import { 
  Download, Search, Filter, Calendar, ChevronDown, ChevronRight, 
  CheckCircle2, Clock, MapPin, ShieldCheck, BarChart3, TrendingUp, XCircle 
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import PageHeader from '../../components/delivery/PageHeader';
import DeliveryStatusBadge from '../../components/delivery/DeliveryStatusBadge';
import EmptyState from '../../components/delivery/EmptyState';
import './DeliveryHistoryPage.css';

const DeliveryHistoryPage = () => {
  const { historyOrders, addToast } = useDelivery();

  const [dateFilter, setDateFilter] = useState('30d'); // 'today' | '7d' | '30d' | 'custom'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  // Toggle row expand
  const toggleRow = (orderId) => {
    setExpandedRows(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Filter history
  const filteredOrders = useMemo(() => {
    return (historyOrders || []).filter(order => {
      // Status filter
      if (statusFilter !== 'ALL' && order.status !== statusFilter) return false;

      // Search filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesId = (order.orderCode || order.id || '').toLowerCase().includes(query);
        const matchesBatch = (order.batchId || '').toLowerCase().includes(query);
        const matchesName = (order.customerName || '').toLowerCase().includes(query);
        if (!matchesId && !matchesBatch && !matchesName) return false;
      }

      return true;
    });
  }, [historyOrders, statusFilter, searchQuery]);

  // Group by date
  const groupedOrders = useMemo(() => {
    const groups = {};
    filteredOrders.forEach(o => {
      const dateKey = o.date || '2026-09-30';
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(o);
    });
    return groups;
  }, [filteredOrders]);

  // Pagination on dates/orders
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Order Code', 'Date', 'Batch', 'Customer', 'Address', 'Status', 'Total', 'COD Amount', 'Delivery Time', 'Distance Km', 'Proof'];
    const rows = filteredOrders.map(o => [
      o.orderCode || o.id,
      o.date,
      o.batchId,
      `"${o.customerName}"`,
      `"${o.address}"`,
      o.status,
      o.total,
      o.codAmount,
      o.deliveredAt || '',
      o.distanceKm || '',
      o.proofType || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `micrologi_history_${dateFilter}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Delivery history CSV exported successfully', 'success');
  };

  // KPIs
  const totalDelivered = filteredOrders.filter(o => o.status === 'DELIVERED').length;
  const successRate = filteredOrders.length > 0
    ? ((totalDelivered / filteredOrders.length) * 100).toFixed(1)
    : '100';
  const totalDistance = filteredOrders.reduce((acc, o) => acc + (o.distanceKm || 0), 0).toFixed(1);
  const avgTime = filteredOrders.length > 0
    ? Math.round(filteredOrders.reduce((acc, o) => acc + (o.durationMins || 0), 0) / filteredOrders.length)
    : 22;

  // Chart data points (daily volume)
  const chartDays = [
    { day: 'Mon', count: 18, height: '70%' },
    { day: 'Tue', count: 24, height: '95%' },
    { day: 'Wed', count: 21, height: '82%' },
    { day: 'Thu', count: 19, height: '74%' },
    { day: 'Fri', count: 26, height: '100%' },
    { day: 'Sat', count: 22, height: '86%' },
    { day: 'Sun', count: 14, height: '55%' }
  ];

  return (
    <div className="dl-history-page">
      <PageHeader
        breadcrumbs={['Account', 'Records']}
        title="Delivery History"
        subtitle="Audited dispatch records, customer proofs, and route KPI performance"
        badge="Archived Logs"
        actions={
          <button 
            type="button" 
            className="dl-btn dl-btn-secondary"
            onClick={handleExportCSV}
          >
            <Download size={15} />
            <span>Export CSV Report</span>
          </button>
        }
      />

      {/* KPI Strip */}
      <div className="history-kpi-grid">
        <div className="dl-card kpi-card">
          <span className="kpi-label">Total Delivered</span>
          <span className="kpi-value dl-tabular">{totalDelivered}</span>
          <span className="kpi-subtext text-success">
            <CheckCircle2 size={12} /> In selected window
          </span>
        </div>

        <div className="dl-card kpi-card">
          <span className="kpi-label">Success Rate</span>
          <span className="kpi-value dl-tabular">{successRate}%</span>
          <span className="kpi-subtext text-success">
            <TrendingUp size={12} /> Standard target: 95%
          </span>
        </div>

        <div className="dl-card kpi-card">
          <span className="kpi-label">Avg Delivery Time</span>
          <span className="kpi-value dl-tabular">{avgTime} mins</span>
          <span className="kpi-subtext">Per customer drop</span>
        </div>

        <div className="dl-card kpi-card">
          <span className="kpi-label">Total Fleet Distance</span>
          <span className="kpi-value dl-tabular">{totalDistance} km</span>
          <span className="kpi-subtext">Logged on route mesh</span>
        </div>
      </div>

      {/* Mini Deliveries Chart & Date Filters Bar */}
      <div className="dl-card history-chart-card">
        <div className="chart-header-row">
          <div className="chart-title-group">
            <BarChart3 size={17} className="text-primary" />
            <h3 className="chart-heading dl-heading">Daily Delivery Volume</h3>
          </div>

          {/* Date Presets */}
          <div className="date-presets-strip">
            {['today', '7d', '30d', 'custom'].map(preset => (
              <button
                key={preset}
                type="button"
                className={`date-preset-btn ${dateFilter === preset ? 'active' : ''}`}
                onClick={() => setDateFilter(preset)}
              >
                {preset === 'today' ? 'Today' : preset === '7d' ? 'Last 7 Days' : preset === '30d' ? '30 Days' : 'Custom'}
              </button>
            ))}
          </div>
        </div>

        {/* CSS Bar Chart */}
        <div className="daily-volume-bars">
          {chartDays.map(item => (
            <div key={item.day} className="chart-day-col">
              <div className="bar-track">
                <div 
                  className="bar-fill" 
                  style={{ height: item.height }}
                  title={`${item.count} deliveries on ${item.day}`}
                />
              </div>
              <span className="bar-day-label">{item.day}</span>
              <span className="bar-count-label dl-tabular">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Status Filters */}
      <div className="history-filters-bar">
        <div className="search-input-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by Order ID, Batch, Customer..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="history-search-input"
          />
        </div>

        <div className="status-select-wrap">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="history-select"
            aria-label="Filter history by status"
          >
            <option value="ALL">All Statuses</option>
            <option value="DELIVERED">Delivered Only</option>
            <option value="FAILED">Failed / Returned</option>
          </select>
        </div>
      </div>

      {/* Grouped Table with Sticky Date Headers & Expandable Rows */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          title="No history found"
          description="No deliveries match the selected date preset or filter criteria."
          primaryAction={{
            label: "Reset Filters",
            onClick: () => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setDateFilter('30d');
            }
          }}
        />
      ) : (
        <div className="dl-card history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }} aria-label="Expand" />
                <th>Order ID</th>
                <th>Batch</th>
                <th>Customer</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Time & Proof</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedOrders).map(([dateStr, dayOrders]) => (
                <React.Fragment key={dateStr}>
                  {/* Sticky Date Group Header */}
                  <tr className="date-group-header-row">
                    <td colSpan={7} className="date-group-header-cell">
                      <Calendar size={13} />
                      <span>{new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="date-group-count">({dayOrders.length} orders)</span>
                    </td>
                  </tr>

                  {/* Day Orders Rows */}
                  {dayOrders.map(order => {
                    const isExpanded = expandedRows[order.id];

                    return (
                      <React.Fragment key={order.id}>
                        <tr 
                          className={`history-order-row ${isExpanded ? 'is-expanded' : ''}`}
                          onClick={() => toggleRow(order.id)}
                        >
                          <td className="expand-chevron-cell">
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </td>
                          <td className="history-order-code dl-heading">{order.orderCode || order.id}</td>
                          <td className="history-batch-cell">{order.batchId}</td>
                          <td>
                            <div className="history-customer-cell">
                              <span className="customer-name">{order.customerName}</span>
                              <span className="customer-address-sub">{order.address}</span>
                            </div>
                          </td>
                          <td className="dl-tabular">
                            {order.codAmount > 0 ? (
                              <span className="text-warning font-semibold">₹{order.codAmount} COD</span>
                            ) : (
                              <span className="text-success font-medium">Prepaid ₹{order.total}</span>
                            )}
                          </td>
                          <td>
                            <DeliveryStatusBadge status={order.status} size="sm" />
                          </td>
                          <td className="history-proof-cell">
                            <span className="proof-time dl-tabular">{order.deliveredAt}</span>
                            <span className="proof-tag">{order.proofType}</span>
                          </td>
                        </tr>

                        {/* Expandable Details Sub-row */}
                        {isExpanded && (
                          <tr className="history-expanded-row">
                            <td colSpan={7} className="expanded-details-container">
                              <div className="expanded-content-grid">
                                <div className="expanded-card">
                                  <span className="exp-label">Aggregated Items</span>
                                  <div className="exp-items-list">
                                    {(order.items || []).map((itm, i) => (
                                      <span key={i} className="exp-item-chip">• {itm}</span>
                                    ))}
                                  </div>
                                </div>

                                <div className="expanded-card">
                                  <span className="exp-label">Delivery Verification</span>
                                  <div className="exp-val-row">
                                    <ShieldCheck size={16} className="text-success" />
                                    <span>{order.proofType || 'OTP 4-Digit Authenticated'}</span>
                                  </div>
                                  <span className="exp-sub">Trip duration: {order.durationMins} mins ({order.distanceKm} km)</span>
                                </div>

                                <div className="expanded-card">
                                  <span className="exp-label">Customer Rating</span>
                                  <div className="exp-rating-stars">
                                    {order.rating ? '★★★★★ 5.0' : 'Awaiting customer rating'}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="history-pagination-footer">
            <span className="pagination-info">
              Showing {filteredOrders.length} recorded delivery transactions
            </span>
            <div className="pagination-pages">
              <button 
                type="button" 
                className="page-btn" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Previous
              </button>
              <span className="page-current dl-tabular">Page {currentPage} of {totalPages}</span>
              <button 
                type="button" 
                className="page-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryHistoryPage;
