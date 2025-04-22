/**
 * Client-side Encryption Service
 *
 * Provides encryption and decryption capabilities for sensitive patient data
 * in compliance with HIPAA requirements for data in transit and at rest.
 *
 * Note: Client-side encryption is an additional security layer and should be
 * used alongside proper TLS/HTTPS and server-side encryption.
 */

import CryptoJS from 'crypto-js';

// Types for encryption
interface EncryptionOptions {
  // Use a secret key from a secure source (e.g., environment variables)
  // In a real implementation, this would come from a secure key management service
  secretKey?: string;
}

/**
 * Encryption Service for sensitive data
 */
class EncryptionService {
  private readonly defaultKey: string;

  constructor() {
    // In production, this should come from a secure source
    // For development, we're using a placeholder
    this.defaultKey = process.env.ENCRYPTION_KEY || 'NOVAMIND_SECURE_KEY_PLACEHOLDER';
  }

  /**
   * Encrypt a string value
   */
  encrypt(value: string, options?: EncryptionOptions): string {
    if (!value) return value;

    const key = options?.secretKey || this.defaultKey;

    try {
      return CryptoJS.AES.encrypt(value, key).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      // Return original value if encryption fails
      // In production, you might want to throw an error instead
      return value;
    }
  }

  /**
   * Decrypt an encrypted string
   */
  decrypt(encryptedValue: string, options?: EncryptionOptions): string {
    if (!encryptedValue) return encryptedValue;

    const key = options?.secretKey || this.defaultKey;

    try {
      const bytes = CryptoJS.AES.decrypt(encryptedValue, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      // Return empty string if decryption fails
      // In production, you might want to throw an error instead
      return '';
    }
  }

  /**
   * Encrypt an object by encrypting its string properties
   * Does not encrypt nested objects by default
   */
  encryptObject<T extends Record<string, unknown>>(
    obj: T,
    options?: EncryptionOptions & { deep?: boolean }
  ): T {
    if (!obj) return obj;

    const result = { ...obj };

    for (const key in result) {
      if (Object.prototype.hasOwnProperty.call(result, key)) {
        const value = result[key];

        if (typeof value === 'string') {
          // Encrypt string values
          (result[key] as unknown) = this.encrypt(value, options);
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
    options?: EncryptionOptions & { deep?: boolean }
  ): T {
    if (!obj) return obj;

    const result = { ...obj };

    for (const key in result) {
      if (Object.prototype.hasOwnProperty.call(result, key)) {
        const value = result[key];

        if (typeof value === 'string') {
          // Decrypt string values
          (result[key] as unknown) = this.decrypt(value, options);
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
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    }

    return result;
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();
