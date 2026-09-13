import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { AlertTriangle, Home, ArrowLeft, LogIn } from 'lucide-react';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const { currentUser } = useAppContext();

  const getDashboardLink = () => {
    if (!currentUser) return '/login';
    switch (currentUser.role) {
      case 'customer':
        return '/customer-dashboard';
      case 'vendor':
        return '/vendor-dashboard';
      case 'admin':
        return '/admin-dashboard';
      case 'delivery_partner':
        return '/delivery-dashboard';
      default:
        return '/';
    }
  };

  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <div className="not-found-badge">
          <AlertTriangle size={32} className="text-warning" />
        </div>
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-desc">
          The page or logistics resource you are looking for doesn't exist, has been relocated, or is temporarily unavailable.
        </p>

        <div className="not-found-actions">
          {currentUser ? (
            <Link to={getDashboardLink()} className="btn btn-primary not-found-btn">
              <Home size={18} />
              <span>Back to Dashboard</span>
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary not-found-btn">
              <LogIn size={18} />
              <span>Sign In to Micro-Logistics</span>
            </Link>
          )}

          <Link to="/" className="btn btn-outline not-found-btn">
            <ArrowLeft size={18} />
            <span>Return to Landing Page</span>
          </Link>
        </div>

        <div className="not-found-footer">
          <span>Smart Micro-Logistics Network &bull; Decentralized Batching & Dispatch</span>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
