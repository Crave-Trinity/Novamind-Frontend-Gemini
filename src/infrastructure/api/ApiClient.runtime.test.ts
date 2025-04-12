/**
 * @fileoverview Tests for runtime validation functions in ApiClient.runtime.ts.
 */

import { describe, it, expect, vi } from 'vitest';
import type { AxiosResponse } from 'axios'; // Import AxiosResponse type
import {
  validateApiResponse,
  // Import other guards as they are defined
} from '@api/ApiClient.runtime';

// Import mock data generators or fixtures if available

describe('ApiClient Runtime Validation', () => {
  // --- Mock Data ---
  const mockValidPatient = { id: 1, name: 'John Doe', condition: 'Stable' };

  // Helper to create a mock AxiosResponse
  const createMockResponse = <T>(
    data: T,
    status = 200,
    headers = { 'content-type': 'application/json' }
  ): AxiosResponse<T> => ({
    data,
    status,
    statusText: 'OK',
    headers,
    config: {} as never, // Using never is slightly more appropriate than any here
    request: {} as never,
  });

  // --- Tests for validateApiResponse ---
  describe('validateApiResponse', () => {
    it('should return structured response for valid data and status', () => {
      const mockResponse = createMockResponse(mockValidPatient);
      const result = validateApiResponse(mockResponse);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('headers');
      expect(result.data).toEqual(mockValidPatient);
      expect(result.status).toBe(200);
      expect(result.headers['content-type']).toBe('application/json');
    });

    it('should throw error for non-2xx status codes', () => {
      const mockErrorResponse = createMockResponse(null, 404);
      expect(() => validateApiResponse(mockErrorResponse)).toThrow(
        'API request failed with status 404'
      );

      const mockServerResponse = createMockResponse({ error: 'Internal Error' }, 500);
      expect(() => validateApiResponse(mockServerResponse)).toThrow(
        'API request failed with status 500'
      );
    });

    it('should throw error for missing data payload', () => {
      const mockResponseNoData = createMockResponse<null>(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockResponseNoData as any).data = undefined; // Force undefined data
      expect(() => validateApiResponse(mockResponseNoData)).toThrow(
        'API response missing data payload'
      );
    });

    it('should warn but not throw for unexpected content type', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn');
      const mockXmlResponse = createMockResponse('<data/>', 200, {
        'content-type': 'application/xml',
      });
      expect(() => validateApiResponse(mockXmlResponse)).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Unexpected content type: application/xml');
      consoleWarnSpy.mockRestore(); // Clean up spy
    });
  });

  // --- Skipped tests for specific type guards --- 
  describe.skip('isApiPatient', () => {
    it('should return true for valid patient object', () => {
      // expect(isApiPatient(mockValidPatient)).toBe(true);
    });

    it('should return false for invalid patient object (missing name)', () => {
      // expect(isApiPatient({ id: 2, condition: 'Unknown' })).toBe(false);
    });

    it('should return false for null', () => {
      // expect(isApiPatient(null)).toBe(false);
    });

    it('should return false for non-object', () => {
      // expect(isApiPatient('string')).toBe(false);
    });
  });

  describe.skip('isApiPatientArray', () => {
    it('should return true for valid patient array', () => {
      // expect(isApiPatientArray([mockValidPatient])).toBe(true);
    });
    it('should return false for invalid patient array', () => {
      // Example: expect(isApiPatientArray([mockValidPatient, { id: 2, condition: 'Unknown' }])).toBe(false);
    });
    it('should return false for non-array', () => {
      // expect(isApiPatientArray(mockValidPatient)).toBe(false);
    });
    it('should return true for empty array', () => {
      // expect(isApiPatientArray([])).toBe(true);
    });
  });
});
