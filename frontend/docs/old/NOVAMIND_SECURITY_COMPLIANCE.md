# Novamind Security & HIPAA Compliance Guide

This document outlines the comprehensive security and HIPAA compliance measures implemented in the Novamind Digital Twin platform. As a healthcare application handling sensitive patient data, security is a foundational aspect of our architecture.

## 🔐 HIPAA Compliance Framework

### PHI Protection Mechanisms

1. **Data Classification**
   - All data is classified into PHI and non-PHI categories
   - Automated scanning tools detect and flag potential PHI in code or logs
   - Strict separation between identified and de-identified data

2. **Secure Storage**
   ```javascript
   // frontend/src/utils/secureStorage.ts
   export const secureStorage = {
     set: (key: string, value: any) => {
       const encrypted = encryptData(JSON.stringify(value));
       sessionStorage.setItem(`novamind_${key}`, encrypted);
     },
     
     get: (key: string) => {
       const data = sessionStorage.getItem(`novamind_${key}`);
       if (!data) return null;
       try {
         return JSON.parse(decryptData(data));
       } catch (e) {
         // Invalid data, clear it
         secureStorage.remove(key);
         return null;
       }
     },
     
     remove: (key: string) => {
       sessionStorage.removeItem(`novamind_${key}`);
     },
     
     clear: () => {
       Object.keys(sessionStorage).forEach(key => {
         if (key.startsWith('novamind_')) {
           sessionStorage.removeItem(key);
         }
       });
     }
   };
   ```

3. **Transmission Protection**
   - All data transmitted using TLS 1.2+
   - Certificate pinning for API endpoints
   - No PHI in URLs (always POST for PHI data)

### Access Controls

1. **Authentication System**
   - Multi-factor authentication required
   - JWT with short expiration (15 minutes)
   - Refresh token rotation 
   - Password complexity enforcement
   - Failed login throttling

2. **Authorization Framework**
   ```typescript
   // Example of role-based access control
   enum Role {
     ADMIN = 'ADMIN',
     PROVIDER = 'PROVIDER',
     RESEARCHER = 'RESEARCHER',
     PATIENT = 'PATIENT'
   }
   
   interface AccessPolicy {
     resource: string;
     action: 'read' | 'write' | 'delete';
     roles: Role[];
   }
   
   // Access control check function
   function hasAccess(user: User, resource: string, action: string): boolean {
     const policy = accessPolicies.find(p => 
       p.resource === resource && p.action === action
     );
     
     return policy ? policy.roles.includes(user.role) : false;
   }
   ```

3. **Session Management**
   - Automatic session timeout (30 minutes of inactivity)
   - One-device-at-a-time policy
   - Session invalidation on password change

### Audit and Logging

1. **Comprehensive Audit Trail**
   ```typescript
   // Audit logging service
   interface AuditLogEntry {
     userId: string;
     action: string;
     resource: string;
     resourceId: string;
     timestamp: Date;
     ipAddress: string;
     userAgent: string;
     sessionId: string;
     status: 'success' | 'failure';
     reason?: string;
   }
   
   // Log all PHI access
   function logPHIAccess(user: User, patientId: string, dataType: string): void {
     auditLogger.log({
       userId: user.id,
       action: 'view',
       resource: dataType,
       resourceId: patientId,
       timestamp: new Date(),
       ipAddress: getClientIP(),
       userAgent: getUserAgent(),
       sessionId: getSessionId(),
       status: 'success'
     });
   }
   ```

2. **Sanitization for Logs**
   - PHI detection and redaction in logs
   - Custom sanitization patterns in phi_patterns.yaml
   - Regular expressions to identify SSNs, patient IDs, names, etc.

## 🛡️ Application Security

### Secure Headers

