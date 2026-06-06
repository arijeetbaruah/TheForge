import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface AdminRouteProps {
  children?: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, profile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-heading text-xl text-primary">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <span className="text-4xl">👑</span>
          <span>Opening Royal Chambers...</span>
        </div>
      </div>
    );
  }

  // If not logged in or not an admin
  if (!user || !profile || !isAdmin) {
    return <Navigate to="/orders" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default AdminRoute;
