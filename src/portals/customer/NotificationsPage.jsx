import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Bell, Info, Package, Truck } from 'lucide-react';
import './OrdersPage.css';

const NotificationsPage = () => {
  const { notifications } = useAppContext();

  const getIcon = (type) => {
    switch(type) {
      case 'delivery': return <Truck size={20} className="text-primary" />;
      case 'order': return <Package size={20} className="text-warning" />;
      default: return <Info size={20} className="text-secondary" />;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Notifications</h2>
          <p>Stay updated with the latest system and delivery events.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--spacing-4)' }}>
        {notifications.length === 0 ? (
          <p className="empty-state">No new notifications.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {notifications.map(notif => (
              <div key={notif.id} className="flex items-start gap-4 p-4 border-b border-border last-of-type-no-border" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                <div className="bg-background p-2 rounded-full">
                  {getIcon(notif.type)}
                </div>
                <div>
                  <p className="font-medium">{notif.message}</p>
                  <span className="text-sm text-secondary">{new Date(notif.date).toLocaleString()}</span>
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
