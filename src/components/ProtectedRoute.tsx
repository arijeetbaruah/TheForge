import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="parchment-container d-flex justify-content-center align-items-center">
        <div className="parchment-scroll text-center" style={{ maxWidth: "400px" }}>
          <h2 className="mb-3">Tending the Forge</h2>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Blowing the bellows, stoking the coals...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Save the target path for post-login redirect if needed, or just redirect
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user doesn't have the permission, send them to home page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
