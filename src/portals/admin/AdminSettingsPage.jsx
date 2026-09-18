import React, { useState, useRef, useEffect } from 'react';
import {
  User, Shield, Truck, Users, Key,
  Camera, X, Eye, EyeOff, ChevronRight,
  Smartphone, Globe, Lock, Fingerprint, RefreshCw, Plus, Trash2,
  Zap, MapPin, Route, Settings, MoreVertical, Edit3,
  AlertTriangle, Copy, Wifi,
  Mail, Activity,
  Clock, Upload, XCircle, LogOut, Link2,
  Check, CheckCircle, Download
} from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import './AdminSettingsPage.css';

/* ─── tiny helpers ──────────────────────────────────────────── */
const Toggle = ({ checked, onChange, id }) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`stg-toggle ${checked ? 'on' : 'off'}`}
  >
    <span className="stg-toggle-thumb" />
  </button>
);

const PasswordStrength = ({ password }) => {
  const getStrength = (pw) => {
    if (!pw || pw.length < 4) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: 'var(--accent-rose)' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'var(--accent-amber)' };
    return { level: 3, label: 'Strong', color: 'var(--accent-emerald)' };
  };
  const { level, label, color } = getStrength(password);
  if (!label) return null;
  return (
    <div className="stg-pw-strength">
      <div className="stg-pw-bars">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="stg-pw-bar"
            style={{ background: i <= level ? color : 'var(--color-border)' }}
          />
        ))}
      </div>
      <span style={{ color, fontSize: '12px', fontWeight: 600 }}>{label}</span>
    </div>
  );
};

const StatusPill = ({ status }) => {
  const map = {
    Connected: { bg: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)', border: 'var(--accent-emerald-border)' },
    'Not connected': { bg: 'var(--status-neutral-bg)', color: 'var(--color-text-secondary)', border: 'var(--status-neutral-border)' },
    Active: { bg: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)', border: 'var(--accent-emerald-border)' },
    Invited: { bg: 'var(--accent-sky-light)', color: 'var(--accent-sky)', border: 'var(--accent-sky-border)' },
    Suspended: { bg: 'var(--status-danger-bg)', color: 'var(--accent-rose)', border: 'var(--status-danger-border)' },
  };
  const s = map[status] || map['Not connected'];
  return (
    <span className="stg-status-pill" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  );
};

const SectionCard = ({ children, className = '' }) => (
  <div className={`stg-card ${className}`}>{children}</div>
);

const CardHeader = ({ icon: Icon, title, description, accent }) => (
  <div className="stg-card-header">
    <div className="stg-card-icon" style={accent ? { background: accent } : {}}>
      <Icon size={20} />
    </div>
    <div>
      <h3 className="stg-card-title">{title}</h3>
      {description && <p className="stg-card-desc">{description}</p>}
    </div>
  </div>
);

const Field = ({ label, hint, error, children, id }) => (
  <div className="stg-field">
    {label && <label htmlFor={id} className="stg-label">{label}</label>}
    {children}
    {error && <span className="stg-error">{error}</span>}
    {hint && !error && <span className="stg-hint">{hint}</span>}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   SECTION COMPONENTS
══════════════════════════════════════════════════════════════ */

/* ─── PROFILE ────────────────────────────────────────────────── */
const ProfileSection = ({ onChange = () => {} }) => {
  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState('Sarah Chen');
  const [email] = useState('sarah.chen@micrologi.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const fileRef = useRef();

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setAvatar(URL.createObjectURL(f));
  };

  useEffect(() => { if (typeof onChange === 'function') onChange(); }, [name, phone, timezone]);

  const timezones = [
    'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London',
    'America/New_York', 'America/Los_Angeles', 'Australia/Sydney', 'UTC'
  ];

  return (
    <>
      <SectionCard>
        <CardHeader icon={User} title="Personal Information" description="Your name, contact details and display photo." />
        <div className="stg-avatar-row">
          <div className="stg-avatar-wrap">
            <div className="stg-avatar-circle">
              {avatar
                ? <img src={avatar} alt="avatar" className="stg-avatar-img" />
                : <span className="stg-avatar-initials">SC</span>
              }
              <div className="stg-avatar-overlay" onClick={() => fileRef.current.click()}>
                <Camera size={18} />
                <span>Change photo</span>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileChange} id="avatar-upload" />
          </div>
          <div className="stg-avatar-actions">
            <button className="btn btn-outline stg-btn-sm" onClick={() => fileRef.current.click()}>
              <Upload size={14} /> Upload photo
            </button>
            {avatar && (
              <button className="btn stg-btn-sm stg-btn-ghost-danger" onClick={() => setAvatar(null)}>
                <Trash2 size={14} /> Remove
              </button>
            )}
            <span className="stg-hint">JPG, PNG or GIF. Max 2MB.</span>
          </div>
        </div>

        <div className="stg-form-grid">
          <Field label="Full name" id="pf-name">
            <input
              id="pf-name"
              className="form-control stg-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
            />
          </Field>
          <Field label="Email address" id="pf-email">
            <div className="stg-input-inline">
              <input id="pf-email" className="form-control stg-input" value={email} readOnly />
              <span className="stg-badge-verified"><Check size={11} /> Verified</span>
            </div>
          </Field>
          <Field label="Phone number" id="pf-phone">
            <input
              id="pf-phone"
              className="form-control stg-input"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
            />
          </Field>
          <Field label="Role / Title" id="pf-role" hint="Assigned by system administrator — read only.">
            <input id="pf-role" className="form-control stg-input stg-input-readonly" value="Super Administrator" readOnly />
          </Field>
          <Field label="Timezone" id="pf-tz">
            <div className="stg-select-wrap">
              <Globe size={15} className="stg-select-icon" />
              <select
                id="pf-tz"
                className="form-select stg-select"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
              >
                {timezones.map(tz => <option key={tz}>{tz}</option>)}
              </select>
            </div>
          </Field>
        </div>
      </SectionCard>
    </>
  );
};

