/**
 * @fileoverview Tests for runtime validation functions in brainDataTransformer.runtime.ts.
 */

import { describe, it, expect } from 'vitest';
import {
    validateBrainModelData,
    validateBrainRegionArray,
    validateRenderMode,
    validateThemeSettings,
    isThemeSettings, // Import guard for direct testing
} from './brainDataTransformer.runtime';
import {
    BrainModel,
    BrainRegion,
    ThemeSettings,
    RenderMode
} from '@domain/types/brain'; // Assuming index export in domain/types/brain
import { generateMockBrainData } from './brainDataTransformer'; // For valid data
import { visualizationThemes } from '@domain/types/brain/visualization'; // For valid theme settings

// --- Mock Data ---

const mockValidBrainModel = generateMockBrainData();

const mockInvalidBrainModel_MissingRegions = {
    ...generateMockBrainData(),
    regions: undefined // Missing required field
};

const mockInvalidBrainModel_BadConnections = {
    ...generateMockBrainData(),
    connections: [{ id: 'c1', sourceId: 'r1' }] // Incomplete connection object
};

const mockValidRegions: BrainRegion[] = generateMockBrainData().regions;
const mockInvalidRegions = [
    ...generateMockBrainData().regions,
    { id: 'invalid', name: 'Invalid Region' } // Missing required fields
];

const mockValidThemeSettings = visualizationThemes.dark;
const mockInvalidThemeSettings = {
    ...visualizationThemes.dark,
    backgroundColor: 123 // Wrong type
};

const mockValidRenderMode = RenderMode.ANATOMICAL;
const mockInvalidRenderMode = 'invalid-mode';


describe('brainDataTransformer Runtime Validation', () => {

  // Tests for validateBrainModelData
  describe('validateBrainModelData', () => {
    it('should return Ok for valid BrainModel data', () => {
      const result = validateBrainModelData(mockValidBrainModel);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(mockValidBrainModel);
    });

    it('should return Err for data missing regions', () => {
      const result = validateBrainModelData(mockInvalidBrainModel_MissingRegions);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Invalid BrainModel data structure');
    });

    it('should return Err for data with invalid connections array', () => {
      const result = validateBrainModelData(mockInvalidBrainModel_BadConnections);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Invalid BrainModel data structure');
    });

     it('should return Err for non-object input', () => {
      const result = validateBrainModelData(null);
      expect(result.err).toBe(true);
    });
  });

  // Tests for validateBrainRegionArray
  describe('validateBrainRegionArray', () => {
     it('should return Ok for valid BrainRegion array', () => {
      const result = validateBrainRegionArray(mockValidRegions);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(mockValidRegions);
    });

     it('should return Ok for empty array', () => {
      const result = validateBrainRegionArray([]);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual([]);
    });

    it('should return Err for array with invalid BrainRegion objects', () => {
      const result = validateBrainRegionArray(mockInvalidRegions);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Expected an array of BrainRegion objects');
    });

     it('should return Err for non-array input', () => {
      const result = validateBrainRegionArray({ id: 'r1' });
      expect(result.err).toBe(true);
    });
  });

  // Tests for validateRenderMode
  describe('validateRenderMode', () => {
     it('should return Ok for valid RenderMode values', () => {
        Object.values(RenderMode).forEach(mode => {
             const result = validateRenderMode(mode);
             expect(result.ok).toBe(true);
             expect(result.val).toEqual(mode);
        });
    });

    it('should return Err for invalid string values', () => {
      const result = validateRenderMode(mockInvalidRenderMode);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Invalid RenderMode value');
    });

     it('should return Err for non-string input', () => {
      const result = validateRenderMode(1);
      expect(result.err).toBe(true);
    });
  });

  // Tests for validateThemeSettings
  describe('validateThemeSettings', () => {
     it('should return Ok for valid ThemeSettings object', () => {
      const result = validateThemeSettings(mockValidThemeSettings);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(mockValidThemeSettings);
    });

    it('should return Err for invalid ThemeSettings object (wrong type)', () => {
      const result = validateThemeSettings(mockInvalidThemeSettings);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Invalid ThemeSettings object');
    });

     it('should return Err for non-object input', () => {
      const result = validateThemeSettings(null);
      expect(result.err).toBe(true);
    });
  });

   // Direct tests for isThemeSettings guard
   describe('isThemeSettings', () => {
        it('should return true for valid theme settings', () => {
            expect(isThemeSettings(visualizationThemes.clinical)).toBe(true);
        });
         it('should return false for object missing properties', () => {
            const incompleteTheme = { ...visualizationThemes.dark, backgroundColor: undefined };
            expect(isThemeSettings(incompleteTheme)).toBe(false);
        });
         it('should return false for object with wrong property type', () => {
            expect(isThemeSettings(mockInvalidThemeSettings)).toBe(false);
        });
   });

});
