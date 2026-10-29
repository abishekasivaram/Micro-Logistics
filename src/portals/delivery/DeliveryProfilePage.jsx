import React, { useState, useEffect } from 'react';
import { 
  User, Phone, MapPin, Truck, ShieldCheck, Star, 
  Calendar, FileText, Lock, Globe, Bell, Compass, 
  Save, AlertTriangle, Upload, Check, RotateCcw, Smartphone, Laptop,
  Zap, BatteryCharging, Clock, Award, PackageCheck, Sliders, Eye, EyeOff,
  Copy, CheckCircle2, ChevronRight, Activity, Wrench, Shield, AlertCircle,
  ExternalLink, Sparkles, Navigation, Fuel, Gauge, RefreshCw, Radio
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import PageHeader from '../../components/delivery/PageHeader';
import DeliveryStatusBadge from '../../components/delivery/DeliveryStatusBadge';
import './DeliveryProfilePage.css';

const DRIVER_AVATAR_PRESETS = [
  { id: 'p1', label: 'David A.', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250' },
  { id: 'p2', label: 'Ramesh K.', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250' },
  { id: 'p3', label: 'Arun S.', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250' },
  { id: 'p4', label: 'Karthik V.', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=250' }
];

const DeliveryProfilePage = () => {
  const { agentProfile, updateProfileFields, updateAgentAvailability, theme, toggleTheme, addToast } = useDelivery();

  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'vehicle' | 'docs' | 'performance' | 'preferences' | 'security'
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Security password toggles
  const [showCurPwd, setShowCurPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  // Terminal Quick PIN
  const [quickPin, setQuickPin] = useState('4091');
  const [isEditingPin, setIsEditingPin] = useState(false);

  // Editable Form State
  const initialForm = {
    name: agentProfile?.fullName || agentProfile?.name || 'Fleet Captain',
    phone: agentProfile?.phone || '+91 98401 23456',
    email: agentProfile?.email || 'agent@micrologi.com',
    emergencyContact: agentProfile?.emergencyContact || '+91 94440 99887 (Family)',
    currentArea: agentProfile?.currentArea || 'Chennai Delivery Area',
    bloodGroup: agentProfile?.bloodGroup || 'O+ Positive',
    residentialAddress: agentProfile?.residentialAddress || 'Chennai, Tamil Nadu',
    vehicleType: agentProfile?.vehicle?.type || 'Electric Cargo Scooter',
    vehicleModel: agentProfile?.vehicle?.model || 'Ather 450X Logistics Pro',
    vehiclePlate: agentProfile?.vehicle?.plateNumber || 'TN-07-CB-2041',
    depotHub: agentProfile?.depotHub || 'South Chennai Hub (Depot 01)',
    defaultMapApp: agentProfile?.preferences?.defaultMapApp || 'Google Maps',
    language: agentProfile?.preferences?.language || 'English (IN)',
    voiceGuidance: true,
    autoAcceptBatch: false,
    batterySaverMode: false,
    offlineCaching: true
  };

  const [form, setForm] = useState(initialForm);
  const [isDirty, setIsDirty] = useState(false);

  // Sync with context if agentProfile changes externally or new driver logs in
  useEffect(() => {
    if (agentProfile) {
      setForm({
        name: agentProfile.fullName || agentProfile.name || '',
        phone: agentProfile.phone || '',
        email: agentProfile.email || '',
        emergencyContact: agentProfile.emergencyContact || '+91 94440 99887 (Family)',
        currentArea: agentProfile.currentArea || 'Chennai Area',
        bloodGroup: agentProfile.bloodGroup || 'O+ Positive',
        residentialAddress: agentProfile.residentialAddress || '',
        vehicleType: agentProfile.vehicle?.type || 'Electric Cargo Scooter',
        vehicleModel: agentProfile.vehicle?.model || 'Cargo EV',
        vehiclePlate: agentProfile.vehicle?.plateNumber || '',
        depotHub: agentProfile.depotHub || 'Logistics Depot',
        defaultMapApp: agentProfile.preferences?.defaultMapApp || 'Google Maps',
        language: agentProfile.preferences?.language || 'English (IN)',
        voiceGuidance: true,
        autoAcceptBatch: false,
        batterySaverMode: false,
        offlineCaching: true
      });
      setIsDirty(false);
    }
  }, [
    agentProfile?.id,
    agentProfile?.username,
    agentProfile?.agentCode,
    agentProfile?.residentialAddress,
    agentProfile?.currentArea,
    agentProfile?.depotHub,
    agentProfile?.emergencyContact,
    agentProfile?.bloodGroup,
    agentProfile?.phone,
    agentProfile?.name
  ]);

  const handleFieldChange = (key, val) => {
    setForm(prev => {
      const next = { ...prev, [key]: val };
      const hasChanged = Object.keys(initialForm).some(k => next[k] !== initialForm[k]);
      setIsDirty(hasChanged);
      return next;
    });
  };

  const handleDiscard = () => {
    setForm(initialForm);
    setIsDirty(false);
    addToast('All unsaved changes discarded', 'neutral');
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      updateProfileFields({
        name: form.name,
        phone: form.phone,
        email: form.email,
        currentArea: form.currentArea,
        residentialAddress: form.residentialAddress,
        depotHub: form.depotHub,
        emergencyContact: form.emergencyContact,
        bloodGroup: form.bloodGroup,
        vehicle: {
          ...agentProfile?.vehicle,
          type: form.vehicleType,
          model: form.vehicleModel,
          plateNumber: form.vehiclePlate
        },
        preferences: {
          ...agentProfile?.preferences,
          defaultMapApp: form.defaultMapApp,
          language: form.language,
          voiceGuidance: form.voiceGuidance,
          autoAcceptBatch: form.autoAcceptBatch
        }
      });
      setIsDirty(false);
      setIsSaving(false);
    }, 350);
  };

  const handleCopyAgentId = () => {
    const code = agentProfile?.agentCode || 'DA-4091';
    navigator.clipboard?.writeText(code);
    setCopiedId(true);
    addToast(`Agent ID ${code} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleApplyAvatar = (url) => {
    updateProfileFields({ avatar: url });
    setShowPhotoPicker(false);
    setCustomPhotoUrl('');
    addToast('Profile avatar updated successfully', 'success');
  };

  const availability = agentProfile?.availability || 'Available';

  const availabilityOptions = [
    { id: 'Available', label: 'Available', color: '#10b981', desc: 'Accepting dispatches' },
    { id: 'On Break', label: 'On Break', color: '#f59e0b', desc: 'Pausing new orders' },
    { id: 'Offline', label: 'Offline', color: '#64748b', desc: 'Shift completed' }
  ];

  return (
    <div className="dl-profile-page-wrapper">
      {/* Top Breadcrumb & Heading */}
      <PageHeader
        breadcrumbs={['Account', 'Fleet Member']}
        title="Fleet Profile & Credentials"
        subtitle="Manage agent credentials, cargo vehicle telemetry, and dispatch preferences"
      />

      {/* ─── 1. REAL-TIME FLEET TELEMETRY RIBBON ───────────────────────── */}
      <div className="dl-fleet-telemetry-ribbon">
        {/* Card 1: Active Shift */}
        <div className="dl-telemetry-card">
          <div className="dl-telemetry-icon-box shift-icon">
            <Clock size={20} />
          </div>
          <div className="dl-telemetry-meta">
            <div className="dl-telemetry-top">
              <span className="dl-telemetry-label">Shift Duration</span>
              <span className="dl-status-chip online">
                <span className="dl-pulse-dot" /> On Duty
              </span>
            </div>
            <div className="dl-telemetry-value">4h 35m Active</div>
            <div className="dl-telemetry-sub">Shift started at 08:30 AM · {agentProfile?.depotHub || 'Logistics Hub'}</div>
          </div>
        </div>

        {/* Card 2: Today's Deliveries */}
        <div className="dl-telemetry-card">
          <div className="dl-telemetry-icon-box drop-icon">
            <PackageCheck size={20} />
          </div>
          <div className="dl-telemetry-meta">
            <div className="dl-telemetry-top">
              <span className="dl-telemetry-label">Today's Deliveries</span>
              <span className="dl-progress-badge">87.5%</span>
            </div>
            <div className="dl-telemetry-value">14 / 16 Drops</div>
            <div className="dl-telemetry-progress-bar">
              <div className="dl-telemetry-progress-fill" style={{ width: '87.5%' }} />
            </div>
            <div className="dl-telemetry-sub">2 pending drops remaining in {agentProfile?.currentArea || form.currentArea || 'assigned zone'}</div>
          </div>
        </div>

        {/* Card 3: Performance Score */}
        <div className="dl-telemetry-card">
          <div className="dl-telemetry-icon-box star-icon">
            <Award size={20} />
          </div>
          <div className="dl-telemetry-meta">
            <div className="dl-telemetry-top">
              <span className="dl-telemetry-label">Fleet Rating</span>
              <span className="dl-rank-pill">Top 5%</span>
            </div>
            <div className="dl-telemetry-value star-val">
              {agentProfile?.rating || 4.95} <span className="dl-star-symbol">★</span>
            </div>
            <div className="dl-telemetry-sub">382 customer ratings · Tier 1 Elite Bonus</div>
          </div>
        </div>

        {/* Card 4: Cargo Vehicle Telemetry */}
        <div className="dl-telemetry-card">
          <div className="dl-telemetry-icon-box ev-icon">
            <BatteryCharging size={20} />
          </div>
          <div className="dl-telemetry-meta">
            <div className="dl-telemetry-top">
              <span className="dl-telemetry-label">{form.vehicleModel || agentProfile?.vehicle?.model || 'Cargo EV'}</span>
              <span className="dl-battery-badge">82% EV</span>
            </div>
            <div className="dl-telemetry-value">46 km Est. Range</div>
            <div className="dl-telemetry-sub">32 PSI Tires · Next service in 850 km</div>
          </div>
        </div>
      </div>

      {/* ─── 2. HIGH-TECH FLEET HERO CARD ──────────────────────────────── */}
      <div className="dl-fleet-hero-card">
        {/* Cover Banner with Tech Grid Accent & Live Status Switcher */}
        <div className="dl-fleet-cover-banner">
          <div className="dl-cover-grid-overlay" />
          
          <div className="dl-cover-top-controls">
            <div className="dl-fleet-cluster-tag">
              <Radio size={14} className="dl-radio-blinking" />
              <span>{agentProfile?.clusterTag || 'CONNECTED: CHENNAI DISPATCH CLUSTER'}</span>
            </div>

            {/* Quick Shift Availability Switcher */}
            <div className="dl-availability-switcher">
              <span className="dl-switch-label">Shift Status:</span>
              <div className="dl-switch-buttons-group">
                {availabilityOptions.map(opt => {
                  const isCurrent = availability.toLowerCase() === opt.id.toLowerCase();
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`dl-avail-btn ${isCurrent ? 'active' : ''}`}
                      onClick={() => updateAgentAvailability(opt.id)}
                      title={opt.desc}
                    >
                      <span className="dl-btn-dot" style={{ backgroundColor: opt.color }} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Identity & Profile Bar */}
        <div className="dl-fleet-identity-section">
          {/* Avatar with Customization Trigger */}
          <div className="dl-avatar-container">
            <div className="dl-avatar-frame">
              {agentProfile?.avatar ? (
                <img 
                  src={agentProfile.avatar} 
                  alt={agentProfile.name || 'Fleet Agent'} 
                  className="dl-avatar-img"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="dl-avatar-initials">
                  {(agentProfile?.fullName || agentProfile?.name || 'Fleet Captain').charAt(0)}
                </div>
              )}
              <span className={`dl-avatar-status-dot ${availability.toLowerCase() === 'available' ? 'is-active' : ''}`} />
            </div>

            <button 
              type="button" 
              className="dl-avatar-edit-btn"
              onClick={() => setShowPhotoPicker(!showPhotoPicker)}
              title="Change Profile Photo"
            >
              <Upload size={13} />
              <span>Change</span>
            </button>

            {/* Photo Picker Popover */}
            {showPhotoPicker && (
              <div className="dl-avatar-picker-modal">
                <div className="dl-picker-header">
                  <span>Select Agent Photo</span>
                  <button type="button" className="dl-picker-close" onClick={() => setShowPhotoPicker(false)}>×</button>
                </div>
                <div className="dl-presets-grid">
                  {DRIVER_AVATAR_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      className="dl-preset-thumb-btn"
                      onClick={() => handleApplyAvatar(preset.url)}
                    >
                      <img src={preset.url} alt={preset.label} />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
                <div className="dl-custom-url-row">
                  <input
                    type="url"
                    placeholder="Or paste image URL..."
                    value={customPhotoUrl}
                    onChange={(e) => setCustomPhotoUrl(e.target.value)}
                    className="dl-picker-input"
                  />
                  <button
                    type="button"
                    disabled={!customPhotoUrl}
                    onClick={() => handleApplyAvatar(customPhotoUrl)}
                    className="dl-apply-url-btn"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Identity Meta */}
          <div className="dl-identity-details">
            <div className="dl-identity-title-row">
              <h2 className="dl-driver-name">{agentProfile?.fullName || agentProfile?.name || 'Fleet Captain'}</h2>
              
              <button 
                type="button" 
                className="dl-agent-code-chip" 
                onClick={handleCopyAgentId}
                title="Click to copy Agent Code"
              >
                <span className="dl-code-prefix">AGENT</span>
                <span className="dl-code-num">{agentProfile?.agentCode || 'DA-4091'}</span>
                {copiedId ? <Check size={12} className="text-success" /> : <Copy size={12} />}
              </button>

              <DeliveryStatusBadge status={availability} size="sm" />

              <span className="dl-verified-driver-badge">
                <ShieldCheck size={14} /> Tier 1 Fleet Partner
              </span>
            </div>

            <p className="dl-driver-subtitle">
              Commercial Delivery Operations • {agentProfile?.depotHub || form.depotHub || 'Logistics Depot'}
            </p>

            {/* Quick Meta Chips */}
            <div className="dl-driver-meta-strip">
              <div className="dl-chip-item">
                <Star size={14} className="dl-chip-star" />
                <strong>{agentProfile?.rating || 4.95}</strong>
                <span className="text-muted">({agentProfile?.ratingsCount || 382} reviews)</span>
              </div>
              <div className="dl-chip-item">
                <Calendar size={14} />
                <span>Active Member since {agentProfile?.joinedDate || 'March 2024'}</span>
              </div>
              <div className="dl-chip-item">
                <Truck size={14} />
                <span>{form.vehiclePlate || 'TN-01-AB-1234'} ({form.vehicleType})</span>
              </div>
              <div className="dl-chip-item">
                <MapPin size={14} />
                <span>{form.currentArea || agentProfile?.currentArea || 'Assigned Corridor'}</span>
              </div>
            </div>
          </div>

          {/* Right Action: SOS / Support */}
          <div className="dl-hero-right-actions">
            <button 
              type="button" 
              className="dl-support-hotline-btn"
              onClick={() => addToast('Connecting to Fleet Dispatch Control Tower...', 'info')}
            >
              <Phone size={14} />
              <span>Dispatch SOS: 1800-MICRO-LOGI</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 3. MODERN HORIZONTAL PILL TAB NAVIGATION ──────────────────── */}
      <div className="dl-nav-tabs-bar">
        {[
          { id: 'personal', label: 'Personal & Contact', icon: User },
          { id: 'vehicle', label: 'Cargo Vehicle & Telemetry', icon: Truck, badge: '82% EV' },
          { id: 'docs', label: 'KYC & Regulatory Docs', icon: FileText, warning: true },
          { id: 'performance', label: 'Performance & Accolades', icon: Award, badge: '4.95 ★' },
          { id: 'preferences', label: 'Dispatch Preferences', icon: Sliders },
          { id: 'security', label: 'Security & Device Sessions', icon: ShieldCheck, badge: '2 Active' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`dl-nav-tab-button ${isActive ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} className="dl-tab-icon" />
              <span className="dl-tab-text">{tab.label}</span>
              {tab.badge && <span className="dl-tab-badge">{tab.badge}</span>}
              {tab.warning && <span className="dl-tab-badge dl-warning-pill">1 Expiring</span>}
            </button>
          );
        })}
      </div>

      {/* ─── 4. TAB CONTENTS ───────────────────────────────────────────── */}
      <div className="dl-tab-main-panel">
        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: PERSONAL & CONTACT INFORMATION */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {activeTab === 'personal' && (
          <div className="dl-card dl-content-card">
            <div className="dl-card-header-row">
              <div>
                <h3 className="dl-card-title">Personal & Emergency Details</h3>
                <p className="dl-card-desc">Official KYC identity, dispatch hub assignment, and medical registry</p>
              </div>
              <div className="dl-card-header-badge">
                <ShieldCheck size={14} className="text-success" /> Government Verified Identity
              </div>
            </div>

            <form onSubmit={handleSave} className="dl-form-container">
              <div className="dl-form-grid-2col">
                {/* Full Name */}
                <div className="dl-field-group">
                  <label className="dl-label" htmlFor="prof-name">Full Legal Name *</label>
                  <div className="dl-input-wrapper">
                    <User size={16} className="dl-field-icon" />
                    <input
                      id="prof-name"
                      type="text"
                      value={form.name}
                      onChange={e => handleFieldChange('name', e.target.value)}
                      className="dl-text-input"
                      required
                    />
                  </div>
                  <span className="dl-field-hint">Must match your Commercial Driving License exactly</span>
                </div>

                {/* Agent Code (Readonly) */}
                <div className="dl-field-group">
                  <label className="dl-label">Fleet Agent ID (System Registered)</label>
                  <div className="dl-input-wrapper dl-input-readonly">
                    <Shield size={16} className="dl-field-icon" />
                    <input
                      type="text"
                      value={agentProfile?.agentCode || 'DA-4091'}
                      readOnly
                      className="dl-text-input readonly font-mono"
                    />
                    <button 
                      type="button" 
                      onClick={handleCopyAgentId} 
                      className="dl-inner-copy-btn"
                      title="Copy ID"
                    >
                      {copiedId ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <span className="dl-field-hint">Used for dispatch assignments and hub gate verification</span>
                </div>

                {/* Contact Phone */}
                <div className="dl-field-group">
                  <label className="dl-label" htmlFor="prof-phone">Registered Contact Phone *</label>
                  <div className="dl-input-wrapper">
                    <Phone size={16} className="dl-field-icon" />
                    <input
                      id="prof-phone"
                      type="tel"
                      value={form.phone}
                      onChange={e => handleFieldChange('phone', e.target.value)}
                      className="dl-text-input"
                      required
                    />
                  </div>
                  <span className="dl-field-hint">Used by merchants and customers for order delivery calls</span>
                </div>

                {/* Email Address */}
                <div className="dl-field-group">
                  <label className="dl-label" htmlFor="prof-email">Official Fleet Email *</label>
                  <div className="dl-input-wrapper">
                    <Globe size={16} className="dl-field-icon" />
                    <input
                      id="prof-email"
                      type="email"
                      value={form.email}
                      onChange={e => handleFieldChange('email', e.target.value)}
                      className="dl-text-input"
                      required
                    />
                  </div>
                  <span className="dl-field-hint">Payout invoices and weekly fleet earnings are sent here</span>
                </div>

                {/* Service Operating Area */}
                <div className="dl-field-group">
                  <label className="dl-label" htmlFor="prof-area">Assigned Service Zone / Area Hub *</label>
                  <div className="dl-input-wrapper">
                    <MapPin size={16} className="dl-field-icon" />
                    <input
                      id="prof-area"
                      type="text"
                      value={form.currentArea}
                      onChange={e => handleFieldChange('currentArea', e.target.value)}
                      className="dl-text-input"
                      required
                    />
                  </div>
                  <span className="dl-field-hint">Primary coverage cluster (Sub-25 min batch delivery radius)</span>
                </div>

                {/* Emergency Contact */}
                <div className="dl-field-group">
                  <label className="dl-label" htmlFor="prof-emergency">Emergency SOS Contact (Family) *</label>
                  <div className="dl-input-wrapper">
                    <AlertCircle size={16} className="dl-field-icon text-danger" />
                    <input
                      id="prof-emergency"
                      type="text"
                      value={form.emergencyContact}
                      onChange={e => handleFieldChange('emergencyContact', e.target.value)}
                      className="dl-text-input"
                      placeholder="+91 94440 99887 (Brother)"
                      required
                    />
                  </div>
                  <span className="dl-field-hint">Notified immediately if an on-road accident SOS is triggered</span>
                </div>

                {/* Blood Group */}
                <div className="dl-field-group">
                  <label className="dl-label" htmlFor="prof-blood">Blood Group (Medical Emergency Registry) *</label>
                  <div className="dl-input-wrapper">
                    <Activity size={16} className="dl-field-icon text-danger" />
                    <select
                      id="prof-blood"
                      value={form.bloodGroup}
                      onChange={e => handleFieldChange('bloodGroup', e.target.value)}
                      className="dl-select-input"
                    >
                      <option value="O+ Positive">O+ Positive (Universal Donor)</option>
                      <option value="O- Negative">O- Negative</option>
                      <option value="A+ Positive">A+ Positive</option>
                      <option value="A- Negative">A- Negative</option>
                      <option value="B+ Positive">B+ Positive</option>
                      <option value="B- Negative">B- Negative</option>
                      <option value="AB+ Positive">AB+ Positive</option>
                      <option value="AB- Negative">AB- Negative</option>
                    </select>
                  </div>
                  <span className="dl-field-hint">Printed on your physical MicroLogi Fleet Badge for trauma response</span>
                </div>

                {/* Residential Base Address */}
                <div className="dl-field-group">
                  <label className="dl-label" htmlFor="prof-res-addr">Residential Base Address</label>
                  <div className="dl-input-wrapper">
                    <MapPin size={16} className="dl-field-icon" />
                    <input
                      id="prof-res-addr"
                      type="text"
                      value={form.residentialAddress}
                      onChange={e => handleFieldChange('residentialAddress', e.target.value)}
                      className="dl-text-input"
                    />
                  </div>
                  <span className="dl-field-hint">Used by routing AI to optimize first pickup & end-of-shift return drop</span>
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="dl-form-footer-actions">
                <div className="dl-unsaved-indicator">
                  {isDirty ? (
                    <span className="dl-dirty-flag">
                      <AlertTriangle size={14} className="text-warning" /> Unsaved changes pending
                    </span>
                  ) : (
                    <span className="dl-saved-flag">
                      <CheckCircle2 size={14} className="text-success" /> All credentials synced with Fleet Cloud
                    </span>
                  )}
                </div>

                <div className="dl-buttons-cluster">
                  <button
                    type="button"
                    disabled={!isDirty}
                    onClick={handleDiscard}
                    className="dl-btn-secondary"
                  >
                    <RotateCcw size={15} /> Discard Changes
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving || !isDirty}
                    className="dl-btn-primary"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw size={15} className="dl-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save size={15} /> Save Profile Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: CARGO VEHICLE & TELEMETRY */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {activeTab === 'vehicle' && (
          <div className="dl-tab-section-stack">
            {/* Real-Time Vehicle Status Box */}
            <div className="dl-card dl-telematics-hero-card">
              <div className="dl-telematics-header">
                <div className="dl-vehicle-identity">
                  <div className="dl-vehicle-icon-ring">
                    <Truck size={24} />
                  </div>
                  <div>
                    <h3 className="dl-vehicle-model-name">{form.vehicleModel}</h3>
                    <div className="dl-vehicle-plate-pill">
                      <span className="dl-in-flag">IND</span>
                      <strong>{form.vehiclePlate}</strong>
                    </div>
                  </div>
                </div>

                <div className="dl-vehicle-health-badge">
                  <Zap size={15} className="text-success" />
                  <span>EV Powertrain Active · 100% Green Delivery</span>
                </div>
              </div>

              {/* Telematics Sensors Bar */}
              <div className="dl-telematics-sensors-grid">
                {/* Sensor 1: Battery Level */}
                <div className="dl-sensor-tile">
                  <div className="dl-sensor-top">
                    <span className="dl-sensor-label">High-Voltage Battery</span>
                    <BatteryCharging size={16} className="text-success" />
                  </div>
                  <div className="dl-sensor-main">
                    <span className="dl-sensor-val">82%</span>
                    <span className="dl-sensor-unit">(46 km range)</span>
                  </div>
                  <div className="dl-sensor-bar">
                    <div className="dl-sensor-bar-fill bg-success" style={{ width: '82%' }} />
                  </div>
                  <span className="dl-sensor-footnote">Fast Charger at {agentProfile?.depotHub || 'Depot'} (Available)</span>
                </div>

                {/* Sensor 2: Cargo Payload */}
                <div className="dl-sensor-tile">
                  <div className="dl-sensor-top">
                    <span className="dl-sensor-label">Rear Cargo Payload</span>
                    <PackageCheck size={16} className="text-primary" />
                  </div>
                  <div className="dl-sensor-main">
                    <span className="dl-sensor-val">14.2 kg</span>
                    <span className="dl-sensor-unit">/ 65 kg max</span>
                  </div>
                  <div className="dl-sensor-bar">
                    <div className="dl-sensor-bar-fill bg-primary" style={{ width: '22%' }} />
                  </div>
                  <span className="dl-sensor-footnote">3 parcels onboard · 3 open parcel slots</span>
                </div>

                {/* Sensor 3: Tire Pressure */}
                <div className="dl-sensor-tile">
                  <div className="dl-sensor-top">
                    <span className="dl-sensor-label">TPMS Tire Pressure</span>
                    <Gauge size={16} className="text-info" />
                  </div>
                  <div className="dl-sensor-main">
                    <span className="dl-sensor-val">32 / 36</span>
                    <span className="dl-sensor-unit">PSI</span>
                  </div>
                  <div className="dl-sensor-bar">
                    <div className="dl-sensor-bar-fill bg-info" style={{ width: '95%' }} />
                  </div>
                  <span className="dl-sensor-footnote">Front 32 PSI · Rear 36 PSI (Optimal)</span>
                </div>

                {/* Sensor 4: Maintenance */}
                <div className="dl-sensor-tile">
                  <div className="dl-sensor-top">
                    <span className="dl-sensor-label">Fleet Servicing Due</span>
                    <Wrench size={16} className="text-muted" />
                  </div>
                  <div className="dl-sensor-main">
                    <span className="dl-sensor-val">In 850 km</span>
                    <span className="dl-sensor-unit">(14,250 Odo)</span>
                  </div>
                  <div className="dl-sensor-bar">
                    <div className="dl-sensor-bar-fill bg-warning" style={{ width: '70%' }} />
                  </div>
                  <span className="dl-sensor-footnote">Scheduled Brake & Regenerative check</span>
                </div>
              </div>
            </div>

            {/* Editable Vehicle Spec Form */}
            <div className="dl-card dl-content-card">
              <h3 className="dl-card-title">Vehicle Registration & Equipment Specs</h3>
              <p className="dl-card-desc">Configure cargo vehicle parameters, designated depot, and cargo box capacity</p>

              <div className="dl-form-grid-2col mt-3">
                <div className="dl-field-group">
                  <label className="dl-label" htmlFor="prof-veh-type">Vehicle Category</label>
                  <div className="dl-input-wrapper">
                    <Truck size={16} className="dl-field-icon" />
                    <select
                      id="prof-veh-type"
                      value={form.vehicleType}
                      onChange={e => handleFieldChange('vehicleType', e.target.value)}
                      className="dl-select-input"
                    >
                      <option value="Electric Cargo Scooter">Electric Cargo Scooter (Ather / Ola S1 Pro)</option>
                      <option value="Electric 3-Wheeler Cargo">Electric 3-Wheeler Cargo (Euler HiLoad / Piaggio)</option>
                      <option value="Compact Electric Van">Compact Electric Van (Tata Ace EV)</option>
                      <option value="Standard Petrol Motorcycle">Standard Motorcycle (Honda Shine / Hero Splendor)</option>
                    </select>
                  </div>
                </div>

                <div className="dl-field-group">
                  <label className="dl-label" htmlFor="prof-veh-model">Vehicle Model & Trim</label>
                  <div className="dl-input-wrapper">
                    <Sliders size={16} className="dl-field-icon" />
                    <input
                      id="prof-veh-model"
                      type="text"
                      value={form.vehicleModel}
                      onChange={e => handleFieldChange('vehicleModel', e.target.value)}
                      className="dl-text-input"
                    />
                  </div>
                </div>

                <div className="dl-field-group">
                  <label className="dl-label" htmlFor="prof-veh-plate">Registration Plate (RTO Approved)</label>
                  <div className="dl-input-wrapper">
                    <ShieldCheck size={16} className="dl-field-icon" />
                    <input
                      id="prof-veh-plate"
                      type="text"
                      value={form.vehiclePlate}
                      onChange={e => handleFieldChange('vehiclePlate', e.target.value.toUpperCase())}
                      className="dl-text-input font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="dl-field-group">
                  <label className="dl-label" htmlFor="prof-veh-depot">Designated Charging & Storage Depot</label>
                  <div className="dl-input-wrapper">
                    <MapPin size={16} className="dl-field-icon" />
                    <input
                      id="prof-veh-depot"
                      type="text"
                      value={form.depotHub}
                      onChange={e => handleFieldChange('depotHub', e.target.value)}
                      className="dl-text-input"
                    />
                  </div>
                </div>
              </div>

              <div className="dl-form-footer-actions">
                <button
                  type="button"
                  disabled={!isDirty}
                  onClick={handleSave}
                  className="dl-btn-primary"
                >
                  <Save size={15} /> Save Vehicle Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: KYC & REGULATORY DOCUMENTS */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {activeTab === 'docs' && (
          <div className="dl-tab-section-stack">
            {/* Compliance Banner */}
            <div className="dl-card dl-compliance-banner">
              <div className="dl-compliance-icon">
                <ShieldCheck size={28} />
              </div>
              <div className="dl-compliance-content">
                <div className="dl-compliance-title">Fleet Compliance: 94% Operational Readiness</div>
                <p className="dl-compliance-desc">
                  Your Driving License and PAN verification are 100% active. 
                  Your <strong>Third-Party Cargo Insurance</strong> is entering the 45-day renewal window.
                </p>
              </div>
              <button 
                type="button" 
                className="dl-btn-primary dl-renew-banner-btn"
                onClick={() => addToast('Connecting to Partner Insurance Renewal Portal...', 'info')}
              >
                Renew Policy (15% Partner Discount)
              </button>
            </div>

            {/* Document Cards Grid */}
            <div className="dl-documents-grid">
              {/* Document 1: Commercial Driving License */}
              <div className="dl-doc-card">
                <div className="dl-doc-top">
                  <div className="dl-doc-icon-box bg-primary-soft">
                    <FileText size={22} className="text-primary" />
                  </div>
                  <span className="dl-status-chip verified">
                    <CheckCircle2 size={12} /> Verified & Active
                  </span>
                </div>
                <h4 className="dl-doc-title">Commercial Driving License (MCWG / LMV)</h4>
                <div className="dl-doc-meta-field">
                  <span className="dl-doc-meta-label">License Number:</span>
                  <span className="dl-doc-meta-val font-mono">{agentProfile?.documents?.licenseNumber || 'DL-TN01-2021-998822'}</span>
                </div>
                <div className="dl-doc-meta-field">
                  <span className="dl-doc-meta-label">Validity Expiration:</span>
                  <span className="dl-doc-meta-val text-success">November 30, 2028 (Active)</span>
                </div>
                <div className="dl-doc-footer-actions">
                  <button 
                    type="button" 
                    className="dl-btn-secondary dl-doc-btn"
                    onClick={() => addToast('Opening Driving License verification scan...', 'info')}
                  >
                    View Document
                  </button>
                  <button 
                    type="button" 
                    className="dl-btn-secondary dl-doc-btn"
                    onClick={() => addToast('License replacement upload dialog opened', 'info')}
                  >
                    Replace Scan
                  </button>
                </div>
              </div>

              {/* Document 2: Insurance with Expiry Warning */}
              <div className="dl-doc-card has-warning-border">
                <div className="dl-doc-top">
                  <div className="dl-doc-icon-box bg-warning-soft">
                    <AlertTriangle size={22} className="text-warning" />
                  </div>
                  <span className="dl-status-chip warning">
                    <Clock size={12} /> Expires in 46 Days
                  </span>
                </div>
                <h4 className="dl-doc-title">Third-Party Commercial Cargo Insurance</h4>
                <div className="dl-doc-meta-field">
                  <span className="dl-doc-meta-label">Policy Number:</span>
                  <span className="dl-doc-meta-val font-mono">{agentProfile?.documents?.insurancePolicy || 'ICICI-LOMB-882910-E'}</span>
                </div>
                <div className="dl-doc-meta-field">
                  <span className="dl-doc-meta-label">Renewal Deadline:</span>
                  <span className="dl-doc-meta-val text-warning font-semibold">December 15, 2026</span>
                </div>
                <div className="dl-doc-footer-actions">
                  <button 
                    type="button" 
                    className="dl-btn-primary dl-doc-btn"
                    onClick={() => addToast('Opening Instant Insurance Renewal Portal...', 'info')}
                  >
                    Renew Policy Now
                  </button>
                  <button 
                    type="button" 
                    className="dl-btn-secondary dl-doc-btn"
                    onClick={() => addToast('Uploaded new insurance policy document', 'success')}
                  >
                    Upload Renewed
                  </button>
                </div>
              </div>

              {/* Document 3: Income Tax PAN Identification */}
              <div className="dl-doc-card">
                <div className="dl-doc-top">
                  <div className="dl-doc-icon-box bg-success-soft">
                    <ShieldCheck size={22} className="text-success" />
                  </div>
                  <span className="dl-status-chip verified">
                    <CheckCircle2 size={12} /> Verified & Active
                  </span>
                </div>
                <h4 className="dl-doc-title">Permanent Account Number (PAN Card)</h4>
                <div className="dl-doc-meta-field">
                  <span className="dl-doc-meta-label">PAN Identifier:</span>
                  <span className="dl-doc-meta-val font-mono">{agentProfile?.documents?.pancardNumber || 'ABCDE1234F'}</span>
                </div>
                <div className="dl-doc-meta-field">
                  <span className="dl-doc-meta-label">Tax Compliance Status:</span>
                  <span className="dl-doc-meta-val text-success">TDS Form 16 Active</span>
                </div>
                <div className="dl-doc-footer-actions">
                  <button 
                    type="button" 
                    className="dl-btn-secondary dl-doc-btn"
                    onClick={() => addToast('Viewing verified PAN card on file', 'info')}
                  >
                    View Card
                  </button>
                </div>
              </div>

              {/* Document 4: Zero Emission EV Certificate */}
              <div className="dl-doc-card">
                <div className="dl-doc-top">
                  <div className="dl-doc-icon-box bg-success-soft">
                    <Zap size={22} className="text-success" />
                  </div>
                  <span className="dl-status-chip verified">
                    <CheckCircle2 size={12} /> Green Certified
                  </span>
                </div>
                <h4 className="dl-doc-title">Zero Emissions EV Fitness Exemption</h4>
                <div className="dl-doc-meta-field">
                  <span className="dl-doc-meta-label">Exemption Code:</span>
                  <span className="dl-doc-meta-val font-mono">PUC-EXEMPT-EV-2024</span>
                </div>
                <div className="dl-doc-meta-field">
                  <span className="dl-doc-meta-label">Green Fleet Incentive:</span>
                  <span className="dl-doc-meta-val text-success">Zero Carbon Surcharge Exemption</span>
                </div>
                <div className="dl-doc-footer-actions">
                  <button 
                    type="button" 
                    className="dl-btn-secondary dl-doc-btn"
                    onClick={() => addToast('EV Green Certification valid across all Chennai Hubs', 'info')}
                  >
                    View Green Badge
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: PERFORMANCE & ACCOLADES */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {activeTab === 'performance' && (
          <div className="dl-tab-section-stack">
            {/* Performance KPI Grid */}
            <div className="dl-perf-kpi-grid">
              <div className="dl-perf-box">
                <span className="dl-perf-label">Customer Satisfaction</span>
                <div className="dl-perf-score star-score">
                  4.95 <span className="dl-star-icon">★</span>
                </div>
                <span className="dl-perf-subtext">382 ratings (98% 5-Star)</span>
                <div className="dl-perf-trend positive">
                  <span>+0.04 vs last month</span>
                </div>
              </div>

              <div className="dl-perf-box">
                <span className="dl-perf-label">On-Time Drop Rate</span>
                <div className="dl-perf-score text-success">98.4%</div>
                <span className="dl-perf-subtext">+2.1% above Hub Average (96.3%)</span>
                <div className="dl-perf-trend positive">
                  <span>Elite Delivery Badge</span>
                </div>
              </div>

              <div className="dl-perf-box">
                <span className="dl-perf-label">Lifetime Deliveries</span>
                <div className="dl-perf-score">428</div>
                <span className="dl-perf-subtext">1,420 Total Kilometers logged</span>
                <div className="dl-perf-trend neutral">
                  <span>Zero lost parcels</span>
                </div>
              </div>

              <div className="dl-perf-box">
                <span className="dl-perf-label">Average Stop Velocity</span>
                <div className="dl-perf-score text-primary">22.4m</div>
                <span className="dl-perf-subtext">From seller pickup to customer handoff</span>
                <div className="dl-perf-trend positive">
                  <span>-3.2m faster than SLA</span>
                </div>
              </div>
            </div>

            {/* Accolades & Customer Compliments Gallery */}
            <div className="dl-card dl-content-card">
              <h3 className="dl-card-title">Customer Feedback & Operational Accolades</h3>
              <p className="dl-card-desc">Recognitions unlocked through consistent customer delight and hyperlocal excellence</p>

              <div className="dl-accolades-gallery mt-3">
                <div className="dl-accolade-card">
                  <div className="dl-accolade-emoji">⚡</div>
                  <div className="dl-accolade-body">
                    <div className="dl-accolade-name">Lightning Fast Delivery</div>
                    <div className="dl-accolade-desc">Delivered under 20 mins on sub-3km drops</div>
                  </div>
                  <span className="dl-accolade-count">142</span>
                </div>

                <div className="dl-accolade-card">
                  <div className="dl-accolade-emoji">🤝</div>
                  <div className="dl-accolade-body">
                    <div className="dl-accolade-name">Polite & Professional</div>
                    <div className="dl-accolade-desc">Courteous handoff and prompt doorstep calls</div>
                  </div>
                  <span className="dl-accolade-count">210</span>
                </div>

                <div className="dl-accolade-card">
                  <div className="dl-accolade-emoji">📦</div>
                  <div className="dl-accolade-body">
                    <div className="dl-accolade-name">Careful Parcel Handling</div>
                    <div className="dl-accolade-desc">Zero package crushing on fragile bakery & goods</div>
                  </div>
                  <span className="dl-accolade-count">188</span>
                </div>

                <div className="dl-accolade-card">
                  <div className="dl-accolade-emoji">🌧️</div>
                  <div className="dl-accolade-body">
                    <div className="dl-accolade-name">Monsoon Champion</div>
                    <div className="dl-accolade-desc">Completed 60+ drops during heavy rain alerts</div>
                  </div>
                  <span className="dl-accolade-count">65</span>
                </div>

                <div className="dl-accolade-card">
                  <div className="dl-accolade-emoji">🎯</div>
                  <div className="dl-accolade-body">
                    <div className="dl-accolade-name">Zero Damage Milestone</div>
                    <div className="dl-accolade-desc">300 consecutive orders without damage claims</div>
                  </div>
                  <span className="dl-accolade-count">300+</span>
                </div>

                <div className="dl-accolade-card">
                  <div className="dl-accolade-emoji">🏆</div>
                  <div className="dl-accolade-body">
                    <div className="dl-accolade-name">Agent of the Month</div>
                    <div className="dl-accolade-desc">Awarded for highest on-time score (Sept 2026)</div>
                  </div>
                  <span className="dl-accolade-count">1</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB 5: DISPATCH PREFERENCES */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {activeTab === 'preferences' && (
          <div className="dl-card dl-content-card">
            <h3 className="dl-card-title">Dispatch & Mobile Terminal Preferences</h3>
            <p className="dl-card-desc">Configure navigational guidance, display theme, and dispatch automation rules</p>

            <div className="dl-prefs-sections-stack mt-4">
              {/* Interface Theme Switcher */}
              <div className="dl-pref-row">
                <div className="dl-pref-info">
                  <h4 className="dl-pref-heading">Interface Visual Theme</h4>
                  <p className="dl-pref-sub">Switch between daylight high-contrast and low-light tactical dark mode</p>
                </div>
                <div className="dl-theme-toggle-group">
                  <button
                    type="button"
                    className={`dl-theme-btn ${theme === 'light' ? 'is-active' : ''}`}
                    onClick={() => { if (theme !== 'light') toggleTheme(); }}
                  >
                    <span>☀️ Light Mode</span>
                  </button>
                  <button
                    type="button"
                    className={`dl-theme-btn ${theme === 'dark' ? 'is-active' : ''}`}
                    onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                  >
                    <span>🌙 Tactical Dark</span>
                  </button>
                </div>
              </div>

              {/* Navigation App Choice */}
              <div className="dl-pref-row">
                <div className="dl-pref-info">
                  <h4 className="dl-pref-heading">Primary Navigation Provider</h4>
                  <p className="dl-pref-sub">Default maps launched when tapping "Navigate to Stop" on active batches</p>
                </div>
                <div className="dl-maps-selector">
                  {['Google Maps', 'Apple Maps', 'Waze'].map(app => (
                    <button
                      key={app}
                      type="button"
                      className={`dl-map-choice ${form.defaultMapApp === app ? 'is-active' : ''}`}
                      onClick={() => handleFieldChange('defaultMapApp', app)}
                    >
                      <Navigation size={15} />
                      <span>{app}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selection */}
              <div className="dl-pref-row">
                <div className="dl-pref-info">
                  <h4 className="dl-pref-heading">Dispatch Voice & Text Language</h4>
                  <p className="dl-pref-sub">Audio turn-by-turn prompts and order instruction readouts</p>
                </div>
                <select
                  value={form.language}
                  onChange={e => handleFieldChange('language', e.target.value)}
                  className="dl-select-input dl-prefs-select"
                >
                  <option value="English (IN)">English (India)</option>
                  <option value="Tamil">தமிழ் (Tamil)</option>
                  <option value="Hindi">हिन्दी (Hindi)</option>
                </select>
              </div>

              {/* Operational Automation Toggles */}
              <div className="dl-pref-row">
                <div className="dl-pref-info">
                  <h4 className="dl-pref-heading">Spoken Voice Prompts</h4>
                  <p className="dl-pref-sub">Speak merchant special instructions and customer gate codes hands-free</p>
                </div>
                <label className="dl-toggle-switch">
                  <input
                    type="checkbox"
                    checked={form.voiceGuidance}
                    onChange={e => handleFieldChange('voiceGuidance', e.target.checked)}
                  />
                  <span className="dl-toggle-slider" />
                </label>
              </div>

              <div className="dl-pref-row">
                <div className="dl-pref-info">
                  <h4 className="dl-pref-heading">Auto-Queue Next Dispatch Batch</h4>
                  <p className="dl-pref-sub">Automatically accept proximate pickup batches when within 500m of final drop</p>
                </div>
                <label className="dl-toggle-switch">
                  <input
                    type="checkbox"
                    checked={form.autoAcceptBatch}
                    onChange={e => handleFieldChange('autoAcceptBatch', e.target.checked)}
                  />
                  <span className="dl-toggle-slider" />
                </label>
              </div>

              <div className="dl-pref-row">
                <div className="dl-pref-info">
                  <h4 className="dl-pref-heading">Offline GPS Routing Caching</h4>
                  <p className="dl-pref-sub">Cache route telemetry and customer numbers for zones with low cellular coverage</p>
                </div>
                <label className="dl-toggle-switch">
                  <input
                    type="checkbox"
                    checked={form.offlineCaching}
                    onChange={e => handleFieldChange('offlineCaching', e.target.checked)}
                  />
                  <span className="dl-toggle-slider" />
                </label>
              </div>
            </div>

            <div className="dl-form-footer-actions mt-4">
              <button
                type="button"
                disabled={!isDirty}
                onClick={handleSave}
                className="dl-btn-primary"
              >
                <Save size={15} /> Save Dispatch Preferences
              </button>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB 6: SECURITY & DEVICE SESSIONS */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {activeTab === 'security' && (
          <div className="dl-tab-section-stack">
            {/* Password Update Card */}
            <div className="dl-card dl-content-card">
              <h3 className="dl-card-title">Password & Fleet Credential Security</h3>
              <p className="dl-card-desc">Keep your agent account protected across handheld mobile devices and web terminals</p>

              <div className="dl-form-grid-2col mt-3">
                <div className="dl-field-group">
                  <label className="dl-label" htmlFor="sec-cur">Current Password</label>
                  <div className="dl-input-wrapper">
                    <Lock size={16} className="dl-field-icon" />
                    <input
                      id="sec-cur"
                      type={showCurPwd ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={passwords.current}
                      onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                      className="dl-text-input"
                    />
                    <button 
                      type="button" 
                      className="dl-inner-eye-btn"
                      onClick={() => setShowCurPwd(!showCurPwd)}
                    >
                      {showCurPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="dl-field-group">
                  <label className="dl-label" htmlFor="sec-new">New Password (Min 8 Characters)</label>
                  <div className="dl-input-wrapper">
                    <Lock size={16} className="dl-field-icon" />
                    <input
                      id="sec-new"
                      type={showNewPwd ? 'text' : 'password'}
                      placeholder="Enter strong password..."
                      value={passwords.new}
                      onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                      className="dl-text-input"
                    />
                    <button 
                      type="button" 
                      className="dl-inner-eye-btn"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                    >
                      {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="dl-form-footer-actions">
                <button
                  type="button"
                  className="dl-btn-primary"
                  onClick={() => {
                    if (!passwords.new || passwords.new.length < 8) {
                      addToast('New password must be at least 8 characters long', 'error');
                      return;
                    }
                    setPasswords({ current: '', new: '', confirm: '' });
                    addToast('Agent password updated securely', 'success');
                  }}
                >
                  <Lock size={15} /> Update Password
                </button>
              </div>
            </div>

            {/* Quick Terminal PIN Card */}
            <div className="dl-card dl-content-card">
              <div className="dl-card-header-row">
                <div>
                  <h3 className="dl-card-title">Handheld Terminal 4-Digit Quick PIN</h3>
                  <p className="dl-card-desc">Used for rapid screen unlocking at merchant pickup counters without full password entry</p>
                </div>
                <div className="dl-pin-display font-mono">
                  {isEditingPin ? (
                    <input
                      type="text"
                      maxLength={4}
                      value={quickPin}
                      onChange={(e) => setQuickPin(e.target.value.replace(/\D/g, ''))}
                      className="dl-pin-input font-mono"
                    />
                  ) : (
                    <span>•••• ({quickPin})</span>
                  )}
                  <button 
                    type="button" 
                    className="dl-btn-secondary dl-doc-btn ml-2"
                    onClick={() => {
                      if (isEditingPin) {
                        setIsEditingPin(false);
                        addToast(`Terminal PIN updated to ${quickPin}`, 'success');
                      } else {
                        setIsEditingPin(true);
                      }
                    }}
                  >
                    {isEditingPin ? 'Save PIN' : 'Change PIN'}
                  </button>
                </div>
              </div>
            </div>

            {/* Active Device Sessions */}
            <div className="dl-card dl-content-card">
              <h3 className="dl-card-title">Active Fleet Device Sessions</h3>
              <p className="dl-card-desc">Devices currently authenticated to {agentProfile?.name || 'this driver'}'s agent account</p>

              <div className="dl-sessions-list mt-3">
                <div className="dl-session-item is-current">
                  <div className="dl-session-icon-box bg-success-soft">
                    <Smartphone size={22} className="text-success" />
                  </div>
                  <div className="dl-session-info">
                    <div className="dl-session-title-row">
                      <strong className="dl-session-name">MicroLogi Handheld Terminal (Android 14)</strong>
                      <span className="dl-current-device-tag">Active Device (GPS Live)</span>
                    </div>
                    <span className="dl-session-sub">
                      Chennai Central Zone · IP: 106.51.24.12 · Ather Mount Docked
                    </span>
                  </div>
                </div>

                <div className="dl-session-item">
                  <div className="dl-session-icon-box bg-primary-soft">
                    <Laptop size={22} className="text-primary" />
                  </div>
                  <div className="dl-session-info">
                    <div className="dl-session-title-row">
                      <strong className="dl-session-name">Web Control Tower (Chrome / Windows)</strong>
                      <span className="dl-session-time">Last active 2 hrs ago</span>
                    </div>
                    <span className="dl-session-sub">
                      Chennai, India · IP: 49.207.214.88 · Desktop Portal
                    </span>
                  </div>
                  <button
                    type="button"
                    className="dl-btn-secondary dl-revoke-btn"
                    onClick={() => addToast('Session revoked remotely', 'neutral')}
                  >
                    Revoke
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── 5. STICKY SAVE BAR (Appears on uncommitted edits) ─────────── */}
      {isDirty && (
        <div className="dl-sticky-save-banner" role="alert">
          <div className="dl-sticky-save-content">
            <div className="dl-sticky-msg">
              <AlertTriangle size={18} className="text-warning" />
              <span>You have unsaved changes to your Fleet Profile and Credentials.</span>
            </div>

            <div className="dl-sticky-actions">
              <button
                type="button"
                className="dl-btn-secondary dl-sticky-btn"
                onClick={handleDiscard}
              >
                <RotateCcw size={14} /> Discard
              </button>

              <button
                type="button"
                className="dl-btn-primary dl-sticky-btn"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <RefreshCw size={14} className="dl-spin" /> : <Save size={14} />}
                <span>Save All Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryProfilePage;
