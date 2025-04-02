/**
 * NOVAMIND Neural Test Suite - Rebuilt
 * BiometricStreamController testing with focused, incremental tests.
 */

import { describe, it, expect, vi, beforeEach, Mocked } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { biometricService } from "@application/services/biometricService";
import { useBiometricStreamController } from "@application/controllers/BiometricStreamController";
import {
  BiometricDataPoint,
  BiometricAlert,
  BiometricStream,
  // BiometricType, // Assuming type strings are used internally if not directly imported
  // AlertPriority, // Assuming type strings are used internally if not directly imported
} from "../../domain/types/biometric/streams"; // Adjusted path
import { Result, success, failure } from "../../domain/types/shared/common"; // Adjusted path

// Mock the biometricService
vi.mock("@application/services/biometricService", () => ({
  biometricService: {
    getStreamMetadata: vi.fn(),
    calculateStreamCorrelations: vi.fn(),
    // Add other methods if the hook uses them
  },
}));

// Mock data
const mockPatientId = "patient-123";
const mockStreamMetadata: BiometricStream[] = [
  { id: "stream-hr", patientId: mockPatientId, type: "heartRate", source: "wearable", name: "Heart Rate Monitor", unit: "bpm", isActive: true, lastDataPointTimestamp: new Date() },
  { id: "stream-bp", patientId: mockPatientId, type: "bloodPressureSystolic", source: "clinical", name: "Blood Pressure Cuff (Systolic)", unit: "mmHg", isActive: true, lastDataPointTimestamp: new Date() },
  { id: "stream-bp-dia", patientId: mockPatientId, type: "bloodPressureDiastolic", source: "clinical", name: "Blood Pressure Cuff (Diastolic)", unit: "mmHg", isActive: true, lastDataPointTimestamp: new Date() },
];
const mockDataPoint: BiometricDataPoint = { id: "dp-hr-1", streamId: "stream-hr", timestamp: new Date(), value: 75, type: "heartRate", source: "wearable", quality: "high" };

// Mock WebSocket connection
class MockWebSocket {
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
        this.onopen({ type: "open" });
      }
    });
  }
  send = vi.fn();
  close = vi.fn(() => {
    this.readyState = 3; // CLOSED
    if (this.onclose) {
      this.onclose({ type: "close", code: 1000, reason: "Test closed" });
    }
  });
  // Helper methods for tests
  simulateMessage(data: any) { if (this.onmessage) { this.onmessage({ data: typeof data === "string" ? data : JSON.stringify(data) }); } }
  simulateError(errorData: any) { if (this.onerror) { this.onerror(errorData); } }
}

let lastMockWebSocketInstance: MockWebSocket | null = null;
global.WebSocket = vi.fn().mockImplementation((url: string) => {
  const instance = new MockWebSocket(url);
  lastMockWebSocketInstance = instance;
  return instance;
}) as any;


describe("BiometricStreamController (Rebuilt)", () => {
  // Use real timers to avoid conflicts with WebSocket mock's async events
  vi.useRealTimers();

  const mockedBiometricService = biometricService as Mocked<typeof biometricService>;

  beforeEach(() => {
    lastMockWebSocketInstance = null;
    vi.clearAllMocks();

    // Default dynamic mock for getStreamMetadata
    mockedBiometricService.getStreamMetadata.mockImplementation(
      async (patientId: string, streamIds?: string[]): Promise<Result<BiometricStream[]>> => {
        const streamsToReturn = streamIds && streamIds.length > 0
          ? mockStreamMetadata.filter(meta => streamIds.includes(meta.id))
          : []; // Default to empty array if no IDs provided
        return success(streamsToReturn);
      }
    );
    // Default mock for correlations
    mockedBiometricService.calculateStreamCorrelations.mockResolvedValue(
      success(new Map<string, number>())
    );
  });

  it("initializes with default state", () => {
    const { result } = renderHook(() =>
      useBiometricStreamController(mockPatientId) // Initialize without specific streamIds
    );

    expect(result.current.isConnected).toBe(false);
    expect(result.current.activeStreams.size).toBe(0);
    expect(result.current.latestAlerts).toEqual([]);
    // Check if getStreamData returns undefined for non-existent streams initially
    // Check if getStreamData returns an empty array for non-existent streams initially
    expect(result.current.getStreamData('stream-hr')).toEqual([]);
  });

  it("connects streams and updates state", async () => {
    const requestedStreamIds = ["stream-hr", "stream-bp"];
    const { result } = renderHook(() =>
      useBiometricStreamController(mockPatientId, { streamIds: requestedStreamIds })
    );

    // Initial state check
    expect(result.current.isConnected).toBe(false);
    expect(result.current.activeStreams.size).toBe(0);

    // Re-introduce act wrapper around the async action initiation
    await act(async () => {
      await result.current.connectStreams();
    });

    // State should be updated synchronously after connectStreams resolves (metadata fetch)
    // The hook's internal simulation doesn't rely on the mocked WebSocket's onopen
    expect(result.current.isConnected).toBe(true);
    // Verify final state and mock calls
    // Verify mock calls and final state
    expect(mockedBiometricService.getStreamMetadata).toHaveBeenCalledWith(mockPatientId, requestedStreamIds);
    // expect(lastMockWebSocketInstance).not.toBeNull(); // This is invalid as the hook uses internal simulation, not the global mock
    expect(result.current.activeStreams.size).toBe(2); // Based on dynamic mock response for metadata
    expect(result.current.activeStreams.get("stream-hr")).toBeDefined();
    expect(result.current.activeStreams.get("stream-bp")).toBeDefined();
    // isConnected was already asserted above
  });

  // --- Add more focused tests below ---

});