All responses include these security headers:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer-when-downgrade
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://api.novamind.health; worker-src 'self' blob:; manifest-src 'self'; frame-ancestors 'self'; form-action 'self'; base-uri 'self'; object-src 'none'
```

### XSS Prevention

1. **Input Validation**
   ```typescript
   // sanitize user input
   function sanitizeInput(input: string): string {
     return input
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#039;');
   }
   ```

2. **Output Encoding**
   - React's built-in XSS protection 
   - Content Security Policy (CSP) implementation
   - No dangerous methods (dangerouslySetInnerHTML) in codebase

3. **React-Specific Protections**
   - Using controlled components for all forms
   - No use of eval() or Function constructor
   - Avoiding direct DOM manipulation

### CSRF Protection

1. **Token-Based CSRF Prevention**
   ```typescript
   // CSRF token management
   function getCsrfToken(): string {
     // Get token from cookie that was set by the server
     const token = getCookie('X-CSRF-TOKEN');
     return token;
   }
   
   // Add token to all API requests
   axios.interceptors.request.use(config => {
     config.headers['X-CSRF-TOKEN'] = getCsrfToken();
     return config;
   });
   ```

2. **SameSite Cookie Attributes**
   - All cookies use SameSite=Lax as minimum 
   - Session cookies use SameSite=Strict
   - HttpOnly and Secure flags for all sensitive cookies

### API Security

1. **Rate Limiting**
   - IP-based rate limiting with increasing timeouts
   - Account-specific limits for sensitive operations
   - Configurable thresholds per endpoint

2. **Input Validation**
   ```typescript
   // Example input validation with Zod
   import { z } from 'zod';
   
   const PatientInfoSchema = z.object({
     firstName: z.string().min(1).max(50),
     lastName: z.string().min(1).max(50),
     birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
     gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
     contactNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
     email: z.string().email().optional(),
   });
   
   function validatePatientInfo(data: unknown) {
     return PatientInfoSchema.parse(data);
   }
   ```

3. **Secure Error Handling**
   - No sensitive information in error messages
   - Generic errors to clients, detailed logs server-side
   - Separate production and development error handling

## 🔒 Infrastructure Security

### SSL/TLS Configuration

1. **Modern TLS Settings**
   - TLS 1.2+ only (TLS 1.0/1.1 disabled)
   - Strong cipher suite configuration:
     ```
     ECDHE-ECDSA-AES128-GCM-SHA256
     ECDHE-RSA-AES128-GCM-SHA256
     ECDHE-ECDSA-AES256-GCM-SHA384
     ECDHE-RSA-AES256-GCM-SHA384
     ```
   - OCSP Stapling enabled
   - Perfect Forward Secrecy required

2. **Certificate Management**
   - Automatic renewal via Let's Encrypt
   - Certificate monitoring with expiration alerts
   - Annual review of certificate policies

### Network Security

1. **Firewall Configuration**
   - Default deny-all policy
   - Explicit rules for required ports only
   - Log all blocked connection attempts
   - Regular rule audits

2. **DDoS Protection**
   - Global CDN with built-in DDoS protection
   - TCP SYN cookies enabled
   - Application-level rate limiting
   - Configurable under-attack mode

## 🧪 Security Testing Framework

### Automated Security Testing

1. **Static Analysis**
   - SonarQube with HIPAA-specific security rules
   - ESLint security plugins for JavaScript/TypeScript
   - Scheduled weekly automated scans

2. **Dependency Scanning**
   ```bash
   # Example security dependency scanning commands
   npm audit --production
   npx snyk test
   safety check -r requirements.txt
   ```

3. **OWASP ZAP Integration**
   - API scanning for common vulnerabilities
   - Regular scheduled scans
   - Penetration testing reports

### Manual Security Review

1. **Code Review Checklist**
   - PHI handling review
   - Authentication/authorization checks
   - Input validation coverage
   - Proper sanitization
   - File upload security

2. **Annual Penetration Testing**
   - External security firm audit
   - Black box and white box testing
   - Remediation plan for all findings

## 📝 Security Documentation & Policies

### Incident Response Plan

1. **Response Team**
   - Defined roles and responsibilities
   - Contact information
   - Escalation procedures

2. **Incident Classification**
   - Severity levels and definitions
   - Response time objectives
   - Reporting requirements

3. **HIPAA Breach Notification**
   - Timeline requirements (60 days max)
   - Documentation procedures
   - Patient notification template

### Business Associate Agreements

1. **Template BAA**
   - Standard terms for all vendors
   - Security requirements
   - PHI handling instructions
   - Breach notification responsibilities

2. **Vendor Assessment**
   - Security questionnaire
   - Evidence collection
   - Annual reassessment

## 🔍 HIPAA Technical Safeguards Implementation

### Access Controls (§164.312(a)(1))

```typescript
// Strong authentication implementation
async function authenticateUser(username: string, password: string, mfaCode: string): Promise<AuthResult> {
  // 1. Verify username and password
  const user = await getUserByUsername(username);
  if (!user || !await verifyPassword(password, user.passwordHash)) {
    auditLogger.log({
      action: 'login',
      status: 'failure',
      reason: 'Invalid credentials',
      // other audit fields
    });
    return { success: false, reason: 'Invalid credentials' };
  }
  
  // 2. Verify MFA if enabled
  if (user.mfaEnabled) {
    const mfaValid = await verifyMFACode(user.id, mfaCode);
    if (!mfaValid) {
      auditLogger.log({
        action: 'login',
        status: 'failure',
        reason: 'Invalid MFA code',
        // other audit fields
      });
      return { success: false, reason: 'Invalid MFA code' };
    }
  }
  
  // 3. Generate secure tokens
  const { accessToken, refreshToken } = await generateTokens(user);
  
  // 4. Log successful login
  auditLogger.log({
    action: 'login',
    status: 'success',
    // other audit fields
  });
  
  return { 
    success: true, 
    accessToken,
    refreshToken,
    user: sanitizeUserData(user) // Remove sensitive data
  };
}
```

### Audit Controls (§164.312(b))

```typescript
// Backend audit trail implementation
const auditSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  ipAddress: String,
  userAgent: String,
  sessionId: String,
  status: { type: String, enum: ['success', 'failure'], required: true },
  reason: String,
  details: mongoose.Schema.Types.Mixed,
  phi: { type: Boolean, default: false, index: true }
}, { 
  timestamps: true 
});

