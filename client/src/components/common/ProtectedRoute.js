import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ roles, children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><span className="spinner"/> Loading...</div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role))
    return <div className="empty-state"><h3>Access Denied</h3><p>You don't have permission to view this page.</p></div>;
  return children ? children : <Outlet />;
};
export default ProtectedRoute;
