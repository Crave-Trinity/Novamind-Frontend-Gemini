/**
 * NOVAMIND Neural Test Suite - Debug Version
 */

/// <reference types="vitest" />

import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { BrainModel } from '@domain/types/brain/models';
import { useBrainVisualization } from './useBrainVisualization';

// Mock the apiClient singleton
vi.mock('@infrastructure/api/ApiClient', () => {
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
        tissueType: 'gray'
      }
    ],
    connections: [
      {
        id: 'test-connection',
        sourceId: 'test-region',
        targetId: 'other-region',
        strength: 0.7,
        type: 'structural',
        directionality: 'bidirectional',
        activityLevel: 0.6,
        pathwayLength: 10,
        dataConfidence: 0.8
      }
    ],
    scan: {
      id: 'test-scan',
      patientId: 'test-patient',
      scanDate: new Date().toISOString(),
      scanType: 'fMRI',
      resolution: '2mm',
      scannerModel: 'Test Scanner',
      contrastAgent: false,
      notes: 'Test scan',
      technician: 'Test Tech',
      processingMethod: 'standard',
      dataQualityScore: 0.9
    },
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    processingLevel: 'analyzed',
    lastUpdated: new Date().toISOString()
  };

  return {
    apiClient: {
      getBrainModel: vi.fn().mockImplementation(async (patientId: string) => {
        console.log('[MOCK] Getting brain model for:', patientId);
        return mockBrainModel;
      })
    }
  };
});

console.log('[SETUP] Starting test file execution');

// Create test wrapper with fresh QueryClient for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
      gcTime: 0,
      staleTime: 0,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false
    }
  },
  logger: {
    log: console.log,
    warn: console.warn,
    error: console.error,
  },
});

const createWrapper = () => {
  console.log('[SETUP] Creating wrapper function');
  const testQueryClient = createTestQueryClient();
  
  return ({ children }: { children: React.ReactNode }) => {
    console.log('[WRAPPER] Rendering QueryClientProvider');
    return React.createElement(
      QueryClientProvider,
      { client: testQueryClient },
      children
    );
  };
};

console.log('[SETUP] Test setup complete');

// Test Suite
describe('useBrainVisualization Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    console.log('[TEST] beforeEach - clearing mocks');
    vi.clearAllMocks();
    queryClient = new QueryClient({
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
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('renders without crashing', async () => {
    console.log('[TEST] Starting basic render test');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    );

    console.log('[TEST] About to render hook');
    const { result } = renderHook(
      () =>
        useBrainVisualization({
          patientId: 'test-patient',
          disabled: false,
          autoRotate: false,
          highlightActiveRegions: false,
        }),
      { wrapper },
    );

    console.log('[TEST] Current state:', {
      isLoading: result.current.isLoading,
      hasData: !!result.current.brainModel,
      data: result.current.brainModel,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.brainModel).toBeDefined();
      expect(result.current.brainModel).toMatchObject({
        id: 'test-brain-model',
        patientId: 'test-patient',
      });
    });
  });
});
