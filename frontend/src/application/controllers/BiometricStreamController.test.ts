/**
 * NOVAMIND Neural Test Suite
 * BiometricStreamController testing with quantum precision
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react-hooks";
import { useBiometricStreamController } from "@application/controllers/BiometricStreamController";

// Mock the domain types to prevent import errors
vi.mock("@domain/types/biometric/streams", () => ({
  BiometricStreamType: {
    HEART_RATE: "heart_rate",
    BLOOD_PRESSURE: "blood_pressure",
    RESPIRATORY_RATE: "respiratory_rate",
    SLEEP: "sleep",
    ACTIVITY: "activity",
    GALVANIC_SKIN_RESPONSE: "gsr",
    CORTISOL: "cortisol",
    HRV: "hrv",
  },
  AlertPriority: {
    URGENT: "urgent",
    WARNING: "warning",
    INFORMATION: "information",
  },
  StreamStatus: {
    ACTIVE: "active",
    PAUSED: "paused",
    OFFLINE: "offline",
    ERROR: "error",
  },
}));

vi.mock("@domain/types/common/result", () => ({
  createSuccess: (value: any) => ({ success: true, value }),
  createError: (error: any) => ({ success: false, error }),
}));

// Mock the service used by the controller
vi.mock("@application/services/biometricService", () => ({
  useBiometricService: () => ({
    fetchPatientStreams: vi.fn(() =>
      Promise.resolve({
        success: true,
        value: mockStreamConfigurations,
      }),
    ),
    getStreamStatus: vi.fn(() =>
      Promise.resolve({
        success: true,
        value: mockStreamStatus,
      }),
    ),
    activateStream: vi.fn(() =>
      Promise.resolve({
        success: true,
        value: { status: "active", message: "Stream activated successfully" },
      }),
    ),
    deactivateStream: vi.fn(() =>
      Promise.resolve({
        success: true,
        value: { status: "paused", message: "Stream paused successfully" },
      }),
    ),
    getLatestReadings: vi.fn(() =>
      Promise.resolve({
        success: true,
        value: mockLatestReadings,
      }),
    ),
    subscribeToAlerts: vi.fn(() =>
      Promise.resolve({
        success: true,
        value: { subscriptionId: "sub-123" },
      }),
    ),
    getStreamHistory: vi.fn(() =>
      Promise.resolve({
        success: true,
        value: mockStreamHistory,
      }),
    ),
    processRealtimeData: vi.fn(() =>
      Promise.resolve({
        success: true,
        value: mockProcessedData,
      }),
    ),
  }),
}));

// Mock data with clinical precision
const mockPatientId = "patient-123";

const mockStreamConfigurations = [
  {
    id: "stream-hr",
    type: "heart_rate",
    description: "Continuous heart rate monitoring",
    device: "CardioSense X7",
    frequency: "continuous",
    thresholds: {
      min: 50,
      max: 100,
      criticalLow: 40,
      criticalHigh: 120,
    },
    status: "active",
  },
  {
    id: "stream-bp",
    type: "blood_pressure",
    description: "Intermittent blood pressure readings",
    device: "BP Monitor Pro",
    frequency: "every 2 hours",
    thresholds: {
      systolicMin: 90,
      systolicMax: 140,
      diastolicMin: 60,
      diastolicMax: 90,
      criticalSystolicLow: 80,
      criticalSystolicHigh: 180,
      criticalDiastolicLow: 50,
      criticalDiastolicHigh: 110,
    },
    status: "active",
  },
  {
    id: "stream-gsr",
    type: "gsr",
    description: "Galvanic skin response for stress monitoring",
    device: "StressWatch 3.0",
    frequency: "continuous",
    thresholds: {
      stressThreshold: 0.7,
    },
    status: "paused",
  },
];

const mockStreamStatus = {
  id: "stream-hr",
  status: "active",
  lastUpdate: "2025-03-30T14:30:00Z",
  batteryLevel: 0.85,
  signalStrength: 0.92,
  nextScheduledReading: null,
  errors: [],
};

const mockLatestReadings = {
  heart_rate: {
    value: 72,
    timestamp: "2025-03-30T15:05:00Z",
    trend: "stable",
    status: "normal",
  },
  blood_pressure: {
    systolic: 128,
    diastolic: 82,
    timestamp: "2025-03-30T14:00:00Z",
    trend: "elevated",
    status: "warning",
  },
  gsr: {
    value: 0.45,
    timestamp: "2025-03-30T15:05:00Z",
    trend: "increasing",
    status: "normal",
  },
};

const mockAlerts = [
  {
    id: "alert-1",
    streamId: "stream-bp",
    type: "blood_pressure",
    priority: "warning",
    message: "Blood pressure elevated above normal range",
    threshold: { systolicMax: 140 },
    value: { systolic: 148, diastolic: 88 },
    timestamp: "2025-03-30T14:00:00Z",
    acknowledged: false,
  },
  {
    id: "alert-2",
    streamId: "stream-hr",
    type: "heart_rate",
    priority: "information",
    message: "Heart rate increasing during activity period",
    threshold: { trending: "increasing" },
    value: { value: 95, trend: "increasing" },
    timestamp: "2025-03-30T13:45:00Z",
    acknowledged: true,
  },
];

const mockStreamHistory = {
  data: [
    { timestamp: "2025-03-30T10:00:00Z", value: 68 },
    { timestamp: "2025-03-30T11:00:00Z", value: 72 },
    { timestamp: "2025-03-30T12:00:00Z", value: 75 },
    { timestamp: "2025-03-30T13:00:00Z", value: 71 },
    { timestamp: "2025-03-30T14:00:00Z", value: 69 },
    { timestamp: "2025-03-30T15:00:00Z", value: 72 },
  ],
  statistics: {
    mean: 71.17,
    median: 71.5,
    min: 68,
    max: 75,
    stdDev: 2.32,
  },
  patterns: [
    {
      type: "diurnal",
      description: "Typical daytime increase observed",
      confidence: 0.85,
    },
  ],
  annotations: [
    {
      timestamp: "2025-03-30T12:00:00Z",
      note: "After medication administration",
      author: "System",
    },
  ],
};

const mockProcessedData = {
  heart_rate: {
    variability: 12.5,
    rhythmAnalysis: "normal sinus rhythm",
    stressIndicator: 0.35,
  },
  blood_pressure: {
    meanArterialPressure: 97.3,
    pulseWaveVelocity: 8.2,
    cardiovascularLoad: "moderate",
  },
  sleep: {
    cycles: [
      { stage: "rem", duration: 90, quality: 0.8 },
      { stage: "deep", duration: 120, quality: 0.9 },
      { stage: "light", duration: 180, quality: 0.7 },
    ],
    totalDuration: 390,
    overallQuality: 0.8,
    disruptions: 2,
  },
};

// Mock WebSocket connection
class MockWebSocket {
  onopen: ((event: any) => void) | null = null;
  onclose: ((event: any) => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  readyState: number = 0; // CONNECTING

  constructor(public url: string) {
    // Simulate connection establishment
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) {
        this.onopen({ type: "open" });
      }
    }, 10);
  }

  send(data: string): void {
    // Process message and simulate response
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({
          data: JSON.stringify({
            type: "reading",
            streamId: "stream-hr",
            value: 75,
            timestamp: new Date().toISOString(),
          }),
        });
      }
    }, 10);
  }

  close(): void {
    this.readyState = 3; // CLOSED
    if (this.onclose) {
      this.onclose({ type: "close", code: 1000, reason: "Test closed" });
    }
  }

  // Helper to simulate incoming messages
  simulateMessage(data: any): void {
    if (this.onmessage) {
      this.onmessage({
        data: typeof data === "string" ? data : JSON.stringify(data),
      });
    }
  }

  // Helper to simulate errors
  simulateError(errorData: any): void {
    if (this.onerror) {
      this.onerror(errorData);
    }
  }
}

// Replace global WebSocket with mock implementation
global.WebSocket = MockWebSocket as any;

describe("BiometricStreamController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with correct default state and fetches stream configurations", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useBiometricStreamController(mockPatientId),
    );

    // Initial state check
    expect(result.current.isInitialized).toBe(false);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();

    // Wait for initialization to complete
    await waitForNextUpdate();

    // Post-initialization state
    expect(result.current.isInitialized).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.streamConfigurations).toEqual(
      mockStreamConfigurations,
    );
    expect(result.current.activeStreams.length).toBeGreaterThan(0);
  });

  it("activates biometric stream with quantum precision", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useBiometricStreamController(mockPatientId),
    );

    // Wait for initialization
    await waitForNextUpdate();

    // Attempt to activate the GSR stream which is initially paused
    act(() => {
      result.current.activateStream("stream-gsr");
    });

    // Wait for the operation to complete
    await waitForNextUpdate();

    // Verify the stream was activated
    expect(result.current.streamStatuses["stream-gsr"]).toBeDefined();
    expect(result.current.error).toBeNull();
  });

  it("fetches and processes latest biometric readings with clinical precision", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useBiometricStreamController(mockPatientId),
    );

    // Wait for initialization
    await waitForNextUpdate();

    // Fetch latest readings
    act(() => {
      result.current.fetchLatestReadings();
    });

    // Wait for the operation to complete
    await waitForNextUpdate();

    // Verify the readings were fetched and processed
    expect(result.current.latestReadings).toEqual(mockLatestReadings);
    expect(result.current.error).toBeNull();

    // Processed data should be available
    expect(result.current.processedData).toBeTruthy();
  });

  it("subscribes to and processes biometric alerts with HIPAA-compliant precision", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useBiometricStreamController(mockPatientId),
    );

    // Wait for initialization
    await waitForNextUpdate();

    // Subscribe to alerts
    act(() => {
      result.current.subscribeToAlerts(["warning", "urgent"]);
    });

    // Wait for the subscription to complete
    await waitForNextUpdate();

    // Simulate receiving an alert
    act(() => {
      const mockWs = result.current.alertSubscription as any;
      if (mockWs) {
        mockWs.simulateMessage({
          type: "alert",
          alert: mockAlerts[0],
        });
      }
    });

    // Verify alert was received and processed
    expect(result.current.alerts.length).toBeGreaterThan(0);
    expect(result.current.alerts[0].id).toBe("alert-1");
    expect(result.current.error).toBeNull();
  });

  it("retrieves stream history with temporal precision", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useBiometricStreamController(mockPatientId),
    );

    // Wait for initialization
    await waitForNextUpdate();

    // Request stream history
    act(() => {
      result.current.getStreamHistory("stream-hr", { hours: 6 });
    });

    // Wait for the operation to complete
    await waitForNextUpdate();

    // Verify history was retrieved
    expect(result.current.streamHistory).toEqual(mockStreamHistory);
    expect(result.current.error).toBeNull();
  });

  it("handles error states with neural precision", async () => {
    // Mock the biometric service to return an error
    vi.mock("@application/services/biometricService", () => ({
      useBiometricService: () => ({
        fetchPatientStreams: vi.fn(() =>
          Promise.resolve({
            success: false,
            error: "Failed to retrieve biometric stream configurations",
          }),
        ),
        getStreamStatus: vi.fn(),
        activateStream: vi.fn(),
        deactivateStream: vi.fn(),
        getLatestReadings: vi.fn(),
        subscribeToAlerts: vi.fn(),
        getStreamHistory: vi.fn(),
        processRealtimeData: vi.fn(),
      }),
    }));

    const { result, waitForNextUpdate } = renderHook(() =>
      useBiometricStreamController(mockPatientId),
    );

    // Wait for initialization attempt to complete
    await waitForNextUpdate();

    // Verify error state
    expect(result.current.isInitialized).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(
      "Failed to retrieve biometric stream configurations",
    );
    expect(result.current.streamConfigurations).toEqual([]);
  });

  it("processes real-time biometric data with mathematical precision", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useBiometricStreamController(mockPatientId),
    );

    // Wait for initialization
    await waitForNextUpdate();

    // Request data processing
    act(() => {
      result.current.processStreamData({
        heart_rate: mockLatestReadings.heart_rate,
        blood_pressure: mockLatestReadings.blood_pressure,
      });
    });

    // Wait for the operation to complete
    await waitForNextUpdate();

    // Verify processed data
    expect(result.current.processedData).toEqual(mockProcessedData);
    expect(result.current.error).toBeNull();
  });
});
