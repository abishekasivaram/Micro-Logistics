import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { mockUsers } from '../data/sampleData';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAppContext();
  
  const [selectedRole, setSelectedRole] = useState('customer');

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Find the matching mock user for the selected role
    const mockUser = mockUsers.find(u => u.role === selectedRole);
    
    if (mockUser) {
      setCurrentUser(mockUser);
      
      // Redirect based on role
      if (selectedRole === 'customer') navigate('/customer-dashboard');
      else if (selectedRole === 'vendor') navigate('/vendor-dashboard');
      else if (selectedRole === 'admin') navigate('/admin-dashboard');
      else navigate('/dashboard');
    }
  };

  const handleGoogleSignIn = () => {
    alert("Google Sign-In will be available after backend authentication is configured.");
  };

  return (
    <div className="login-container">
      <div className="login-split login-left">
        <div className="login-branding">
          <h1>MicroLogi</h1>
          <p>The centralized micro-logistics platform for managing local orders, inventory, and deliveries.</p>
        </div>
      </div>
      
      <div className="login-split login-right">
        <div className="login-card">
          <h2>Welcome back</h2>
          <p className="login-subtitle">Select your role and enter your details to sign in.</p>
          
          <div className="role-selector">
            <button 
              className={`role-btn ${selectedRole === 'customer' ? 'active' : ''}`}
              onClick={() => setSelectedRole('customer')}
              type="button"
            >
              Customer
            </button>
            <button 
              className={`role-btn ${selectedRole === 'vendor' ? 'active' : ''}`}
              onClick={() => setSelectedRole('vendor')}
              type="button"
            >
              Vendor
            </button>
            <button 
              className={`role-btn ${selectedRole === 'admin' ? 'active' : ''}`}
              onClick={() => setSelectedRole('admin')}
              type="button"
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                className="form-control" 
                placeholder={`${selectedRole}@example.com`}
                defaultValue={`${selectedRole}@example.com`}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                className="form-control" 
                placeholder="••••••••" 
                defaultValue="password123"
                required 
              />
            </div>
            
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>
            
            <button type="submit" className="btn btn-primary w-full login-btn">
              Sign In
            </button>
          </form>

          <div className="divider">OR</div>

          <button type="button" className="google-btn" onClick={handleGoogleSignIn}>
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
          
          <div className="login-footer">
            <p>Don't have an account? <Link to="/register">Create account</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
