/**
 * Client-side Encryption Service
 *
 * Provides encryption and decryption capabilities for sensitive patient data
 * in compliance with HIPAA requirements for data in transit and at rest.
 *
 * Note: Client-side encryption is an additional security layer and should be
 * used alongside proper TLS/HTTPS and server-side encryption.
 */

import * as CryptoJS from 'crypto-js';
import { auditLogClient, AuditEventType } from '../clients/auditLogClient';

// Custom error types for better error handling
export class EncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EncryptionError';
  }
}

export class DecryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DecryptionError';
  }
}

// Types for encryption
interface EncryptionOptions {
  // Use a secret key from a secure source (e.g., environment variables)
  // In a real implementation, this would come from a secure key management service
  secretKey?: string;
  // Option to salt the encryption
  useSalt?: boolean;
  // Option for initialization vector
  iv?: string;
  // Iteration count for PBKDF2
  iterations?: number;
}

/**
 * Encryption Service for sensitive data
 */
class EncryptionService {
  private readonly defaultKey: string;
  private readonly ivSize = 16; // 128 bits
  private readonly keyStrength = 256; // Use AES-256
  private readonly defaultIterations = 10000;

  constructor() {
    // In production, this should come from a secure source
    // For development, we're using a placeholder
    this.defaultKey = process.env.ENCRYPTION_KEY || 'NOVAMIND_SECURE_KEY_PLACEHOLDER';

    // Log initialization without exposing the key
    this.logSecurityEvent('Encryption service initialized', 'init');
  }