// Index for quick querying by date ranges and user
auditSchema.index({ userId: 1, timestamp: -1 });
auditSchema.index({ resource: 1, resourceId: 1, timestamp: -1 });

// Archive old audit logs after 7 years (HIPAA retention requirement)
auditSchema.pre('save', function(next) {
  const now = new Date();
  const sevenYearsAgo = new Date(now.setFullYear(now.getFullYear() - 7));
  
  if (this.timestamp < sevenYearsAgo) {
    this.collection.archive(this);
    return next(new Error('Audit log older than retention period'));
  }
  next();
});
```

### Integrity Controls (§164.312(c)(1))

```typescript
// Data integrity verification
function verifyDataIntegrity(originalData: any, currentData: any, hash: string): boolean {
  // 1. Generate hash of original data
  const originalHash = generateHash(originalData);
  
  // 2. Compare with stored hash
  if (originalHash !== hash) {
    auditLogger.log({
      action: 'integrity_check',
      status: 'failure',
      reason: 'Hash mismatch',
      // other audit fields
    });
    return false;
  }
  
  // 3. Compare original with current data
  if (JSON.stringify(originalData) !== JSON.stringify(currentData)) {
    auditLogger.log({
      action: 'integrity_check',
      status: 'failure',
      reason: 'Data changed',
      // other audit fields
    });
    return false;
  }
  
  return true;
}

// Generate SHA-256 hash of data for integrity checking
function generateHash(data: any): string {
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
}
```

### Person or Entity Authentication (§164.312(d))

```typescript
// Multi-factor authentication
async function setupMFA(userId: string, phoneNumber: string): Promise<boolean> {
  // 1. Validate phone number
  if (!isValidPhoneNumber(phoneNumber)) {
    return false;
  }
  
  // 2. Generate secret key for TOTP
  const secret = generateTOTPSecret();
  
  // 3. Store secret securely (encrypted)
  await storeUserMFASecret(userId, encryptData(secret));
  
  // 4. Enable MFA for user
  await updateUser(userId, { mfaEnabled: true, mfaMethod: 'totp' });
  
  // 5. Log MFA setup
  auditLogger.log({
    userId,
    action: 'mfa_setup',
    resource: 'authentication',
    resourceId: userId,
    status: 'success'
  });
  
  return true;
}
```

### Transmission Security (§164.312(e)(1))

```typescript
// API client with encryption
const apiClient = axios.create({
  baseURL: process.env.API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add encryption to requests with PHI
apiClient.interceptors.request.use(config => {
  // Check if payload contains PHI
  if (config.data && containsPHI(config.data)) {
    // Encrypt the payload
    config.data = {
      encryptedData: encryptData(JSON.stringify(config.data)),
      iv: getEncryptionIV(), // Initialization vector
      timestamp: Date.now(),
    };
    
    // Add encryption headers
    config.headers['X-Data-Encrypted'] = 'true';
  }
  
  return config;
});

// Decrypt responses that are encrypted
apiClient.interceptors.response.use(response => {
  if (response.headers['x-data-encrypted'] === 'true') {
    const { encryptedData, iv } = response.data;
    response.data = JSON.parse(decryptData(encryptedData, iv));
  }
  
  return response;
});
```

## 🔄 Regular Security Reviews

1. **Quarterly Vulnerability Assessment**
   - Automated scanning of all systems
   - Manual review of high-severity findings
   - Remediation tracking

2. **Annual Security Review**
   - Comprehensive policy review
   - Control effectiveness assessment
   - Staff security training
   
3. **Continuous Monitoring**
   - Real-time security alerting
   - Suspicious activity detection
   - Access anomaly tracking

## 📊 Security Metrics

1. **Key Performance Indicators**
   - Mean time to detect security incidents
   - Vulnerability remediation time
   - Security training completion rate
   - Failed login attempt rate

2. **Monthly Security Report**
   - Security incidents summary
   - Vulnerability status
   - Access control violations
   - Audit log analysis

---

Implementation of these security and compliance measures ensures that Novamind Digital Twin maintains the highest standards of data protection, meeting and exceeding HIPAA requirements while providing a secure platform for sensitive healthcare operations.