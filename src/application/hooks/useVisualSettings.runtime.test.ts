/**
 * @fileoverview Tests for runtime validation functions in useVisualSettings.runtime.ts.
 */

import { describe, it, expect } from 'vitest';
// Import the specific validation functions and relevant types/enums
import {
  validatePartialVisualizationSettings,
  validateFullThemeSettings,
} from '@hooks/useVisualSettings.runtime';
import {
  type VisualizationSettings,
  type ThemeSettings,
  RenderMode,
  type ThemeOption,
  visualizationThemes, // Import predefined themes for testing
  defaultVisualizationSettings, // Import defaults for base valid object
} from '@domain/types/brain/visualization';

// Type alias for clarity
type PartialVisSettings = Partial<VisualizationSettings>;
type FullThemeSettings = ThemeSettings;

// Helper to create a valid partial settings object
const createValidPartialSettings = (): PartialVisSettings => ({
  showLabels: false,
  rotationSpeed: 0.8,
  renderMode: RenderMode.CONNECTIVITY,
  levelOfDetail: 'medium',
  // Add other valid partial fields based on VisualizationSettings interface
});

// Helper to create a valid full theme settings object
const createValidFullTheme = (): FullThemeSettings => ({
  ...visualizationThemes.dark, // Use a predefined theme as a base
  name: 'dark', // Ensure name matches ThemeOption
});

describe('useVisualSettings Runtime Validation', () => {
  // Tests for validatePartialVisualizationSettings
  describe('validatePartialVisualizationSettings', () => {
    it('should return Ok for a valid Partial<VisualizationSettings> object', () => {
      const validData = createValidPartialSettings();
      const result = validatePartialVisualizationSettings(validData);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(validData);
    });

    it('should return Ok for an empty object (all fields optional)', () => {
      const validData = {};
      const result = validatePartialVisualizationSettings(validData);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual({});
    });

    it('should return Err for non-object input', () => {
      const invalidData = true;
      const result = validatePartialVisualizationSettings(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Input must be an object.');
    });

    it('should return Err for null input', () => {
      const invalidData = null;
      const result = validatePartialVisualizationSettings(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Input must be an object.');
    });

    it('should return Err for data with incorrect field type (e.g., showLabels)', () => {
      const invalidData = { showLabels: 'yes' };
      const result = validatePartialVisualizationSettings(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('showLabels must be a boolean.');
    });

    it('should return Err for data with invalid enum value (e.g., renderMode)', () => {
      const invalidData = { renderMode: 'fancy' };
      const result = validatePartialVisualizationSettings(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Invalid renderMode value "fancy".');
    });

    it('should return Err for data with invalid enum value (e.g., levelOfDetail)', () => {
      const invalidData = { levelOfDetail: 'super_high' };
      const result = validatePartialVisualizationSettings(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Invalid levelOfDetail value.');
    });

    it('should return Err for invalid cameraPosition', () => {
      const invalidData = { cameraPosition: [0, '1'] };
      const result = validatePartialVisualizationSettings(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        'cameraPosition must be an array of three numbers.'
      );
    });

    // Note: The check for nested themeSettings was removed from validatePartialVisualizationSettings
    // as themeSettings is not part of the VisualizationSettings domain type.
  });

  // Tests for validateFullThemeSettings
  describe('validateFullThemeSettings', () => {
    it('should return Ok for a valid ThemeSettings object', () => {
      const validData = createValidFullTheme();
      const result = validateFullThemeSettings(validData);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(validData);
    });

    it('should return Err for non-object input', () => {
      const invalidData = 'dark';
      const result = validateFullThemeSettings(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Input must be an object.');
    });

    it('should return Err for an empty object (missing required fields)', () => {
      const invalidData = {};
      const result = validateFullThemeSettings(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Missing or invalid "name".');
    });

    it('should return Err for data missing a required field (e.g., name)', () => {
      const invalidData = { ...createValidFullTheme(), name: undefined } as any;
      const result = validateFullThemeSettings(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Missing or invalid "name".');
    });

    it('should return Err for data with incorrect field type (e.g., glowIntensity)', () => {
      const invalidData = { ...createValidFullTheme(), glowIntensity: 'low' };
      const result = validateFullThemeSettings(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Missing or invalid "glowIntensity".');
    });
  });
});
