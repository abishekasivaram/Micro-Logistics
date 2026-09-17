import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  Bell, CheckCircle2, Info, AlertTriangle, Layers, 
  Clock, Check, Filter, Sparkles, Truck 
} from 'lucide-react';
import './AdminNotificationsPage.css';

const AdminNotificationsPage = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useAppContext();
  const [filterType, setFilterType] = useState('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const aggCount = notifications.filter(n => n.type === 'aggregation').length;
  const delCount = notifications.filter(n => n.type === 'delivery').length;

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'unread') return !n.isRead;
    if (filterType === 'aggregation') return n.type === 'aggregation';
    if (filterType === 'delivery') return n.type === 'delivery';
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'aggregation':
        return <Layers size={18} />;
      case 'delivery':
        return <Truck size={18} />;
      case 'warning':
        return <AlertTriangle size={18} />;
      default:
        return <Bell size={18} />;
    }
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'aggregation':
        return { bg: '#EFF6FF', color: '#2563EB', tag: 'Aggregation Hub' };
      case 'delivery':
        return { bg: '#ECFDF5', color: '#059669', tag: 'Dispatch Event' };
      case 'warning':
        return { bg: '#FEF3C7', color: '#D97706', tag: 'Telemetry Alert' };
      default:
        return { bg: '#F1F5F9', color: '#475569', tag: 'System Signal' };
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2>System & Logistics Signals</h2>
            <span className="badge badge-primary">LIVE STREAM</span>
          </div>
          <p>Real-time audit log of automated batch clustering, courier assignments, and network alerts.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            className="btn btn-outline" 
            onClick={markAllNotificationsAsRead}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Check size={16} /> Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      <div className="notifications-container">
        {/* Signal Stats Grid */}
        <div className="notifications-stats-grid">
          <div className="notif-stat-card">
            <div className="notif-stat-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
              <Bell size={20} />
            </div>
            <div className="notif-stat-info">
              <span className="notif-stat-value">{notifications.length}</span>
              <span className="notif-stat-label">Total Signals</span>
            </div>
          </div>

          <div className="notif-stat-card">
            <div className="notif-stat-icon" style={{ background: '#FEF2F2', color: '#DC2626' }}>
              <AlertTriangle size={20} />
            </div>
            <div className="notif-stat-info">
              <span className="notif-stat-value">{unreadCount}</span>
              <span className="notif-stat-label">Pending Action</span>
            </div>
          </div>

          <div className="notif-stat-card">
            <div className="notif-stat-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
              <Layers size={20} />
            </div>
            <div className="notif-stat-info">
              <span className="notif-stat-value">{aggCount}</span>
              <span className="notif-stat-label">Batch Groupings</span>
            </div>
          </div>

          <div className="notif-stat-card">
            <div className="notif-stat-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
              <Truck size={20} />
            </div>
            <div className="notif-stat-info">
              <span className="notif-stat-value">{delCount}</span>
              <span className="notif-stat-label">Dispatches</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="notif-filter-bar">
          <div className="notif-filter-pills">
            <button 
              className={`notif-filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All Signals ({notifications.length})
            </button>
            <button 
              className={`notif-filter-btn ${filterType === 'unread' ? 'active' : ''}`}
              onClick={() => setFilterType('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button 
              className={`notif-filter-btn ${filterType === 'aggregation' ? 'active' : ''}`}
              onClick={() => setFilterType('aggregation')}
            >
              Batches ({aggCount})
            </button>
            <button 
              className={`notif-filter-btn ${filterType === 'delivery' ? 'active' : ''}`}
              onClick={() => setFilterType('delivery')}
            >
              Deliveries ({delCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="notif-list">
          {filteredNotifications.length === 0 ? (
            <div className="notif-empty-state">
              <div className="notif-empty-icon">
                <Sparkles size={28} />
              </div>
              <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)' }}>All Signals Cleared</h4>
              <p style={{ margin: 0, fontSize: '13px' }}>
                {filterType === 'unread' 
                  ? 'There are no pending unread notifications in the system buffer.' 
                  : 'No notification records match the active filter criteria.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map(n => {
              const style = getNotificationStyle(n.type);
              return (
                <div 
                  key={n.id} 
                  className={`notif-item ${n.isRead ? 'read' : 'unread'} type-${n.type || 'system'}`}
                >
                  <div className="notif-left">
                    <div 
                      className="notif-icon-box" 
                      style={{ background: style.bg, color: style.color }}
                    >
                      {getNotificationIcon(n.type)}
                    </div>
                    <div className="notif-content">
                      <span className="notif-title">{n.message}</span>
                      <div className="notif-meta">
                        <span 
                          className="notif-tag" 
                          style={{ background: style.bg, color: style.color }}
                        >
                          {style.tag}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {new Date(n.date).toLocaleString([], { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {!n.isRead && (
                          <span style={{ 
                            fontSize: '10px', 
                            fontWeight: '700', 
                            color: 'var(--accent-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            ● NEW
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="notif-actions">
                    {!n.isRead ? (
                      <button 
                        className="btn btn-sm btn-outline" 
                        onClick={() => markNotificationAsRead(n.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Check size={14} /> Acknowledge
                      </button>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} color="#10B981" /> Read
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
