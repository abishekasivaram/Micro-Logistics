import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Bell, CheckCircle, Info, AlertTriangle, Layers } from 'lucide-react';
import '../seller/DashboardOverview.css';

const AdminNotificationsPage = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useAppContext();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>System & Logistics Notifications</h2>
          <p>Real-time notifications for order aggregation readiness, batch assignments, delivery alerts, and seller updates.</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline" onClick={markAllNotificationsAsRead}>
            Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      <div className="card" style={{ padding: '20px' }}>
        {notifications.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px' }}>
            No notifications available.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map(n => (
              <div 
                key={n.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '14px 18px', 
                  borderRadius: '10px', 
                  background: n.isRead ? '#ffffff' : '#eff6ff', 
                  border: `1px solid ${n.isRead ? '#e2e8f0' : '#bfdbfe'}`,
                  transition: 'background 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ color: n.type === 'aggregation' ? '#2563eb' : n.type === 'delivery' ? '#16a34a' : '#64748b' }}>
                    {n.type === 'aggregation' ? <Layers size={22} /> : n.type === 'delivery' ? <CheckCircle size={22} /> : <Bell size={22} />}
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#1e293b' }}>{n.message}</strong>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(n.date).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!n.isRead && (
                  <button className="btn btn-sm btn-outline" onClick={() => markNotificationAsRead(n.id)}>
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
