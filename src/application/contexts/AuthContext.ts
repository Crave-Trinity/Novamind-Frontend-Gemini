/**
 * Authentication Context
 * 
 * Provides authentication state management for the application following
 * clean architecture principles. This context sits in the application layer
 * and interfaces with the infrastructure layer through services.
 */

import { createContext } from "react";
import { User, Permission } from "@domain/types/auth/auth";

/**
 * Shape of the authentication context
 */
export interface AuthContextType {
  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  
  // Authentication actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  
  // Session management
  checkSessionExpiration: () => number; // Returns milliseconds until expiration
  renewSession: () => void;
  
  // Permission checks
  hasPermission: (permission: Permission) => boolean;
}

/**
 * Default context values
 */
const defaultContext: AuthContextType = {
  isAuthenticated: false,
  isLoading: false,
  error: null,
  user: null,
  
  // These will be implemented in the provider
  login: async () => false,
  logout: async () => {},
  checkSessionExpiration: () => 0,
  renewSession: () => {},
  hasPermission: () => false,
};

/**
 * Authentication context
 */
export const AuthContext = createContext<AuthContextType>(defaultContext);