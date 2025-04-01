/**
 * @fileoverview Tests for runtime validation functions in useTheme.runtime.ts.
 */

import { describe, it, expect } from 'vitest';
import { validateThemeSettings, validateThemeOption } from './useTheme.runtime';
// Import actual domain types and the theme definitions
import {
  ThemeSettings,
  ThemeOption,
  isValidTheme,
  visualizationThemes,
} from '@domain/types/brain/visualization';

// Helper to create a valid ThemeSettings object (using the 'clinical' theme as base)
const createValidMockThemeSettings = (): ThemeSettings => ({
  ...visualizationThemes.clinical, // Start with a valid theme
});

describe('useTheme Runtime Validation', () => {
  describe('validateThemeSettings', () => {
    it('should return Ok for a valid ThemeSettings object', () => {
      const validData = createValidMockThemeSettings();
      const result = validateThemeSettings(validData);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(validData);
    });

     it('should return Ok for another valid ThemeSettings object (dark)', () => {
      const validData = visualizationThemes.dark; // Use another predefined theme
      const result = validateThemeSettings(validData);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(validData);
    });

    it('should return Err for non-object input', () => {
      const invalidData = 'dark';
      const result = validateThemeSettings(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain('Input must be an object.');
    });

    it('should return Err for null input', () => {
      const invalidData = null;
      const result = validateThemeSettings(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain('Input must be an object.');
    });

     it('should return Err for an empty object (missing required fields)', () => {
      const invalidData = {};
      const result = validateThemeSettings(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Missing or invalid "name".');
    });

    it('should return Err for data missing a required field (e.g., name)', () => {
      const invalidData = { ...createValidMockThemeSettings(), name: undefined } as any; // Force missing name
      const result = validateThemeSettings(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Missing or invalid "name".');
    });

     it('should return Err for data with invalid theme name', () => {
      const invalidData = { ...createValidMockThemeSettings(), name: 'invalid-theme-name' };
      const result = validateThemeSettings(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Missing or invalid "name".'); // Because isValidTheme fails
    });

    it('should return Err for data with incorrect field type (e.g., glowIntensity)', () => {
      const invalidData = { ...createValidMockThemeSettings(), glowIntensity: 'high' };
      const result = validateThemeSettings(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Missing or invalid "glowIntensity".');
    });

     it('should return Err for data with incorrect field type (e.g., useBloom)', () => {
      const invalidData = { ...createValidMockThemeSettings(), useBloom: 'maybe' };
      const result = validateThemeSettings(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Missing or invalid "useBloom".');
    });

     it('should return Err for data missing a required color field (e.g., primaryColor)', () => {
       const invalidData = { ...createValidMockThemeSettings() };
       // @ts-expect-error - Intentionally delete for test
       delete invalidData.primaryColor;
       const result = validateThemeSettings(invalidData);
       expect(result.err).toBe(true);
       expect((result.val as Error).message).toContain('Missing or invalid "primaryColor".');
     });

  });

  describe('validateThemeOption', () => {
    it('should return Ok for valid ThemeOption values', () => {
      expect(validateThemeOption('clinical').ok).toBe(true);
      expect(validateThemeOption('dark').ok).toBe(true);
      expect(validateThemeOption('high-contrast').ok).toBe(true);
      expect(validateThemeOption('presentation').ok).toBe(true);
      expect(validateThemeOption('research').ok).toBe(true);
    });

    it('should return Err for invalid ThemeOption values', () => {
      expect(validateThemeOption('light').err).toBe(true); // 'light' is not a defined ThemeOption
      expect(validateThemeOption('custom').err).toBe(true);
      expect(validateThemeOption(123).err).toBe(true);
      expect(validateThemeOption(null).err).toBe(true);
      expect(validateThemeOption(undefined).err).toBe(true);
      expect(validateThemeOption({}).err).toBe(true);
    });

     it('should return specific error message for invalid option', () => {
      const result = validateThemeOption('invalid-option');
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toBe('Invalid ThemeOption: Received "invalid-option".');
     });
  });
});
