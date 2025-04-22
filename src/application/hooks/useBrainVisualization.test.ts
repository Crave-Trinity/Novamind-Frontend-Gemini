/* eslint-disable */
/**
 * NOVAMIND Neural Test Suite - Debug Version
 */

/// <reference types="vitest" />

import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { BrainModel } from '@domain/types/brain/models';
import { useBrainVisualization } from './useBrainVisualization';

// Mock the apiClient singleton
vi.mock('../../infrastructure/api/apiClient', () => { // Use the correct relative path
  const mockBrainModel: BrainModel = {
    id: 'test-brain-model',
    patientId: 'test-patient',
    regions: [
      {
        id: 'test-region',
        name: 'Test Region',
        position: { x: 0, y: 0, z: 0 },
        color: '#ff0000',
        connections: ['other-region'],
        activityLevel: 0.5,
        isActive: true,
        hemisphereLocation: 'left',
        dataConfidence: 0.8,
        volumeMl: 100,
        riskFactor: 0.2,
        clinicalSignificance: 'normal',
        tissueType: 'gray',
        volume: 1500,
        activity: 0.5,
      },
    ],
    connections: [
      {
        id: 'test-connection',
        sourceId: 'test-region',
        targetId: 'other-region',
        strength: 0.7,
        type: 'excitatory',
        directionality: 'bidirectional',
        activityLevel: 0.6,
        pathwayLength: 10,
        dataConfidence: 0.8,
      },
    ],
    scan: {
      id: 'test-scan',
      patientId: 'test-patient',
      scanDate: new Date().toISOString(),
      scanType: 'fMRI',
      resolution: { x: 2, y: 2, z: 2 },
      scannerModel: 'Test Scanner',
      contrastAgent: false,
      notes: 'Test scan',
      technician: 'Test Tech',
      processingMethod: 'standard',
      dataQualityScore: 0.9,
      metadata: {}, // Added missing metadata property
    },
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    processingLevel: 'analyzed',
    lastUpdated: new Date().toISOString(),
  };

  return {
    apiClient: {
      // Mock the 'get' method used by the hook to immediately return the mockBrainModel
      get: vi.fn().mockImplementation(async (path: string) => {
        console.log('[MOCK] apiClient.get called with path:', path);
        
        // Ensure we're specifically handling the brain model path correctly
        if (path.includes('brainModel') || path.includes('brain-model')) {
          console.log('[MOCK] Returning mockBrainModel for brain model request');
          return mockBrainModel;
        }
        
        console.log('[MOCK] Returning default mock for path:', path);
        return { data: "mock data" };
      }),
    },
  };
});

console.log('[SETUP] Starting test file execution');

// Removed unused function: createTestQueryClient

// Removed unused createWrapper function

console.log('[SETUP] Test setup complete');

// Test Suite
describe('useBrainVisualization Hook', () => {
  let queryClient: QueryClient;

  // beforeEach(() => { // Remove beforeEach setup for queryClient
  //   console.log('[TEST] beforeEach - clearing mocks');
  //   vi.clearAllMocks();
  //   // queryClient = new QueryClient({ // Create client inside wrapper instead
  //   //   defaultOptions: {
  //   //     queries: {
  //   //       retry: false,
  //   //       gcTime: 0,
  //   //       staleTime: 0,
  //   //       refetchOnMount: false,
  //   //       refetchOnWindowFocus: false,
  //   //       refetchOnReconnect: false,
  //   //     },
  //   //   },
  //   // });
  // });

  // afterEach(() => { // No longer need to clear client created in wrapper
  //   // queryClient.clear();
  // });

  it.skip('renders without crashing', async () => {
    console.log('[TEST] Starting basic render test');

    // Create a fresh client for each renderHook call within the wrapper
    const wrapper = ({ children }: { children: React.ReactNode }) => {
      const testQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            gcTime: 0,
            staleTime: 0,
          },
        },
      });
      return React.createElement(QueryClientProvider, { client: testQueryClient }, children);
    };

    console.log('[TEST] About to render hook');
    const { result } = renderHook(
      () =>
        useBrainVisualization({
          patientId: 'test-patient',
          disabled: false,
          autoRotate: false,
          highlightActiveRegions: false,
        }),
      { wrapper }
    );

    console.log('[TEST] Current state:', {
      isLoading: result.current.isLoading,
      hasData: !!result.current.brainModel,
      data: result.current.brainModel,
    });

    // Wait for the query to be successful and data to be defined
    await waitFor(() => {
      console.log('[TEST] Checking result in waitFor:', {
        isLoading: result.current.isLoading,
        hasData: !!result.current.brainModel,
        data: result.current.brainModel,
      });
      
      // Then check loading state and data
      expect(result.current.isLoading).toBe(false);
      expect(result.current.brainModel).toBeDefined();
      expect(result.current.brainModel).toMatchObject({
        id: 'test-brain-model',
        patientId: 'test-patient',
      });
    }, { timeout: 5000 }); // Increase timeout to give more time for async operations
  });
});
