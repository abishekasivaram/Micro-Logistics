import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Bell, Check } from 'lucide-react';

const NotificationsPage = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useAppContext();
  
  // Data Isolation: The global notifications currently don't have target audience ID perfectly mapped for all agents in sampleData
  // For the sake of demonstration, we'll filter them conceptually or just show system/delivery notifications.
  // In a real app, `notification.targetId === currentUser.id` would be used.
  // Here we'll show delivery and system notifications as a proxy.
  const myNotifications = notifications.filter(n => n.type === 'delivery' || n.type === 'system');

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Notifications</h2>
          <p className="text-secondary">Updates on your deliveries and account</p>
        </div>
        <button 
          className="btn btn-outline" 
          onClick={markAllNotificationsAsRead}
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Check size={16} /> Mark all as read
        </button>
      </div>

      <div className="card" style={{ padding: '0' }}>
        {myNotifications.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {myNotifications.map((notif, index) => (
              <li 
                key={notif.id} 
                style={{ 
                  padding: '20px', 
                  borderBottom: index < myNotifications.length - 1 ? '1px solid #eee' : 'none',
                  backgroundColor: notif.isRead ? 'transparent' : '#f0f7ff',
                  display: 'flex',
                  gap: '15px',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ 
                  backgroundColor: notif.type === 'delivery' ? '#e6f2ff' : '#f8f9fa',
                  padding: '10px',
                  borderRadius: '50%',
                  color: notif.type === 'delivery' ? '#007bff' : '#6c757d'
                }}>
                  <Bell size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 5px 0', fontWeight: notif.isRead ? 'normal' : '500' }}>
                    {notif.message}
                  </p>
                  <span className="text-secondary text-sm">
                    {new Date(notif.date).toLocaleString()}
                  </span>
                </div>
                {!notif.isRead && (
                  <button 
                    className="btn-text-primary" 
                    onClick={() => markNotificationAsRead(notif.id)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-secondary" style={{ padding: '40px' }}>
            <Bell size={40} className="mx-auto mb-3 opacity-50" />
            <p>You have no new notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
