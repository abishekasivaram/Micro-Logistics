import React from 'react';
import './OrdersPage.css';

const SettingsPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p>Manage your account and application preferences.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--spacing-6)', maxWidth: '600px' }}>
        <form className="flex flex-col gap-4">
          <div className="form-group flex flex-col gap-2">
            <label className="font-medium text-sm">Business Name</label>
            <input type="text" className="form-control p-2 border rounded" defaultValue="Fresh Mart" />
          </div>
          <div className="form-group flex flex-col gap-2">
            <label className="font-medium text-sm">Email Address</label>
            <input type="email" className="form-control p-2 border rounded" defaultValue="vendor@example.com" />
          </div>
          <div className="form-group flex flex-col gap-2">
            <label className="font-medium text-sm">Notification Preferences</label>
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Email alerts for new orders</label>
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> SMS alerts for delivery updates</label>
          </div>
          <button type="button" className="btn btn-primary mt-4" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
