import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Settings, Save, CheckCircle, Bell, Shield, Sliders } from 'lucide-react';
import './OrdersPage.css';

const SettingsPage = () => {
  const { currentUser, updateUserProfile } = useAppContext();

  const [settings, setSettings] = useState({
    name: currentUser?.name || currentUser?.shopName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    preferredWindow: currentUser?.preferredWindow || '9:00 AM – 1:00 PM',
    emailAlerts: true,
    smsAlerts: true,
    autoAggregatedGrouping: true
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserProfile({
      name: settings.name,
      email: settings.email,
      phone: settings.phone,
      preferredWindow: settings.preferredWindow
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Account & Logistics Preferences</h2>
          <p>Manage your notification settings, default dispatch window, and profile contact details.</p>
        </div>
      </div>

      {savedSuccess && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          background: '#ecfdf5',
          border: '1px solid #6ee7b7',
          color: '#065f46',
          borderRadius: '10px',
          marginBottom: '20px',
          maxWidth: '640px'
        }} role="status">
          <CheckCircle size={18} />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <div className="card" style={{ padding: 'var(--spacing-6)', maxWidth: '640px' }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="form-group flex flex-col gap-2">
            <label htmlFor="settings-name" className="font-medium text-sm">Account / Display Name</label>
            <input 
              type="text" 
              id="settings-name"
              className="form-control" 
              value={settings.name}
              onChange={e => setSettings({ ...settings, name: e.target.value })}
              required 
            />
          </div>

          <div className="form-group flex flex-col gap-2">
            <label htmlFor="settings-email" className="font-medium text-sm">Email Address</label>
            <input 
              type="email" 
              id="settings-email"
              className="form-control" 
              value={settings.email}
              onChange={e => setSettings({ ...settings, email: e.target.value })}
              required 
            />
          </div>

          <div className="form-group flex flex-col gap-2">
            <label htmlFor="settings-phone" className="font-medium text-sm">Phone Number</label>
            <input 
              type="tel" 
              id="settings-phone"
              className="form-control" 
              value={settings.phone}
              onChange={e => setSettings({ ...settings, phone: e.target.value })}
              placeholder="e.g. 9876543210" 
            />
          </div>

          <div className="form-group flex flex-col gap-2">
            <label htmlFor="settings-window" className="font-medium text-sm">Default Delivery Time Window</label>
            <select 
              id="settings-window"
              className="form-control"
              value={settings.preferredWindow}
              onChange={e => setSettings({ ...settings, preferredWindow: e.target.value })}
            >
              <option value="9:00 AM – 1:00 PM">Morning Window (9:00 AM – 1:00 PM)</option>
              <option value="1:00 PM – 5:00 PM">Afternoon Window (1:00 PM – 5:00 PM)</option>
              <option value="5:00 PM – 9:00 PM">Evening Window (5:00 PM – 9:00 PM)</option>
            </select>
          </div>

          <div className="form-group flex flex-col gap-3 pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
            <span className="font-medium text-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bell size={16} className="text-primary" /> Notifications & Logistics Alerts
            </span>
            <label htmlFor="settings-email-alerts" className="flex items-center gap-2 cursor-pointer text-sm">
              <input 
                id="settings-email-alerts"
                type="checkbox" 
                checked={settings.emailAlerts}
                onChange={e => setSettings({ ...settings, emailAlerts: e.target.checked })} 
              /> 
              <span>Email updates for batch dispatch and order confirmations</span>
            </label>
            <label htmlFor="settings-sms-alerts" className="flex items-center gap-2 cursor-pointer text-sm">
              <input 
                id="settings-sms-alerts"
                type="checkbox" 
                checked={settings.smsAlerts}
                onChange={e => setSettings({ ...settings, smsAlerts: e.target.checked })} 
              /> 
              <span>SMS notifications with OTP on delivery arrival</span>
            </label>
            <label htmlFor="settings-auto-agg" className="flex items-center gap-2 cursor-pointer text-sm">
              <input 
                id="settings-auto-agg"
                type="checkbox" 
                checked={settings.autoAggregatedGrouping}
                onChange={e => setSettings({ ...settings, autoAggregatedGrouping: e.target.checked })} 
              /> 
              <span>Automatic aggregation for multi-seller orders in same time slot</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary mt-2 flex items-center gap-2" style={{ alignSelf: 'flex-start' }}>
            <Save size={16} /> Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