/* ─── ACCOUNT & SECURITY ─────────────────────────────────────── */
const SecuritySection = ({ onChange = () => {} }) => {
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confPw, setConfPw] = useState('');
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [twoFA, setTwoFA] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [otpLength, setOtpLength] = useState(6);
  const [otpExpiry, setOtpExpiry] = useState(5);
  const [geofenceOtp, setGeofenceOtp] = useState(true);
  const [autoOtp, setAutoOtp] = useState(true);
  const [revokeModal, setRevokeModal] = useState({ open: false, session: null });

  const [sessions] = useState([
    { id: 1, device: 'Chrome on macOS', location: 'Mumbai, IN', lastActive: '2 min ago', current: true },
    { id: 2, device: 'Safari on iPhone 15', location: 'Mumbai, IN', lastActive: '1 hour ago', current: false },
    { id: 3, device: 'Firefox on Windows', location: 'Bangalore, IN', lastActive: '3 days ago', current: false },
  ]);

  useEffect(() => { }, [curPw, newPw, confPw, twoFA, otpLength, otpExpiry, geofenceOtp, autoOtp]);

  const pwMismatch = confPw && newPw !== confPw;
  const hasNumber = /[0-9]/.test(newPw);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPw);
  const hasLowercase = /[a-z]/.test(newPw);
  const isPasswordValid = hasNumber && hasSpecial && hasLowercase && newPw.length >= 6;

  const handleTwoFAToggle = (val) => {
    setTwoFA(val);
    if (val) setShowQR(true);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!curPw) {
      setFeedback({ type: 'error', message: 'Please enter your current password.' });
      return;
    }
    if (!newPw) {
      setFeedback({ type: 'error', message: 'Please enter a new password.' });
      return;
    }
    if (!hasLowercase) {
      setFeedback({ type: 'error', message: 'Password must contain at least one lowercase letter (a-z).' });
      return;
    }
    if (!hasNumber) {
      setFeedback({ type: 'error', message: 'Password must contain at least one number (0-9).' });
      return;
    }
    if (!hasSpecial) {
      setFeedback({ type: 'error', message: 'Password must contain at least one special character (!@#$%^&*).' });
      return;
    }
    if (newPw.length < 6) {
      setFeedback({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPw !== confPw) {
      setFeedback({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setIsUpdating(true);
    setFeedback(null);

    setTimeout(() => {
      setIsUpdating(false);
      try {
        const savedUser = JSON.parse(localStorage.getItem('micrologi_currentUser') || '{}');
        savedUser.password = newPw;
        localStorage.setItem('micrologi_currentUser', JSON.stringify(savedUser));
        localStorage.setItem('micrologi_admin_password', newPw);
      } catch (err) {
        console.error(err);
      }

      setFeedback({ type: 'success', message: 'Password updated successfully!' });
      setCurPw('');
      setNewPw('');
      setConfPw('');
      if (typeof onChange === 'function') onChange();

      setTimeout(() => {
        setFeedback(null);
      }, 4000);
    }, 600);
  };

  return (
    <>
      {/* Password */}
      <SectionCard>
        <CardHeader icon={Lock} title="Change Password" description="Update your account password. Use a strong passphrase." />
        <div className="stg-form-grid stg-form-grid-single">
          <Field label="Current password" id="pw-cur">
            <div className="stg-pw-wrap">
              <input
                id="pw-cur"
                type={showCur ? 'text' : 'password'}
                className="form-control stg-input"
                value={curPw}
                onChange={e => {
                  setCurPw(e.target.value);
                  if (feedback) setFeedback(null);
                }}
                placeholder="••••••••"
              />
              <button type="button" className="stg-pw-eye" onClick={() => setShowCur(!showCur)}>
                {showCur ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
          <Field label="New password" id="pw-new">
            <div className="stg-pw-wrap">
              <input
                id="pw-new"
                type={showNew ? 'text' : 'password'}
                className="form-control stg-input"
                value={newPw}
                onChange={e => {
                  setNewPw(e.target.value);
                  if (feedback) setFeedback(null);
                }}
                placeholder="••••••••"
              />
              <button type="button" className="stg-pw-eye" onClick={() => setShowNew(!showNew)}>
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <PasswordStrength password={newPw} />
          </Field>
          <Field label="Confirm new password" id="pw-conf" error={pwMismatch ? 'Passwords do not match' : ''}>
            <div className="stg-pw-wrap">
              <input
                id="pw-conf"
                type={showConf ? 'text' : 'password'}
                className={`form-control stg-input ${pwMismatch ? 'stg-input-error' : ''}`}
                value={confPw}
                onChange={e => {
                  setConfPw(e.target.value);
                  if (feedback) setFeedback(null);
                }}
                placeholder="••••••••"
              />
              <button type="button" className="stg-pw-eye" onClick={() => setShowConf(!showConf)}>
                {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
        </div>

        {/* Condition text for password requirements */}
        <div className="stg-password-requirements">
          <div className="stg-req-title">Password must contain at least:</div>
          <div className="stg-req-chips">
            <div className={`stg-req-chip ${hasLowercase ? 'met' : ''}`}>
              {hasLowercase ? <Check size={12} /> : <span className="stg-req-dot" />}
              <span>Lowercase letter (a-z)</span>
            </div>
            <div className={`stg-req-chip ${hasNumber ? 'met' : ''}`}>
              {hasNumber ? <Check size={12} /> : <span className="stg-req-dot" />}
              <span>Number (0-9)</span>
            </div>
            <div className={`stg-req-chip ${hasSpecial ? 'met' : ''}`}>
              {hasSpecial ? <Check size={12} /> : <span className="stg-req-dot" />}
              <span>Special character (!@#$...)</span>
            </div>
            <div className={`stg-req-chip ${newPw.length >= 6 ? 'met' : ''}`}>
              {newPw.length >= 6 ? <Check size={12} /> : <span className="stg-req-dot" />}
              <span>Min. 6 characters</span>
            </div>
          </div>
        </div>

        <div className="stg-card-footer">
          {feedback && (
            <div className={`stg-inline-feedback ${feedback.type}`}>
              {feedback.type === 'success' ? (
                <CheckCircle size={15} />
              ) : (
                <AlertTriangle size={15} />
              )}
              <span>{feedback.message}</span>
            </div>
          )}
          <button
            type="button"
            className="btn stg-btn-update"
            onClick={handleUpdatePassword}
            disabled={isUpdating || !curPw || !newPw || !confPw || pwMismatch || !isPasswordValid}
          >
            {isUpdating ? (
              <>
                <RefreshCw size={14} className="stg-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Check size={14} />
                <span>Update Password</span>
              </>
            )}
          </button>
        </div>
      </SectionCard>

      {/* 2FA */}
      <SectionCard>
        <CardHeader icon={Fingerprint} title="Two-Factor Authentication" description="Add an extra layer of security with authenticator app TOTP." />
        <div className="stg-toggle-row">
          <div>
            <div className="stg-toggle-label">Enable two-factor authentication</div>
            <div className="stg-toggle-desc">Use an authenticator app (Google Authenticator, Authy) for login verification.</div>
          </div>
          <Toggle id="twofa-toggle" checked={twoFA} onChange={handleTwoFAToggle} />
        </div>
        {twoFA && showQR && (
          <div className="stg-2fa-setup">
            <div className="stg-qr-box">
              {/* QR Code placeholder — in production: use a QR library */}
              <div className="stg-qr-placeholder">
                <div className="stg-qr-grid">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className="stg-qr-cell" style={{ background: Math.random() > 0.45 ? '#0F172A' : 'transparent' }} />
                  ))}
                </div>
              </div>
              <p className="stg-qr-hint">Scan with your authenticator app</p>
            </div>
            <div className="stg-backup-codes">
              <div className="stg-backup-title"><Key size={14} /> Backup codes — save these safely</div>
              <div className="stg-backup-grid">
                {['7K2M-9QP4', 'X8N3-5WR1', '2JH6-4TL9', 'V5DK-8FG2', 'P3YC-1NM7', 'B9RS-6EU4'].map(code => (
                  <span key={code} className="stg-backup-code">{code}</span>
                ))}
              </div>
              <button className="btn btn-outline stg-btn-sm" style={{ marginTop: '12px' }}>
                <Download size={13} /> Download codes
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* OTP Settings */}
      <SectionCard>
        <CardHeader icon={Smartphone} title="OTP Verification Settings" description="Configure one-time password behavior for the delivery confirmation flow." />
        <div className="stg-form-grid">
          <Field label="OTP length" id="otp-len" hint="Number of digits sent to the customer for delivery confirmation.">
            <div className="stg-segment" id="otp-len">
              {[4, 6].map(n => (
                <button
                  key={n}
                  type="button"
                  className={`stg-segment-btn ${otpLength === n ? 'active' : ''}`}
                  onClick={() => setOtpLength(n)}
                >
                  {n} digits
                </button>
              ))}
            </div>
          </Field>
          <Field label="OTP expiry duration" id="otp-exp" hint="Minutes before an OTP expires.">
            <div className="stg-input-affix-wrap">
              <input
                id="otp-exp"
                type="number"
                className="form-control stg-input"
                min={1} max={60}
                value={otpExpiry}
                onChange={e => setOtpExpiry(Number(e.target.value))}
              />
              <span className="stg-input-affix">MIN</span>
            </div>
          </Field>
        </div>
        <div className="stg-toggle-stack">
          <div className="stg-toggle-row">
            <div>
              <div className="stg-toggle-label">Require geofence match before OTP entry</div>
              <div className="stg-toggle-desc">Courier must be within the delivery geofence before the OTP input is unlocked.</div>
            </div>
            <Toggle id="otp-geo" checked={geofenceOtp} onChange={val => { setGeofenceOtp(val); onChange(); }} />
          </div>
          <div className="stg-toggle-row">
            <div>
              <div className="stg-toggle-label">Auto-generate OTP for customer</div>
              <div className="stg-toggle-desc">OTPs are generated automatically. Disable to require manual entry by dispatchers.</div>
            </div>
            <Toggle id="otp-auto" checked={autoOtp} onChange={val => { setAutoOtp(val); onChange(); }} />
          </div>
        </div>
      </SectionCard>

      {/* Sessions */}
      <SectionCard>
        <CardHeader icon={Activity} title="Active Sessions" description="Devices currently signed in to your account." />
        <div className="stg-sessions-list">
          {sessions.map(s => (
            <div key={s.id} className="stg-session-row">
              <div className="stg-session-icon">
                <Smartphone size={18} />
              </div>
              <div className="stg-session-info">
                <div className="stg-session-device">
                  {s.device}
                  {s.current && <span className="stg-badge-current">Current</span>}
                </div>
                <div className="stg-session-meta">
                  <MapPin size={11} />{s.location} · <Clock size={11} />{s.lastActive}
                </div>
              </div>
              {!s.current && (
                <button
                  className="btn btn-outline stg-btn-sm stg-btn-danger-outline"
                  onClick={() => setRevokeModal({ open: true, session: s })}
                >
                  <LogOut size={13} /> Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Danger zone */}
      <SectionCard className="stg-danger-zone">
        <CardHeader icon={AlertTriangle} title="Danger Zone" description="Irreversible account actions. Proceed with extreme caution." />
        <div className="stg-danger-actions">
          <div className="stg-danger-item">
            <div>
              <div className="stg-danger-title">Deactivate account</div>
              <div className="stg-danger-desc">Temporarily disable your account. You can reactivate at any time.</div>
            </div>
            <button className="btn stg-btn-danger-outline stg-btn-sm">Deactivate</button>
          </div>
          <div className="stg-danger-item">
            <div>
              <div className="stg-danger-title">Delete account permanently</div>
              <div className="stg-danger-desc">This will permanently erase all your data and cannot be undone.</div>
            </div>
            <button className="btn stg-btn-danger-solid stg-btn-sm">Delete account</button>
          </div>
        </div>
      </SectionCard>

      <ConfirmationModal
        isOpen={revokeModal.open}
        onClose={() => setRevokeModal({ open: false, session: null })}
        onConfirm={() => {}}
        title="Revoke this session?"
        message="The selected device will be immediately signed out and will need to re-authenticate."
        subjectName={revokeModal.session?.device}
        subjectInfo={`Location: ${revokeModal.session?.location} · Last active: ${revokeModal.session?.lastActive}`}
        confirmText="Yes, revoke this session"
        cancelText="Keep session"
        variant="danger"
        badgeText="SESSION REVOKE"
        icon={LogOut}
      />
    </>
  );
};

/* ─── DELIVERY & DISPATCH ────────────────────────────────────── */
const DeliverySection = ({ onChange = () => {} }) => {
  const [geofenceRadius, setGeofenceRadius] = useState(250);
  const [batchSize, setBatchSize] = useState(5);
  const [autoAssign, setAutoAssign] = useState(true);
  const [assignTimeout, setAssignTimeout] = useState(3);
  const [routeOpt, setRouteOpt] = useState('Balanced');
  const [otpRetry, setOtpRetry] = useState(3);

  useEffect(() => { if (typeof onChange === 'function') onChange(); }, [geofenceRadius, batchSize, autoAssign, assignTimeout, routeOpt, otpRetry]);

  return (
    <>
      <SectionCard>
        <CardHeader icon={MapPin} title="Geofence & Dispatch Defaults" description="Configure geofence radii and batch-level operational parameters." />
        <div className="stg-form-grid">
          <Field label="Default geofence radius" id="geo-radius" hint="OTP unlock distance from customer location (meters).">
            <div className="stg-slider-field">
              <input
                id="geo-radius"
                type="range"
                className="stg-slider"
                min={50} max={1000} step={50}
                value={geofenceRadius}
                onChange={e => setGeofenceRadius(Number(e.target.value))}
              />
              <span className="stg-slider-badge">{geofenceRadius} m</span>
            </div>
          </Field>
          <Field label="Default batch size limit" id="batch-sz" hint="Maximum orders bundled into a single dispatch mission.">
            <div className="stg-input-affix-wrap">
              <input
                id="batch-sz"
                type="number"
                className="form-control stg-input"
                min={1} max={20}
                value={batchSize}
                onChange={e => setBatchSize(Number(e.target.value))}
              />
              <span className="stg-input-affix">ORDERS</span>
            </div>
          </Field>
        </div>
      </SectionCard>

      <SectionCard>
        <CardHeader icon={Zap} title="Auto-Assignment & Routing" description="Control automated courier assignment and route optimization preferences." />
        <div className="stg-toggle-row" style={{ marginBottom: '20px' }}>
          <div>
            <div className="stg-toggle-label">Automatically assign nearest available courier</div>
            <div className="stg-toggle-desc">The system selects the optimal courier based on proximity and current load.</div>
          </div>
          <Toggle id="auto-assign" checked={autoAssign} onChange={setAutoAssign} />
        </div>
        <div className="stg-form-grid">
          <Field label="Fallback timeout before manual review" id="assign-timeout" hint="Minutes to wait before flagging for manual dispatcher action.">
            <div className="stg-input-affix-wrap">
              <input
                id="assign-timeout"
                type="number"
                className="form-control stg-input"
                min={1} max={30}
                value={assignTimeout}
                disabled={!autoAssign}
                onChange={e => setAssignTimeout(Number(e.target.value))}
              />
              <span className="stg-input-affix">MIN</span>
            </div>
          </Field>
          <Field label="Route optimization preference" id="route-opt">
            <div className="stg-select-wrap">
              <Route size={15} className="stg-select-icon" />
              <select
                id="route-opt"
                className="form-select stg-select"
                value={routeOpt}
                onChange={e => setRouteOpt(e.target.value)}
              >
                {['Fastest route', 'Shortest distance', 'Balanced'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </Field>
          <Field label="OTP retry limit before manual review" id="otp-retry" hint="Consecutive failed OTP attempts before flagging a delivery.">
            <div className="stg-input-affix-wrap">
              <input
                id="otp-retry"
                type="number"
                className="form-control stg-input"
                min={1} max={10}
                value={otpRetry}
                onChange={e => setOtpRetry(Number(e.target.value))}
              />
              <span className="stg-input-affix">RETRIES</span>
            </div>
          </Field>
        </div>
      </SectionCard>
    </>
  );
};

/* ─── TEAM & ROLES ───────────────────────────────────────────── */
const TeamSection = ({ onChange = () => {} }) => {
  const initMembers = [
    { id: 1, name: 'Sarah Chen', email: 'sarah.chen@micrologi.com', role: 'Super Admin', status: 'Active', lastActive: 'Now', initials: 'SC', color: '#4F46E5' },
    { id: 2, name: 'Arjun Mehta', email: 'arjun.m@micrologi.com', role: 'Dispatcher', status: 'Active', lastActive: '45 min ago', initials: 'AM', color: '#0284C7' },
    { id: 3, name: 'Priya Singh', email: 'priya.s@micrologi.com', role: 'Viewer', status: 'Invited', lastActive: '—', initials: 'PS', color: '#059669' },
    { id: 4, name: 'Rahul Dev', email: 'rahul.d@micrologi.com', role: 'Dispatcher', status: 'Suspended', lastActive: '2 days ago', initials: 'RD', color: '#D97706' },
  ];
  const [members, setMembers] = useState(initMembers);
  const [inviteModal, setInviteModal] = useState(false);
  const [removeModal, setRemoveModal] = useState({ open: false, member: null });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Viewer');
  const [showMatrix, setShowMatrix] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);

  const permissions = {
    'Super Admin': { Orders: true, Batches: true, Analytics: true, Settings: true, 'Team & Roles': true, Integrations: true },
    Dispatcher: { Orders: true, Batches: true, Analytics: true, Settings: false, 'Team & Roles': false, Integrations: false },
    Viewer: { Orders: true, Batches: false, Analytics: true, Settings: false, 'Team & Roles': false, Integrations: false },
  };

  return (
    <>
      <SectionCard>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 className="stg-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} style={{ color: 'var(--accent-primary)' }} /> Team Members
            </h3>
            <p className="stg-card-desc">Manage team access and roles for the Control Tower.</p>
          </div>
          <button className="btn btn-primary stg-btn-sm" onClick={() => setInviteModal(true)}>
            <Plus size={14} /> Invite member
          </button>
        </div>
        <div className="stg-team-table-wrap">
          <table className="stg-team-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Active</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} className="stg-team-row">
                  <td>
                    <div className="stg-member-cell">
                      <div className="stg-member-avatar" style={{ background: m.color }}>{m.initials}</div>
                      <div>
                        <div className="stg-member-name">{m.name}</div>
                        <div className="stg-member-email">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      className="stg-role-select form-select"
                      value={m.role}
                      onChange={e => {
                        setMembers(prev => prev.map(p => p.id === m.id ? { ...p, role: e.target.value } : p));
                        onChange();
                      }}
                    >
                      {['Super Admin', 'Dispatcher', 'Viewer'].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </td>
                  <td><StatusPill status={m.status} /></td>
                  <td className="stg-team-last-active">{m.lastActive}</td>
                  <td>
                    <div className="stg-actions-menu-wrap">
                      <button
                        className="stg-actions-btn"
                        onClick={() => setMenuOpen(menuOpen === m.id ? null : m.id)}
                      >
                        <MoreVertical size={15} />
                      </button>
                      {menuOpen === m.id && (
                        <div className="stg-actions-dropdown">
                          <button className="stg-actions-item" onClick={() => { setMenuOpen(null); }}>
                            <Edit3 size={13} /> Edit role
                          </button>
                          <button
                            className="stg-actions-item danger"
                            onClick={() => { setMenuOpen(null); setRemoveModal({ open: true, member: m }); }}
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Permission Matrix */}
      <SectionCard>
        <button
          className="stg-expand-row"
          onClick={() => setShowMatrix(!showMatrix)}
          type="button"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={16} style={{ color: 'var(--accent-primary)' }} />
            <span className="stg-card-title">Role Permission Matrix</span>
          </div>
          <ChevronRight size={16} className={`stg-chevron ${showMatrix ? 'open' : ''}`} />
        </button>
        {showMatrix && (
          <div className="stg-matrix-wrap">
            <table className="stg-matrix-table">
              <thead>
                <tr>
                  <th>Permission</th>
                  {Object.keys(permissions).map(r => <th key={r}>{r}</th>)}
                </tr>
              </thead>
              <tbody>
                {Object.keys(Object.values(permissions)[0]).map(perm => (
                  <tr key={perm}>
                    <td>{perm}</td>
                    {Object.values(permissions).map((p, i) => (
                      <td key={i} className="stg-matrix-cell">
                        {p[perm]
                          ? <CheckCircle size={16} style={{ color: 'var(--accent-emerald)' }} />
                          : <XCircle size={16} style={{ color: 'var(--status-neutral-dot)' }} />
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Invite Modal */}
      {inviteModal && createPortal(
        <div className="stg-modal-backdrop" onClick={() => setInviteModal(false)}>
          <div className="stg-modal-card" onClick={e => e.stopPropagation()}>
            <div className="stg-modal-header">
              <h3>Invite team member</h3>
              <button className="stg-modal-close" onClick={() => setInviteModal(false)}><X size={16} /></button>
            </div>
            <div className="stg-modal-body">
              <Field label="Email address" id="inv-email">
                <input
                  id="inv-email"
                  type="email"
                  className="form-control stg-input"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                />
              </Field>
              <Field label="Role" id="inv-role" hint="Controls what this person can view and manage.">
                <div className="stg-select-wrap">
                  <Shield size={14} className="stg-select-icon" />
                  <select id="inv-role" className="form-select stg-select" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                    {['Super Admin', 'Dispatcher', 'Viewer'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </Field>
            </div>
            <div className="stg-modal-footer">
              <button className="btn btn-outline stg-btn-sm" onClick={() => setInviteModal(false)}>Cancel</button>
              <button className="btn btn-primary stg-btn-sm" onClick={() => {
                if (inviteEmail) {
                  setMembers(prev => [...prev, {
                    id: Date.now(), name: inviteEmail, email: inviteEmail, role: inviteRole,
                    status: 'Invited', lastActive: '—', initials: inviteEmail.slice(0, 2).toUpperCase(), color: '#94A3B8'
                  }]);
                  setInviteModal(false);
                  setInviteEmail('');
                  onChange();
                }
              }}>
                <Mail size={13} /> Send invitation
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ConfirmationModal
        isOpen={removeModal.open}
        onClose={() => setRemoveModal({ open: false, member: null })}
        onConfirm={() => {
          setMembers(prev => prev.filter(m => m.id !== removeModal.member?.id));
          if (typeof onChange === 'function') onChange();
        }}
        title="Remove team member?"
        message="This person will lose all access to the Control Tower immediately."
        subjectName={removeModal.member?.name}
        subjectInfo={`${removeModal.member?.email} · ${removeModal.member?.role}`}
        confirmText="Yes, remove member"
        cancelText="Keep member"
        variant="danger"
        badgeText="TEAM ACCESS"
        icon={Users}
      />
    </>
  );
};

/* ─── INTEGRATIONS & API KEYS ────────────────────────────────── */
const IntegrationsSection = ({ onChange = () => {} }) => {
  const [mapsKey, setMapsKey] = useState('AIzaSyD-9tSrke72M4PXyH5TIqVwNXhSR2Z8Q0E');
  const [showKey, setShowKey] = useState(false);
  const [mapsStatus, setMapsStatus] = useState(null); // null | 'ok' | 'error' | 'testing'
  const [webhookUrl, setWebhookUrl] = useState('https://your-endpoint.com/hooks/delivery-status');
  const [webhookStatus, setWebhookStatus] = useState(null);

  const [services] = useState([
    { id: 'sms', name: 'MSG91 SMS', desc: 'OTP and delivery notification delivery', status: 'Connected', logo: '📱' },
    { id: 'pay', name: 'Razorpay', desc: 'Payment gateway for COD and prepaid orders', status: 'Connected', logo: '💳' },
    { id: 'map', name: 'Google Maps Platform', desc: 'Geocoding, routing and geofence services', status: 'Connected', logo: '🗺️' },
    { id: 'slack', name: 'Slack Alerts', desc: 'Dispatch alerts to your ops Slack channel', status: 'Not connected', logo: '💬' },
  ]);

  const testMaps = () => {
    setMapsStatus('testing');
    setTimeout(() => setMapsStatus(mapsKey.length > 10 ? 'ok' : 'error'), 1400);
  };
  const testWebhook = () => {
    setWebhookStatus('testing');
    setTimeout(() => setWebhookStatus(webhookUrl.startsWith('https') ? 'ok' : 'error'), 1600);
  };

  useEffect(() => { if (typeof onChange === 'function') onChange(); }, [mapsKey, webhookUrl]);

  const maskedKey = mapsKey.replace(/./g, (c, i) => i < 7 || i > mapsKey.length - 5 ? c : '•');

  return (
    <>
      <SectionCard>
        <CardHeader icon={Key} title="Google Maps API Key" description="Used for geocoding, route optimization and geofence calculations." />
        <Field label="API Key" id="maps-key">
          <div className="stg-api-key-row">
            <div className="stg-pw-wrap" style={{ flex: 1 }}>
              <input
                id="maps-key"
                type={showKey ? 'text' : 'password'}
                className="form-control stg-input"
                value={showKey ? mapsKey : maskedKey}
                onChange={e => { if (showKey) setMapsKey(e.target.value); onChange(); }}
              />
              <button type="button" className="stg-pw-eye" onClick={() => setShowKey(!showKey)}>
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <button className="btn btn-outline stg-btn-sm" onClick={() => { navigator.clipboard?.writeText(mapsKey); }}>
              <Copy size={13} />
            </button>
            <button
              className={`btn stg-btn-sm ${mapsStatus === 'ok' ? 'stg-btn-success-outline' : mapsStatus === 'error' ? 'stg-btn-danger-outline' : 'btn-outline'}`}
              onClick={testMaps}
              disabled={mapsStatus === 'testing'}
            >
              {mapsStatus === 'testing' && <RefreshCw size={13} className="stg-spin" />}
              {mapsStatus === 'ok' && <CheckCircle size={13} />}
              {mapsStatus === 'error' && <XCircle size={13} />}
              {!mapsStatus && <Wifi size={13} />}
              {mapsStatus === 'testing' ? 'Testing…' : mapsStatus === 'ok' ? 'Connected' : mapsStatus === 'error' ? 'Failed' : 'Test connection'}
            </button>
          </div>
        </Field>
      </SectionCard>

      <SectionCard>
        <CardHeader icon={Link2} title="Webhook Configuration" description="Receive real-time HTTP POST callbacks for order and delivery status events." />
        <Field label="Webhook endpoint URL" id="wh-url" hint="Must be publicly accessible over HTTPS.">
          <div className="stg-api-key-row">
            <input
              id="wh-url"
              className="form-control stg-input"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              placeholder="https://your-server.com/hooks/delivery"
              style={{ flex: 1 }}
            />
            <button
              className={`btn stg-btn-sm ${webhookStatus === 'ok' ? 'stg-btn-success-outline' : webhookStatus === 'error' ? 'stg-btn-danger-outline' : 'btn-outline'}`}
              onClick={testWebhook}
              disabled={webhookStatus === 'testing'}
            >
              {webhookStatus === 'testing' && <RefreshCw size={13} className="stg-spin" />}
              {webhookStatus === 'ok' && <CheckCircle size={13} />}
              {webhookStatus === 'error' && <XCircle size={13} />}
              {!webhookStatus && <Zap size={13} />}
              {webhookStatus === 'testing' ? 'Sending…' : webhookStatus === 'ok' ? 'Sent' : webhookStatus === 'error' ? 'Failed' : 'Send test webhook'}
            </button>
          </div>
        </Field>
      </SectionCard>

      <SectionCard>
        <CardHeader icon={Globe} title="Connected Services" description="Third-party service integrations for SMS, payments and more." />
        <div className="stg-services-list">
          {services.map(svc => (
            <div key={svc.id} className="stg-service-row">
              <div className="stg-service-logo">{svc.logo}</div>
              <div className="stg-service-info">
                <div className="stg-service-name">{svc.name}</div>
                <div className="stg-service-desc">{svc.desc}</div>
              </div>
              <StatusPill status={svc.status} />
              <button className={`btn stg-btn-sm ${svc.status === 'Connected' ? 'stg-btn-danger-outline' : 'btn-primary'}`}>
                {svc.status === 'Connected' ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
};



/* ══════════════════════════════════════════════════════════════
   MAIN SETTINGS PAGE
══════════════════════════════════════════════════════════════ */
const AdminSettingsPage = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const contentRef = useRef();

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Account & Security', icon: Shield },
    { id: 'delivery', label: 'Delivery & Dispatch', icon: Truck },
    { id: 'team', label: 'Team & Roles', icon: Users },
    { id: 'integrations', label: 'Integrations & API Keys', icon: Key },
  ];

  const switchSection = (id) => {
    setActiveSection(id);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  return (
    <div className="page-container stg-page">
      <div className="stg-settings-layout">
        {/* Left sub-nav */}
        <nav className="stg-subnav" aria-label="Settings navigation">
          {/* Mobile tab scroller */}
          <div className="stg-subnav-mobile-scroll">
            {navItems.map(item => (
              <button
                key={item.id}
                type="button"
                className={`stg-subnav-tab ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => switchSection(item.id)}
              >
                <item.icon size={14} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Desktop vertical nav */}
          <div className="stg-subnav-desktop">
            <div className="stg-subnav-header">
              <div className="stg-subnav-header-icon"><Settings size={14} /></div>
              <span>Settings</span>
            </div>
            <div className="stg-subnav-group">
              <div className="stg-subnav-group-label">Account</div>
              {navItems.slice(0, 2).map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={`stg-subnav-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => switchSection(item.id)}
                >
                  <span className="stg-subnav-icon-wrap"><item.icon size={15} /></span>
                  <span className="stg-subnav-label">{item.label}</span>
                  {activeSection === item.id && <span className="stg-subnav-active-pip" />}
                </button>
              ))}
            </div>
            <div className="stg-subnav-divider" />
            <div className="stg-subnav-group">
              <div className="stg-subnav-group-label">Operations</div>
              {navItems.slice(2, 4).map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={`stg-subnav-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => switchSection(item.id)}
                >
                  <span className="stg-subnav-icon-wrap"><item.icon size={15} /></span>
                  <span className="stg-subnav-label">{item.label}</span>
                  {activeSection === item.id && <span className="stg-subnav-active-pip" />}
                </button>
              ))}
            </div>
            <div className="stg-subnav-divider" />
            <div className="stg-subnav-group">
              <div className="stg-subnav-group-label">Platform</div>
              {navItems.slice(5).map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={`stg-subnav-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => switchSection(item.id)}
                >
                  <span className="stg-subnav-icon-wrap"><item.icon size={15} /></span>
                  <span className="stg-subnav-label">{item.label}</span>
                  {activeSection === item.id && <span className="stg-subnav-active-pip" />}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Right content panel */}
        <div className="stg-content-panel" ref={contentRef}>
          <div className={`stg-section-container stg-section-enter`} key={activeSection}>
            {activeSection === 'profile' && <ProfileSection />}
            {activeSection === 'security' && <SecuritySection />}
            {activeSection === 'delivery' && <DeliverySection />}
            {activeSection === 'team' && <TeamSection />}
            {activeSection === 'integrations' && <IntegrationsSection />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