  /**
   * Encrypt a string value
   */
  encrypt(value: string, options?: EncryptionOptions): string {
    if (!value) return value;

    const key = options?.secretKey || this.defaultKey;
    const iterations = options?.iterations || this.defaultIterations;

    try {
      // Generate a random IV if not provided
      const iv = options?.iv || CryptoJS.lib.WordArray.random(this.ivSize).toString();

      // Create key with PBKDF2 for better security
      const salt = options?.useSalt ? CryptoJS.lib.WordArray.random(128 / 8) : null;
      const saltStr = salt ? salt.toString() : '';
      const derivedKey = salt
        ? CryptoJS.PBKDF2(key, CryptoJS.enc.Hex.parse(saltStr), {
            keySize: this.keyStrength / 32,
            iterations,
          })
        : key;

      // Encrypt with AES using derived key and IV
      const encrypted = CryptoJS.AES.encrypt(value, derivedKey, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      // Combine IV, salt (if used), and ciphertext for storage
      const result = salt
        ? `${iv}:${salt.toString()}:${encrypted.toString()}`
        : `${iv}::${encrypted.toString()}`;

      this.logSecurityEvent('Data encrypted successfully', 'encrypt');
      return result;
    } catch (error) {
      this.logSecurityEvent(
        `Encryption error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'encrypt_error'
      );

      // Always throw an error to prevent using unencrypted data
      throw new EncryptionError('Failed to encrypt sensitive data');
    }
  }

  /**
   * Decrypt an encrypted string
   */
  decrypt(encryptedValue: string, options?: EncryptionOptions): string {
    if (!encryptedValue) return encryptedValue;

    const key = options?.secretKey || this.defaultKey;
    const iterations = options?.iterations || this.defaultIterations;

    try {
      // Split the combined string to extract IV, salt, and ciphertext
      const [iv, saltStr, ciphertext] = encryptedValue.split(':');

      if (!iv || !ciphertext) {
        throw new DecryptionError('Invalid encrypted format');
      }

      // Derive the key if salt was used
      const derivedKey =
        saltStr && saltStr.length > 0
          ? CryptoJS.PBKDF2(key, CryptoJS.enc.Hex.parse(saltStr), {
              keySize: this.keyStrength / 32,
              iterations,
            })
          : key;

      // Decrypt with AES
      const decrypted = CryptoJS.AES.decrypt(ciphertext, derivedKey, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const result = decrypted.toString(CryptoJS.enc.Utf8);

      // Validate the result - if decryption fails, it often returns an empty string
      if (!result) {
        throw new DecryptionError('Decryption resulted in empty string');
      }

      this.logSecurityEvent('Data decrypted successfully', 'decrypt');
      return result;
    } catch (error) {
      this.logSecurityEvent(
        `Decryption error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'decrypt_error'
      );
      throw new DecryptionError('Failed to decrypt data');
    }
  }

  /**
   * Encrypt an object by encrypting its string properties
   * Does not encrypt nested objects by default
   */
  encryptObject<T extends Record<string, unknown>>(
    obj: T,
    options?: EncryptionOptions & { deep?: boolean; sensitiveFields?: string[] }
  ): T {
    if (!obj) return obj;

    const result = { ...obj };
    const sensitiveFields = options?.sensitiveFields || [];

    for (const key in result) {
      if (Object.prototype.hasOwnProperty.call(result, key)) {
        const value = result[key];
        const isSensitiveField = sensitiveFields.length === 0 || sensitiveFields.includes(key);

        if (typeof value === 'string' && isSensitiveField) {
          try {
            // Encrypt string values
            (result[key] as unknown) = this.encrypt(value, options);
          } catch (error) {
            this.logSecurityEvent(`Failed to encrypt field "${key}"`, 'encrypt_field_error');
            throw new EncryptionError(
              `Failed to encrypt field "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        } else if (options?.deep && value && typeof value === 'object' && !Array.isArray(value)) {
          // Deep encrypt nested objects if requested
          (result[key] as unknown) = this.encryptObject(value as Record<string, unknown>, options);
        }
      }
    }

    return result;
  }

  /**
   * Decrypt an object with encrypted string properties
   * Does not decrypt nested objects by default
   */
  decryptObject<T extends Record<string, unknown>>(
    obj: T,
    options?: EncryptionOptions & {
      deep?: boolean;
      sensitiveFields?: string[];
      skipFailures?: boolean;
    }
  ): T {
    if (!obj) return obj;

    const result = { ...obj };
    const sensitiveFields = options?.sensitiveFields || [];
    const skipFailures = options?.skipFailures ?? false;

    for (const key in result) {
      if (Object.prototype.hasOwnProperty.call(result, key)) {
        const value = result[key];
        const isSensitiveField = sensitiveFields.length === 0 || sensitiveFields.includes(key);

        if (typeof value === 'string' && isSensitiveField && this.isEncrypted(value as string)) {
          try {
            // Decrypt string values
            (result[key] as unknown) = this.decrypt(value as string, options);
          } catch (error) {
            // Either skip failed decryptions or throw an error based on options
            this.logSecurityEvent(`Failed to decrypt field "${key}"`, 'decrypt_field_error');

            if (!skipFailures) {
              throw new DecryptionError(
                `Failed to decrypt field "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`
              );
            }
          }
        } else if (options?.deep && value && typeof value === 'object' && !Array.isArray(value)) {
          // Deep decrypt nested objects if requested
          (result[key] as unknown) = this.decryptObject(value as Record<string, unknown>, options);
        }
      }
    }

    return result;
  }

  /**
   * Generate a secure random key
   */
  generateKey(length = 32): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
    let result = '';

    // Use crypto API if available for better randomness
    if (window.crypto && window.crypto.getRandomValues) {
      const values = new Uint32Array(length);
      window.crypto.getRandomValues(values);

      for (let i = 0; i < length; i++) {
        result += characters.charAt(values[i] % characters.length);
      }
    } else {
      // Fallback to Math.random (less secure)
      this.logSecurityEvent('Using insecure random generator (Math.random)', 'security_warning');
      throw new EncryptionError('Secure random generation not available - crypto API required');
    }

    this.logSecurityEvent('New encryption key generated', 'key_generation');
    return result;
  }

  /**
   * Test if a string appears to be encrypted with this service
   */
  isEncrypted(value: string): boolean {
    if (!value || typeof value !== 'string') return false;

    // Check for the pattern with IV:Salt:Ciphertext
    const parts = value.split(':');
    return parts.length === 3 && parts[0].length > 0 && parts[2].length > 0;
  }

  /**
   * Log security events for audit purposes without exposing sensitive data
   */
  private logSecurityEvent(message: string, action: string): void {
    try {
      auditLogClient.log(AuditEventType.SECURITY_EVENT, {
        action: `encryption_${action}`,
        details: message,
        timestamp: new Date(),
        result: action.includes('error') ? 'failure' : 'success',
      });
    } catch (error) {
      // Fail silently if audit logging fails
      console.error('Failed to log security event:', error);
    }
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();
