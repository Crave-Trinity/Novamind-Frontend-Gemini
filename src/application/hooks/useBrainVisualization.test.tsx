/**
 * @vitest-environment jsdom
 */
/* eslint-disable */
/**
 * NOVAMIND Neural Test Suite
 * useBrainVisualization testing with quantum precision
 */

import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, QueryObserverResult, RefetchOptions } from '@tanstack/react-query'; // Added missing types
import { renderHook, waitFor } from '@testing-library/react';
import { useBrainVisualization } from '../hooks/useBrainVisualization'; // Use relative path
import { apiClient } from '../../infrastructure/api/apiClient'; // Correct casing to match hook
import type { BrainModel } from '../../domain/types/brain/models'; // Use relative path
import type { RenderMode } from '../../domain/types/brain/visualization'; // Use relative path

// Mock the apiClient's get method to intercept API calls
vi.mock('../../infrastructure/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(), // Mock the 'get' method
  },
}));

// Define queryClient globally for the test suite
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

// Define the wrapper component globally
const QueryWrapper = ({ children }: { children: ReactNode }): React.ReactElement => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

// Define a more specific type for the mock data, aligning with BrainModel
// Use Partial to allow defining only necessary fields for the test
const mockBrainModelData: Partial<BrainModel> = {
  id: 'mock-model-123',
  patientId: 'default',
  regions: [{
    id: 'r1',
    name: 'Region 1',
    activityLevel: 0.8,
    position: { x: 0, y: 0, z: 0 },
    color: 'red',
    connections: [],
    isActive: true,
    // Add missing required properties with default values
    hemisphereLocation: 'left',
    dataConfidence: 1,
    volume: 100,
    activity: 0.8
  }],
  connections: [], // Use 'connections' instead of 'pathways' if that's the correct type property
  // Add other necessary fields if hook uses them
};

describe('useBrainVisualization Hook', () => { // Un-skip the suite
  // Re-skip due to persistent hangs - needs investigation into async/timing issues
  // Cast the mocked apiClient method
  // Cast the mocked 'get' method
  const mockedGet = apiClient.get as Mock;


  beforeEach(() => {
    // vi.useFakeTimers(); // Removed fake timers
    // Reset mocks
    vi.clearAllMocks();
    queryClient.clear(); // Clear query cache

    // Setup mock response for apiClient.getBrainModel
    // Ensure the resolved value matches the expected BrainModel structure or use 'as any' if structure is complex/partial
    // Setup mock response for apiClient.get for the specific brain model path
    mockedGet.mockImplementation(async (path: string) => {
      if (path.includes('brain-models/')) { // Check if the path matches what the hook calls
        return Promise.resolve(mockBrainModelData as BrainModel);
      }
      // Handle other paths or throw an error if needed
      return Promise.reject(new Error(`Unexpected path in mock: ${path}`));
    });
  });

  afterEach(() => {
    // vi.useRealTimers(); // Removed fake timers
    vi.restoreAllMocks();
  });

  it('processes data with mathematical precision', async () => {
    // Add async
    // Render the actual hook with the wrapper
    const { result } = renderHook(() => useBrainVisualization(), { wrapper: QueryWrapper }); // Pass the wrapper function

    // Assertions need to wait for the query to resolve
    await waitFor(() => expect(result.current.isLoading).toBe(false)); // Keep waitFor

    expect(result.current.error).toBeNull();
    // Use toMatchObject for partial comparison if mockBrainModelData is Partial<BrainModel>
    expect(result.current.brainModel).toMatchObject(mockBrainModelData);
    expect(result.current.visibleRegions).toBeDefined();
    // Assuming visiblePathways corresponds to connections
    // Assuming visiblePathways corresponds to connections in the loaded model
    expect(result.current.brainModel?.connections).toBeDefined();
  });

  it('handles edge cases with clinical precision', async () => {
    // Add async
    // Test error state by rejecting the mock promise
    const testError = new Error('Test Error');
    // Reject the mock promise for the error case
    mockedGet.mockRejectedValue(testError);

    const { result } = renderHook(() => useBrainVisualization(), { wrapper: QueryWrapper }); // Pass the wrapper function

    // Assertions need to wait for the query to fail
    await waitFor(() => expect(result.current.error).toBeDefined()); // Wait for error object
    
    // Also wait for isLoading to become false after the error
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeDefined(); // Check if error object exists
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Test Error');
    expect(result.current.brainModel).toBeUndefined(); // Data should be undefined on error
    expect(result.current.visibleRegions).toEqual([]); // Should be empty if brainModel is null/undefined
    // Assuming visiblePathways corresponds to connections
    // Assuming visiblePathways corresponds to connections
    expect(result.current.brainModel?.connections ?? []).toEqual([]);
  });
});
