import React, { useState, useEffect } from 'react';
import { 
  User, Phone, MapPin, Truck, ShieldCheck, Star, 
  Calendar, FileText, Lock, Globe, Bell, Compass, 
  Save, AlertTriangle, Upload, Check, RotateCcw, Smartphone, Laptop
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import PageHeader from '../../components/delivery/PageHeader';
import DeliveryStatusBadge from '../../components/delivery/DeliveryStatusBadge';
import './DeliveryProfilePage.css';

const DeliveryProfilePage = () => {
  const { agentProfile, updateProfileFields, updateAgentAvailability, theme, toggleTheme, addToast } = useDelivery();

  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'vehicle' | 'performance' | 'preferences' | 'security'

  // Editable Form State
  const initialForm = {
    name: agentProfile?.name || 'David Anand',
    phone: agentProfile?.phone || '+91 98401 23456',
    email: agentProfile?.email || 'david.anand@micrologi.com',
    emergencyContact: '+91 94440 99887 (Brother)',
    currentArea: agentProfile?.currentArea || 'T. Nagar & Central Chennai',
    bloodGroup: 'O+ Positive',
    vehicleType: agentProfile?.vehicle?.type || 'Electric Cargo Scooter',
    vehiclePlate: agentProfile?.vehicle?.plateNumber || 'TN-01-AB-1234',
    defaultMapApp: agentProfile?.preferences?.defaultMapApp || 'Google Maps',
    language: agentProfile?.preferences?.language || 'English (IN)'
  };

  const [form, setForm] = useState(initialForm);
  const [isDirty, setIsDirty] = useState(false);

  const handleFieldChange = (key, val) => {
    setForm(prev => {
      const next = { ...prev, [key]: val };
      // Check if dirty
      const hasChanged = Object.keys(initialForm).some(k => next[k] !== initialForm[k]);
      setIsDirty(hasChanged);
      return next;
    });
  };

  const handleDiscard = () => {
    setForm(initialForm);
    setIsDirty(false);
    addToast('Changes discarded', 'neutral');
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    updateProfileFields({
      name: form.name,
      phone: form.phone,
      email: form.email,
      currentArea: form.currentArea,
      vehicle: {
        ...agentProfile.vehicle,
        type: form.vehicleType,
        plateNumber: form.vehiclePlate
      },
      preferences: {
        ...agentProfile.preferences,
        defaultMapApp: form.defaultMapApp,
        language: form.language
      }
    });
    setIsDirty(false);
  };

  const availability = agentProfile?.availability || 'Available';

  return (
    <div className="dl-profile-page">
      <PageHeader
        breadcrumbs={['Account', 'Fleet Member']}
        title="Fleet Profile & Credentials"
        subtitle="Manage agent credentials, cargo vehicle telemetry, and dispatch preferences"
      />

      {/* Header Profile Card with Gradient Cover */}
      <div className="dl-card profile-hero-card">
        <div className="profile-cover-gradient" />

        <div className="profile-hero-content">
          {/* Avatar with Upload Simulation */}
          <div className="profile-avatar-wrapper">
            {agentProfile?.avatar ? (
              <img src={agentProfile.avatar} alt={agentProfile.name} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-fallback">{(agentProfile?.name || 'Da1').charAt(0)}</div>
            )}
            <button 
              type="button" 
              className="avatar-upload-overlay-btn" 
              title="Change Profile Photo"
              onClick={() => addToast('Photo upload dialog opened', 'info')}
            >
              <Upload size={14} />
            </button>
          </div>

          {/* Identity Meta */}
          <div className="profile-identity-col">
            <div className="identity-top-row">
              <h2 className="profile-agent-name dl-heading">{agentProfile?.name || 'David Anand (Da1)'}</h2>
              <span className="agent-id-pill">{agentProfile?.agentCode || 'DA-4091'}</span>
              <DeliveryStatusBadge status={availability} size="sm" />
            </div>

            <p className="profile-role-title">Delivery Fleet Operations • Central Logistics Hub</p>

            <div className="profile-badges-row">
              <div className="meta-chip">
                <Star size={14} className="star-icon text-warning" />
                <span className="font-semibold">{agentProfile?.rating || 4.95}</span>
                <span className="text-muted">({agentProfile?.ratingsCount || 382} reviews)</span>
              </div>
              <div className="meta-chip">
                <Calendar size={14} className="text-muted" />
                <span>Joined {agentProfile?.joinedDate || 'March 2024'}</span>
              </div>
              <div className="meta-chip">
                <Truck size={14} className="text-muted" />
                <span>{agentProfile?.vehicle?.plateNumber || 'TN-01-AB-1234'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="profile-tabs-nav">
        {[
          { id: 'personal', label: 'Personal Info', icon: User },
          { id: 'vehicle', label: 'Vehicle & Documents', icon: Truck },
          { id: 'performance', label: 'Performance', icon: Star },
          { id: 'preferences', label: 'Preferences', icon: Globe },
          { id: 'security', label: 'Security & Sessions', icon: Lock }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={`profile-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="profile-tab-content">
        {/* Tab 1: Personal Info */}
        {activeTab === 'personal' && (
          <div className="dl-card profile-form-card">
            <h3 className="section-box-title dl-heading">Personal Information</h3>
            <div className="profile-form-grid">
              <div className="form-group-item">
                <label className="field-label" htmlFor="prof-name">Full Legal Name</label>
                <input
                  id="prof-name"
                  type="text"
                  value={form.name}
                  onChange={e => handleFieldChange('name', e.target.value)}
                  className="dl-form-input"
                />
              </div>

              <div className="form-group-item">
                <label className="field-label" htmlFor="prof-phone">Registered Contact Phone</label>
                <input
                  id="prof-phone"
                  type="text"
                  value={form.phone}
                  onChange={e => handleFieldChange('phone', e.target.value)}
                  className="dl-form-input"
                />
              </div>

              <div className="form-group-item">
                <label className="field-label" htmlFor="prof-email">Email Address</label>
                <input
                  id="prof-email"
                  type="email"
                  value={form.email}
                  onChange={e => handleFieldChange('email', e.target.value)}
                  className="dl-form-input"
                />
              </div>

              <div className="form-group-item">
                <label className="field-label" htmlFor="prof-area">Assigned Service Area</label>
                <input
                  id="prof-area"
                  type="text"
                  value={form.currentArea}
                  onChange={e => handleFieldChange('currentArea', e.target.value)}
                  className="dl-form-input"
                />
              </div>

              <div className="form-group-item">
                <label className="field-label" htmlFor="prof-emergency">Emergency Contact</label>
                <input
                  id="prof-emergency"
                  type="text"
                  value={form.emergencyContact}
                  onChange={e => handleFieldChange('emergencyContact', e.target.value)}
                  className="dl-form-input"
                />
              </div>

              <div className="form-group-item">
                <label className="field-label" htmlFor="prof-blood">Blood Group (Medical Registry)</label>
                <input
                  id="prof-blood"
                  type="text"
                  value={form.bloodGroup}
                  onChange={e => handleFieldChange('bloodGroup', e.target.value)}
                  className="dl-form-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Vehicle & Documents */}
        {activeTab === 'vehicle' && (
          <div className="profile-docs-container">
            {/* Vehicle Details Card */}
            <div className="dl-card profile-form-card">
              <h3 className="section-box-title dl-heading">Fleet Cargo Vehicle</h3>
              <div className="profile-form-grid">
                <div className="form-group-item">
                  <label className="field-label" htmlFor="prof-veh-type">Vehicle Model & Type</label>
                  <input
                    id="prof-veh-type"
                    type="text"
                    value={form.vehicleType}
                    onChange={e => handleFieldChange('vehicleType', e.target.value)}
                    className="dl-form-input"
                  />
                </div>

                <div className="form-group-item">
                  <label className="field-label" htmlFor="prof-veh-plate">Registration Plate Number</label>
                  <input
                    id="prof-veh-plate"
                    type="text"
                    value={form.vehiclePlate}
                    onChange={e => handleFieldChange('vehiclePlate', e.target.value)}
                    className="dl-form-input"
                  />
                </div>
              </div>
            </div>

            {/* Regulatory Documents & Expiry Warnings */}
            <div className="dl-card profile-form-card">
              <h3 className="section-box-title dl-heading">KYC Verification & Regulatory Documents</h3>
              <div className="documents-list-grid">
                {/* Document 1: Driving License */}
                <div className="doc-item-card">
                  <div className="doc-icon-box">
                    <FileText size={20} className="text-primary" />
                  </div>
                  <div className="doc-meta-info">
                    <span className="doc-name">Commercial Driving License (MCWG/LMV)</span>
                    <span className="doc-number font-mono">{agentProfile?.documents?.licenseNumber}</span>
                    <span className="doc-status text-success">
                      <ShieldCheck size={13} /> Verified • Valid till Nov 2028
                    </span>
                  </div>
                  <button 
                    type="button" 
                    className="dl-btn dl-btn-secondary doc-btn"
                    onClick={() => addToast('Uploaded new license document', 'info')}
                  >
                    Replace
                  </button>
                </div>

                {/* Document 2: Insurance with EXPIRY WARNING */}
                <div className="doc-item-card is-warning-doc">
                  <div className="doc-icon-box box-warning">
                    <AlertTriangle size={20} className="text-warning" />
                  </div>
                  <div className="doc-meta-info">
                    <div className="doc-name-row">
                      <span className="doc-name">Third Party Cargo Insurance Policy</span>
                      <span className="expiry-warning-badge">Expires in 46 days</span>
                    </div>
                    <span className="doc-number font-mono">{agentProfile?.documents?.insurancePolicy}</span>
                    <span className="doc-status text-warning">
                      Renewal Required by Dec 15, 2026
                    </span>
                  </div>
                  <button 
                    type="button" 
                    className="dl-btn dl-btn-primary doc-btn"
                    onClick={() => addToast('Opening insurance renewal portal...', 'info')}
                  >
                    Renew Policy
                  </button>
                </div>

                {/* Document 3: PAN / Tax ID */}
                <div className="doc-item-card">
                  <div className="doc-icon-box">
                    <ShieldCheck size={20} className="text-success" />
                  </div>
                  <div className="doc-meta-info">
                    <span className="doc-name">Income Tax PAN Identification</span>
                    <span className="doc-number font-mono">{agentProfile?.documents?.pancardNumber}</span>
                    <span className="doc-status text-success">
                      Verified Identity on File
                    </span>
                  </div>
                  <span className="verified-check-tag">Verified</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Performance */}
        {activeTab === 'performance' && (
          <div className="profile-perf-container">
            <div className="dl-card profile-form-card">
              <h3 className="section-box-title dl-heading">Fleet Performance Telemetry</h3>
              <div className="perf-stats-strip">
                <div className="perf-stat-box">
                  <span className="perf-label">Customer Rating</span>
                  <span className="perf-val text-warning">4.95 ★</span>
                  <span className="perf-sub">382 total ratings</span>
                </div>
                <div className="perf-stat-box">
                  <span className="perf-label">On-Time Delivery</span>
                  <span className="perf-val text-success">98.4%</span>
                  <span className="perf-sub">+2.1% vs hub avg</span>
                </div>
                <div className="perf-stat-box">
                  <span className="perf-label">Completed Drops</span>
                  <span className="perf-val">428 orders</span>
                  <span className="perf-sub">Lifetime deliveries</span>
                </div>
                <div className="perf-stat-box">
                  <span className="perf-label">Average Drop Time</span>
                  <span className="perf-val">22.4 mins</span>
                  <span className="perf-sub">From merchant pickup</span>
                </div>
              </div>

              {/* Accolades */}
              <div className="perf-accolades-section">
                <span className="accolades-title">Customer Feedback Badges</span>
                <div className="accolades-pills">
                  <span className="accolade-chip">⚡ Lightning Fast Delivery (142)</span>
                  <span className="accolade-chip">🤝 Polite & Professional (210)</span>
                  <span className="accolade-chip">📦 Careful Package Handling (188)</span>
                  <span className="accolade-chip">🌧️ All-Weather Champion (65)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Preferences */}
        {activeTab === 'preferences' && (
          <div className="dl-card profile-form-card">
            <h3 className="section-box-title dl-heading">Application & Dispatch Preferences</h3>
            <div className="profile-form-grid">
              <div className="form-group-item">
                <label className="field-label">Interface Theme Mode</label>
                <div className="pref-theme-options">
                  <button
                    type="button"
                    className={`theme-choice-btn ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => { if (theme !== 'light') toggleTheme(); }}
                  >
                    <span>Light Mode</span>
                  </button>
                  <button
                    type="button"
                    className={`theme-choice-btn ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                  >
                    <span>Dark Mode (Tactical)</span>
                  </button>
                </div>
              </div>

              <div className="form-group-item">
                <label className="field-label" htmlFor="prof-map">Default Navigation App</label>
                <select
                  id="prof-map"
                  value={form.defaultMapApp}
                  onChange={e => handleFieldChange('defaultMapApp', e.target.value)}
                  className="dl-form-input"
                >
                  <option value="Google Maps">Google Maps</option>
                  <option value="Apple Maps">Apple Maps</option>
                  <option value="Waze">Waze</option>
                </select>
              </div>

              <div className="form-group-item">
                <label className="field-label" htmlFor="prof-lang">Display Language</label>
                <select
                  id="prof-lang"
                  value={form.language}
                  onChange={e => handleFieldChange('language', e.target.value)}
                  className="dl-form-input"
                >
                  <option value="English (IN)">English (India)</option>
                  <option value="Tamil">தமிழ் (Tamil)</option>
                  <option value="Hindi">हिन्दी (Hindi)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Security */}
        {activeTab === 'security' && (
          <div className="profile-security-container">
            <div className="dl-card profile-form-card">
              <h3 className="section-box-title dl-heading">Password & Authentication</h3>
              <div className="profile-form-grid">
                <div className="form-group-item">
                  <label className="field-label" htmlFor="sec-cur-pwd">Current Password</label>
                  <input
                    id="sec-cur-pwd"
                    type="password"
                    placeholder="••••••••••••"
                    className="dl-form-input"
                  />
                </div>
                <div className="form-group-item">
                  <label className="field-label" htmlFor="sec-new-pwd">New Password</label>
                  <input
                    id="sec-new-pwd"
                    type="password"
                    placeholder="At least 8 characters"
                    className="dl-form-input"
                  />
                </div>
              </div>
              <button 
                type="button" 
                className="dl-btn dl-btn-secondary mt-3"
                onClick={() => addToast('Password updated successfully', 'success')}
              >
                Update Password
              </button>
            </div>

            {/* Active Sessions */}
            <div className="dl-card profile-form-card">
              <h3 className="section-box-title dl-heading">Active Login Sessions</h3>
              <div className="active-sessions-list">
                <div className="session-item">
                  <Smartphone size={20} className="text-primary" />
                  <div className="session-info">
                    <span className="session-device">Agent Mobile App (Android 14)</span>
                    <span className="session-meta">Chennai, India • Active Now • IP: 106.51.24.12</span>
                  </div>
                  <span className="current-badge">Current Device</span>
                </div>
                <div className="session-item">
                  <Laptop size={20} className="text-muted" />
                  <div className="session-info">
                    <span className="session-device">Web Control Tower (Chrome / Windows)</span>
                    <span className="session-meta">Chennai, India • 2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Save Changes Bar (Appears ONLY when form is dirty!) */}
      {isDirty && (
        <div className="sticky-save-bar" role="alert" aria-live="assertive">
          <div className="save-bar-content">
            <div className="save-bar-message">
              <AlertTriangle size={18} className="text-warning" />
              <span>You have unsaved changes to your profile credentials.</span>
            </div>

            <div className="save-bar-actions">
              <button 
                type="button" 
                className="dl-btn dl-btn-secondary"
                onClick={handleDiscard}
              >
                <RotateCcw size={14} />
                <span>Discard</span>
              </button>

              <button 
                type="button" 
                className="dl-btn dl-btn-primary"
                onClick={handleSave}
              >
                <Save size={14} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryProfilePage;
