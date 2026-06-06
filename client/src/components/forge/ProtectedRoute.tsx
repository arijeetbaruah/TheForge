import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, profile, loading, isMember } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-heading text-xl text-primary">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <span className="text-4xl">🔥</span>
          <span>Consulting the Guild Archives...</span>
        </div>
      </div>
    );
  }

  // If not logged in
  if (!user || !profile) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
