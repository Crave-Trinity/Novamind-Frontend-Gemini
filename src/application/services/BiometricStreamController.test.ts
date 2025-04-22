/* eslint-disable */
/**
 * NOVAMIND Neural Test Suite - Rebuilt
 * BiometricStreamController testing with focused, incremental tests.
 */

import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest'; // Already correct
import { renderHook, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { biometricService } from '@application/services/biometricService';
import { useBiometricStreamController } from '@application/services/BiometricStreamController'; // Corrected path
import {
  // Removed unused: BiometricDataPoint
  // Removed unused: BiometricAlert
  type BiometricStream, // Already correct
  // BiometricType,
  // AlertPriority,
} from '../../domain/types/biometric/streams';
import { type Result, success } from '../../domain/types/shared/common'; // Removed unused: failure

// Mock the biometricService
vi.mock('@application/services/biometricService', () => ({
  biometricService: {
    getStreamMetadata: vi.fn(),
    calculateStreamCorrelations: vi.fn(),
    // Add other methods if the hook uses them
  },
}));

// Mock data
const mockPatientId = 'patient-123';
const mockStreamMetadata: BiometricStream[] = [
  {
    id: 'stream-hr',
    patientId: mockPatientId,
    type: 'heartRate',
    source: 'wearable',
    name: 'Heart Rate Monitor',
    unit: 'bpm',
    isActive: true,
    lastDataPointTimestamp: new Date(),
  },
  {
    id: 'stream-bp',
    patientId: mockPatientId,
    type: 'bloodPressureSystolic',
    source: 'clinical',
    name: 'Blood Pressure Cuff (Systolic)',
    unit: 'mmHg',
    isActive: true,
    lastDataPointTimestamp: new Date(),
  },
  {
    id: 'stream-bp-dia',
    patientId: mockPatientId,
    type: 'bloodPressureDiastolic',
    source: 'clinical',
    name: 'Blood Pressure Cuff (Diastolic)',
    unit: 'mmHg',
    isActive: true,
    lastDataPointTimestamp: new Date(),
  },
];
// Removed unused variable: mockDataPoint

// Mock WebSocket connection
class MockWebSocket {
  // Use 'any' for the event type for simplicity in the mock
  onopen: ((event: any) => void) | null = null;
  onclose: ((event: any) => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  readyState: number = 0; // Start as CONNECTING

  constructor(public url: string) {
    // Simulate async connection opening
    this.readyState = 1; // OPEN
    queueMicrotask(() => {
      if (this.onopen) {
        this.onopen({ type: 'open' });
      }
    });
  }
  send = vi.fn();
  close = vi.fn(() => {
    this.readyState = 3; // CLOSED
    if (this.onclose) {
      this.onclose({ type: 'close', code: 1000, reason: 'Test closed' });
    }
  });
  // Helper methods for tests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public simulateMessage(data: any): void { // Added public keyword
    if (this.onmessage) {
      this.onmessage({ data: typeof data === 'string' ? data : JSON.stringify(data) });
    }
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public simulateError(errorData: any): void { // Added public keyword
    if (this.onerror) {
      this.onerror(errorData);
    }
  }
} // Closing brace for the class

// Removed unused variable: lastMockWebSocketInstance
global.WebSocket = vi.fn().mockImplementation((url: string) => {
  const instance = new MockWebSocket(url); // Removed assignment to unused lastMockWebSocketInstance
  // Removed assignment to non-existent variable: lastMockWebSocketInstance
  return instance;
}) as any;

describe('BiometricStreamController (Rebuilt)', () => {
  // Re-skip due to persistent timeout
  // Removed local vi.useRealTimers(); Global setup now manages timers.

  const mockedBiometricService = biometricService as Mocked<typeof biometricService>;

  beforeEach(() => {
    // Removed assignment to non-existent variable: lastMockWebSocketInstance
    vi.clearAllMocks();

    // Default dynamic mock for getStreamMetadata
    mockedBiometricService.getStreamMetadata.mockImplementation(
      async (
        _patientId: string,
        streamIds?: string[]
      ): Promise<Result<BiometricStream[], Error>> => {
        // Prefixed unused patientId, Added error type
        const streamsToReturn =
          streamIds && streamIds.length > 0
            ? mockStreamMetadata.filter((meta) => streamIds.includes(meta.id))
            : []; // Default to empty array if no IDs provided
        return success(streamsToReturn);
      }
    );
    // Default mock for correlations
    mockedBiometricService.calculateStreamCorrelations.mockResolvedValue(
      success(new Map<string, number>())
    );
  });

  it('initializes with default state', () => {
    const { result } = renderHook(
      () => useBiometricStreamController(mockPatientId) // Initialize without specific streamIds
    );

    expect(result.current.isConnected).toBe(false);
    expect(result.current.activeStreams.size).toBe(0);
    expect(result.current.latestAlerts).toEqual([]);
    // Check if getStreamData returns undefined for non-existent streams initially
    // Check if getStreamData returns an empty array for non-existent streams initially
    expect(result.current.getStreamData('stream-hr')).toEqual([]);
  });

  it('connects streams and updates state', async () => {
    // vi.useFakeTimers(); // Disable fake timers for this test
    const requestedStreamIds = ['stream-hr', 'stream-bp'];

    // Ensure the mock returns the correct structure expected by the hook
    const specificMetadata = mockStreamMetadata.filter((m) => requestedStreamIds.includes(m.id));
    mockedBiometricService.getStreamMetadata.mockResolvedValue(success(specificMetadata));

    const { result } = renderHook(() =>
      useBiometricStreamController(mockPatientId, { streamIds: requestedStreamIds })
    );

    // Initial state check
    expect(result.current.isConnected).toBe(false);
    expect(result.current.activeStreams.size).toBe(0);

    // Call connectStreams within act
    await act(async () => {
      await result.current.connectStreams();
    });

    // After connectStreams, state.isConnected should be true immediately
    expect(result.current.isConnected).toBe(true);

    // Assert activeStreams size after isConnected is confirmed
    expect(result.current.activeStreams.size).toBe(specificMetadata.length);

    // Final assertions
    expect(mockedBiometricService.getStreamMetadata).toHaveBeenCalledWith(
      mockPatientId,
      requestedStreamIds
    );
    expect(result.current.activeStreams.get('stream-hr')).toBeDefined();
    expect(result.current.activeStreams.get('stream-bp')).toBeDefined();

    // vi.useRealTimers(); // Not needed if fake timers aren't used in the test
  });

  // --- Add more focused tests below ---
});
