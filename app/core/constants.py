# -*- coding: utf-8 -*-
"""
NOVAMIND Constants Module
========================
Centralized constants for the NOVAMIND psychiatric platform.
"""

# Application constants
APP_NAME = "NOVAMIND"
APP_VERSION = "0.1.0"
APP_DESCRIPTION = "Concierge Psychiatric Platform with Digital Twin Technology"

# API endpoints
API_PREFIX = "/api/v1"
API_DOCS_URL = "/docs"
API_REDOC_URL = "/redoc"

# Authentication constants
TOKEN_TYPE = "Bearer"
ACCESS_TOKEN_EXPIRE_DAYS = 7
REFRESH_TOKEN_EXPIRE_DAYS = 30
PASSWORD_RESET_TOKEN_EXPIRE_HOURS = 24

# HIPAA compliance constants
PHI_RETENTION_DAYS = 2555  # 7 years
AUDIT_LOG_RETENTION_DAYS = 2555  # 7 years
SESSION_TIMEOUT_MINUTES = 30
FAILED_LOGIN_LOCKOUT_THRESHOLD = 5
ACCOUNT_LOCKOUT_MINUTES = 30

# Digital Twin constants
DIGITAL_TWIN_UPDATE_INTERVAL_HOURS = 24
SYMPTOM_PREDICTION_DAYS = 14
BIOMETRIC_DATA_RETENTION_DAYS = 90
CORRELATION_THRESHOLD = 0.7

# Pharmacogenomics constants
PGX_HIGH_IMPACT_THRESHOLD = 0.8
PGX_MEDIUM_IMPACT_THRESHOLD = 0.5
PGX_LOW_IMPACT_THRESHOLD = 0.2

# Database constants
DB_POOL_MIN_SIZE = 5
DB_POOL_MAX_SIZE = 20
DB_POOL_TIMEOUT_SECONDS = 30
DB_QUERY_TIMEOUT_SECONDS = 10

# Pagination constants
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

# Cache constants
CACHE_TTL_SECONDS = 300  # 5 minutes
CACHE_MAX_SIZE = 1000

# File upload constants
MAX_UPLOAD_SIZE_MB = 10
ALLOWED_UPLOAD_EXTENSIONS = [".pdf", ".jpg", ".png", ".txt", ".csv"]

# Error messages
ERROR_UNAUTHORIZED = "Authentication required"
ERROR_FORBIDDEN = "Insufficient permissions"
ERROR_NOT_FOUND = "Resource not found"
ERROR_VALIDATION = "Validation error"
ERROR_INTERNAL = "Internal server error"

# Success messages
SUCCESS_CREATED = "Resource created successfully"
SUCCESS_UPDATED = "Resource updated successfully"
SUCCESS_DELETED = "Resource deleted successfully"

# User roles
ROLE_ADMIN = "admin"
ROLE_PROVIDER = "provider"
ROLE_PATIENT = "patient"
ROLE_STAFF = "staff"
ROLE_RESEARCHER = "researcher"

# Permission types
PERMISSION_VIEW = "view"
PERMISSION_CREATE = "create"
PERMISSION_UPDATE = "update"
PERMISSION_DELETE = "delete"
PERMISSION_MANAGE = "manage"

# Resource types
RESOURCE_PATIENT = "patient"
RESOURCE_PROVIDER = "provider"
RESOURCE_RECORD = "record"
RESOURCE_PRESCRIPTION = "prescription"
RESOURCE_USER = "user"
RESOURCE_SYSTEM = "system"

# Audit action types
AUDIT_LOGIN = "login"
AUDIT_LOGOUT = "logout"
AUDIT_VIEW = "view"
AUDIT_CREATE = "create"
AUDIT_UPDATE = "update"
AUDIT_DELETE = "delete"
AUDIT_EXPORT = "export"
AUDIT_IMPORT = "import"

# HTTP status codes
HTTP_OK = 200
HTTP_CREATED = 201
HTTP_ACCEPTED = 202
HTTP_NO_CONTENT = 204
HTTP_BAD_REQUEST = 400
HTTP_UNAUTHORIZED = 401
HTTP_FORBIDDEN = 403
HTTP_NOT_FOUND = 404
HTTP_CONFLICT = 409
HTTP_UNPROCESSABLE_ENTITY = 422
HTTP_INTERNAL_SERVER_ERROR = 500
HTTP_SERVICE_UNAVAILABLE = 503
