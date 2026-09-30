import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Bell, Truck, Package, Info, AlertTriangle, X } from 'lucide-react';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const { notifications: rawNotifications } = useAppContext();
  
  // Use local state to allow dismissals
  const [notifications, setNotifications] = useState(
    rawNotifications.length > 0 ? rawNotifications : [
      { id: '1', type: 'alert', title: 'Low stock alert', message: 'You have 2 units of Aashirvaad Atta left.', date: new Date(), unread: true },
      { id: '2', type: 'order', title: 'New order placed', message: 'Order ORD-1092 was just placed by Rahul.', date: new Date(Date.now() - 3600000), unread: true },
      { id: '3', type: 'delivery', title: 'Batch created', message: '4 orders combined for RS Puram delivery.', date: new Date(Date.now() - 86400000), unread: false },
      { id: '4', type: 'system', title: 'Platform update', message: 'We have updated our terms of service.', date: new Date(Date.now() - 172800000), unread: false }
    ]
  );

  const handleDismiss = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'delivery': return <Truck size={18} />;
      case 'order': return <Package size={18} />;
      case 'alert': return <AlertTriangle size={18} />;
      default: return <Info size={18} />;
    }
  };

  const getTimeAgo = (dateStr) => {
    const d = new Date(dateStr);
    const diff = Math.floor((new Date() - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Group notifications by day
  const grouped = notifications.reduce((acc, notif) => {
    const notifDate = new Date(notif.date);
    const today = new Date();
    const isToday = notifDate.toDateString() === today.toDateString();
    
    let group = isToday ? 'Today' : 'Earlier';
    if (!isToday && (today - notifDate) < 86400000 * 2) {
        group = 'Yesterday';
    }

    if (!acc[group]) acc[group] = [];
    acc[group].push(notif);
    return acc;
  }, {});

  const groups = ['Today', 'Yesterday', 'Earlier'].filter(g => grouped[g]);

  return (
    <div className="notifications-page-container">
      <div className="notifications-feed">
        <div className="notif-header-row">
          <h1 className="notif-title">Notifications</h1>
          {notifications.some(n => n.unread) && (
            <button className="mark-read-btn" onClick={markAllRead}>Mark all as read</button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="empty-notifications">
            <Bell size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '16px', color: 'var(--text)', margin: '0 0 8px 0' }}>All caught up!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>You have no new notifications.</p>
          </div>
        ) : (
          groups.map(group => (
            <div key={group} className="notif-group">
              <h4 className="notif-group-title">{group}</h4>
              {grouped[group].map(notif => (
                <div key={notif.id} className="notif-card">
                  {notif.unread && <div className="notif-unread-dot"></div>}
                  <div className={`notif-icon-circle ${notif.type}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="notif-content">
                    <h4 className="notif-headline">{notif.title || (notif.type === 'order' ? 'Order Update' : 'System Alert')}</h4>
                    <p className="notif-message">{notif.message}</p>
                    <div className="notif-time">{getTimeAgo(notif.date)}</div>
                  </div>
                  <button className="notif-dismiss" onClick={() => handleDismiss(notif.id)}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
