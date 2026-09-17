import React, { useState } from 'react';
import { FileText, Download, Filter, CheckCircle, Info, Calendar, Sparkles, Printer } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

const AdminReportsPage = () => {
  const [reportType, setReportType] = useState('Daily Orders');
  const [dateRange, setDateRange] = useState('Today');
  const [toastMessage, setToastMessage] = useState(null);

  const handleExport = (format) => {
    if (format === 'CSV') {
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Report,Period,GeneratedAt,Status\n" +
        `"${reportType}","${dateRange}","${new Date().toISOString()}","Complete"\n`;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${reportType.replace(/\s+/g, '_')}_${dateRange.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setToastMessage(`Report "${reportType}" downloaded successfully as CSV.`);
    } else {
      setToastMessage(`Print preview opened for "${reportType}" report.`);
      window.print();
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h2>
            System Audit Reports & Data Export Center
            <span className="telemetry-tag">
              <span className="telemetry-pulse" /> COMPLIANCE EXPORT
            </span>
          </h2>
          <p className="page-subtitle">
            Generate cryptographically structured operational audits for transaction ledgers, merchant fulfilment, route aggregation, and SLA metrics.
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="modal-notice-banner" style={{ marginBottom: '1.5rem', background: '#ECFDF5', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#065F46' }}>
          <CheckCircle size={18} className="text-emerald" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Report Generator Controls */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
        <div className="card-header" style={{ padding: '0 0 1.25rem 0', borderBottom: '1px solid var(--color-border)' }}>
          <h4 className="card-title">
            <FileText size={17} className="text-accent" />
            Generate Custom Operational Audit
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', margin: '1.5rem 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label htmlFor="admin-report-category" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>
              Report Category Domain
            </label>
            <select 
              id="admin-report-category" 
              className="form-select" 
              value={reportType} 
              onChange={e => setReportType(e.target.value)}
            >
              <option value="Daily Orders">Daily Orders & Fulfilment Summary</option>
              <option value="Seller Performance">Seller Merchant Compliance & Performance</option>
              <option value="Delivery Performance">Delivery Dispatch Batches & Fleet Audit</option>
              <option value="Aggregation Performance">Smart Order Aggregation Efficiency</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label htmlFor="admin-report-period" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>
              Audit Temporal Window
            </label>
            <select 
              id="admin-report-period" 
              className="form-select" 
              value={dateRange} 
              onChange={e => setDateRange(e.target.value)}
            >
              <option value="Today">Current Operational Day (Today)</option>
              <option value="This Week">Rolling 7-Day Cycle</option>
              <option value="This Month">Calendar Month to Date</option>
              <option value="Custom Date Range">Custom Audit Range</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => handleExport('CSV')}
          >
            <Download size={15} /> Export Dataset (CSV)
          </button>
          <button 
            className="btn btn-outline" 
            onClick={() => handleExport('PDF')}
          >
            <Printer size={15} /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Sample Preview Table */}
      <div className="table-card">
        <div className="card-header">
          <div>
            <h4 className="card-title">
              Report Data Preview: {reportType}
            </h4>
            <span className="card-subtitle-small">Temporal scope: {dateRange}</span>
          </div>
          <span className="badge-subtle">LIVE SAMPLE</span>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Generated Timestamp</th>
                <th>Metric Dimension</th>
                <th>Measured Platform Value</th>
                <th>Audit Verification</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.8125rem' }}>
                    {new Date().toISOString().split('T')[0]} 09:00:00
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>Total Orders Processed</span>
                </td>
                <td>
                  <span className="monetary-amount" style={{ color: '#4F46E5' }}>18 Consignments</span>
                </td>
                <td>
                  <StatusBadge status="COMPLETED" />
                </td>
              </tr>
              <tr>
                <td>
                  <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.8125rem' }}>
                    {new Date().toISOString().split('T')[0]} 12:00:00
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>Aggregation Success Rate</span>
                </td>
                <td>
                  <span className="monetary-amount" style={{ color: '#059669' }}>78.5% Cluster Efficiency</span>
                </td>
                <td>
                  <StatusBadge status="ACTIVE" />
                </td>
              </tr>
              <tr>
                <td>
                  <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.8125rem' }}>
                    {new Date().toISOString().split('T')[0]} 16:30:00
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>Active Delivery Batches Coordinated</span>
                </td>
                <td>
                  <span className="monetary-amount">4 Multi-Stop Batches</span>
                </td>
                <td>
                  <StatusBadge status="ASSIGNED" />
                </td>
              </tr>
            </tbody>
          </table>

          <div className="table-footer">
            <span>Report sample generated for preview • Verified by MicroLogi Core</span>
            <span style={{ fontFamily: 'var(--font-family-mono)' }}>SHA256: 7f8a9e...21b</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
