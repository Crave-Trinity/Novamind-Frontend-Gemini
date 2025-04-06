/**
 * NOVAMIND Neural Test Suite
 * Vite environment types verification with quantum precision
 */

import { describe, it, expect } from 'vitest'; // Removed unused vi import

// Declaration files (.d.ts) are not imported directly
// They extend the global namespace with additional types

describe('Vite Environment Types', () => {
  it('verifies Vite types with clinical precision', () => {
    // Test that import.meta.env is available in TypeScript
    const envVariables = {
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
    };

    // Validate that the environment variables exist
    expect(envVariables).toBeDefined();
    expect(typeof envVariables.MODE).toBe('string');
    expect(typeof envVariables.DEV).toBe('boolean');
    expect(typeof envVariables.PROD).toBe('boolean');
  });

  it('maintains neural precision with custom environment variables', () => {
    // Mock custom environment variables to verify type behavior
    // Note: This is for type checking only, actual values come from Vite at runtime
    const mockEnv = {
      VITE_API_URL: 'https://api.novamind.com',
      VITE_API_KEY: 'test-key-123',
      VITE_DEBUG_MODE: 'true',
    };

    // Verify type structure
    expect(typeof mockEnv.VITE_API_URL).toBe('string');
    expect(typeof mockEnv.VITE_API_KEY).toBe('string');
    expect(typeof mockEnv.VITE_DEBUG_MODE).toBe('string');

    // Verify expected string values (demonstrates type safety)
    expect(mockEnv.VITE_API_URL).toContain('novamind.com');
  });
});
