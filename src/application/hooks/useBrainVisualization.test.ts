/* eslint-disable */
/**
 * NOVAMIND Neural Test Suite - Debug Version
 */

/// <reference types="vitest" />

import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
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
        // Ensure we're specifically handling the brain model path correctly
        if (path.includes('brainModel') || path.includes('brain-model')) {
          return { data: mockBrainModel };
        }
        
        return { data: "mock data" };
      }),
    },
  };
});

// Test Suite
describe('useBrainVisualization Hook', () => {
  // Create a test wrapper with QueryClientProvider for each test
  const createWrapper = () => {
    const testQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
          staleTime: 0,
          refetchOnMount: false,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
        },
      },
      logger: {
        log: () => {},
        warn: () => {},
        error: () => {},
      },
    });
    
    return ({ children }: { children: React.ReactNode }) => {
      return (
        <QueryClientProvider client={testQueryClient}>
          {children}
        </QueryClientProvider>
      );
    };
  };

  it('renders without crashing and loads brain model data', async () => {
    // Arrange - Setup the wrapper with query client
    const wrapper = createWrapper();

    // Act - Render the hook with test parameters
    const { result } = renderHook(
      () => useBrainVisualization({
        patientId: 'test-patient',
        disabled: false,
        autoRotate: false,
        highlightActiveRegions: false,
      }),
      { wrapper }
    );

    // Assert - Check initial loading state
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the query to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 1000 });
    
    // Assert final state
    expect(result.current.brainModel).toBeDefined();
    expect(result.current.brainModel?.id).toBe('test-brain-model');
    expect(result.current.brainModel?.patientId).toBe('test-patient');
    expect(result.current.brainModel?.regions).toHaveLength(1);
    expect(result.current.brainModel?.connections).toHaveLength(1);
  });
});
