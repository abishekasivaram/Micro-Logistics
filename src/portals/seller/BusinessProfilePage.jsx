import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  Store, Palette, MapPin, CreditCard,
  CheckCircle, Clock, ShieldCheck, Sparkles,
  Phone, Mail, Check, Landmark,
  Zap, Award, RefreshCw, Eye,
  Shield, Pencil, Unlock, X, Copy,
  Navigation, CheckCircle2, TrendingUp
} from 'lucide-react';
import { getVendorLogo, handleVendorLogoError } from '../../utils/imageUtils';
import './BusinessProfilePage.css';

const BusinessProfilePage = () => {
  const { currentUser, updateSellerProfile } = useAppContext();

  const [activeTab, setActiveTab] = useState('details');
  const [isOpenForOrders, setIsOpenForOrders] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const [formData, setFormData] = useState({
    businessName: currentUser?.shopName || currentUser?.name || 'Namma Chennai Naturals',
    category: currentUser?.category || 'Dairy, Organic & Daily Essentials',
    email: currentUser?.email || 'support@nammachennai.com',
    phone: currentUser?.phone || '+91 98401 23456',
    currency: 'INR (₹)',
    logo: currentUser?.logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80',
    coverImage: currentUser?.coverImage || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1600&auto=format&fit=crop&q=80',
    brandColor: '#4F46E5',
    description: currentUser?.description || 'Your trusted Chennai neighborhood merchant delivering farm-fresh Aavin dairy, organic produce, and daily staples across Chennai micro-clusters since 2014.',
    address: currentUser?.address || '12/4 Usman Road, T. Nagar, Chennai - 600017',
    pickupInstructions: 'Dispatch Bay Counter 2, Ground Floor. Courier partners may park in the designated 2-wheeler pickup zone.',
    openingTime: '07:30 AM',
    closingTime: '10:30 PM',
    deliveryRadius: '4.5 km',
    prepTime: '15 mins',
    bankName: 'HDFC Bank',
    bankAccount: '•••• •••• •••• 4567',
    accountHolder: 'Namma Chennai Naturals Private Limited',
    ifsc: 'HDFC0001234',
    upiId: 'nammachennai@okhdfcbank',
    gstin: '33AAACK7890M1Z2',
    fssai: '12423002000456'
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleChange = (field, value) => {
    if (!isEditing) return;
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    
    try {
      if (updateSellerProfile) {
        await updateSellerProfile({
          shopName: formData.businessName,
          name: formData.businessName,
          email: formData.email,
          phone: formData.phone,
          description: formData.description,
          address: formData.address,
          logo: formData.logo,
          coverImage: formData.coverImage,
          category: formData.category
        });
      }
    } catch (err) {
      console.error(err);
    }

    setIsSaving(false);
    setIsSaved(true);
    setHasChanges(false);
    setIsEditing(false);
    setTimeout(() => setIsSaved(false), 3500);
  };

  const handleDiscard = () => {
    setFormData({
      businessName: currentUser?.shopName || currentUser?.name || 'Namma Chennai Naturals',
      category: currentUser?.category || 'Dairy, Organic & Daily Essentials',
      email: currentUser?.email || 'support@nammachennai.com',
      phone: currentUser?.phone || '+91 98401 23456',
      currency: 'INR (₹)',
      logo: currentUser?.logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80',
      coverImage: currentUser?.coverImage || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1600&auto=format&fit=crop&q=80',
      brandColor: '#4F46E5',
      description: currentUser?.description || 'Your trusted Chennai neighborhood merchant delivering farm-fresh Aavin dairy, organic produce, and daily staples across Chennai micro-clusters since 2014.',
      address: currentUser?.address || '12/4 Usman Road, T. Nagar, Chennai - 600017',
      pickupInstructions: 'Dispatch Bay Counter 2, Ground Floor. Courier partners may park in the designated 2-wheeler pickup zone.',
      openingTime: '07:30 AM',
      closingTime: '10:30 PM',
      deliveryRadius: '4.5 km',
      prepTime: '15 mins',
      bankName: 'HDFC Bank',
      bankAccount: '•••• •••• •••• 4567',
      accountHolder: 'Namma Chennai Naturals Private Limited',
      ifsc: 'HDFC0001234',
      upiId: 'nammachennai@okhdfcbank',
      gstin: '33AAACK7890M1Z2',
      fssai: '12423002000456'
    });
    setHasChanges(false);
    setIsEditing(false);
  };

  return (
    <div className="business-profile-container">
      {/* ─── Hero Merchant Storefront Card ────────────────────────── */}
      <div className="storefront-hero-card">
        <div 
          className="hero-banner-background"
          style={{ backgroundImage: `url(${formData.coverImage})` }}
        >
          <div className="hero-banner-overlay" />
        </div>

        <div className="hero-content-wrap">
          <div className="hero-store-identity">
            <div className="hero-avatar-wrapper">
              <img 
                src={getVendorLogo({ logo: formData.logo, name: formData.businessName, category: formData.category })} 
                alt={formData.businessName}
                className="hero-store-avatar"
                onError={(e) => handleVendorLogoError(e, formData.businessName, formData.category)}
              />
              <span className={`hero-online-status-dot ${isOpenForOrders ? 'online' : 'paused'}`} />
            </div>

            <div className="hero-text-block">
              <div className="hero-badge-row">
                <span className="hero-verified-badge">
                  <ShieldCheck size={13} /> Verified Merchant Partner
                </span>
                <span className="hero-merchant-id">
                  ID: #MKT-CHN-94432
                </span>
                {isEditing ? (
                  <span className="hero-editing-pill">
                    <Unlock size={12} /> Editing Mode
                  </span>
                ) : (
                  <span className="hero-viewonly-pill">
                    <CheckCircle2 size={12} /> Profile Active
                  </span>
                )}
              </div>

              <h1 className="hero-store-title">{formData.businessName}</h1>

              <div className="hero-meta-chips">
                <span className="hero-meta-chip">
                  <MapPin size={13} /> T. Nagar, Chennai
                </span>
                <span className="hero-meta-chip">
                  <Clock size={13} /> {formData.prepTime} Prep SLA
                </span>
                <span className="hero-meta-chip">
                  <Zap size={13} /> {formData.deliveryRadius} Cluster Coverage
                </span>
                <span className="hero-meta-chip rating">
                  ★ 4.9 (248 Customer Reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="hero-actions-panel">
            <div className="store-status-toggle-card">
              <div className="toggle-label-group">
                <span className="toggle-title">Accepting Orders</span>
                <span className="toggle-status-text">
                  {isOpenForOrders ? 'Open for AI dispatch' : 'Intake paused'}
                </span>
              </div>
              <button 
                type="button"
                className={`store-toggle-switch ${isOpenForOrders ? 'active' : ''}`}
                onClick={() => setIsOpenForOrders(!isOpenForOrders)}
                title={isOpenForOrders ? "Pause Incoming Orders" : "Open for Delivery"}
              >
                <span className="toggle-handle" />
              </button>
            </div>

            {isEditing ? (
              <div className="hero-edit-buttons-group">
                <button 
                  type="button"
                  className="cancel-hero-btn"
                  onClick={handleDiscard}
                  disabled={isSaving}
                  title="Discard changes and exit edit mode"
                >
                  <X size={15} /> Cancel
                </button>

                <button 
                  type="button"
                  className="save-hero-btn"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={15} className="spin-icon" /> Saving...
                    </>
                  ) : isSaved ? (
                    <>
                      <Check size={15} /> Synchronized!
                    </>
                  ) : (
                    <>
                      <CheckCircle size={15} /> Save All Changes
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button 
                type="button"
                className="edit-hero-btn"
                onClick={() => setIsEditing(true)}
                title="Click to edit store details, hours, and branding"
              >
                <Pencil size={15} /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Operational Metrics Strip ────────────────────────────── */}
      <div className="profile-telemetry-ribbon">
        <div className="telemetry-stat-card">
          <div className="telemetry-icon-box" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <Clock size={18} />
          </div>
          <div>
            <span className="telemetry-lbl">Prep SLA Buffer</span>
            <div className="telemetry-val">{formData.prepTime}</div>
          </div>
        </div>

        <div className="telemetry-stat-card">
          <div className="telemetry-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
            <TrendingUp size={18} />
          </div>
          <div>
            <span className="telemetry-lbl">On-Time Handover</span>
            <div className="telemetry-val">99.4%</div>
          </div>
        </div>

        <div className="telemetry-stat-card">
          <div className="telemetry-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Navigation size={18} />
          </div>
          <div>
            <span className="telemetry-lbl">Active Spatial Cluster</span>
            <div className="telemetry-val">T. Nagar Zone 4</div>
          </div>
        </div>

        <div className="telemetry-stat-card">
          <div className="telemetry-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <CreditCard size={18} />
          </div>
          <div>
            <span className="telemetry-lbl">Bank Settlement</span>
            <div className="telemetry-val">Daily Auto-Clear</div>
          </div>
        </div>
      </div>

      {/* ─── Sync Status Notification Toast ───────────────────────── */}
      {isSaved && (
        <div className="profile-sync-toast">
          <CheckCircle size={18} />
          <span>Store settings successfully updated and synchronized across the MicroLogi customer marketplace.</span>
        </div>
      )}

      {/* ─── Modern Segmented Navigation ──────────────────────────── */}
      <div className="profile-tabs-nav-bar">
        <button 
          type="button"
          className={`tab-nav-item ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          <Store size={16} />
          <span>Store Details & Hub</span>
        </button>
        <button 
          type="button"
          className={`tab-nav-item ${activeTab === 'hours' ? 'active' : ''}`}
          onClick={() => setActiveTab('hours')}
        >
          <Clock size={16} />
          <span>Operating Hours & SLA</span>
        </button>
        <button 
          type="button"
          className={`tab-nav-item ${activeTab === 'branding' ? 'active' : ''}`}
          onClick={() => setActiveTab('branding')}
        >
          <Palette size={16} />
          <span>Branding & Live Preview</span>
        </button>
        <button 
          type="button"
          className={`tab-nav-item ${activeTab === 'payouts' ? 'active' : ''}`}
          onClick={() => setActiveTab('payouts')}
        >
          <CreditCard size={16} />
          <span>Banking & Settlements</span>
        </button>
        <button 
          type="button"
          className={`tab-nav-item ${activeTab === 'compliance' ? 'active' : ''}`}
          onClick={() => setActiveTab('compliance')}
        >
          <Award size={16} />
          <span>Compliance & Licenses</span>
        </button>
      </div>

      {/* ─── TAB 1: Store Details & Hub ───────────────────────────── */}
      {activeTab === 'details' && (
        <div className="tab-content-grid">
          {/* Card 1: Core Store Identity */}
          <div className="profile-section-card">
            <div className="card-section-header">
              <div className="header-icon-box">
                <Store size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 className="card-section-title">Core Store Identity</h3>
                  <span className="section-status-tag">Marketplace Profile</span>
                </div>
                <p className="card-section-desc">Public store details displayed on customer marketplace cards and invoices.</p>
              </div>
            </div>

            <div className="card-section-body">
              {!isEditing ? (
                /* Rich View Mode for Store Identity */
                <div className="view-mode-data-list">
                  <div className="view-mode-item">
                    <span className="view-item-label">Store Brand Name</span>
                    <div className="view-item-val-row">
                      <span className="view-item-val-title">{formData.businessName}</span>
                      <button 
                        type="button"
                        className="btn-inline-copy"
                        onClick={() => handleCopy(formData.businessName, 'brandName')}
                        title="Copy brand name"
                      >
                        {copiedKey === 'brandName' ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                      </button>
                    </div>
                    <span className="view-item-sub">Registered trade name recognized by Chennai neighborhood patrons.</span>
                  </div>

                  <div className="view-mode-two-col">
                    <div className="view-mode-item">
                      <span className="view-item-label">Business Category</span>
                      <div className="view-item-val">
                        <span className="category-pill-badge">{formData.category}</span>
                      </div>
                    </div>

                    <div className="view-mode-item">
                      <span className="view-item-label">Billing Currency</span>
                      <div className="view-item-val">
                        <span className="currency-pill-badge">INR (₹) · Indian Rupee</span>
                      </div>
                    </div>
                  </div>

                  <div className="view-mode-item">
                    <span className="view-item-label">Store Bio & Heritage Description</span>
                    <div className="bio-quote-box">
                      <span className="quote-mark">“</span>
                      <p className="bio-quote-text">{formData.description}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Editable Form Mode */
                <div className="edit-mode-form-fields">
                  <div className="form-group-block">
                    <label className="field-label">
                      Store Brand Name <span className="req-asterisk">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="field-text-input is-editable"
                      value={formData.businessName} 
                      onChange={e => handleChange('businessName', e.target.value)} 
                      placeholder="e.g. Namma Chennai Naturals"
                    />
                    <span className="field-hint-text">Your recognized retail trade name seen by neighborhood shoppers.</span>
                  </div>

                  <div className="fields-two-col">
                    <div className="form-group-block">
                      <label className="field-label">Primary Business Category</label>
                      <select 
                        className="field-select-input is-editable"
                        value={formData.category} 
                        onChange={e => handleChange('category', e.target.value)}
                      >
                        <option value="Dairy, Organic & Daily Essentials">Dairy, Organic & Daily Essentials</option>
                        <option value="Grocery & Daily Essentials">Grocery & Daily Essentials</option>
                        <option value="Fresh Fruits & Vegetables">Fresh Fruits & Vegetables</option>
                        <option value="Bakery & Gourmet Foods">Bakery & Gourmet Foods</option>
                        <option value="Packaged Foods & Beverages">Packaged Foods & Beverages</option>
                      </select>
                    </div>

                    <div className="form-group-block">
                      <label className="field-label">Operating Currency</label>
                      <div className="locked-currency-chip">
                        <span>INR (₹) - Indian Rupee</span>
                        <span className="locked-badge">Fixed by Region</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group-block">
                    <label className="field-label">Store Bio & Description</label>
                    <textarea 
                      className="field-textarea-input is-editable"
                      rows={3}
                      value={formData.description} 
                      onChange={e => handleChange('description', e.target.value)}
                      placeholder="Tell local shoppers about your specialties, quality guarantees, and store heritage..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Contact & Physical Dispatch Hub */}
          <div className="profile-section-card">
            <div className="card-section-header">
              <div className="header-icon-box">
                <MapPin size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 className="card-section-title">Physical Dispatch Hub & Contact</h3>
                  <span className="section-status-tag green">Spatial Node</span>
                </div>
                <p className="card-section-desc">Pickup address coordinated with micro-logistics delivery drivers.</p>
              </div>
            </div>

            <div className="card-section-body">
              {!isEditing ? (
                /* Rich View Mode for Dispatch Hub */
                <div className="view-mode-data-list">
                  <div className="view-mode-two-col">
                    <div className="view-mode-item">
                      <span className="view-item-label">Merchant Support Phone</span>
                      <div className="contact-link-row">
                        <a href={`tel:${formData.phone}`} className="view-contact-link">
                          <Phone size={13} color="var(--primary)" />
                          <span>{formData.phone}</span>
                        </a>
                        <button 
                          type="button"
                          className="btn-inline-copy"
                          onClick={() => handleCopy(formData.phone, 'phone')}
                          title="Copy phone"
                        >
                          {copiedKey === 'phone' ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <span className="view-item-sub">Priority line for driver arrival and dispatch coordination.</span>
                    </div>

                    <div className="view-mode-item">
                      <span className="view-item-label">Merchant Contact Email</span>
                      <div className="contact-link-row">
                        <a href={`mailto:${formData.email}`} className="view-contact-link">
                          <Mail size={13} color="var(--text-muted)" />
                          <span>{formData.email}</span>
                        </a>
                        <button 
                          type="button"
                          className="btn-inline-copy"
                          onClick={() => handleCopy(formData.email, 'email')}
                          title="Copy email"
                        >
                          {copiedKey === 'email' ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <span className="view-item-sub">Direct inbox for settlement reports and invoices.</span>
                    </div>
                  </div>

                  <div className="view-mode-item">
                    <span className="view-item-label">Physical Fulfillment Store Address</span>
                    <div className="address-display-box">
                      <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ flex: 1 }}>
                        <div className="address-main-text">{formData.address}</div>
                        <div className="address-cluster-tag">Central Chennai Micro-Logistics Node · Zone 4</div>
                      </div>
                      <button 
                        type="button"
                        className="btn-inline-copy"
                        onClick={() => handleCopy(formData.address, 'address')}
                        title="Copy address"
                      >
                        {copiedKey === 'address' ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  <div className="view-mode-item">
                    <span className="view-item-label">Courier Pickup & Handover Instructions</span>
                    <div className="pickup-instruction-card">
                      <div className="pickup-icon-badge">
                        <Zap size={14} color="#4f46e5" />
                      </div>
                      <div>
                        <div className="pickup-text">{formData.pickupInstructions}</div>
                        <span className="pickup-rider-notice">Broadcasted to delivery agent mobile consoles upon arrival.</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Editable Form Mode */
                <div className="edit-mode-form-fields">
                  <div className="fields-two-col">
                    <div className="form-group-block">
                      <label className="field-label">
                        Merchant Support Phone <span className="req-asterisk">*</span>
                      </label>
                      <div className="input-prefix-group">
                        <span className="input-country-prefix">+91</span>
                        <input 
                          type="tel" 
                          className="field-text-input has-prefix is-editable"
                          value={formData.phone.replace('+91', '').trim()} 
                          onChange={e => handleChange('phone', `+91 ${e.target.value.trim()}`)}
                          placeholder="98401 23456"
                        />
                      </div>
                      <span className="field-hint-text">Used for critical dispatch alerts and driver calls.</span>
                    </div>

                    <div className="form-group-block">
                      <label className="field-label">
                        Merchant Contact Email <span className="req-asterisk">*</span>
                      </label>
                      <input 
                        type="email" 
                        className="field-text-input is-editable"
                        value={formData.email} 
                        onChange={e => handleChange('email', e.target.value)} 
                        placeholder="merchant@store.com"
                      />
                      <span className="field-hint-text">Direct email for daily settlement and invoice reports.</span>
                    </div>
                  </div>

                  <div className="form-group-block">
                    <label className="field-label">
                      Physical Store Address <span className="req-asterisk">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="field-text-input is-editable"
                      value={formData.address} 
                      onChange={e => handleChange('address', e.target.value)} 
                      placeholder="Street address, building number, locality, Chennai pincode"
                    />
                  </div>

                  <div className="form-group-block">
                    <label className="field-label">Driver Pickup & Handover Instructions</label>
                    <input 
                      type="text" 
                      className="field-text-input is-editable"
                      value={formData.pickupInstructions} 
                      onChange={e => handleChange('pickupInstructions', e.target.value)} 
                      placeholder="e.g. Counter 2 at ground floor entrance"
                    />
                    <span className="field-hint-text">Displayed on delivery agent mobile terminals upon arrival.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: Operating Hours & Logistics SLA ───────────────── */}
      {activeTab === 'hours' && (
        <div className="tab-content-grid">
          {/* Card 1: Operating Schedule */}
          <div className="profile-section-card">
            <div className="card-section-header">
              <div className="header-icon-box">
                <Clock size={18} />
              </div>
              <div>
                <h3 className="card-section-title">Store Schedule & Availability</h3>
                <p className="card-section-desc">Automated store status controlling online order intake.</p>
              </div>
              <span className="section-status-tag">
                <Clock size={12} /> {isEditing ? 'Editing Hours' : 'Intake Schedule'}
              </span>
            </div>

            <div className="card-section-body">
              {!isEditing ? (
                <div className="view-mode-data-list">
                  <div className="view-mode-item">
                    <span className="view-item-label">Store Operating Window</span>
                    <div className="hours-status-summary-card">
                      <div className="hours-pulse-indicator">
                        <span className={`live-status-dot ${isOpenForOrders ? 'pulse' : 'paused'}`} />
                        <span className="hours-status-text">
                          {isOpenForOrders ? 'Store Active & Open for Intake' : 'Store Intake Paused'}
                        </span>
                      </div>
                      <div className="hours-timing-highlight">
                        {formData.openingTime} – {formData.closingTime}
                        <span className="hours-timing-badge">Daily Schedule</span>
                      </div>
                      <span className="view-item-sub">Orders placed within this window are dispatched automatically via the AI micro-logistics network.</span>
                    </div>
                  </div>

                  <div className="view-mode-item">
                    <span className="view-item-label">Merchant Preparation SLA Buffer</span>
                    <div className="sla-view-card">
                      <div className="sla-view-badge">
                        <Clock size={15} color="var(--primary)" />
                        <span className="sla-view-time">{formData.prepTime}</span>
                        <span className="sla-view-tag">
                          {formData.prepTime === '10 mins' ? 'Express Fast' : formData.prepTime === '15 mins' ? 'Standard Balanced' : 'High Volume'}
                        </span>
                      </div>
                      <span className="view-item-sub">MicroLogi delivery riders are routed to arrive at your pickup counter precisely at the end of this buffer.</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="edit-mode-form-fields">
                  <div className="schedule-presets-strip">
                    <span className="preset-label">Quick Presets:</span>
                    <button 
                      type="button"
                      className="preset-chip-btn"
                      onClick={() => {
                        handleChange('openingTime', '07:00 AM');
                        handleChange('closingTime', '10:00 PM');
                      }}
                    >
                      07:00 AM - 10:00 PM (Retail Standard)
                    </button>
                    <button 
                      type="button"
                      className="preset-chip-btn"
                      onClick={() => {
                        handleChange('openingTime', '06:00 AM');
                        handleChange('closingTime', '11:00 PM');
                      }}
                    >
                      06:00 AM - 11:00 PM (Extended)
                    </button>
                  </div>

                  <div className="fields-two-col">
                    <div className="form-group-block">
                      <label className="field-label">Daily Opening Time</label>
                      <input 
                        type="text" 
                        className="field-text-input is-editable"
                        value={formData.openingTime} 
                        onChange={e => handleChange('openingTime', e.target.value)} 
                        placeholder="07:30 AM"
                      />
                    </div>

                    <div className="form-group-block">
                      <label className="field-label">Daily Closing Time</label>
                      <input 
                        type="text" 
                        className="field-text-input is-editable"
                        value={formData.closingTime} 
                        onChange={e => handleChange('closingTime', e.target.value)} 
                        placeholder="10:30 PM"
                      />
                    </div>
                  </div>

                  <div className="form-group-block">
                    <label className="field-label">Average Preparation SLA Buffer</label>
                    <div className="sla-selector-grid">
                      {['10 mins', '15 mins', '20 mins', '25 mins'].map(sla => (
                        <button
                          key={sla}
                          type="button"
                          className={`sla-option-card ${formData.prepTime === sla ? 'active' : ''}`}
                          onClick={() => handleChange('prepTime', sla)}
                        >
                          <span className="sla-value">{sla}</span>
                          <span className="sla-desc">
                            {sla === '10 mins' ? 'Express Fast' : sla === '15 mins' ? 'Standard Balanced' : 'High Volume'}
                          </span>
                        </button>
                      ))}
                    </div>
                    <span className="field-hint-text">Used by AI dispatch to coordinate rider arrival with packing completion.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Delivery Radius & AI Bundling */}
          <div className="profile-section-card">
            <div className="card-section-header">
              <div className="header-icon-box">
                <Zap size={18} />
              </div>
              <div>
                <h3 className="card-section-title">Micro-Logistics Radius & Clustering</h3>
                <p className="card-section-desc">Delivery perimeter optimized for sub-20 minute aggregated orders.</p>
              </div>
              <span className="section-status-tag">
                <Zap size={12} /> Cluster Zone 4
              </span>
            </div>

            <div className="card-section-body">
              {!isEditing ? (
                <div className="view-mode-data-list">
                  <div className="view-mode-item">
                    <span className="view-item-label">Active Micro-Logistics Radius</span>
                    <div className="cluster-view-banner">
                      <div className="cluster-badge-icon">
                        <Zap size={22} color="#4f46e5" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="cluster-title-row">
                          <span className="cluster-val">{formData.deliveryRadius} Coverage Radius</span>
                          <span className="rec-pill">AI Preferred</span>
                        </div>
                        <div className="cluster-desc-text">Central Chennai Node Corridor · Est. Transit: 15 – 25 mins</div>
                      </div>
                    </div>
                  </div>

                  <div className="ai-logistics-info-banner">
                    <Sparkles size={20} className="ai-sparkle-icon" />
                    <div>
                      <div className="ai-info-title">Smart Batch Bundling Active</div>
                      <div className="ai-info-text">
                        Within your <strong>{formData.deliveryRadius}</strong> perimeter, your orders are aggregated with complementary neighborhood merchants on single delivery runs, saving packaging overhead and speeding up customer delivery times.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="edit-mode-form-fields">
                  <div className="radius-picker-grid">
                    {[
                      { dist: '2.5 km', name: 'Hyperlocal Zone', time: '10 - 15 mins', rec: false },
                      { dist: '3.5 km', name: 'Optimal AI Cluster', time: '15 - 20 mins', rec: true },
                      { dist: '4.5 km', name: 'Central Chennai Hub', time: '20 - 30 mins', rec: false },
                      { dist: '6.0 km', name: 'Extended Metro Zone', time: '30 - 45 mins', rec: false }
                    ].map(item => (
                      <div 
                        key={item.dist}
                        className={`radius-card ${formData.deliveryRadius === item.dist ? 'active' : ''}`}
                        onClick={() => handleChange('deliveryRadius', item.dist)}
                      >
                        <div className="radius-card-top">
                          <span className="radius-dist">{item.dist}</span>
                          {item.rec && <span className="rec-pill">AI Preferred</span>}
                        </div>
                        <div className="radius-name">{item.name}</div>
                        <div className="radius-time">Est. Delivery: {item.time}</div>
                      </div>
                    ))}
                  </div>

                  <div className="ai-logistics-info-banner">
                    <Sparkles size={20} className="ai-sparkle-icon" />
                    <div>
                      <div className="ai-info-title">Smart Batch Bundling Active</div>
                      <div className="ai-info-text">
                        Within a <strong>{formData.deliveryRadius}</strong> perimeter, your orders are aggregated with complementary neighborhood merchants on single delivery runs.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: Branding & Live Preview ───────────────────────── */}
      {activeTab === 'branding' && (
        <div className="tab-content-grid">
          {/* Card 1: Asset URLs */}
          <div className="profile-section-card">
            <div className="card-section-header">
              <div className="header-icon-box">
                <Palette size={18} />
              </div>
              <div>
                <h3 className="card-section-title">Visual Brand Assets</h3>
                <p className="card-section-desc">Logo and promotional banner URLs representing your digital storefront.</p>
              </div>
            </div>

            <div className="card-section-body">
              <div className="form-group-block">
                <label className="field-label">Store Logo URL</label>
                <div className="asset-input-row">
                  <input 
                    type="url" 
                    className={`field-text-input ${isEditing ? 'is-editable' : ''}`}
                    value={formData.logo} 
                    onChange={e => handleChange('logo', e.target.value)} 
                    placeholder="https://images.unsplash.com/..."
                    disabled={!isEditing}
                    readOnly={!isEditing}
                  />
                  <div className="asset-avatar-preview">
                    <img 
                      src={getVendorLogo({ logo: formData.logo, name: formData.businessName, category: formData.category })} 
                      alt="Logo" 
                      onError={(e) => handleVendorLogoError(e, formData.businessName, formData.category)} 
                    />
                  </div>
                </div>
                <span className="field-hint-text">Square 1:1 image (PNG or JPG). Recommended min 200x200px.</span>
              </div>

              <div className="form-group-block">
                <label className="field-label">Store Cover Banner URL</label>
                <input 
                  type="url" 
                  className={`field-text-input ${isEditing ? 'is-editable' : ''}`}
                  value={formData.coverImage} 
                  onChange={e => handleChange('coverImage', e.target.value)} 
                  placeholder="https://images.unsplash.com/..."
                  disabled={!isEditing}
                  readOnly={!isEditing}
                />
                <span className="field-hint-text">16:9 banner displayed at the top of your marketplace store page.</span>
              </div>

              <div className="form-group-block">
                <label className="field-label">Theme Accent Color</label>
                <div className="color-swatches-row">
                  {['#4F46E5', '#059669', '#D97706', '#E11D48', '#7C3AED', '#0284C7'].map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`swatch-btn ${formData.brandColor === color ? 'selected' : ''} ${!isEditing ? 'disabled' : ''}`}
                      style={{ backgroundColor: color, cursor: !isEditing ? 'default' : 'pointer' }}
                      onClick={() => isEditing && handleChange('brandColor', color)}
                      disabled={!isEditing}
                    >
                      {formData.brandColor === color && <Check size={14} color="#ffffff" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Live Marketplace Card Preview */}
          <div className="profile-section-card">
            <div className="card-section-header">
              <div className="header-icon-box">
                <Eye size={18} />
              </div>
              <div>
                <h3 className="card-section-title">Live Marketplace Card Preview</h3>
                <p className="card-section-desc">Real-time simulation of how shoppers discover your store on MicroLogi.</p>
              </div>
            </div>

            <div className="card-section-body" style={{ alignItems: 'center', justifyContent: 'center' }}>
              <div className="marketplace-preview-widget">
                <div className="preview-widget-image-wrap">
                  <img 
                    src={formData.coverImage} 
                    alt="Cover" 
                    className="preview-widget-cover" 
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600'; }}
                  />
                  <div className="preview-widget-status-overlay">
                    <span className={`status-pill ${isOpenForOrders ? 'open' : 'closed'}`}>
                      {isOpenForOrders ? '● Open Now' : '○ Closed'}
                    </span>
                  </div>
                  <div className="preview-widget-logo-chip">
                    <img 
                      src={getVendorLogo({ logo: formData.logo, name: formData.businessName, category: formData.category })} 
                      alt="Logo" 
                      onError={(e) => handleVendorLogoError(e, formData.businessName, formData.category)} 
                    />
                  </div>
                </div>

                <div className="preview-widget-body">
                  <div className="preview-widget-header-row">
                    <div>
                      <h4 className="preview-widget-title">{formData.businessName}</h4>
                      <span className="preview-widget-cat">{formData.category}</span>
                    </div>
                    <div className="preview-widget-rating">
                      <span>★ 4.9</span>
                    </div>
                  </div>

                  <p className="preview-widget-desc">{formData.description}</p>

                  <div className="preview-widget-meta-footer">
                    <span>⚡ {formData.prepTime} SLA</span>
                    <span>•</span>
                    <span>📍 {formData.deliveryRadius} radius</span>
                    <span>•</span>
                    <span style={{ color: '#059669', fontWeight: 700 }}>Free micro-delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: Banking & Settlements ─────────────────────────── */}
      {activeTab === 'payouts' && (
        <div className="tab-content-grid">
          {/* Card 1: Bank Account Details */}
          <div className="profile-section-card">
            <div className="card-section-header">
              <div className="header-icon-box">
                <Landmark size={18} />
              </div>
              <div>
                <h3 className="card-section-title">Direct Settlement Bank Account</h3>
                <p className="card-section-desc">Bank account where verified order revenues are deposited automatically.</p>
              </div>
            </div>

            <div className="card-section-body">
              {!isEditing ? (
                <div className="view-mode-data-list">
                  <div className="bank-account-card">
                    <div className="bank-card-header">
                      <div className="bank-chip">
                        <Landmark size={20} color="#ffffff" />
                      </div>
                      <div className="bank-name-tag">{formData.bankName}</div>
                    </div>

                    <div className="bank-card-number">
                      •••• •••• •••• {formData.bankAccount ? formData.bankAccount.slice(-4) : '4092'}
                    </div>

                    <div className="bank-card-footer">
                      <div>
                        <span className="bank-footer-label">BENEFICIARY</span>
                        <div className="bank-footer-val">{formData.accountHolder}</div>
                      </div>
                      <div>
                        <span className="bank-footer-label">IFSC CODE</span>
                        <div className="bank-footer-val">{formData.ifsc}</div>
                      </div>
                    </div>
                  </div>

                  <div className="view-mode-two-col" style={{ marginTop: '16px' }}>
                    <div className="view-mode-item">
                      <span className="view-item-label">Settlement IFSC Code</span>
                      <div className="contact-link-row">
                        <span className="view-item-val-title">{formData.ifsc}</span>
                        <button 
                          type="button"
                          className="btn-inline-copy"
                          onClick={() => handleCopy(formData.ifsc, 'ifsc')}
                          title="Copy IFSC code"
                        >
                          {copiedKey === 'ifsc' ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <span className="view-item-sub">Branch: T. Nagar Main Branch, Chennai - 600017</span>
                    </div>

                    <div className="view-mode-item">
                      <span className="view-item-label">Instant UPI Settlement ID</span>
                      <div className="contact-link-row">
                        <span className="view-item-val-title">{formData.upiId}</span>
                        <button 
                          type="button"
                          className="btn-inline-copy"
                          onClick={() => handleCopy(formData.upiId, 'upiId')}
                          title="Copy UPI ID"
                        >
                          {copiedKey === 'upiId' ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <span className="view-item-sub">Configured for end-of-day automated instant settlement.</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="edit-mode-form-fields">
                  <div className="form-group-block">
                    <label className="field-label">Account Beneficiary Name</label>
                    <input 
                      type="text" 
                      className="field-text-input is-editable"
                      value={formData.accountHolder} 
                      onChange={e => handleChange('accountHolder', e.target.value)} 
                    />
                  </div>

                  <div className="fields-two-col">
                    <div className="form-group-block">
                      <label className="field-label">Bank Name</label>
                      <input 
                        type="text" 
                        className="field-text-input is-editable"
                        value={formData.bankName} 
                        onChange={e => handleChange('bankName', e.target.value)} 
                      />
                    </div>

                    <div className="form-group-block">
                      <label className="field-label">Account Number</label>
                      <input 
                        type="text" 
                        className="field-text-input is-editable"
                        value={formData.bankAccount} 
                        onChange={e => handleChange('bankAccount', e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="fields-two-col">
                    <div className="form-group-block">
                      <label className="field-label">IFSC Code</label>
                      <input 
                        type="text" 
                        className="field-text-input is-editable"
                        value={formData.ifsc} 
                        onChange={e => handleChange('ifsc', e.target.value)} 
                      />
                      <span className="field-hint-text">Branch: T. Nagar Main Branch, Chennai - 600017</span>
                    </div>

                    <div className="form-group-block">
                      <label className="field-label">Instant UPI Settlement ID</label>
                      <input 
                        type="text" 
                        className="field-text-input is-editable"
                        value={formData.upiId} 
                        onChange={e => handleChange('upiId', e.target.value)} 
                      />
                      <span className="field-hint-text">Used for instant end-of-day QR settlements.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Payout Schedule & Security Notice */}
          <div className="profile-section-card">
            <div className="card-section-header">
              <div className="header-icon-box">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="card-section-title">Automated Settlement Protocol</h3>
                <p className="card-section-desc">RBI compliant escrow and instant direct-debit clearing.</p>
              </div>
            </div>

            <div className="card-section-body">
              <div className="settlement-status-badge-card">
                <div className="status-badge-icon">
                  <CheckCircle size={22} color="#059669" />
                </div>
                <div>
                  <div className="status-badge-title">Direct Automated Clearing Active</div>
                  <div className="status-badge-sub">Account verified via penny-drop validation protocol.</div>
                </div>
              </div>

              <div className="settlement-metrics-row">
                <div className="settlement-metric-box">
                  <span className="metric-label">Payout Cycle</span>
                  <span className="metric-value">Daily (T+1)</span>
                  <span className="metric-sub">09:00 AM IST</span>
                </div>
                <div className="settlement-metric-box">
                  <span className="metric-label">Platform Fee</span>
                  <span className="metric-value">3.5%</span>
                  <span className="metric-sub">Zero gateway fee</span>
                </div>
                <div className="settlement-metric-box">
                  <span className="metric-label">Pending Payout</span>
                  <span className="metric-value">₹24,850.00</span>
                  <span className="metric-sub">Scheduled Next Day</span>
                </div>
              </div>

              <div className="security-notice-callout">
                <Shield size={16} color="#4f46e5" />
                <span>
                  All customer payments are held in automated escrow until driver delivery confirmation and cleared directly into your registered bank account.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: Compliance & Licenses ─────────────────────────── */}
      {activeTab === 'compliance' && (
        <div className="tab-content-grid">
          <div className="profile-section-card">
            <div className="card-section-header">
              <div className="header-icon-box">
                <Award size={18} />
              </div>
              <div>
                <h3 className="card-section-title">Statutory Merchant Registrations</h3>
                <p className="card-section-desc">Verified government tax IDs and retail trade compliance.</p>
              </div>
            </div>

            <div className="card-section-body">
              {!isEditing ? (
                <div className="view-mode-data-list">
                  <div className="view-mode-two-col">
                    <div className="view-mode-item">
                      <span className="view-item-label">Goods & Services Tax (GSTIN)</span>
                      <div className="contact-link-row">
                        <span className="view-item-val-title">{formData.gstin}</span>
                        <button 
                          type="button"
                          className="btn-inline-copy"
                          onClick={() => handleCopy(formData.gstin, 'gstin')}
                          title="Copy GSTIN"
                        >
                          {copiedKey === 'gstin' ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <div className="compliance-verified-pill">
                        <CheckCircle size={12} color="#059669" />
                        <span>● Verified & Active (Tamil Nadu Commercial Tax)</span>
                      </div>
                      <span className="view-item-sub">Applicable for monthly automated B2B tax invoice generation.</span>
                    </div>

                    <div className="view-mode-item">
                      <span className="view-item-label">FSSAI Food Safety License</span>
                      <div className="contact-link-row">
                        <span className="view-item-val-title">{formData.fssai}</span>
                        <button 
                          type="button"
                          className="btn-inline-copy"
                          onClick={() => handleCopy(formData.fssai, 'fssai')}
                          title="Copy FSSAI"
                        >
                          {copiedKey === 'fssai' ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <div className="compliance-verified-pill">
                        <CheckCircle size={12} color="#059669" />
                        <span>● Active Registration (Central Food Safety)</span>
                      </div>
                      <span className="view-item-sub">Mandatory food safety certificate for grocery and dairy merchants.</span>
                    </div>
                  </div>

                  <div className="compliance-banner-row">
                    <div className="compliance-stat-card">
                      <CheckCircle size={20} color="#059669" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>Merchant Verification Tier 1</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Complete KYC and background check passed on July 2026. Fully certified for express grocery dispatch.</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="edit-mode-form-fields">
                  <div className="fields-two-col">
                    <div className="form-group-block">
                      <label className="field-label">Goods & Services Tax (GSTIN)</label>
                      <div className="verified-id-input-wrap">
                        <input 
                          type="text" 
                          className="field-text-input is-editable"
                          value={formData.gstin} 
                          onChange={e => handleChange('gstin', e.target.value)} 
                        />
                        <span className="verified-pill">● Verified</span>
                      </div>
                      <span className="field-hint-text">Applicable for monthly automated B2B tax invoice generation.</span>
                    </div>

                    <div className="form-group-block">
                      <label className="field-label">FSSAI License Number</label>
                      <div className="verified-id-input-wrap">
                        <input 
                          type="text" 
                          className="field-text-input is-editable"
                          value={formData.fssai} 
                          onChange={e => handleChange('fssai', e.target.value)} 
                        />
                        <span className="verified-pill">● Active</span>
                      </div>
                      <span className="field-hint-text">Mandatory food safety certificate for grocery and dairy merchants.</span>
                    </div>
                  </div>

                  <div className="compliance-banner-row">
                    <div className="compliance-stat-card">
                      <CheckCircle size={18} color="#059669" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>Merchant Verification Tier 1</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Complete KYC and background check passed on July 2026.</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Floating Action Dock (Only Shown When Editing) ────────── */}
      {isEditing && (
        <div className="sticky-action-dock is-active-floating">
          <div className="dock-status-info">
            {hasChanges ? (
              <span className="unsaved-badge">
                <span className="pulsing-edit-dot" /> You have unsaved profile changes
              </span>
            ) : (
              <span className="editing-badge">
                <Unlock size={14} /> Edit Mode Active — Click fields to modify
              </span>
            )}
          </div>

          <div className="dock-buttons-row">
            <button 
              type="button" 
              className="dock-discard-btn"
              onClick={handleDiscard}
              disabled={isSaving}
            >
              <X size={14} /> Discard Changes
            </button>

            <button 
              type="button" 
              className="dock-save-btn"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <RefreshCw size={15} className="spin-icon" /> Synchronizing...
                </>
              ) : (
                <>
                  <Check size={16} /> Save Store Details
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessProfilePage;
