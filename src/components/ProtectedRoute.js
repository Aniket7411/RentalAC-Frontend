import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, requireUser = false }) => {
  const { isAuthenticated, isAdmin, isUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (requireUser) {
      return <Navigate to="/login" replace />;
    }
    return <Navigate to="/admin/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireUser && !isUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
