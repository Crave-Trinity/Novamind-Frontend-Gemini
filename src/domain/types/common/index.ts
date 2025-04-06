export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Vector4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Matrix3 {
  elements: number[];
}

export interface Matrix4 {
  elements: number[];
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface Bounds {
  min: Vector3;
  max: Vector3;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type UUID = string;

export interface Identifiable {
  id: UUID;
}

export interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

export interface Metadata {
  [key: string]: unknown;
}

// Basic Types
export type ISO8601DateTime = string;
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export interface JSONObject {
  [key: string]: JSONValue;
}
export interface JSONArray extends Array<JSONValue> {}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: ISO8601DateTime;
    requestId: UUID;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: JSONValue;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    timestamp: ISO8601DateTime;
    requestId: UUID;
    pagination: {
      total: number;
      pages: number;
      current: number;
      limit: number;
    };
  };
}

// HIPAA Compliance Types
export interface AuditLog {
  id: UUID;
  timestamp: ISO8601DateTime;
  action: 'create' | 'read' | 'update' | 'delete';
  resource: string;
  resourceId: UUID;
  userId: UUID;
  changes?: JSONValue;
  ipAddress: string;
  userAgent: string;
}

export interface EncryptedData {
  iv: string;
  data: string;
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

// Error Types
export class DomainError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: JSONValue
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, details?: JSONValue) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthorizationError extends DomainError {
  constructor(message: string, details?: JSONValue) {
    super(message, 'AUTHORIZATION_ERROR', details);
    this.name = 'AuthorizationError';
  }
}
