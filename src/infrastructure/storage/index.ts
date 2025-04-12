/* eslint-disable */
/**
 * Storage service for persistent data
 */

/**
 * Interface for storage providers
 */
export interface StorageProvider {
  getItem<T>(key: string): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * Local storage provider
 */
export class LocalStorageProvider implements StorageProvider {
  private prefix: string;

  constructor(prefix = 'novamind_') {
    this.prefix = prefix;
  }

  getItem<T>(key: string): T | null {
    const item = localStorage.getItem(this.prefix + key);
    if (!item) return null;

    try {
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Failed to parse stored item:', error);
      return null;
    }
  }

  setItem<T>(key: string, value: T): void {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  }

  removeItem(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    // Only clear keys with our prefix
    Object.keys(localStorage)
      .filter((key) => key.startsWith(this.prefix))
      .forEach((key) => localStorage.removeItem(key));
  }
}

/**
 * Session storage provider
 */
export class SessionStorageProvider implements StorageProvider {
  private prefix: string;

  constructor(prefix = 'novamind_') {
    this.prefix = prefix;
  }

  getItem<T>(key: string): T | null {
    const item = sessionStorage.getItem(this.prefix + key);
    if (!item) return null;

    try {
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Failed to parse stored item:', error);
      return null;
    }
  }

  setItem<T>(key: string, value: T): void {
    sessionStorage.setItem(this.prefix + key, JSON.stringify(value));
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    // Only clear keys with our prefix
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(this.prefix))
      .forEach((key) => sessionStorage.removeItem(key));
  }
}
