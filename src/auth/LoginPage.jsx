import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { mockUsers } from '../data/sampleData';
import { Eye, EyeOff, ArrowLeft, Lock } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setCurrentUser, customers, vendors } = useAppContext();
  
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    
    const searchId = usernameOrEmail.trim().toLowerCase();

    // 1. Check Customer
    const customerMatch = customers.find(c => 
      c.id.toLowerCase() === searchId || 
      (c.username && c.username.toLowerCase() === searchId)
    );

    // 2. Check Seller (Vendor)
    const sellerMatch = vendors.find(v => 
      (v.shopName && v.shopName.toLowerCase() === searchId) || 
      (v.id && v.id.toLowerCase() === searchId) ||
      (v.username && v.username.toLowerCase() === searchId)
    );

    // 3. Check Admin
    const adminMatch = mockUsers.find(u => 
      u.role === 'admin' && 
      (u.id.toLowerCase() === searchId || (u.username && u.username.toLowerCase() === searchId))
    );

    // The application automatically determines the account type by searching the existing account data
    let foundUser = customerMatch || sellerMatch || adminMatch;

    if (!foundUser) {
      alert("Account not found. Please check your User ID or Shop Name.");
      return;
    }

    const expectedPassword = foundUser.password || 'password123';
    if (password !== expectedPassword) {
      alert("Incorrect password.");
      return;
    }

    if (customerMatch) {
      setCurrentUser({ ...foundUser, role: 'customer' });
      navigate('/customer-dashboard');
    } else if (sellerMatch) {
      setCurrentUser({ ...foundUser, role: 'vendor' });
      navigate('/vendor-dashboard');
    } else if (adminMatch) {
      setCurrentUser({ ...foundUser, role: 'admin' });
      navigate('/admin-dashboard');
    }
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
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="identifier">User ID / Shop Name</label>
              <input 
                type="text" 
                id="identifier" 
                className="form-control" 
                placeholder="Enter your ID or shop name"
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
                  placeholder="Enter your password" 
                  value={password}
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

          <div className="login-footer">
            <p>Don't have an account? <Link to="/register-customer">Create Account</Link> | <Link to="/register-seller">Register as Seller</Link></p>
          </div>

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
