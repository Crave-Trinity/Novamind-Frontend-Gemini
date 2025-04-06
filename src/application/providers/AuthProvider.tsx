/**
 * Authentication Provider Component
 * 
 * Provides authentication state and methods to the application through the Auth Context.
 * Implements HIPAA-compliant session management with automatic timeout.
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, type AuthContextType } from "@application/contexts/AuthContext";
import { authService } from "@infrastructure/services/AuthService";
import type { User, Permission } from "@domain/types/auth/auth";
import { auditLogService, AuditEventType } from "@infrastructure/services/AuditLogService"; // AuditEventType is an enum (value)

// Session warning time (5 minutes before expiration)
const SESSION_WARNING_TIME = 5 * 60 * 1000;
// Session check interval (check every minute)
const SESSION_CHECK_INTERVAL = 60 * 1000;

interface AuthProviderProps {
  children: React.ReactNode; // ReactNode is already a type
}

/**
 * Authentication Provider
 * 
 * Manages authentication state and session lifecycle
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  
  // Authentication state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  // Session management
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number>(0);
  const [showSessionWarning, setShowSessionWarning] = useState<boolean>(false);
  
  /**
   * Initialize authentication state from storage
   */
  const initializeAuth = useCallback(() => {
    try {
      // Check if user is already authenticated
      if (authService.isAuthenticated()) {
        const currentUser = authService.getCurrentUser();
        const sessionVerification = authService.verifySession();
        
        if (currentUser && sessionVerification.valid && sessionVerification.remainingTime) {
          setUser(currentUser);
          setIsAuthenticated(true);
          setSessionExpiresAt(Date.now() + sessionVerification.remainingTime);
          
          // Log session reuse for audit
          auditLogService.log(AuditEventType.USER_SESSION_VERIFY, {
            action: "session_restore",
            details: "User session restored",
            result: "success",
          });
        }
      }
    } catch (err) {
      console.error("Failed to initialize auth state:", err);
      setError("Failed to restore authentication session.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Login handler
   */
  const login = useCallback(async (
    email: string, 
    password: string, 
    rememberMe: boolean = false
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.login({ 
        email, 
        password, 
        rememberMe 
      });
      
      if (result.success && result.user && result.token) {
        setUser(result.user);
        setIsAuthenticated(true);
        setSessionExpiresAt(result.token.expiresAt);
        setIsLoading(false);
        return true;
      } else {
        setError(result.error || "Authentication failed.");
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      setError("An unexpected error occurred during login.");
      setIsLoading(false);
      return false;
    }
  }, []);
  
  /**
   * Logout handler
   */
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await authService.logout();
      
      // Reset auth state
      setUser(null);
      setIsAuthenticated(false);
      setSessionExpiresAt(0);
      setError(null);
      
      // Redirect to login page
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);
  
  /**
   * Check session expiration time
   */
  const checkSessionExpiration = useCallback((): number => {
    if (!isAuthenticated || sessionExpiresAt === 0) {
      return 0;
    }
    
    const now = Date.now();
    return Math.max(0, sessionExpiresAt - now);
  }, [isAuthenticated, sessionExpiresAt]);
  
  /**
   * Renew current session
   */
  const renewSession = useCallback((): void => {
    if (!isAuthenticated) return;
    
    try {
      const verification = authService.renewSession();
      
      if (verification.valid && verification.remainingTime) {
        setSessionExpiresAt(Date.now() + verification.remainingTime);
        setShowSessionWarning(false);
        
        // Log session renewal for audit
        auditLogService.log(AuditEventType.USER_SESSION_RENEWED, {
          action: "session_renewed",
          details: "User session renewed",
          result: "success",
        });
      }
    } catch (err) {
      console.error("Session renewal error:", err);
    }
  }, [isAuthenticated]);
  
  /**
   * Check permission
   */
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  }, [user]);
  
  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  
  /**
   * Session monitoring
   * Checks session status periodically and sets warning when close to expiration
   */
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const checkSession = () => {
      const remainingTime = checkSessionExpiration();
      
      if (remainingTime <= 0) {
        // Session expired, log out
        logout();
      } else if (remainingTime <= SESSION_WARNING_TIME) {
        // Show warning when less than 5 minutes remaining
        setShowSessionWarning(true);
      }
    };
    
    // Initial check
    checkSession();
    
    // Set up periodic checks
    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL);
    
    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated, checkSessionExpiration, logout]);
  
  /**
   * Context value
   */
  const contextValue = useMemo<AuthContextType>(() => ({
    isAuthenticated,
    isLoading,
    error,
    user,
    login,
    logout,
    checkSessionExpiration,
    renewSession,
    hasPermission,
  }), [
    isAuthenticated,
    isLoading, 
    error, 
    user, 
    login, 
    logout, 
    checkSessionExpiration, 
    renewSession, 
    hasPermission
  ]);
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      {/* 
        Could render a SessionWarningModal here when showSessionWarning is true,
        but this is best handled at the app level or with a proper routing system
        to avoid prop drilling
      */}
    </AuthContext.Provider>
  );
};