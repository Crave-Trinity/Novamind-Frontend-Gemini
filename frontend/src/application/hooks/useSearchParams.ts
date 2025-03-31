/**
 * NOVAMIND Neural-Safe Application Hook
 * useSearchParams - Quantum-level hook for URL parameter management
 * with state persistence for clinical navigation
 */

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Hook return type with neural-safe typing
 */
interface UseSearchParamsReturn {
  // URL parameter methods
  getParam: (key: string) => string | null;
  setParam: (key: string, value: string | number | null) => void;
  setParams: (params: Record<string, string | number | null>) => void;
  removeParam: (key: string) => void;
  clearParams: () => void;
  
  // Advanced methods
  serializeState: <T extends object>(state: T, prefix?: string) => void;
  deserializeState: <T extends object>(defaultState: T, prefix?: string) => T;
  getFullUrl: () => string;
}

/**
 * useSearchParams - Application hook for URL parameter management
 * Implements state persistence with clinical precision
 */
export function useSearchParams(): UseSearchParamsReturn {
  // Access Next.js router
  const router = useRouter();
  
  // Get current URL search params
  const getSearchParams = useCallback(() => {
    // Use URLSearchParams when available (client-side)
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    // Server-side fallback
    return new URLSearchParams('');
  }, []);
  
  // Get a specific parameter
  const getParam = useCallback((key: string): string | null => {
    if (!router.isReady) return null;
    
    // Handle param from router.query
    const value = router.query[key];
    
    // Handle array values (e.g., ?key=value1&key=value2)
    if (Array.isArray(value)) {
      return value[0] || null;
    }
    
    return value || null;
  }, [router.isReady, router.query]);
  
  // Set a specific parameter
  const setParam = useCallback((key: string, value: string | number | null) => {
    if (!router.isReady) return;
    
    // Create a copy of the current query parameters
    const newQuery = { ...router.query };
    
    // Update, add, or remove the parameter
    if (value === null || value === undefined || value === '') {
      delete newQuery[key];
    } else {
      newQuery[key] = value.toString();
    }
    
    // Update the URL
    router.push(
      {
        pathname: router.pathname,
        query: newQuery
      },
      undefined,
      { shallow: true } // Shallow routing to avoid full page reload
    );
  }, [router]);
  
  // Set multiple parameters at once
  const setParams = useCallback((params: Record<string, string | number | null>) => {
    if (!router.isReady) return;
    
    // Create a copy of the current query parameters
    const newQuery = { ...router.query };
    
    // Update, add, or remove parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        delete newQuery[key];
      } else {
        newQuery[key] = value.toString();
      }
    });
    
    // Update the URL
    router.push(
      {
        pathname: router.pathname,
        query: newQuery
      },
      undefined,
      { shallow: true } // Shallow routing to avoid full page reload
    );
  }, [router]);
  
  // Remove a specific parameter
  const removeParam = useCallback((key: string) => {
    if (!router.isReady) return;
    
    // Create a copy of the current query parameters
    const newQuery = { ...router.query };
    
    // Remove the parameter
    delete newQuery[key];
    
    // Update the URL
    router.push(
      {
        pathname: router.pathname,
        query: newQuery
      },
      undefined,
      { shallow: true } // Shallow routing to avoid full page reload
    );
  }, [router]);
  
  // Clear all parameters
  const clearParams = useCallback(() => {
    if (!router.isReady) return;
    
    // Update the URL with empty query
    router.push(
      {
        pathname: router.pathname,
        query: {}
      },
      undefined,
      { shallow: true } // Shallow routing to avoid full page reload
    );
  }, [router]);
  
  /**
   * Advanced methods for state serialization
   */
  
  // Serialize a state object to URL parameters
  const serializeState = useCallback(<T extends object>(state: T, prefix: string = '') => {
    if (!router.isReady) return;
    
    // Create a copy of the current query parameters
    const newQuery = { ...router.query };
    
    // Helper function to flatten a nested object
    const flattenObject = (obj: any, parentKey: string = ''): Record<string, string> => {
      const result: Record<string, string> = {};
      
      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = parentKey ? `${parentKey}_${key}` : key;
        
        if (value === null || value === undefined) {
          delete result[fullKey];
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          // Recursively flatten nested objects
          Object.assign(result, flattenObject(value, fullKey));
        } else if (Array.isArray(value)) {
          // Handle arrays by joining with commas
          result[fullKey] = value.join(',');
        } else {
          // Convert primitive values to strings
          result[fullKey] = value.toString();
        }
      });
      
      return result;
    };
    
    // Flatten and serialize the state object
    const serialized = flattenObject(state, prefix);
    
    // Filter out null or empty values and append prefix
    Object.entries(serialized).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        delete newQuery[key];
      } else {
        newQuery[key] = value;
      }
    });
    
    // Update the URL
    router.push(
      {
        pathname: router.pathname,
        query: newQuery
      },
      undefined,
      { shallow: true } // Shallow routing to avoid full page reload
    );
  }, [router]);
  
  // Deserialize URL parameters to a state object
  const deserializeState = useCallback(<T extends object>(defaultState: T, prefix: string = ''): T => {
    if (!router.isReady) return defaultState;
    
    const result = { ...defaultState };
    const prefix_ = prefix ? `${prefix}_` : '';
    
    // Helper function to set a nested property
    const setNestedProperty = (obj: any, path: string[], value: any) => {
      const key = path[0];
      if (path.length === 1) {
        // Base case: set the value
        obj[key] = value;
      } else {
        // Recursive case: navigate to the next level
        if (!obj[key] || typeof obj[key] !== 'object') {
          obj[key] = {};
        }
        setNestedProperty(obj[key], path.slice(1), value);
      }
    };
    
    // Process all query parameters
    Object.entries(router.query).forEach(([key, value]) => {
      // Only process parameters that match the prefix
      if (!prefix || key.startsWith(prefix_)) {
        // Remove prefix
        const keyWithoutPrefix = prefix ? key.substring(prefix_.length) : key;
        
        // Skip empty values
        if (!value) return;
        
        // Handle array values
        const actualValue = Array.isArray(value) ? value[0] : value;
        
        // Handle nested paths (e.g., 'settings_visual_theme')
        const path = keyWithoutPrefix.split('_');
        
        // Special handling for arrays
        if (actualValue && actualValue.includes(',')) {
          // Try to parse as comma-separated array
          const arrayValue = actualValue.split(',');
          setNestedProperty(result, path, arrayValue);
        } else {
          // Try to parse as number or boolean
          let parsedValue: any = actualValue;
          
          if (actualValue === 'true') parsedValue = true;
          else if (actualValue === 'false') parsedValue = false;
          else if (!isNaN(Number(actualValue))) parsedValue = Number(actualValue);
          
          setNestedProperty(result, path, parsedValue);
        }
      }
    });
    
    return result;
  }, [router.isReady, router.query]);
  
  // Get the full URL as a string
  const getFullUrl = useCallback((): string => {
    if (typeof window === 'undefined') {
      return '';
    }
    
    return window.location.href;
  }, []);
  
  return {
    getParam,
    setParam,
    setParams,
    removeParam,
    clearParams,
    serializeState,
    deserializeState,
    getFullUrl
  };
}
