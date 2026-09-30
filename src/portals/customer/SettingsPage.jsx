import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Settings, Save, CheckCircle, Bell, Shield, Sliders } from 'lucide-react';
import './SettingsPage.css';

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
    <div className="settings-page-wrapper">
      <div className="settings-header">
        <h2>Account & Logistics Preferences</h2>
        <p>Manage your notification settings, default dispatch window, and profile contact details.</p>
      </div>

      {savedSuccess && (
        <div className="settings-success-alert" role="status">
          <CheckCircle size={20} />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <div className="premium-card">
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label htmlFor="settings-name" className="form-label">Account / Display Name</label>
            <input 
              type="text" 
              id="settings-name"
              className="premium-input" 
              value={settings.name}
              onChange={e => setSettings({ ...settings, name: e.target.value })}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="settings-email" className="form-label">Email Address</label>
            <input 
              type="email" 
              id="settings-email"
              className="premium-input" 
              value={settings.email}
              onChange={e => setSettings({ ...settings, email: e.target.value })}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="settings-phone" className="form-label">Phone Number</label>
            <input 
              type="tel" 
              id="settings-phone"
              className="premium-input" 
              value={settings.phone}
              onChange={e => setSettings({ ...settings, phone: e.target.value })}
              placeholder="e.g. 9876543210" 
            />
          </div>

          <div className="form-group">
            <label htmlFor="settings-window" className="form-label">Default Delivery Time Window</label>
            <select 
              id="settings-window"
              className="premium-input"
              style={{ cursor: 'pointer' }}
              value={settings.preferredWindow}
              onChange={e => setSettings({ ...settings, preferredWindow: e.target.value })}
            >
              <option value="9:00 AM – 1:00 PM">Morning Window (9:00 AM – 1:00 PM)</option>
              <option value="1:00 PM – 5:00 PM">Afternoon Window (1:00 PM – 5:00 PM)</option>
              <option value="5:00 PM – 9:00 PM">Evening Window (5:00 PM – 9:00 PM)</option>
            </select>
          </div>

          <div className="settings-divider"></div>

          <div className="form-group">
            <span className="notification-section-title">
              <span className="icon"><Bell size={18} /></span>
              Notifications & Logistics Alerts
            </span>
            
            <label htmlFor="settings-email-alerts" className={`premium-checkbox-label ${settings.emailAlerts ? 'active' : ''}`}>
              <input 
                id="settings-email-alerts"
                className="premium-checkbox"
                type="checkbox" 
                checked={settings.emailAlerts}
                onChange={e => setSettings({ ...settings, emailAlerts: e.target.checked })} 
              /> 
              <span>Email updates for batch dispatch and order confirmations</span>
            </label>

            <label htmlFor="settings-sms-alerts" className={`premium-checkbox-label ${settings.smsAlerts ? 'active' : ''}`}>
              <input 
                id="settings-sms-alerts"
                className="premium-checkbox"
                type="checkbox" 
                checked={settings.smsAlerts}
                onChange={e => setSettings({ ...settings, smsAlerts: e.target.checked })} 
              /> 
              <span>SMS notifications with OTP on delivery arrival</span>
            </label>

            <label htmlFor="settings-auto-agg" className={`premium-checkbox-label ${settings.autoAggregatedGrouping ? 'active' : ''}`}>
              <input 
                id="settings-auto-agg"
                className="premium-checkbox"
                type="checkbox" 
                checked={settings.autoAggregatedGrouping}
                onChange={e => setSettings({ ...settings, autoAggregatedGrouping: e.target.checked })} 
              /> 
              <span>Automatic aggregation for multi-seller orders in same time slot</span>
            </label>
          </div>

          <button type="submit" className="btn-save">
            <Save size={18} /> Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
