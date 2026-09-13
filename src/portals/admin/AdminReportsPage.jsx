import React, { useState } from 'react';
import { FileText, Download, Filter, CheckCircle, Info } from 'lucide-react';
import '../seller/DashboardOverview.css';

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
      <div className="page-header">
        <div>
          <h2>System Reports & Export Center</h2>
          <p>Generate, review, and export system audit reports for orders, seller performance, and aggregation efficiency.</p>
        </div>
      </div>

      {toastMessage && (
        <div className="alert alert-success" style={{ marginBottom: '16px' }}>
          <CheckCircle size={18} /> {toastMessage}
        </div>
      )}

      {/* Report Generator Controls */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 16px', fontSize: '16px' }}>Generate Custom Operational Report</h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label htmlFor="admin-report-category" className="form-label">Report Category</label>
            <select id="admin-report-category" className="form-control" value={reportType} onChange={e => setReportType(e.target.value)}>
              <option value="Daily Orders">Daily Orders Summary</option>
              <option value="Seller Performance">Seller Onboarding & Performance</option>
              <option value="Delivery Performance">Delivery Batch & Agent Audit</option>
              <option value="Aggregation Performance">Smart Order Aggregation Efficiency</option>
            </select>
          </div>

          <div>
            <label htmlFor="admin-report-period" className="form-label">Time Period</label>
            <select id="admin-report-period" className="form-control" value={dateRange} onChange={e => setDateRange(e.target.value)}>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="Custom Date Range">Custom Date Range</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => handleExport('CSV')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-outline" onClick={() => handleExport('PDF')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Sample Preview Table */}
      <div className="card" style={{ padding: '20px' }}>
        <h4 style={{ margin: '0 0 12px', fontSize: '15px' }}>Report Preview: {reportType} ({dateRange})</h4>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Metric Category</th>
                <th>Recorded Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{new Date().toLocaleDateString()}</td>
                <td>Total Orders Processed</td>
                <td>18 Orders</td>
                <td><span className="badge badge-success">Completed</span></td>
              </tr>
              <tr>
                <td>{new Date().toLocaleDateString()}</td>
                <td>Aggregation Success Rate</td>
                <td>78.5%</td>
                <td><span className="badge badge-primary">Optimal</span></td>
              </tr>
              <tr>
                <td>{new Date().toLocaleDateString()}</td>
                <td>Active Delivery Batches</td>
                <td>4 Batches</td>
                <td><span className="badge badge-warning">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
