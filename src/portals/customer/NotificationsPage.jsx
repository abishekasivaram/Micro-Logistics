import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Bell, Info, Package, Truck, Clock } from 'lucide-react';
import './CustomerNotificationsPage.css';

const NotificationsPage = () => {
  const { notifications } = useAppContext();

  const getIcon = (type) => {
    switch(type) {
      case 'delivery': return <Truck size={24} />;
      case 'order': return <Package size={24} />;
      default: return <Info size={24} />;
    }
  };

  const getIconClass = (type) => {
    switch(type) {
      case 'delivery': return 'delivery';
      case 'order': return 'order';
      default: return 'system';
    }
  };

  return (
    <div className="customer-notifications-page page-container">
      <div className="notifications-header">
        <h2>Notifications</h2>
        <p>Stay updated with the latest system and smart delivery events.</p>
      </div>

      <div className="notifications-card">
        {notifications.length === 0 ? (
          <div className="empty-notifications">
            <Bell size={48} color="#94a3b8" style={{ margin: '0 auto', opacity: 0.5 }} />
            <p>You have no new notifications.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map(notif => (
              <div key={notif.id} className="notification-item">
                <div className={`notification-icon-wrap ${getIconClass(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="notification-content">
                  <p className="notification-message">{notif.message}</p>
                  <span className="notification-time">
                    <Clock size={12} /> {new Date(notif.date).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
