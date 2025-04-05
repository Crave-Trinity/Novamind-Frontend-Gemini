/**
 * Authentication Service
 * 
 * Implements the infrastructure layer for authentication operations
 * with HIPAA-compliant security practices.
 */

import { 
  AuthResult,
  LoginCredentials,
  User,
  UserRole, 
  Permission,
  SessionVerification
} from "@domain/types/auth/auth";
import { auditLogClient, AuditEventType } from "./auditLogClient";

/**
 * Storage keys for secure session management
 */
const STORAGE_KEYS = {
  AUTH_TOKEN: 'novamind_auth_token',
  USER: 'novamind_user',
};

/**
 * Service for handling authentication operations
 */
class AuthClient {
  /**
   * Login with credentials
   * 
   * In a production environment, this would communicate with a secure backend API
   * For now, we're simulating with demo credentials and localStorage
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo purposes, check against hardcoded demo credentials
      if (credentials.email === "demo@novamind.com" && credentials.password === "demo123") {
        const user: User = {
          id: "demo-user-id",
          email: credentials.email,
          name: "Demo User",
          role: UserRole.DEMO,
          permissions: [
            Permission.VIEW_PATIENTS,
            Permission.VIEW_ANALYTICS,
            Permission.RUN_SIMULATIONS,
          ],
          lastLogin: new Date(),
        };

        // Create token that expires in 30 minutes
        const token = {
          token: "demo-token-" + Math.random().toString(36).substring(2),
          expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutes
        };

        // Store auth data in localStorage if rememberMe is true
        // otherwise in sessionStorage for security
        const storage = credentials.rememberMe ? localStorage : sessionStorage;
        storage.setItem(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(token));
        storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

        // Log successful login with audit service
        auditLogClient.log(AuditEventType.USER_LOGIN, {
          userId: user.id,
          email: user.email,
          timestamp: Date.now(),
          details: "User login successful",
        });

        return {
          success: true,
          user,
          token,
        };
      }

      // Log failed login attempt
      auditLogClient.log(AuditEventType.UNAUTHORIZED_ACCESS_ATTEMPT, {
        email: credentials.email,
        timestamp: Date.now(),
        details: "Login failed: Invalid credentials",
      });

      return {
        success: false,
        error: "Invalid email or password",
      };
    } catch (error) {
      // Log error
      auditLogClient.log(AuditEventType.SYSTEM_ERROR, {
        errorCode: "LoginError",
        errorMessage: error.message,
        details: "Exception during login attempt",
      });

      return {
        success: false,
        error: "Authentication service unavailable. Please try again later.",
      };
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    // Log logout action
    auditLogClient.log(AuditEventType.USER_LOGOUT, {
      userId: this.currentUser?.id,
      timestamp: Date.now(),
      details: "User logged out",
    });

    // Remove auth data from storage
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    const verification = this.verifySession();
    return verification.valid;
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    if (!this.isAuthenticated()) {
      return null;
    }

    // Try to get user from both storage options
    const userStr = localStorage.getItem(STORAGE_KEYS.USER) || 
                 sessionStorage.getItem(STORAGE_KEYS.USER);
    
    if (!userStr) {
      return null;
    }

    try {
      return JSON.parse(userStr) as User;
    } catch (e) {
      return null;
    }
  }

  /**
   * Verify current session validity and expiration
   */
  verifySession(): SessionVerification {
    // Try to get token from both storage options
    const tokenStr = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || 
                  sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    
    if (!tokenStr) {
      return { valid: false };
    }

    try {
      const token = JSON.parse(tokenStr);
      const now = Date.now();
      
      if (now >= token.expiresAt) {
        return { valid: false };
      }

      return { 
        valid: true,
        remainingTime: token.expiresAt - now
      };
    } catch (e) {
      return { valid: false };
    }
  }

  /**
   * Check if current user has a specific permission
   */
  hasPermission(permission: Permission): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.permissions.includes(permission);
  }

  /**
   * Renew the current session (extend expiration)
   */
  renewSession(): SessionVerification {
    const user = this.getCurrentUser();
    if (!user) {
      return { valid: false };
    }

    // Create new token that expires in 30 minutes
    const token = {
      token: "demo-token-" + Math.random().toString(36).substring(2),
      expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutes
    };

    // Determine which storage the token is in
    const inLocalStorage = localStorage.getItem(STORAGE_KEYS.USER) !== null;
    const storage = inLocalStorage ? localStorage : sessionStorage;
    
    // Store new token
    storage.setItem(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(token));

    return {
      valid: true,
      remainingTime: 30 * 60 * 1000 // 30 minutes in milliseconds
    };
  }
}

// Export as singleton
export const authClient = new AuthClient();