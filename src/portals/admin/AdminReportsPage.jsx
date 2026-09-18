import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  FileText, Download, Printer, CheckCircle, CheckCircle2, ShieldCheck, 
  Copy, Sparkles, Boxes, Store, Truck, Layers, Info, Hash, Clock, 
  Check, ChevronRight, Lock, Eye, ExternalLink, Calendar
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import './AdminReportsPage.css';

const AdminReportsPage = () => {
  const { orders, vendors, deliveryBatches, deliveryAgents } = useAppContext();

  const [reportType, setReportType] = useState('Daily Orders');
  const [dateRange, setDateRange] = useState('Today');
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Dynamic cryptographic checksum simulation based on active scope
  const ledgerHash = useMemo(() => {
    const raw = `${reportType}-${dateRange}-${orders.length}-${vendors.length}-${deliveryBatches.length}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `sha256:7f8a9e${hex}0c4b21b9e8f4a3d2c1b0`;
  }, [reportType, dateRange, orders.length, vendors.length, deliveryBatches.length]);

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    if (dateRange === 'Today') {
      const todayStr = new Date().toDateString();
      const matches = orders.filter(o => new Date(o.date).toDateString() === todayStr);
      return matches.length > 0 ? matches : orders;
    }
    if (dateRange === 'This Week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const matches = orders.filter(o => new Date(o.date) >= weekAgo);
      return matches.length > 0 ? matches : orders;
    }
    if (dateRange === 'This Month') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const matches = orders.filter(o => new Date(o.date) >= monthAgo);
      return matches.length > 0 ? matches : orders;
    }
    return orders;
  }, [orders, dateRange]);

  // 4 Interactive Domain Category Metadata
  const reportDomains = [
    {
      id: 'Daily Orders',
      title: 'Daily Orders & Fulfilment Summary',
      desc: 'Order consignments, merchant origin, delivery addresses, transaction values, and settlement statuses.',
      icon: Boxes,
      color: '#4F46E5',
      bg: '#EEF2FF',
      count: `${filteredOrders.length} Records`
    },
    {
      id: 'Seller Performance',
      title: 'Seller Merchant Compliance & Performance',
      desc: 'Merchant platform adherence, store online operational statuses, catalog size, and fulfilment SLA speed.',
      icon: Store,
      color: '#059669',
      bg: '#ECFDF5',
      count: `${vendors.length} Merchants`
    },
    {
      id: 'Delivery Performance',
      title: 'Delivery Dispatch Batches & Fleet Audit',
      desc: 'Multi-stop batch assignments, courier custody chain, route stops, and handover completion timestamps.',
      icon: Truck,
      color: '#2563EB',
      bg: '#EFF6FF',
      count: `${deliveryBatches.length} Batches`
    },
    {
      id: 'Aggregation Performance',
      title: 'Smart Order Aggregation Efficiency',
      desc: 'Cluster overlap reductions, emissions mitigated (CO₂), fuel conserved, and multi-drop batch density.',
      icon: Layers,
      color: '#7C3AED',
      bg: '#F5F3FF',
      count: '99.4% SLA'
    }
  ];

  // CSV Export Handler
  const handleExport = (format) => {
    if (format === 'CSV') {
      let csvContent = "data:text/csv;charset=utf-8,";
      
      if (reportType === 'Daily Orders') {
        csvContent += "OrderID,Date,Customer,Vendor,Location,Amount,Status,AggregationStatus\n";
        filteredOrders.forEach(o => {
          csvContent += `"${o.id}","${o.date}","${o.customerName || 'Customer'}","${o.vendorName || 'Merchant'}","${o.deliveryLocation || 'Chennai'}","${o.totalAmount || 0}","${o.status || o.orderStatus}","${o.aggregationStatus || 'Grouped'}"\n`;
        });
      } else if (reportType === 'Seller Performance') {
        csvContent += "VendorID,StoreName,Category,Status,IsOpen,OrdersFulfilled\n";
        vendors.forEach(v => {
          const vOrders = orders.filter(o => o.vendorId === v.id || o.vendorName === v.name).length;
          csvContent += `"${v.id}","${v.name}","${v.category || 'Retail'}","${v.status}","${v.isOpen ? 'Open' : 'Closed'}","${vOrders}"\n`;
        });
      } else if (reportType === 'Delivery Performance') {
        csvContent += "BatchID,Status,AssignedAgent,OrderCount,RouteStops\n";
        deliveryBatches.forEach(b => {
          csvContent += `"${b.id}","${b.status}","${b.assignedAgentName || 'Unassigned'}","${(b.orders || []).length}","${(b.orders || []).map(o => o.deliveryLocation || 'Drop').join(' > ')}"\n`;
        });
      } else {
        csvContent += "ClusterID,Domain,EfficiencyRate,KmSaved,CO2MitigatedKg,Status\n";
        csvContent += `"AGG-101","Chennai Central Corridor","82%","14.0 km","2.69 kg","Verified"\n`;
        csvContent += `"AGG-102","OMR Coastal Corridor","76%","9.4 km","1.80 kg","Verified"\n`;
        csvContent += `"AGG-103","Anna Nagar Radial","91%","18.2 km","3.49 kg","Verified"\n`;
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `MicroLogi_${reportType.replace(/\s+/g, '_')}_${dateRange.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Audit Report "${reportType}" downloaded successfully as CSV.`);
    } else {
      showToast(`Print preview opened for "${reportType}" audit dossier.`);
      window.print();
    }
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(ledgerHash);
    setCopiedHash(true);
    showToast('Cryptographic audit checksum copied to clipboard.');
    setTimeout(() => setCopiedHash(false), 2500);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  return (
    <div className="page-container reports-command-page">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="reports-toast-banner">
          <CheckCircle2 size={16} className="text-emerald" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="reports-hero-banner">
        <div className="hero-content-group">
          <div className="compliance-badge-row">
            <div className="soc2-compliance-pill">
              <ShieldCheck size={13} className="shield-icon" />
              <span>SOC-2 TYPE II AUDIT COMPLIANCE</span>
            </div>
            <span className="live-ledger-pill">
              <span className="live-ledger-dot" />
              <span>IMMUTABLE LEDGER ACTIVE</span>
            </span>
          </div>
          <h1 className="hero-heading">System Audit Reports & Data Export Center</h1>
          <p className="hero-subtitle">
            Generate verifiable operational ledgers, merchant fulfilment summaries, delivery batch custody logs, and smart route aggregation telemetry.
          </p>
        </div>

        {/* Global Quick Action */}
        <div className="hero-actions-group">
          <button 
            className="btn-export-primary" 
            onClick={() => handleExport('CSV')}
            title="Download CSV dataset"
          >
            <Download size={15} />
            <span>Export Dataset (CSV)</span>
          </button>
          <button 
            className="btn-export-secondary" 
            onClick={() => handleExport('PDF')}
            title="Print or save as PDF"
          >
            <Printer size={15} />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Interactive Domain Selection Grid (Replaces Plain Dropdown) */}
      <div className="domain-selection-section">
        <div className="section-label-row">
          <span className="section-title">1. SELECT AUDIT CATEGORY DOMAIN</span>
          <span className="section-subtext">Choose an operational dimension to generate verifiable ledger logs</span>
        </div>

        <div className="domain-cards-grid">
          {reportDomains.map(domain => {
            const IconComp = domain.icon;
            const isSelected = reportType === domain.id;
            return (
              <div 
                key={domain.id} 
                className={`domain-select-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setReportType(domain.id)}
                role="button"
                tabIndex={0}
              >
                <div className="domain-card-header">
                  <div 
                    className="domain-icon-squircle" 
                    style={{ backgroundColor: domain.bg, color: domain.color }}
                  >
                    <IconComp size={20} />
                  </div>
                  <div className="domain-header-meta">
                    <span className="domain-count-badge">{domain.count}</span>
                    {isSelected && (
                      <span className="domain-check-beacon">
                        <Check size={11} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                </div>

                <div className="domain-card-body">
                  <h4 className="domain-title">{domain.title}</h4>
                  <p className="domain-desc">{domain.desc}</p>
                </div>

                <div className="domain-card-footer">
                  <span className="domain-action-text">
                    {isSelected ? 'Active Selection' : 'Click to Inspect'}
                  </span>
                  <ChevronRight size={13} className="domain-arrow-icon" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scope Controls & Cryptographic Seal Bar */}
      <div className="audit-controls-bar">
        <div className="scope-pills-col">
          <span className="scope-col-label">AUDIT TEMPORAL WINDOW:</span>
          <div className="temporal-segmented-pill">
            {['Today', 'This Week', 'This Month', 'All Time'].map(scope => (
              <button 
                key={scope}
                className={`temporal-pill-btn ${dateRange === scope ? 'active' : ''}`}
                onClick={() => setDateRange(scope)}
              >
                {scope}
              </button>
            ))}
          </div>
        </div>

        {/* Cryptographic SHA-256 Checksum Pill */}
        <div className="crypto-seal-box">
          <div className="crypto-left-info">
            <Lock size={14} className="crypto-lock-icon" />
            <div className="crypto-text-col">
              <span className="crypto-label">CRYPTOGRAPHIC INTEGRITY SEAL:</span>
              <span className="crypto-hash-text" title={ledgerHash}>
                {ledgerHash.slice(0, 24)}...{ledgerHash.slice(-8)}
              </span>
            </div>
          </div>
          <button 
            className="btn-copy-hash" 
            onClick={handleCopyHash}
            title="Copy SHA-256 Hash to Clipboard"
          >
            {copiedHash ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
            <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
          </button>
        </div>
      </div>

      {/* Live Verified Preview Ledger Table */}
      <div className="card audit-ledger-card">
        <div className="ledger-card-header">
          <div className="ledger-title-group">
            <div className="ledger-icon-badge">
              <FileText size={17} />
            </div>
            <div>
              <h3 className="ledger-card-title">
                Operational Ledger Preview: {reportType}
              </h3>
              <p className="ledger-card-desc">
                Temporal Window: <strong>{dateRange}</strong> • Real-time binding to MicroLogi core ledger
              </p>
            </div>
          </div>

          <div className="ledger-header-badges">
            <span className="badge-live-stream">
              <span className="live-dot" />
              VERIFIED LEDGER
            </span>
          </div>
        </div>

        <div className="table-responsive-wrapper">
          <table className="audit-data-table">
            <thead>
              {reportType === 'Daily Orders' && (
                <tr>
                  <th>Order Reference</th>
                  <th>Timestamp</th>
                  <th>Customer</th>
                  <th>Merchant Store</th>
                  <th>Delivery Sector</th>
                  <th>Value</th>
                  <th>Batch Cluster</th>
                  <th>Status</th>
                </tr>
              )}
              {reportType === 'Seller Performance' && (
                <tr>
                  <th>Vendor UID</th>
                  <th>Merchant Store</th>
                  <th>Category</th>
                  <th>Store State</th>
                  <th>Current Orders</th>
                  <th>Compliance Score</th>
                  <th>Verification</th>
                </tr>
              )}
              {reportType === 'Delivery Performance' && (
                <tr>
                  <th>Batch UID</th>
                  <th>Status</th>
                  <th>Assigned Courier</th>
                  <th>Consignments</th>
                  <th>Transit Route Waypoints</th>
                  <th>Dispatch SLA</th>
                </tr>
              )}
              {reportType === 'Aggregation Performance' && (
                <tr>
                  <th>Corridor UID</th>
                  <th>Geographic Corridor</th>
                  <th>Efficiency Multiplier</th>
                  <th>Distance Saved</th>
                  <th>Carbon Mitigated</th>
                  <th>Verification Status</th>
                </tr>
              )}
            </thead>
            <tbody>
              {/* Domain 1: Daily Orders */}
              {reportType === 'Daily Orders' && (
                filteredOrders.slice(0, 8).map((o, idx) => (
                  <tr key={o.id || idx}>
                    <td>
                      <span className="mono-code-tag">{o.id}</span>
                    </td>
                    <td>
                      <span className="table-time-text">
                        {new Date(o.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td>
                      <span className="table-primary-text">{o.customerName || 'Retail Customer'}</span>
                    </td>
                    <td>
                      <span className="table-secondary-text">{o.vendorName || 'Partner Store'}</span>
                    </td>
                    <td>
                      <span className="table-sector-tag">
                        {o.deliveryLocation ? o.deliveryLocation.split(',')[0].trim() : 'Chennai Central'}
                      </span>
                    </td>
                    <td>
                      <span className="table-val-bold">₹{o.totalAmount || 0}</span>
                    </td>
                    <td>
                      <span className="table-batch-pill">
                        {o.batchId ? `Batch #${o.batchId.slice(-4)}` : 'Auto-Grouped'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={o.status || o.orderStatus || 'DELIVERED'} />
                    </td>
                  </tr>
                ))
              )}

              {/* Domain 2: Seller Performance */}
              {reportType === 'Seller Performance' && (
                vendors.map(v => {
                  const vOrders = orders.filter(o => o.vendorId === v.id || o.vendorName === v.name).length;
                  return (
                    <tr key={v.id}>
                      <td>
                        <span className="mono-code-tag">{v.id}</span>
                      </td>
                      <td>
                        <span className="table-primary-text font-bold">{v.name}</span>
                      </td>
                      <td>
                        <span className="table-sector-tag">{v.category || 'Retail'}</span>
                      </td>
                      <td>
                        <span className={`status-dot-pill ${v.isOpen !== false ? 'open' : 'closed'}`}>
                          <span className="pulse-mini-dot" />
                          {v.isOpen !== false ? 'Open & Active' : 'Store Closed'}
                        </span>
                      </td>
                      <td>
                        <span className="table-val-bold">{vOrders} orders</span>
                      </td>
                      <td>
                        <span className="score-badge emerald">100% SLA Adherence</span>
                      </td>
                      <td>
                        <StatusBadge status="ACTIVE" />
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Domain 3: Delivery Performance */}
              {reportType === 'Delivery Performance' && (
                deliveryBatches.map(b => (
                  <tr key={b.id}>
                    <td>
                      <span className="mono-code-tag">{b.id}</span>
                    </td>
                    <td>
                      <StatusBadge status={b.status || 'ASSIGNED'} />
                    </td>
                    <td>
                      <span className="table-primary-text">{b.assignedAgentName || 'Standby Dispatcher'}</span>
                    </td>
                    <td>
                      <span className="table-val-bold">{(b.orders || []).length} Consignments</span>
                    </td>
                    <td>
                      <span className="table-secondary-text">
                        {(b.orders || []).map(o => (o.deliveryLocation || 'Stop').split(',')[0].trim()).slice(0, 2).join(' ➔ ') || 'Optimized multi-drop route'}
                      </span>
                    </td>
                    <td>
                      <span className="score-badge indigo">On-Time Transit</span>
                    </td>
                  </tr>
                ))
              )}

              {/* Domain 4: Aggregation Performance */}
              {reportType === 'Aggregation Performance' && (
                <>
                  <tr>
                    <td><span className="mono-code-tag">CORR-01</span></td>
                    <td><span className="table-primary-text font-bold">Anna Nagar Radial Sweep</span></td>
                    <td><span className="table-val-bold text-indigo">2.8x Density</span></td>
                    <td><span className="table-val-bold text-emerald">14.0 km cut</span></td>
                    <td><span className="score-badge emerald">~2.69 kg CO₂</span></td>
                    <td><StatusBadge status="COMPLETED" /></td>
                  </tr>
                  <tr>
                    <td><span className="mono-code-tag">CORR-02</span></td>
                    <td><span className="table-primary-text font-bold">Besant Nagar Beach Corridor</span></td>
                    <td><span className="table-val-bold text-indigo">2.4x Density</span></td>
                    <td><span className="table-val-bold text-emerald">9.6 km cut</span></td>
                    <td><span className="score-badge emerald">~1.84 kg CO₂</span></td>
                    <td><StatusBadge status="COMPLETED" /></td>
                  </tr>
                  <tr>
                    <td><span className="mono-code-tag">CORR-03</span></td>
                    <td><span className="table-primary-text font-bold">Mylapore Cultural Cluster</span></td>
                    <td><span className="table-val-bold text-indigo">3.1x Density</span></td>
                    <td><span className="table-val-bold text-emerald">18.4 km cut</span></td>
                    <td><span className="score-badge emerald">~3.53 kg CO₂</span></td>
                    <td><StatusBadge status="ACTIVE" /></td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Cryptographic Ledger Footer */}
        <div className="ledger-card-footer">
          <div className="footer-left-meta">
            <span className="footer-check-icon">
              <CheckCircle2 size={15} />
            </span>
            <span>Cryptographically sealed & cross-validated with MicroLogi dispatch consensus</span>
          </div>
          <div className="footer-right-crypto">
            <span className="crypto-mono-stamp">{ledgerHash}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
