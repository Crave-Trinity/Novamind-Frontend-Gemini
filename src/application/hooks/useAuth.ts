/**
 * Authentication Hook
 * 
 * Provides easy access to the authentication context throughout the application.
 */

import { useContext } from "react";
import { AuthContext, AuthContextType } from "@application/contexts/AuthContext";

/**
 * Hook for accessing authentication state and methods
 * 
 * This hook provides a type-safe way to access the authentication context
 * and throws a helpful error if used outside of an AuthProvider.
 * 
 * @returns Authentication context with state and methods
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};