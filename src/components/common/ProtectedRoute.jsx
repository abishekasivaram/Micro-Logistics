import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import LoadingFallback from './LoadingFallback';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, authLoading } = useAppContext();

  if (authLoading) {
    return <LoadingFallback />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const role = currentUser.role === 'seller' ? 'vendor' : currentUser.role;

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect based on current user's role
    if (role === 'customer') {
      return <Navigate to="/customer-dashboard" replace />;
    } else if (role === 'vendor') {
      return <Navigate to="/vendor-dashboard" replace />;
    } else if (role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (role === 'delivery_partner') {
      return <Navigate to="/delivery" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
