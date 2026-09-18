import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  Bell, CheckCircle2, Info, AlertTriangle, Layers, 
  Clock, Check, Filter, Sparkles, Truck, Search, 
  ShieldAlert, Activity, ArrowUpRight, Zap, RefreshCw,
  CheckCheck, AlertCircle, Radio
} from 'lucide-react';
import './AdminNotificationsPage.css';

const AdminNotificationsPage = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useAppContext();
  
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const aggCount = notifications.filter(n => n.type === 'aggregation').length;
  const delCount = notifications.filter(n => n.type === 'delivery').length;
  const alertCount = notifications.filter(n => n.type === 'warning' || n.type === 'alert').length;

  // Filter and search
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // Category filter
      if (filterType === 'unread' && n.isRead) return false;
      if (filterType === 'aggregation' && n.type !== 'aggregation') return false;
      if (filterType === 'delivery' && n.type !== 'delivery') return false;
      if (filterType === 'warning' && !['warning', 'alert'].includes(n.type)) return false;

      // Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const msg = (n.message || '').toLowerCase();
        const type = (n.type || '').toLowerCase();
        return msg.includes(q) || type.includes(q);
      }
      return true;
    });
  }, [notifications, filterType, searchQuery]);

  const handleAcknowledge = (id) => {
    markNotificationAsRead(id);
    showToast('Signal acknowledged and logged to audit ledger.');
  };

  const handleMarkAll = () => {
    markAllNotificationsAsRead();
    showToast(`All ${unreadCount} signals acknowledged.`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'aggregation':
        return <Layers size={17} />;
      case 'delivery':
        return <Truck size={17} />;
      case 'warning':
      case 'alert':
        return <AlertTriangle size={17} />;
      default:
        return <Bell size={17} />;
    }
  };

  const getNotificationTheme = (type) => {
    switch (type) {
      case 'aggregation':
        return {
          bg: '#EEF2FF',
          color: '#4F46E5',
          border: 'rgba(79, 70, 229, 0.25)',
          glow: 'rgba(79, 70, 229, 0.12)',
          tag: 'Aggregation Engine',
          badgeClass: 'tag-indigo'
        };
      case 'delivery':
        return {
          bg: '#ECFDF5',
          color: '#059669',
          border: 'rgba(16, 185, 129, 0.25)',
          glow: 'rgba(16, 185, 129, 0.12)',
          tag: 'Courier Dispatch',
          badgeClass: 'tag-emerald'
        };
      case 'warning':
      case 'alert':
        return {
          bg: '#FEF2F2',
          color: '#DC2626',
          border: 'rgba(220, 38, 38, 0.25)',
          glow: 'rgba(220, 38, 38, 0.12)',
          tag: 'Telemetry Warning',
          badgeClass: 'tag-rose'
        };
      default:
        return {
          bg: '#F8FAFC',
          color: '#475569',
          border: 'rgba(100, 116, 139, 0.2)',
          glow: 'rgba(15, 23, 42, 0.05)',
          tag: 'System Event',
          badgeClass: 'tag-slate'
        };
    }
  };

  return (
    <div className="page-container signals-command-page">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="signals-toast-banner">
          <CheckCircle2 size={16} className="text-emerald" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="signals-hero-banner">
        <div className="hero-left-col">
          <div className="stream-badge-row">
            <div className="live-stream-pill">
              <span className="live-pulse-dot" />
              <span>LIVE TELEMETRY STREAM</span>
            </div>
            <span className="stream-status-tag">BUFFER ACTIVE • FIFO</span>
          </div>
          <h1 className="hero-heading">System & Logistics Signals Command</h1>
          <p className="hero-subtitle">
            Real-time operational audit log of automated batch clustering sweeps, courier assignments, route modifications, and merchant mutations.
          </p>
        </div>

        <div className="hero-actions-col">
          {unreadCount > 0 ? (
            <button 
              className="btn-mark-all-primary" 
              onClick={handleMarkAll}
              title="Acknowledge all pending signals"
            >
              <CheckCheck size={16} />
              <span>Mark All Acknowledged ({unreadCount})</span>
            </button>
          ) : (
            <div className="all-clear-badge">
              <CheckCircle2 size={15} className="text-emerald" />
              <span>All Signals Acknowledged</span>
            </div>
          )}
        </div>
      </div>

      {/* 4 Glassmorphic Signal Telemetry Cards */}
      <div className="signals-metrics-grid">
        <div className="signal-kpi-card blue-glow">
          <div className="signal-kpi-header">
            <span className="signal-kpi-label">TOTAL SIGNALS IN BUFFER</span>
            <div className="signal-squircle blue">
              <Bell size={18} />
            </div>
          </div>
          <div className="signal-kpi-val">{notifications.length}</div>
          <div className="signal-kpi-footer">
            <span className="signal-dot blue" />
            <span>Continuous event telemetry stream</span>
          </div>
        </div>

        <div className="signal-kpi-card red-glow">
          <div className="signal-kpi-header">
            <span className="signal-kpi-label">PENDING ACTION</span>
            <div className="signal-squircle red">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="signal-kpi-val text-rose">{unreadCount}</div>
          <div className="signal-kpi-footer">
            <span className="signal-dot red" />
            <span>{unreadCount > 0 ? 'Requires operator review' : 'Zero unacknowledged alerts'}</span>
          </div>
        </div>

        <div className="signal-kpi-card purple-glow">
          <div className="signal-kpi-header">
            <span className="signal-kpi-label">BATCH GROUPINGS</span>
            <div className="signal-squircle purple">
              <Layers size={18} />
            </div>
          </div>
          <div className="signal-kpi-val text-purple">{aggCount}</div>
          <div className="signal-kpi-footer">
            <span className="signal-dot purple" />
            <span>Autonomous clustering sweep events</span>
          </div>
        </div>

        <div className="signal-kpi-card emerald-glow">
          <div className="signal-kpi-header">
            <span className="signal-kpi-label">FLEET DISPATCHES</span>
            <div className="signal-squircle emerald">
              <Truck size={18} />
            </div>
          </div>
          <div className="signal-kpi-val text-emerald">{delCount}</div>
          <div className="signal-kpi-footer">
            <span className="signal-dot emerald" />
            <span>Active courier handovers & runs</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar Strip */}
      <div className="signals-controls-strip">
        <div className="filter-pills-wrap">
          <button 
            className={`filter-pill-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            <span>All Signals</span>
            <span className="filter-count-badge">{notifications.length}</span>
          </button>
          <button 
            className={`filter-pill-btn ${filterType === 'unread' ? 'active' : ''}`}
            onClick={() => setFilterType('unread')}
          >
            <span>Unread</span>
            <span className={`filter-count-badge ${unreadCount > 0 ? 'highlight' : ''}`}>{unreadCount}</span>
          </button>
          <button 
            className={`filter-pill-btn ${filterType === 'aggregation' ? 'active' : ''}`}
            onClick={() => setFilterType('aggregation')}
          >
            <span>Batches</span>
            <span className="filter-count-badge">{aggCount}</span>
          </button>
          <button 
            className={`filter-pill-btn ${filterType === 'delivery' ? 'active' : ''}`}
            onClick={() => setFilterType('delivery')}
          >
            <span>Deliveries</span>
            <span className="filter-count-badge">{delCount}</span>
          </button>
        </div>

        {/* Real-Time Keyword Search */}
        <div className="search-input-box">
          <Search size={14} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search signals by keyword..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="signal-search-field"
          />
          {searchQuery && (
            <button 
              className="clear-search-btn" 
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Signals Stream Feed */}
      <div className="signals-feed-container">
        {filteredNotifications.length === 0 ? (
          <div className="signals-empty-state">
            <div className="empty-icon-ring">
              <Sparkles size={32} />
            </div>
            <h3 className="empty-title">All Signals In Sync</h3>
            <p className="empty-desc">
              {filterType === 'unread'
                ? 'No pending signals require operator attention. The logistics dispatch buffer is clean.'
                : 'No telemetry signals match the current search or category filter.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const theme = getNotificationTheme(n.type);
            return (
              <div 
                key={n.id} 
                className={`signal-feed-card ${n.isRead ? 'is-read' : 'is-unread'}`}
                style={{ '--theme-border': theme.border, '--theme-glow': theme.glow }}
              >
                {/* Accent Beacon Bar on Left */}
                <div className="signal-accent-stripe" style={{ backgroundColor: theme.color }} />

                <div className="signal-card-main">
                  <div 
                    className="signal-icon-squircle" 
                    style={{ backgroundColor: theme.bg, color: theme.color }}
                  >
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="signal-body-col">
                    <div className="signal-top-row">
                      <span className={`signal-type-tag ${theme.badgeClass}`}>
                        {theme.tag}
                      </span>
                      <div className="signal-timestamp-flex">
                        <Clock size={12} />
                        <span>
                          {new Date(n.date).toLocaleString([], { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      {!n.isRead && (
                        <span className="signal-new-beacon">
                          <span className="beacon-dot" />
                          NEW
                        </span>
                      )}
                    </div>

                    <p className="signal-message-text">{n.message}</p>
                  </div>

                  <div className="signal-action-col">
                    {!n.isRead ? (
                      <button 
                        className="btn-ack-signal"
                        onClick={() => handleAcknowledge(n.id)}
                        title="Mark signal as acknowledged"
                      >
                        <Check size={14} />
                        <span>Acknowledge</span>
                      </button>
                    ) : (
                      <span className="signal-acknowledged-text">
                        <Check size={12} />
                        <span>Logged</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
