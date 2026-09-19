import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, UserCheck, Eye, EyeOff, Info, CheckCircle2 } from 'lucide-react';
import './AuthPages.css';

const CustomerRegisterPage = () => {
  const navigate = useNavigate();
  const { registerCustomer } = useAppContext();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    cityArea: 'Anna Nagar, Chennai',
    avatar: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.phone ||
      !formData.address
    ) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (formData.phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      return;
    }

    // Call AppContext registration
    registerCustomer(formData);
    navigate('/customer-dashboard');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wide">

        <div className="auth-header">
          <Link to="/login" className="back-link-dark">
            <ArrowLeft size={16} /> Back to Sign In
          </Link>

          <h2>Customer Account Registration</h2>

          <p>
            Join the hyper-local micro-logistics network to order fresh goods
            with coordinated delivery.
          </p>
        </div>

        {errorMsg && (
          <div className="auth-error-banner" role="alert">
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-grid">

          <div className="form-group">
            <label htmlFor="reg-fullname">Full Name *</label>
            <input
              type="text"
              id="reg-fullname"
              name="fullName"
              className="form-control"
              placeholder="e.g. Priya Rajan"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-username">Username *</label>
            <input
              type="text"
              id="reg-username"
              name="username"
              className="form-control"
              placeholder="e.g. priyarajan"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address *</label>
            <input
              type="email"
              id="reg-email"
              name="email"
              className="form-control"
              placeholder="priya@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-phone">Phone Number *</label>
            <input
              type="tel"
              id="reg-phone"
              name="phone"
              className="form-control"
              placeholder="9876543210"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password *</label>

            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="reg-password"
                name="password"
                className="form-control"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm">Confirm Password *</label>

            <input
              type={showPassword ? 'text' : 'password'}
              id="reg-confirm"
              name="confirmPassword"
              className="form-control"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="reg-address">Delivery Address *</label>

            <input
              type="text"
              id="reg-address"
              name="address"
              className="form-control"
              placeholder="Door No, Street Name, Landmark"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-cityarea">City / Area *</label>

            <select
              id="reg-cityarea"
              name="cityArea"
              className="form-control"
              value={formData.cityArea}
              onChange={handleChange}
            >
              <option value="Anna Nagar, Chennai">
                Anna Nagar, Chennai
              </option>
              <option value="T. Nagar, Chennai">
                T. Nagar, Chennai
              </option>
              <option value="Adyar, Chennai">
                Adyar, Chennai
              </option>
              <option value="Mylapore, Chennai">
                Mylapore, Chennai
              </option>
              <option value="Velachery, Chennai">
                Velachery, Chennai
              </option>
              <option value="Besant Nagar, Chennai">
                Besant Nagar, Chennai
              </option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="reg-avatar">Profile Image URL (Optional)</label>

            <input
              type="url"
              id="reg-avatar"
              name="avatar"
              className="form-control"
              placeholder="https://..."
              value={formData.avatar}
              onChange={handleChange}
            />
          </div>

          <div className="auth-actions-full full-width">

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
            >
              <UserCheck
                size={20}
                style={{ marginRight: '8px' }}
              />
              Create Customer Account
            </button>

            {/* Google Sign-In - FRONTEND VISUAL ONLY */}
            <div
              className="google-auth-container"
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                marginTop: '16px'
              }}
            >
              <button
                type="button"
                style={{
                  width: '220px',
                  maxWidth: '220px',
                  minWidth: '220px',
                  height: '40px',
                  minHeight: '40px',
                  maxHeight: '40px',

                  backgroundColor: '#ffffff',
                  border: '1px solid #dadce0',
                  borderRadius: '6px',

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',

                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#3c4043',

                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  padding: '0 12px',
                  overflow: 'hidden'
                }}
              >

                {/* SMALL GOOGLE ICON */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  style={{
                    width: '18px',
                    height: '18px',
                    minWidth: '18px',
                    minHeight: '18px',
                    maxWidth: '18px',
                    maxHeight: '18px',
                    flex: '0 0 18px',
                    flexShrink: 0,
                    display: 'block',
                    objectFit: 'contain'
                  }}
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />

                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />

                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />

                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>

                <span>Sign in with Google</span>

              </button>
            </div>

          </div>
        </form>

        <div className="auth-footer-text">
          <span>
            Already have an account? <Link to="/login">Sign In</Link>
          </span>
        </div>

      </div>
    </div>
  );
};

export default CustomerRegisterPage;