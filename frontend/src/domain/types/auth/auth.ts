/**
 * Domain types for authentication
 * 
 * These types define the core authentication entities and interfaces
 * that are used throughout the application.
 */

/**
 * User entity representing the authenticated user
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  lastLogin?: Date;
}

/**
 * User roles in the system
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  CLINICIAN = 'CLINICIAN',
  RESEARCHER = 'RESEARCHER',
  DEMO = 'DEMO',
}

/**
 * Granular permissions for access control
 */
export enum Permission {
  VIEW_PATIENTS = 'VIEW_PATIENTS',
  EDIT_PATIENTS = 'EDIT_PATIENTS',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  ADMIN_SETTINGS = 'ADMIN_SETTINGS',
  RUN_SIMULATIONS = 'RUN_SIMULATIONS',
}

/**
 * Authentication token with expiration
 */
export interface AuthToken {
  token: string;
  expiresAt: number; // Unix timestamp in milliseconds
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Authentication result after login attempt
 */
export interface AuthResult {
  success: boolean;
  user?: User;
  token?: AuthToken;
  error?: string;
}

/**
 * Verification for valid session
 */
export interface SessionVerification {
  valid: boolean;
  remainingTime?: number; // milliseconds until expiration
}