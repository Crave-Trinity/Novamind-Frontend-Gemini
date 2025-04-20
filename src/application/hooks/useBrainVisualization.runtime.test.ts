/* eslint-disable */
/**
 * @fileoverview Tests for runtime validation functions in useBrainVisualization.runtime.ts.
 */

import { describe, it, expect } from 'vitest';
import { validatePartialBrainViewState } from '@hooks/useBrainVisualization.runtime';
// Import domain types/enums used in validation
import { RenderMode, isValidRenderMode } from '@domain/types/brain/visualization';

// Define the structure expected for the partial initial view state option
// (Duplicated here for clarity in tests, could be imported if shared)
type PartialBrainViewState = {
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  zoom?: number;
  highlightedRegions?: string[];
  visiblePathways?: boolean;
  renderMode?: RenderMode;
  transparencyLevel?: number;
  focusPoint?: [number, number, number] | null;
};

describe('useBrainVisualization Runtime Validation', () => {
  describe('validatePartialBrainViewState', () => {
    it('should return Ok for a valid partial BrainViewState object', () => {
      const validData: PartialBrainViewState = {
        rotationY: 0.5,
        zoom: 1.5,
        renderMode: RenderMode.FUNCTIONAL,
        highlightedRegions: ['r1', 'r2'],
      };
      const result = validatePartialBrainViewState(validData);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(validData);
    });

    it('should return Ok for an empty object (all fields optional)', () => {
      const validData = {};
      const result = validatePartialBrainViewState(validData);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(validData);
    });

    it('should return Ok for an object with only some valid fields', () => {
      const validData: PartialBrainViewState = {
        visiblePathways: false,
        transparencyLevel: 0.5,
      };
      const result = validatePartialBrainViewState(validData);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(validData);
    });

    it('should return Err for non-object input', () => {
      const invalidData = 123;
      const result = validatePartialBrainViewState(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain('Input must be an object.');
    });

    it('should return Err for null input', () => {
      const invalidData = null;
      const result = validatePartialBrainViewState(invalidData);
      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toContain('Input must be an object.');
    });

    it('should return Err for invalid rotationX type', () => {
      const invalidData = { rotationX: 'abc' };
      const result = validatePartialBrainViewState(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('rotationX must be a number.');
    });

    it('should return Err for invalid zoom value (zero)', () => {
      const invalidData = { zoom: 0 };
      const result = validatePartialBrainViewState(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('zoom must be a positive number.');
    });

    it('should return Err for invalid highlightedRegions type (not array)', () => {
      const invalidData = { highlightedRegions: 'r1' };
      const result = validatePartialBrainViewState(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        'highlightedRegions must be an array of strings.'
      );
    });

    it('should return Err for invalid highlightedRegions type (array of numbers)', () => {
      const invalidData = { highlightedRegions: [1, 2] };
      const result = validatePartialBrainViewState(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        'highlightedRegions must be an array of strings.'
      );
    });

    it('should return Err for invalid visiblePathways type', () => {
      const invalidData = { visiblePathways: 'yes' };
      const result = validatePartialBrainViewState(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('visiblePathways must be a boolean.');
    });

    it('should return Err for invalid renderMode value', () => {
      const invalidData = { renderMode: 'invalid-mode' };
      const result = validatePartialBrainViewState(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain('Invalid renderMode value "invalid-mode".');
    });

    it('should return Err for invalid transparencyLevel (too high)', () => {
      const invalidData = { transparencyLevel: 1.1 };
      const result = validatePartialBrainViewState(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        'transparencyLevel must be a number between 0 and 1.'
      );
    });

    it('should return Err for invalid focusPoint (not array or null)', () => {
      const invalidData = { focusPoint: { x: 0, y: 0, z: 0 } };
      const result = validatePartialBrainViewState(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        'focusPoint must be null or an array of three numbers.'
      );
    });

    it('should return Err for invalid focusPoint (wrong array length)', () => {
      const invalidData = { focusPoint: [0, 0] };
      const result = validatePartialBrainViewState(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        'focusPoint must be null or an array of three numbers.'
      );
    });

    it('should return Err for invalid focusPoint (wrong array element type)', () => {
      const invalidData = { focusPoint: [0, '0', 0] };
      const result = validatePartialBrainViewState(invalidData);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        'focusPoint must be null or an array of three numbers.'
      );
    });

    it('should return Ok for focusPoint being null', () => {
      const validData = { focusPoint: null };
      const result = validatePartialBrainViewState(validData);
      expect(result.ok).toBe(true);
    });

    it('should return Ok for focusPoint being a valid array', () => {
      const validData = { focusPoint: [10, -5, 20] };
      const result = validatePartialBrainViewState(validData);
      expect(result.ok).toBe(true);
    });
  });

  // Tests for isValidRenderMode (imported from domain)
  describe('isValidRenderMode', () => {
    it('should return true for valid RenderMode values', () => {
      expect(isValidRenderMode(RenderMode.ANATOMICAL)).toBe(true);
      expect(isValidRenderMode(RenderMode.FUNCTIONAL)).toBe(true);
      expect(isValidRenderMode('connectivity')).toBe(true); // Test string literal as well
    });

    it('should return false for invalid RenderMode values', () => {
      expect(isValidRenderMode('invalid-mode')).toBe(false);
      expect(isValidRenderMode(123)).toBe(false);
      expect(isValidRenderMode(null)).toBe(false);
      expect(isValidRenderMode(undefined)).toBe(false);
      expect(isValidRenderMode({})).toBe(false);
    });
  });
});
