import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Bell, Truck, Package, Info, AlertTriangle, X, Sparkles, CheckCircle2 } from 'lucide-react';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const { notifications: rawNotifications = [] } = useAppContext();
  
  // Customer-centric default notifications
  const defaultCustomerNotifications = useMemo(() => [
    { 
      id: 'cn-1', 
      type: 'order', 
      title: 'Order Confirmed', 
      message: 'Your order #ORD-1092 from Amudham Daily has been confirmed and is being packed.', 
      date: new Date(Date.now() - 1000 * 60 * 18).toISOString(), 
      unread: true 
    },
    { 
      id: 'cn-2', 
      type: 'delivery', 
      title: 'Out for Delivery', 
      message: 'Agent DA014 has picked up your package and is on the way. Estimated arrival in 18 mins.', 
      date: new Date(Date.now() - 1000 * 60 * 50).toISOString(), 
      unread: true 
    },
    { 
      id: 'cn-3', 
      type: 'deal', 
      title: 'Smart Aggregation Discount', 
      message: 'Your order was grouped with 2 neighborhood deliveries in Adyar — you saved ₹25 on delivery fees!', 
      date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), 
      unread: false 
    },
    { 
      id: 'cn-4', 
      type: 'alert', 
      title: 'Favorite Item Restocked', 
      message: 'Good news! Aashirvaad Whole Wheat Atta 5kg is back in stock at Amudham Daily.', 
      date: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), 
      unread: false 
    },
    { 
      id: 'cn-5', 
      type: 'order', 
      title: 'Order Delivered', 
      message: 'Order #ORD-1088 has been safely delivered to your doorstep. Rate your experience!', 
      date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), 
      unread: false 
    },
    { 
      id: 'cn-6', 
      type: 'system', 
      title: 'Platform Update', 
      message: 'Live interactive GPS delivery route tracking is now active for all your hyper-local neighborhood deliveries.', 
      date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), 
      unread: false 
    }
  ], []);

  // Filter rawNotifications to exclude vendor-internal stock or courier operational telemetry
  const initialNotifications = useMemo(() => {
    const valid = (rawNotifications || []).filter(n => {
      const msg = (n.message || '').toLowerCase();
      const title = (n.title || '').toLowerCase();
      // Exclude seller inventory counts or other customers' placement notifications
      if (
        msg.includes('units left') || 
        msg.includes('units of') || 
        msg.includes('placed by') || 
        msg.includes('reorder threshold') ||
        title.includes('low stock alert')
      ) {
        return false;
      }
      return true;
    });
    return valid.length > 0 ? valid : defaultCustomerNotifications;
  }, [rawNotifications, defaultCustomerNotifications]);

  // Use local state to allow dismissals and marking as read
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleDismiss = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'delivery': return <Truck size={18} />;
      case 'order': return <Package size={18} />;
      case 'deal': return <Sparkles size={18} />;
      case 'alert': return <Bell size={18} />;
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
