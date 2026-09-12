import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { mockUsers } from '../data/sampleData';
import { Eye, EyeOff, Shield, ArrowLeft, Info, Lock } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentUser, customers, vendors } = useAppContext();
  
  // Initial role from state navigation if present
  const initialRole = location.state?.role || 'customer';
  const [selectedRole, setSelectedRole] = useState(initialRole);
  
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [showGoogleNotice, setShowGoogleNotice] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    
    let userToSet = null;

    if (selectedRole === 'customer') {
      userToSet = customers.find(c => c.email === usernameOrEmail || c.username === usernameOrEmail) || {
        id: 'c1',
        name: usernameOrEmail ? usernameOrEmail.split('@')[0] : 'Priya Rajan',
        role: 'customer',
        email: usernameOrEmail || 'priya@example.com',
        phone: '9876543210',
        address: '101 Anna Nagar East, Chennai'
      };
      setCurrentUser(userToSet);
      navigate('/customer-dashboard');
    } else if (selectedRole === 'vendor') { // Seller
      const searchName = usernameOrEmail.trim().toLowerCase();
      const shop = vendors.find(v => (v.shopName || v.name).trim().toLowerCase() === searchName);
      if (!shop) {
        alert("Shop not found. Please check your Shop Name.");
        return;
      }
      if (shop.password && shop.password !== password) {
        alert("Incorrect password. Please try again.");
        return;
      }
      userToSet = { ...shop, role: 'vendor' };
      setCurrentUser(userToSet);
      navigate('/vendor-dashboard');
    } else if (selectedRole === 'admin') {
      userToSet = {
        id: 'u3',
        name: 'System Admin',
        role: 'admin',
        email: 'admin@micrologi.com'
      };
      setCurrentUser(userToSet);
      navigate('/admin-dashboard');
    }
  };

  const handleGoogleClick = () => {
    setShowGoogleNotice(true);
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
        <div className={`login-card ${selectedRole === 'admin' ? 'admin-card-border' : ''}`}>
          
          <div className="login-header-group">
            <div className="header-top-row">
              <h2>{selectedRole === 'admin' ? 'Admin Access Hub' : 'Sign In to Platform'}</h2>
              <Link to="/" className="btn-text-back">Home</Link>
            </div>
            <p className="login-subtitle">
              {selectedRole === 'customer' 
                ? 'Sign in to order local items and track deliveries.' 
                : selectedRole === 'vendor'
                ? 'Sign in to manage seller products and fulfillment.'
                : 'Secure administrative credentials required.'}
            </p>
          </div>
          
          {/* Role selector tabs */}
          <div className="role-selector">
            <button 
              className={`role-btn ${selectedRole === 'customer' ? 'active' : ''}`}
              onClick={() => { setSelectedRole('customer'); setUsernameOrEmail('priya@example.com'); }}
              type="button"
            >
              Customer
            </button>
            <button 
              className={`role-btn ${selectedRole === 'vendor' ? 'active' : ''}`}
              onClick={() => { setSelectedRole('vendor'); setUsernameOrEmail('Namma Chennai Grocers'); setPassword('password123'); }}
              type="button"
            >
              Seller
            </button>
            <button 
              className={`role-btn ${selectedRole === 'admin' ? 'active' : ''}`}
              onClick={() => { setSelectedRole('admin'); setUsernameOrEmail('admin@micrologi.com'); }}
              type="button"
            >
              <Shield size={14} style={{ marginRight: '4px' }} /> Admin
            </button>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="identifier">
                {selectedRole === 'admin' ? 'Admin ID / Email' : selectedRole === 'vendor' ? 'Shop Name' : 'Customer Username / Email'}
              </label>
              <input 
                type="text" 
                id="identifier" 
                className="form-control" 
                placeholder={selectedRole === 'admin' ? 'admin@micrologi.com' : selectedRole === 'vendor' ? 'Namma Chennai Grocers' : 'priya@example.com'}
                value={usernameOrEmail}
                onChange={e => setUsernameOrEmail(e.target.value)}
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
                  placeholder="••••••••" 
                  value={password || 'password123'}
                  onChange={e => setPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="form-options">
              <label className="checkbox-label">
                <input 
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
                {selectedRole === 'admin' ? 'Secure Recovery' : 'Forgot password?'}
              </button>
            </div>
            
            <button 
              type="submit" 
              className={`btn w-full login-btn ${selectedRole === 'admin' ? 'btn-dark' : 'btn-primary'}`}
            >
              {selectedRole === 'admin' ? 'Authenticate Admin' : 'Sign In'}
            </button>
          </form>

          {/* Customer & Seller Google Placeholder & Registration */}
          {selectedRole === 'customer' && (
            <>
              <div className="divider">OR</div>

              <button type="button" className="google-btn" onClick={handleGoogleClick}>
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </>
          )}
          
          {selectedRole !== 'admin' && (
            <div className="login-footer">
              {selectedRole === 'customer' ? (
                <p>Don't have an account? <Link to="/register-customer">Create Account</Link></p>
              ) : (
                <p>New business partner? <Link to="/register-seller">Register as Seller</Link></p>
              )}
            </div>
          )}

          {/* Google Sign In Placeholder Notice Modal */}
          {showGoogleNotice && (
            <div className="modal-backdrop" onClick={() => setShowGoogleNotice(false)}>
              <div className="notice-modal-card" onClick={e => e.stopPropagation()}>
                <div className="notice-header text-primary">
                  <Info size={24} />
                  <h3>Frontend Placeholder Notice</h3>
                </div>
                <p>Google Sign-In will be available after backend authentication is configured.</p>
                <button className="btn btn-primary w-full mt-4" onClick={() => setShowGoogleNotice(false)}>
                  Got it
                </button>
              </div>
            </div>
          )}

          {/* Forgot Password Modal */}
          {showForgotModal && (
            <div className="modal-backdrop" onClick={() => setShowForgotModal(false)}>
              <div className="notice-modal-card" onClick={e => e.stopPropagation()}>
                <div className="notice-header">
                  <Lock size={24} className="text-warning" />
                  <h3>Password Recovery</h3>
                </div>
                <p>For demonstration purposes in Stage 1, use password <strong>password123</strong> to sign in.</p>
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

