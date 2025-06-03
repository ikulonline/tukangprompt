
import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './ui/LoadingSpinner';

interface AdminProtectedRouteProps {
  children?: JSX.Element; // Make children optional if using Outlet
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, profile, isLoading: authIsLoading, profileLoading } = useAuth();
  const location = useLocation();

  if (authIsLoading || profileLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    // Not logged in, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile || profile.role !== 'admin') {
    // Logged in but not an admin, redirect to home or a 'not authorized' page
    // For simplicity, redirecting to home page
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />; // Render children or Outlet
};

export default AdminProtectedRoute;