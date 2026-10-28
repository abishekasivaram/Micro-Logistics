import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Eye, EyeOff, ArrowLeft, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { rectifyCustomerUser } from '../utils/customerDirectory';
import './LoginPage.css';

const getRole = (metadata, email = '') => {
  if (metadata?.role) return metadata.role;
  const lower = (email || '').toLowerCase();
  if (lower.includes('admin')) return 'admin';
  if (lower.includes('agent') || lower.includes('da')) return 'delivery_partner';
  if (lower.includes('vendor') || lower.includes('seller') || lower.includes('nammachennai')) return 'vendor';
  return 'customer';
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { setCurrentUser, customers, vendors, deliveryAgents } = useAppContext();
  
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showForgotModal) {
        setShowForgotModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showForgotModal]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMsg('');
    
    const searchId = usernameOrEmail.trim();
    if (!searchId) {
      setErrorMsg("Please enter your User ID, Shop Name, or Email.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    const lowerSearchId = searchId.toLowerCase();
    setIsSubmitting(true);

    const loginSuccess = (userObj, role) => {
      const normalizedRole = role === 'seller' ? 'vendor' : role;
      setCurrentUser({ ...userObj, role: normalizedRole });
      setPassword('');
      if (normalizedRole === 'customer') {
        navigate('/customer-dashboard');
      } else if (normalizedRole === 'vendor') {
        navigate('/vendor-dashboard');
      } else if (normalizedRole === 'admin') {
        navigate('/admin-dashboard');
      } else if (normalizedRole === 'delivery_partner') {
        navigate('/delivery');
      } else {
        navigate('/');
      }
    };

    try {
      let resolvedEmail = null;

      const TEST_ID_MAP = {
        'admin': 'admin@example.com',
        'c1': 'priya_auth@example.com',
        'priyarajan': 'priya_auth@example.com',
        'c2': 'c2@example.com',
        'c3': 'c3@example.com',
        'c4': 'c4@example.com',
        'v1': 'contact_auth@nammachennai.com',
        'v2': 'v2@example.com',
        'v3': 'v3@example.com',
        'v4': 'v4@example.com',
        'da': 'da2@example.com',
        'da1': 'agent1_auth@example.com',
        'da2': 'da2@example.com',
        'da3': 'da3@example.com',
        'da4': 'da4@example.com'
      };

      if (searchId.includes('@')) {
        resolvedEmail = searchId;
      } else if (TEST_ID_MAP[lowerSearchId]) {
        resolvedEmail = TEST_ID_MAP[lowerSearchId];
      } else {
        // Try backend /auth/resolve endpoint
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
          const apiBase = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'https://micro-logistics.onrender.com/api/v1' : 'http://localhost:5000/api/v1');
          const resolveRes = await fetch(`${apiBase}/auth/resolve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: searchId }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (resolveRes.ok) {
            const resolveData = await resolveRes.json();
            if (resolveData.success && resolveData.email) {
              resolvedEmail = resolveData.email;
            }
          }
        } catch {
          clearTimeout(timeoutId);
        }
      }

      if (resolvedEmail) {
        try {
          await supabase.auth.signOut();
        } catch (e) {}

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: resolvedEmail,
          password
        });

        if (!authError && authData?.user) {
          // Resolve role from verified database profiles table
          let role = null;
          let profileName = null;
          let profilePhone = null;

          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authData.user.id)
              .single();
            if (profile) {
              role = profile.role;
              profileName = profile.username;
              profilePhone = profile.phone;
            }
          } catch {}

          if (!role) {
            role = authData.user.user_metadata?.role || authData.user.app_metadata?.role || getRole(authData.user.user_metadata, resolvedEmail) || 'customer';
          }
          if (role === 'seller') role = 'vendor';

          let customerAddress = null;
          let customerArea = null;
          let customerPhone = null;

          if (role === 'customer') {
            try {
              const { data: custProf } = await supabase.from('customer_profiles').select('*').eq('id', authData.user.id).single();
              if (custProf) {
                customerAddress = custProf.address;
                customerArea = custProf.area;
                customerPhone = custProf.phone;
              }
            } catch (e) {}
          }

          const rawUser = {
            id: authData.user.id,
            email: resolvedEmail,
            name: profileName || authData.user.user_metadata?.full_name || searchId,
            username: profileName || searchId,
            phone: profilePhone || customerPhone,
            legacy_id: authData.user.user_metadata?.legacy_id || searchId,
            shop_name: authData.user.user_metadata?.shop_name || authData.user.user_metadata?.full_name,
            shopName: authData.user.user_metadata?.shop_name || authData.user.user_metadata?.full_name,
            address: customerAddress,
            area: customerArea
          };

          const baseUser = role === 'customer' ? rectifyCustomerUser(rawUser) : rawUser;

          loginSuccess(baseUser, role);
          return;
        } else {
          setErrorMsg("Incorrect credentials. Please verify your details and try again.");
          return;
        }
      } else {
        setErrorMsg("Account not found. Please check your User ID, Shop Name, or Agent ID.");
        return;
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred during sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = (role) => {
    const demoRoleMap = {
      customer: 'c1',
      vendor: 'v1',
      admin: 'admin',
      delivery_partner: 'da1'
    };
    setUsernameOrEmail(demoRoleMap[role] || '');
    setErrorMsg('');
  };

  return (
    <div className="login-container">
      <div className="login-split login-left">
        <div className="login-branding">
          <Link to="/" className="back-link">
            <ArrowLeft size={18} /> Back to Landing Page
          </Link>
          <h1>Smart Micro-Logistics</h1>
          <p>Smarter Local Orders. Better Delivery Coordination.</p>
          <div className="branding-features">
            <div className="b-feat">✔ Hyper-local Seller Network</div>
            <div className="b-feat">✔ Automated Delivery Window Aggregation</div>
            <div className="b-feat">✔ End-to-End Live Dispatch Tracking</div>
          </div>
        </div>
      </div>
      
      <div className="login-split login-right">
        <div className="login-card">
          
          <div className="login-header-group">
            <div className="header-top-row">
              <h2>Welcome Back</h2>
              <Link to="/" className="btn-text-back">Home</Link>
            </div>
            <p className="login-subtitle">Sign in to continue</p>
          </div>

          {errorMsg && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="identifier">User ID / Shop Name</label>
              <input 
                type="text" 
                id="identifier" 
                className="form-control" 
                placeholder="Enter your ID or shop name"
                value={usernameOrEmail}
                disabled={isSubmitting}
                onChange={e => {
                  setUsernameOrEmail(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="password" 
                  className="form-control" 
                  placeholder="Enter your password" 
                  value={password}
                  disabled={isSubmitting}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="form-options">
              <label htmlFor="rememberMe" className="checkbox-label">
                <input 
                  id="rememberMe"
                  type="checkbox" 
                  checked={rememberMe} 
                  disabled={isSubmitting}
                  onChange={e => setRememberMe(e.target.checked)} 
                />
                <span>Remember me</span>
              </label>
              <button 
                type="button" 
                className="forgot-password-btn"
                onClick={() => setShowForgotModal(true)}
                disabled={isSubmitting}
              >
                Forgot password?
              </button>
            </div>
            
            <button 
              type="submit" 
              className="btn w-full login-btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Quick Logins */}
          <div className="demo-accounts-section">
            <span className="demo-title">Quick Demo Login:</span>
            <div className="demo-pills">
              <button type="button" className="demo-pill" onClick={() => handleDemoLogin('customer')} title="Explore Customer Portal">Customer</button>
              <button type="button" className="demo-pill" onClick={() => handleDemoLogin('vendor')} title="Explore Seller Portal">Seller</button>
              <button type="button" className="demo-pill" onClick={() => handleDemoLogin('admin')} title="Explore Admin Portal">Admin</button>
              <button type="button" className="demo-pill" onClick={() => handleDemoLogin('delivery_partner')} title="Explore Delivery Portal">Delivery</button>
            </div>
          </div>

          <div className="login-footer">
            <p>Don't have an account? <Link to="/register-customer">Create Account</Link> | <Link to="/register-seller">Register as Seller</Link></p>
          </div>

          {/* Forgot Password Modal */}
          {showForgotModal && (
            <div className="modal-backdrop" onClick={() => setShowForgotModal(false)}>
              <div 
                className="notice-modal-card" 
                role="dialog" 
                aria-modal="true" 
                aria-labelledby="recovery-title"
                onClick={e => e.stopPropagation()}
              >
                <div className="notice-header">
                  <Lock size={24} className="text-warning" />
                  <h3 id="recovery-title">Password Recovery</h3>
                </div>
                <p>Please contact your system administrator or store coordinator to reset your account password.</p>
                <p className="text-sm text-secondary mt-2">Press <kbd>Esc</kbd> or click Close to dismiss.</p>
                <button className="btn btn-primary w-full mt-4" onClick={() => setShowForgotModal(false)}>
                  Close
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
