/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { checkAuthStatus } from '@application/utils/authUtils'; // Import from new utility file

/**
 * Authentication Route Component
 *
 * Protects routes by checking user authentication status.
 * Redirects to login page if not authenticated.
 */
const AuthRoute: React.FC = () => {
  // Use the utility function to determine auth status
  const [isAuthenticated] = useState<boolean>(checkAuthStatus()); // Removed unused setIsAuthenticated
  const location = useLocation();

  // In production, this would check tokens properly
  useEffect(() => {
    // Set a demo token to localStorage for persistence
    if (!localStorage.getItem('auth_token')) {
      localStorage.setItem('auth_token', 'demo-token-for-novamind-digital-twin');
    }
  }, []);

  // Render the protected route content
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default AuthRoute;
