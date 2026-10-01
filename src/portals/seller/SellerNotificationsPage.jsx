import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  Bell, CheckCircle2, Info, AlertTriangle, Layers, 
  Clock, Check, Filter, Sparkles, Truck, Search, 
  ShieldAlert, Activity, ArrowUpRight, Zap, RefreshCw,
  CheckCheck, AlertCircle, ShoppingBag, Package, Store,
  X, Trash2, Maximize, Minimize
} from 'lucide-react';
import './SellerNotificationsPage.css';

const SellerNotificationsPage = () => {
  const { 
    notifications: rawNotifications = [], 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = useAppContext();

  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  React.useEffect(() => {
    const handleFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Enhanced default feed if empty
  const defaultSellerNotifications = useMemo(() => [
    {
      id: 'sn-1',
      title: 'New Customer Order #ORD-6158',
      message: 'priyarajan placed an order for 2x Aavin Green Milk 500ml (₹44.00). Packing SLA target is 15 minutes.',
      type: 'order',
      date: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
      isRead: false,
      priority: 'high'
    },
    {
      id: 'sn-2',
      title: 'Batch Dispatch Assigned to Courier',
      message: 'Batch #B-8841 containing 3 neighborhood orders has been assigned to driver Rajesh Kumar. Estimated pickup in 8 mins.',
      type: 'delivery',
      date: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
      isRead: false,
      priority: 'normal'
    },
    {
      id: 'sn-3',
      title: 'Low Stock Threshold Warning',
      message: 'SKU "Organic Whole Wheat Atta 5kg" has reached 4 remaining units (Reorder threshold: 10 units).',
      type: 'alert',
      date: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
      isRead: true,
      priority: 'warning'
    },
    {
      id: 'sn-4',
      title: 'Automated Settlement Payout Cleared',
      message: 'Weekly net sales revenue of ₹24,850.00 was processed to your HDFC Bank account (ending in 4567).',
      type: 'system',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      isRead: true,
      priority: 'success'
    },
    {
      id: 'sn-5',
      title: 'Store Schedule Synchronized',
      message: 'Operating hours updated to 08:00 AM - 10:00 PM with 4.5 km delivery radius across RS Puram hub.',
      type: 'system',
      date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      isRead: true,
      priority: 'normal'
    }
  ], []);

  // Merge real and default notifications
  const allNotifications = useMemo(() => {
    const combined = [...rawNotifications];
    defaultSellerNotifications.forEach(def => {
      if (!combined.some(n => n.id === def.id || n.message === def.message)) {
        combined.push(def);
      }
    });
    return combined.filter(n => !dismissedIds.has(n.id));
  }, [rawNotifications, defaultSellerNotifications, dismissedIds]);

  const unreadCount = allNotifications.filter(n => !n.isRead).length;
  const orderCount = allNotifications.filter(n => n.type === 'order').length;
  const deliveryCount = allNotifications.filter(n => n.type === 'delivery').length;
  const alertCount = allNotifications.filter(n => n.type === 'alert' || n.type === 'warning').length;

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return allNotifications.filter(n => {
      if (filterType === 'unread' && n.isRead) return false;
      if (filterType === 'order' && n.type !== 'order') return false;
      if (filterType === 'delivery' && n.type !== 'delivery') return false;
      if (filterType === 'alert' && n.type !== 'alert' && n.type !== 'warning') return false;
      if (filterType === 'system' && n.type !== 'system') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = (n.title || '').toLowerCase();
        const msg = (n.message || '').toLowerCase();
        return title.includes(q) || msg.includes(q);
      }
      return true;
    });
  }, [allNotifications, filterType, searchQuery]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAcknowledge = (id) => {
    if (markNotificationAsRead) markNotificationAsRead(id);
    showToast('Notification acknowledged.');
  };

  const handleDismiss = (id) => {
    setDismissedIds(prev => new Set(prev).add(id));
    showToast('Notification removed from feed.');
  };

  const handleMarkAll = () => {
    if (markAllNotificationsAsRead) markAllNotificationsAsRead();
    showToast(`All ${unreadCount} unread signals marked as read.`);
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const d = new Date(dateStr);
    const diff = Math.floor((new Date() - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getTheme = (type) => {
    switch (type) {
      case 'order':
        return {
          bg: '#EEF2FF',
          color: '#4F46E5',
          border: 'rgba(79, 70, 229, 0.25)',
          tag: 'Store Order',
          badgeClass: 'tag-indigo',
          icon: <ShoppingBag size={18} />
        };
      case 'delivery':
        return {
          bg: '#ECFDF5',
          color: '#059669',
          border: 'rgba(16, 185, 129, 0.25)',
          tag: 'Batch Dispatch',
          badgeClass: 'tag-emerald',
          icon: <Truck size={18} />
        };
      case 'alert':
      case 'warning':
        return {
          bg: '#FFFBEB',
          color: '#D97706',
          border: 'rgba(217, 119, 6, 0.25)',
          tag: 'Inventory SLA',
          badgeClass: 'tag-amber',
          icon: <AlertTriangle size={18} />
        };
      default:
        return {
          bg: '#F1F5F9',
          color: '#475569',
          border: 'rgba(71, 85, 105, 0.25)',
          tag: 'System Telemetry',
          badgeClass: 'tag-slate',
          icon: <Bell size={18} />
        };
    }
  };

  // Group notifications into Today / Yesterday / Earlier
  const groupedNotifications = useMemo(() => {
    const groups = { Today: [], Yesterday: [], Earlier: [] };
    const now = new Date();

    filteredNotifications.forEach(n => {
      const d = new Date(n.date || Date.now());
      const isToday = d.toDateString() === now.toDateString();
      const diffHours = (now - d) / (1000 * 60 * 60);

      if (isToday) {
        groups.Today.push(n);
      } else if (diffHours < 48) {
        groups.Yesterday.push(n);
      } else {
        groups.Earlier.push(n);
      }
    });

    return groups;
  }, [filteredNotifications]);

  return (
    <div className="seller-notifications-page">
      {/* ─── Toast Feedback ────────────────────────────────────────── */}
      {toastMessage && (
        <div className="notif-toast-banner">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Hero Header Banner (Full Screen Width) ────────────────── */}
      <div className="notif-hero-banner">
        <div className="hero-left-content">
          <div className="live-stream-badge">
            <span className="live-pulse-dot" />
            <span>REAL-TIME TELEMETRY FEED</span>
          </div>
          <h1 className="hero-page-title">Store Notifications & Dispatch Signals</h1>
          <p className="hero-page-subtitle">
            Live order requests, batch aggregations, courier arrivals, and inventory alert telemetry.
          </p>
        </div>

        <div className="hero-right-actions">
          <button 
            className={`action-btn-fullscreen ${isFullscreen ? 'is-active' : ''}`}
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen Mode" : "Expand to Fullscreen"}
          >
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
            <span>{isFullscreen ? "Exit Fullscreen" : "Full Screen"}</span>
          </button>
          {unreadCount > 0 && (
            <button className="action-btn-mark-all" onClick={handleMarkAll}>
              <CheckCheck size={16} />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          )}
          <button className="action-btn-refresh" onClick={() => showToast('Feed refreshed.')}>
            <RefreshCw size={15} />
            <span>Sync Feed</span>
          </button>
        </div>
      </div>

      {/* ─── Telemetry Metrics Strip (Full Width 5-Card Layout) ─────── */}
      <div className="metrics-summary-strip">
        <div 
          className={`metric-stat-card ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          <div className="metric-header-row">
            <span className="metric-name">All Signals</span>
            <div className="metric-icon-box slate"><Bell size={16} /></div>
          </div>
          <div className="metric-number-val">{allNotifications.length}</div>
          <span className="metric-sub-label">Total historical stream</span>
        </div>

        <div 
          className={`metric-stat-card ${filterType === 'unread' ? 'active' : ''}`}
          onClick={() => setFilterType('unread')}
        >
          <div className="metric-header-row">
            <span className="metric-name">Unread Alerts</span>
            <div className="metric-icon-box rose"><AlertCircle size={16} /></div>
          </div>
          <div className="metric-number-val" style={{ color: unreadCount > 0 ? '#DC2626' : 'inherit' }}>
            {unreadCount}
          </div>
          <span className="metric-sub-label">Requires merchant action</span>
        </div>

        <div 
          className={`metric-stat-card ${filterType === 'order' ? 'active' : ''}`}
          onClick={() => setFilterType('order')}
        >
          <div className="metric-header-row">
            <span className="metric-name">Orders & Requests</span>
            <div className="metric-icon-box indigo"><ShoppingBag size={16} /></div>
          </div>
          <div className="metric-number-val">{orderCount}</div>
          <span className="metric-sub-label">Kitchen prep & packaging</span>
        </div>

        <div 
          className={`metric-stat-card ${filterType === 'delivery' ? 'active' : ''}`}
          onClick={() => setFilterType('delivery')}
        >
          <div className="metric-header-row">
            <span className="metric-name">Courier & Dispatch</span>
            <div className="metric-icon-box emerald"><Truck size={16} /></div>
          </div>
          <div className="metric-number-val">{deliveryCount}</div>
          <span className="metric-sub-label">Batch coordination</span>
        </div>

        <div 
          className={`metric-stat-card ${filterType === 'alert' ? 'active' : ''}`}
          onClick={() => setFilterType('alert')}
        >
          <div className="metric-header-row">
            <span className="metric-name">Inventory & SLA</span>
            <div className="metric-icon-box amber"><AlertTriangle size={16} /></div>
          </div>
          <div className="metric-number-val">{alertCount}</div>
          <span className="metric-sub-label">Threshold limits</span>
        </div>
      </div>

      {/* ─── Search & Filter Toolbar (Full Width) ───────────────────── */}
      <div className="notif-toolbar-card">
        <div className="search-box-wrapper">
          <Search size={16} className="search-icon-svg" />
          <input 
            type="text" 
            placeholder="Search notifications by keyword, order ID, batch number, or customer name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-field"
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-chips-strip">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'order', label: 'Orders' },
            { id: 'delivery', label: 'Deliveries' },
            { id: 'alert', label: 'Alerts' },
            { id: 'system', label: 'System' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`filter-chip-btn ${filterType === tab.id ? 'active' : ''}`}
              onClick={() => setFilterType(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Chronological Feed Stream (Full Width Cards) ───────────── */}
      <div className="notif-feed-container">
        {filteredNotifications.length === 0 ? (
          <div className="empty-notif-feed-card">
            <div className="empty-icon-circle">
              <CheckCircle2 size={36} color="#10B981" />
            </div>
            <h3 className="empty-title">All Caught Up!</h3>
            <p className="empty-desc">
              {searchQuery 
                ? `No notifications matched your search "${searchQuery}".` 
                : 'There are no active notifications matching the selected filter criteria.'}
            </p>
            {searchQuery && (
              <button className="reset-filter-btn" onClick={() => { setSearchQuery(''); setFilterType('all'); }}>
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          ['Today', 'Yesterday', 'Earlier'].map(groupName => {
            const items = groupedNotifications[groupName];
            if (!items || items.length === 0) return null;

            return (
              <div key={groupName} className="notif-timeline-group">
                <div className="timeline-group-header">
                  <span className="timeline-badge-pill">{groupName}</span>
                  <div className="timeline-divider-line" />
                  <span className="timeline-items-count">{items.length} {items.length === 1 ? 'signal' : 'signals'}</span>
                </div>

                <div className="timeline-cards-list">
                  {items.map(notif => {
                    const theme = getTheme(notif.type);

                    return (
                      <div 
                        key={notif.id} 
                        className={`stream-signal-card ${!notif.isRead ? 'is-unread' : ''}`}
                      >
                        {/* Left accent border line */}
                        <div className="card-accent-strip" style={{ background: theme.color }} />

                        {/* Icon squircle */}
                        <div 
                          className="signal-icon-box"
                          style={{ background: theme.bg, color: theme.color, borderColor: theme.border }}
                        >
                          {theme.icon}
                        </div>

                        {/* Content Body */}
                        <div className="signal-content-body">
                          <div className="signal-header-row">
                            <div className="signal-title-group">
                              <h4 className="signal-title-text">{notif.title}</h4>
                              <span className={`signal-type-tag ${theme.badgeClass}`}>
                                {theme.tag}
                              </span>
                              {!notif.isRead && (
                                <span className="new-badge-dot">● New</span>
                              )}
                            </div>
                            <span className="signal-timestamp">
                              <Clock size={12} /> {getTimeAgo(notif.date)}
                            </span>
                          </div>

                          <p className="signal-message-text">{notif.message}</p>

                          <div className="signal-footer-actions">
                            {!notif.isRead ? (
                              <button 
                                className="action-pill-btn acknowledge"
                                onClick={() => handleAcknowledge(notif.id)}
                              >
                                <Check size={13} /> Mark as Read
                              </button>
                            ) : (
                              <span className="acknowledged-status-chip">
                                ✓ Acknowledged
                              </span>
                            )}

                            <button 
                              className="action-pill-btn dismiss"
                              onClick={() => handleDismiss(notif.id)}
                              title="Dismiss notification"
                            >
                              <X size={13} /> Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SellerNotificationsPage;
