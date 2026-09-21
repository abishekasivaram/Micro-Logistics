import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { mockUsers } from '../data/sampleData';
import { Eye, EyeOff, ArrowLeft, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import './LoginPage.css';

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

  const handleLogin = async (e) => {
    e.preventDefault();
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

    // Helper to determine role from email or metadata (fallback if needed)
    const getRole = (metadata, emailStr) => {
      if (metadata?.role) return metadata.role;
      if (emailStr.includes('admin')) return 'admin';
      return 'customer'; // Default
    };

    const loginSuccess = (userObj, role) => {
      setCurrentUser({ ...userObj, role });
      if (role === 'customer') {
        navigate('/customer-dashboard');
      } else if (role === 'vendor') {
        navigate('/vendor-dashboard');
      } else if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'delivery_partner') {
        navigate('/delivery-dashboard');
      } else {
        navigate('/');
      }
    };

    try {
      let resolvedEmail = null;

      if (searchId.includes('@')) {
        resolvedEmail = searchId;
      } else if (lowerSearchId === 'admin') {
        resolvedEmail = 'admin@example.com';
      } else {
        // Try backend /auth/resolve endpoint
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);

        try {
          const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
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
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: resolvedEmail,
          password
        });

        if (!authError && authData?.user) {
          const role = getRole(authData.user.user_metadata, resolvedEmail);
          
          // Use basic user details for now; AppContext will hydrate full data
          const baseUser = {
            id: authData.user.id,
            email: resolvedEmail,
            name: authData.user.user_metadata?.full_name || searchId,
            username: searchId
          };

          loginSuccess(baseUser, role);
          return;
        } else {
          setErrorMsg("Incorrect credentials. Please try again.");
          return;
        }
      } else {
        setErrorMsg("Account not found. Please check your User ID, Shop Name, or Agent ID.");
        return;
      }
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMsg("An error occurred during login.");
    }
  };

  const fillDemoAccount = (id, pwd) => {
    setUsernameOrEmail(id);
    setPassword(pwd);
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
                  onChange={e => setRememberMe(e.target.checked)} 
                />
                <span>Remember me</span>
              </label>
              <button 
                type="button" 
                className="forgot-password-btn"
                onClick={() => setShowForgotModal(true)}
              >
                Forgot password?
              </button>
            </div>
            
            <button 
              type="submit" 
              className="btn w-full login-btn btn-primary"
            >
              Sign In
            </button>
          </form>

          {/* Demo Quick Logins */}
          <div className="demo-accounts-section">
            <span className="demo-title">Quick Demo Login:</span>
            <div className="demo-pills">
              <button 
                type="button" 
                className="demo-pill" 
                onClick={() => fillDemoAccount('priyarajan', 'password123')}
                title="Fill Customer Demo"
              >
                Customer
              </button>
              <button 
                type="button" 
                className="demo-pill" 
                onClick={() => fillDemoAccount('v1', 'password123')}
                title="Fill Vendor Demo"
              >
                Seller
              </button>
              <button 
                type="button" 
                className="demo-pill" 
                onClick={() => fillDemoAccount('admin', 'password123')}
                title="Fill Admin Demo"
              >
                Admin
              </button>
              <button 
                type="button" 
                className="demo-pill" 
                onClick={() => fillDemoAccount('da1', 'password123')}
                title="Fill Delivery Agent Demo"
              >
                Delivery
              </button>
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
                <p>For demonstration purposes, default passwords are set to <strong>password123</strong>.</p>
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
