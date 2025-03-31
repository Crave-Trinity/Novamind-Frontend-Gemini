/**
 * NOVAMIND Neural Testing Framework
 * Quantum-precise test setup with clinical-grade reliability
 */

import '@testing-library/jest-dom';
import { afterEach, vi, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

// Extend vitest's expect with testing-library matchers for neural-precision assertions
expect.extend(matchers);

/**
 * Mock Module System
 * Implements mathematically precise mock functions with quantum reliability
 */
beforeAll(() => {
  // Mock essential React Router functions with type safety
  vi.mock('react-router-dom', () => ({
    BrowserRouter: vi.fn(({ children }) => children),
    Routes: vi.fn(({ children }) => children),
    Route: vi.fn(({ path, element }) => element),
    Link: vi.fn(({ to, children }) => children),
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: 'test-id' }),
    useLocation: () => ({ pathname: '/test-path' }),
  }));

  // Mock Three.js ecosystem for neural visualization testing
  vi.mock('@react-three/fiber', () => ({
    Canvas: vi.fn(({ children }) => children),
    useFrame: vi.fn(),
    useThree: () => ({
      camera: { 
        position: { set: vi.fn() }, 
        lookAt: vi.fn() 
      },
      gl: { domElement: document.createElement('div') },
      scene: { background: { set: vi.fn() } }
    }),
  }));

  // Mock Lucide icons for neural interface testing
  vi.mock('lucide-react', () => ({
    Brain: vi.fn(() => null),
    Activity: vi.fn(() => null),
    AlertCircle: vi.fn(() => null),
    Clock: vi.fn(() => null),
    ChevronDown: vi.fn(() => null),
    ChevronRight: vi.fn(() => null),
    Filter: vi.fn(() => null),
    Download: vi.fn(() => null),
    Zap: vi.fn(() => null),
    TrendingUp: vi.fn(() => null),
    TrendingDown: vi.fn(() => null),
    Pill: vi.fn(() => null),
    BarChart: vi.fn(() => null),
    Calendar: vi.fn(() => null),
  }));

  // Mock React Query for neural data flow testing
  vi.mock('@tanstack/react-query', () => ({
    QueryClient: vi.fn().mockImplementation(() => ({
      setDefaultOptions: vi.fn(),
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
      prefetchQuery: vi.fn().mockResolvedValue(undefined),
    })),
    QueryClientProvider: vi.fn(({ children }) => children),
    useQuery: vi.fn().mockReturnValue({
      data: { id: 'test-id', name: 'Test Data' },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    }),
    useMutation: vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
      isError: false,
      error: null,
    }),
  }));

  // Neural-safe mock for biometric data streams
  vi.mock('@application/controllers/BiometricStreamController', () => ({
    default: vi.fn().mockImplementation(() => ({
      activateStream: vi.fn(),
      deactivateStream: vi.fn(),
      getLatestReadings: vi.fn().mockReturnValue({
        heartRate: 72,
        respirationRate: 14,
        cortisol: 15.3,
        sleepQuality: 87
      })
    }))
  }));

  // Clinical precision mock for neural activity visualization
  vi.mock('@application/controllers/NeuralActivityController', () => ({
    default: vi.fn().mockImplementation(() => ({
      initialize: vi.fn().mockResolvedValue(true),
      registerRegionHandler: vi.fn(),
      getActiveRegions: vi.fn().mockReturnValue([
        { id: 'amygdala', activityLevel: 0.78, connections: 3 },
        { id: 'prefrontalCortex', activityLevel: 0.64, connections: 5 }
      ]),
      processNeuralData: vi.fn().mockResolvedValue({ success: true })
    }))
  }));

  // Mathematical mock for risk assessment calculations
  vi.mock('@domain/services/RiskAssessmentService', () => ({
    default: vi.fn().mockImplementation(() => ({
      calculateRisk: vi.fn().mockReturnValue({
        clinicalRiskScore: 0.35,
        confidenceInterval: [0.28, 0.42],
        riskFactors: ['sleepPattern', 'cortisol'],
        timeToEvent: { days: 14, confidence: 0.82 }
      }),
      getPredictiveFactors: vi.fn().mockReturnValue([
        { factor: 'sleepPattern', weight: 0.72 },
        { factor: 'socialIsolation', weight: 0.68 }
      ])
    }))
  }));
});

// Surgical DOM cleanup after each test for isolated testing precision
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

/**
 * Neural-Safe Browser Environment Simulation
 * Creates mathematical precise browser API simulations
 */

// Mock PointerEvent for neural interaction testing
class MockPointerEvent extends Event {
  button: number;
  ctrlKey: boolean;
  pointerType: string;
  clientX: number;
  clientY: number;

  constructor(type: string, props: any = {}) {
    super(type, props);
    this.button = props.button || 0;
    this.ctrlKey = props.ctrlKey || false;
    this.pointerType = props.pointerType || 'mouse';
    this.clientX = props.clientX || 0;
    this.clientY = props.clientY || 0;
  }
}

global.PointerEvent = MockPointerEvent as any;

// Clinical precision mock for ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.ResizeObserver = ResizeObserverMock as any;

// Suppress diagnostically irrelevant warnings in test environment
global.console = {
  ...console,
  warn: (...args: any[]) => {
    const suppressPatterns = [
      'Warning: ReactDOM.render is no longer supported',
      'Warning: useLayoutEffect does nothing on the server',
      '@react-three/fiber'
    ];
    const message = args.join(' ');
    if (!suppressPatterns.some(pattern => message.includes(pattern))) {
      console.warn(...args);
    }
  }
};

// Mock matchMedia for responsive visualization testing
global.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

// Neural-safe mock for URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');

// Clinical precision mock for IntersectionObserver
class IntersectionObserverMock {
  root = null;
  rootMargin = '';
  thresholds = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn();
}

global.IntersectionObserver = IntersectionObserverMock as any;
