import React, { useState, useMemo } from 'react';
import { 
  Bell, Check, Trash2, CheckCircle2, AlertTriangle, Truck, 
  CreditCard, Sliders, Volume2, ShieldCheck, Mail, Sparkles, X 
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import PageHeader from '../../components/delivery/PageHeader';
import EmptyState from '../../components/delivery/EmptyState';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const { 
    notifications, markNotificationAsRead, markAllNotificationsAsRead, 
    deleteNotification, clearAllNotifications, addToast 
  } = useDelivery();

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'UNREAD' | 'ASSIGNMENTS' | 'SYSTEM'
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  // Preference toggles
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  // Filter by tab
  const filteredNotifications = useMemo(() => {
    return (notifications || []).filter(item => {
      if (activeTab === 'UNREAD') return !item.isRead;
      if (activeTab === 'ASSIGNMENTS') return item.type === 'assignment';
      if (activeTab === 'SYSTEM') return item.type === 'system' || item.type === 'alert' || item.type === 'payout';
      return true;
    });
  }, [notifications, activeTab]);

  // Group by Today, Yesterday, Earlier
  const groupedNotifications = useMemo(() => {
    const groups = { Today: [], Yesterday: [], Earlier: [] };
    filteredNotifications.forEach(n => {
      const g = n.group || 'Today';
      if (groups[g]) groups[g].push(n);
      else groups.Earlier.push(n);
    });
    return groups;
  }, [filteredNotifications]);

  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <Truck size={17} className="text-primary" />;
      case 'alert':
        return <AlertTriangle size={17} className="text-warning" />;
      case 'payout':
        return <CreditCard size={17} className="text-success" />;
      default:
        return <Bell size={17} className="text-info" />;
    }
  };

  const handleSimulateNewNotification = () => {
    const newId = `notif-${Date.now()}`;
    addToast('New assignment dispatch notification simulated!', 'info');
  };

  return (
    <div className="dl-notifications-page">
      <PageHeader
        breadcrumbs={['Account', 'Inbox']}
        title="Notifications Center"
        subtitle={`Stay informed about live dispatch batches, shift alerts, and daily payouts`}
        badge={unreadCount > 0 ? `${unreadCount} Unread` : 'All Read'}
        actions={
          <div className="notif-header-actions">
            <button
              type="button"
              className="dl-btn dl-btn-secondary"
              onClick={() => setShowPreferencesModal(true)}
            >
              <Sliders size={15} />
              <span>Preferences</span>
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                className="dl-btn dl-btn-secondary"
                onClick={markAllNotificationsAsRead}
              >
                <Check size={15} />
                <span>Mark All Read</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                className="dl-btn dl-btn-secondary text-danger"
                onClick={clearAllNotifications}
              >
                <Trash2 size={15} />
                <span>Clear All</span>
              </button>
            )}
          </div>
        }
      >
        {/* Navigation Tabs */}
        <div className="notif-tabs-strip">
          {[
            { id: 'ALL', label: 'All', count: notifications.length },
            { id: 'UNREAD', label: 'Unread', count: unreadCount },
            { id: 'ASSIGNMENTS', label: 'Assignments', count: notifications.filter(n => n.type === 'assignment').length },
            { id: 'SYSTEM', label: 'System & Alerts', count: notifications.filter(n => n.type !== 'assignment').length }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`notif-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.label}</span>
              <span className="notif-tab-badge dl-tabular">{tab.count}</span>
            </button>
          ))}
        </div>
      </PageHeader>

      {/* Main Notifications Grouped Stream */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description="There are no notifications matching the current filter. New dispatch assignments and alerts will arrive in real-time."
          primaryAction={{
            label: "Reset to All",
            onClick: () => setActiveTab('ALL')
          }}
        />
      ) : (
        <div className="notif-stream-container">
          {Object.entries(groupedNotifications).map(([groupTitle, items]) => {
            if (items.length === 0) return null;

            return (
              <div key={groupTitle} className="notif-group-section">
                <div className="group-heading-row">
                  <span className="group-heading-title">{groupTitle}</span>
                  <span className="group-heading-count">({items.length})</span>
                </div>

                <div className="dl-card notif-items-card">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`notif-stream-item ${!item.isRead ? 'is-unread' : ''}`}
                      onClick={() => !item.isRead && markNotificationAsRead(item.id)}
                    >
                      {/* Left: Icon & Unread Indicator */}
                      <div className="notif-icon-col">
                        <div className="notif-type-icon-box">
                          {getTypeIcon(item.type)}
                        </div>
                        {!item.isRead && <span className="notif-unread-dot" />}
                      </div>

                      {/* Content Body */}
                      <div className="notif-content-body">
                        <div className="notif-title-row">
                          <h4 className="item-title">{item.title}</h4>
                          <span className="item-timestamp dl-tabular">{item.timestamp}</span>
                        </div>
                        <p className="item-desc">{item.description}</p>
                      </div>

                      {/* Hover Actions */}
                      <div className="notif-hover-actions" onClick={e => e.stopPropagation()}>
                        {!item.isRead && (
                          <button
                            type="button"
                            className="item-hover-btn"
                            onClick={() => markNotificationAsRead(item.id)}
                            title="Mark as read"
                            aria-label="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="item-hover-btn text-danger"
                          onClick={() => deleteNotification(item.id)}
                          title="Delete notification"
                          aria-label="Delete notification"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferencesModal && (
        <div className="pref-modal-backdrop" onClick={() => setShowPreferencesModal(false)}>
          <div className="pref-modal-card" onClick={e => e.stopPropagation()}>
            <div className="pref-modal-header">
              <div className="pref-title-box">
                <Sliders size={18} className="text-primary" />
                <h3 className="pref-title dl-heading">Notification Preferences</h3>
              </div>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setShowPreferencesModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="pref-modal-body">
              <div className="pref-toggle-row">
                <div className="pref-toggle-text">
                  <span className="pref-label">Push Dispatch Notifications</span>
                  <span className="pref-sub">Instant alerts for newly assigned delivery batches</span>
                </div>
                <input
                  type="checkbox"
                  checked={pushEnabled}
                  onChange={e => setPushEnabled(e.target.checked)}
                  className="pref-switch"
                />
              </div>

              <div className="pref-toggle-row">
                <div className="pref-toggle-text">
                  <span className="pref-label">Sound & Haptic Feedback</span>
                  <span className="pref-sub">Audio chime when approaching customer delivery stop</span>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={e => setSoundEnabled(e.target.checked)}
                  className="pref-switch"
                />
              </div>

              <div className="pref-toggle-row">
                <div className="pref-toggle-text">
                  <span className="pref-label">Daily Shift Summary Email</span>
                  <span className="pref-sub">EOD report sent to connected agent email address</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailDigest}
                  onChange={e => setEmailDigest(e.target.checked)}
                  className="pref-switch"
                />
              </div>
            </div>

            <div className="pref-modal-footer">
              <button
                type="button"
                className="dl-btn dl-btn-primary w-full"
                onClick={() => {
                  setShowPreferencesModal(false);
                  addToast('Notification preferences updated', 'success');
                }}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
