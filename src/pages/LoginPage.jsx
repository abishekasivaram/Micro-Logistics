import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login and redirect to dashboard
    navigate('/dashboard');
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
          <p className="login-subtitle">Please enter your details to sign in.</p>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                className="form-control" 
                placeholder="vendor@example.com" 
                defaultValue="vendor@example.com"
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
          
          <div className="login-footer">
            <p>Don't have an account? <Link to="/register">Create account</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
