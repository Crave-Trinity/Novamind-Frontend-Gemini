/**
 * NOVAMIND Neural Test Framework
 * Quantum-precise test utilities with clinical-grade reliability
 */

import React, { ReactElement, SetStateAction, Dispatch } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Create a fresh QueryClient for each test with optimal cache configuration
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
      refetchOnWindowFocus: false,
      staleTime: 0,
    },
  },
  logger: {
    log: console.log,
    warn: console.warn,
    error: () => {},
  }
});

type RenderMode = 'standard' | 'detailed' | 'connectivity';
type ThemeMode = 'light' | 'dark' | 'clinical';

interface AllProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient | undefined;
  themeMode?: ThemeMode | undefined;
  brainViewerMode?: RenderMode | undefined;
}

// Mock theme context for visualization testing with clinical precision
const ThemeContext = React.createContext<{ 
  theme: string; 
  setTheme: (theme: string) => void 
}>({ 
  theme: 'dark', 
  setTheme: () => {} 
});

// Mock brain visualization context for neural visualization testing
const BrainVisualizationContext = React.createContext<{
  renderMode: string;
  selectedRegions: string[];
  setRenderMode: (mode: string) => void;
  setSelectedRegions: (regions: string[]) => void;
  highlightRegion: (id: string) => void;
  connectivityThreshold: number;
}>({
  renderMode: 'standard',
  selectedRegions: [],
  setRenderMode: () => {},
  setSelectedRegions: () => {},
  highlightRegion: () => {},
  connectivityThreshold: 0.5
});

// Quantum wrapper for all providers needed in tests
const AllProviders = ({ 
  children, 
  queryClient = createTestQueryClient(),
  themeMode = 'dark',
  brainViewerMode = 'standard'
}: AllProvidersProps) => {
  const [theme, setTheme] = React.useState<ThemeMode>(themeMode);
  const [renderMode, setRenderMode] = React.useState<RenderMode>(brainViewerMode);
  const [selectedRegions, setSelectedRegions] = React.useState<string[]>([]);
  
  const highlightRegion = React.useCallback((id: string) => {
    setSelectedRegions(prev => [...prev, id]);
  }, []);
  
  const handleSetRenderMode = React.useCallback((mode: string) => {
    setRenderMode(mode as RenderMode);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={{ 
        theme, 
        setTheme: (t: string) => setTheme(t as ThemeMode)
      }}>
        <BrainVisualizationContext.Provider value={{
          renderMode,
          selectedRegions,
          setRenderMode: handleSetRenderMode,
          setSelectedRegions,
          highlightRegion,
          connectivityThreshold: 0.5
        }}>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </BrainVisualizationContext.Provider>
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
};

// Surgically enhanced render method with all providers
const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { 
    queryClient?: QueryClient | undefined,
    themeMode?: ThemeMode | undefined,
    brainViewerMode?: RenderMode | undefined
  },
) => {
  const { queryClient, themeMode, brainViewerMode, ...renderOptions } = options || {};
  return {
    ...render(ui, {
      wrapper: (props) => (
        <AllProviders 
          {...props} 
          queryClient={queryClient} 
          themeMode={themeMode}
          brainViewerMode={brainViewerMode}
        />
      ),
      ...renderOptions,
    }),
    user: userEvent.setup(),
  };
};

// Precision utility for delayed assertion
const waitForRender = (ms: number = 0) => new Promise(resolve => setTimeout(resolve, ms));

// Neural mapper for creating mock data with type safety
function createMockData<T>(template: T, overrides: Partial<T> = {}): T {
  return { ...template, ...overrides };
}

// Type-safe mock function creator with advanced tracing
function createTrackedMock<T extends (...args: any[]) => any>(
  implementation?: T
) {
  const defaultFn = () => undefined as any;
  return vi.fn(implementation || defaultFn);
}

// Enhanced error boundary for test isolation
class TestErrorBoundary extends React.Component<{
  children: React.ReactNode;
  fallback: React.ReactNode;
}> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Advanced mocking utilities
const mockConsoleError = () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  
  afterAll(() => {
    console.error = originalError;
  });
  
  return () => (console.error as any).mock.calls;
};

// Neural-safe brain region mock data generator
type BrainRegion = {
  id: string;
  name: string;
  activityLevel: number;
  connections: Array<{targetId: string, strength: number}>;
  coordinates: [number, number, number];
  volume: number;
  clinicalSignificance?: string | undefined;
};

const createMockBrainRegions = (count: number = 5): BrainRegion[] => {
  const regions: BrainRegion[] = [];
  const regionNames = ['amygdala', 'prefrontalCortex', 'hippocampus', 'basalGanglia', 'thalamus', 
                      'hypothalamus', 'cingulateGyrus', 'insula', 'occipitalLobe', 'parietalLobe'];
  
  for (let i = 0; i < Math.min(count, regionNames.length); i++) {
    const region: BrainRegion = {
      id: regionNames[i],
      name: regionNames[i].replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      activityLevel: Math.round((0.3 + Math.random() * 0.7) * 100) / 100,
      connections: [],
      coordinates: [
        Math.round((Math.random() * 2 - 1) * 100) / 100,
        Math.round((Math.random() * 2 - 1) * 100) / 100,
        Math.round((Math.random() * 2 - 1) * 100) / 100
      ],
      volume: Math.round(Math.random() * 100) / 10,
      clinicalSignificance: Math.random() > 0.5 ? 'Significant activity deviation detected' : undefined
    };
    regions.push(region);
  }
  
  // Add mathematical connections with clinical precision
  regions.forEach(region => {
    const connectionCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < connectionCount; i++) {
      const targetIndex = Math.floor(Math.random() * regions.length);
      if (regions[targetIndex].id !== region.id) {
        region.connections.push({
          targetId: regions[targetIndex].id,
          strength: Math.round(Math.random() * 100) / 100
        });
      }
    }
  });
  
  return regions;
};

// Neural-safe mock for biometric data
type BiometricReading = {
  timestamp: string;
  heartRate: number;
  respirationRate: number;
  cortisol: number;
  sleepQuality: number;
  socialActivity: number;
  digitalPhenotype: {
    screenTime: number;
    messageFrequency: number;
    typingSpeed: number;
    appUsagePatterns: {[key: string]: number}
  };
};

const createMockBiometricReadings = (days: number = 7): BiometricReading[] => {
  const readings: BiometricReading[] = [];
  const now = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const baselineHR = 65 + Math.random() * 15;
    const baselineRR = 14 + Math.random() * 4;
    
    // Create daily variations with mathematical precision
    for (let hour = 0; hour < 24; hour += 4) {
      const hourDate = new Date(date);
      hourDate.setHours(hour);
      
      // Circadian rhythm influences
      const circadianFactor = 
        hour < 6 ? 0.8 : // Sleep phase
        hour < 10 ? 1.1 : // Morning activation
        hour < 14 ? 1.0 : // Midday baseline
        hour < 18 ? 0.9 : // Afternoon dip
        hour < 22 ? 1.05 : // Evening activation
        0.85; // Night relaxation
      
      readings.push({
        timestamp: hourDate.toISOString(),
        heartRate: Math.round((baselineHR * circadianFactor + (Math.random() * 8 - 4)) * 10) / 10,
        respirationRate: Math.round((baselineRR * circadianFactor + (Math.random() * 2 - 1)) * 10) / 10,
        cortisol: Math.round((15 + Math.sin(hour / 24 * Math.PI * 2) * 8 + Math.random() * 4) * 10) / 10,
        sleepQuality: hour < 8 ? Math.round((70 + Math.random() * 30) * 10) / 10 : 0,
        socialActivity: hour > 8 && hour < 22 ? Math.round(Math.random() * 100) / 10 : 0,
        digitalPhenotype: {
          screenTime: hour > 8 && hour < 22 ? Math.round(Math.random() * 60) : 0,
          messageFrequency: hour > 8 && hour < 22 ? Math.round(Math.random() * 30) : 0,
          typingSpeed: Math.round((60 + Math.random() * 40) * 10) / 10,
          appUsagePatterns: {
            social: Math.round(Math.random() * 100),
            productivity: Math.round(Math.random() * 100),
            entertainment: Math.round(Math.random() * 100),
            health: Math.round(Math.random() * 100)
          }
        }
      });
    }
  }
  
  return readings;
};

// Clinical risk assessment mock data
type RiskAssessment = {
  timestamp: string;
  clinicalRiskScore: number;
  confidenceInterval: [number, number];
  riskFactors: string[];
  timeToEvent: { days: number; confidence: number };
  recommendedInterventions: string[];
  contributingFactors: Array<{ factor: string; weight: number }>;
};

const createMockRiskAssessment = (): RiskAssessment => {
  const riskScore = Math.round(Math.random() * 100) / 100;
  const confidenceMargin = Math.round(Math.random() * 20) / 100;
  
  const possibleFactors = [
    'sleepDisturbance', 'socialIsolation', 'activityReduction',
    'cortisolElevation', 'inflammatoryMarkers', 'heartRateVariability',
    'digitalEngagement', 'linguisticMarkers', 'sleepDuration'
  ];
  
  // Select 2-5 contributing factors with mathematical weights
  const factorCount = Math.floor(Math.random() * 3) + 2;
  const selectedFactors = new Set<string>();
  while (selectedFactors.size < factorCount) {
    selectedFactors.add(possibleFactors[Math.floor(Math.random() * possibleFactors.length)]);
  }
  
  const contributingFactors = Array.from(selectedFactors).map(factor => ({
    factor,
    weight: Math.round(Math.random() * 100) / 100
  }));
  
  // Sort by weight descending for clinical precision
  contributingFactors.sort((a, b) => b.weight - a.weight);
  
  // Calculate timeToEvent with mathematical precision
  const timeToEvent = Math.floor(Math.random() * 28) + 3; // 3-30 days
  const eventConfidence = Math.round((0.5 + Math.random() * 0.5) * 100) / 100;
  
  // Generate evidence-based interventions
  const possibleInterventions = [
    'Increase structured social interactions',
    'Normalize sleep schedule',
    'CBT for anxiety management',
    'Increase physical activity',
    'Mindfulness practice',
    'Nutritional optimization',
    'Light therapy',
    'Digital consumption reduction',
    'Medication adjustment (clinical evaluation required)'
  ];
  
  const interventionCount = Math.min(3, Math.floor(Math.random() * 4) + 1);
  const selectedInterventions = new Set<string>();
  while (selectedInterventions.size < interventionCount) {
    selectedInterventions.add(possibleInterventions[Math.floor(Math.random() * possibleInterventions.length)]);
  }
  
  return {
    timestamp: new Date().toISOString(),
    clinicalRiskScore: riskScore,
    confidenceInterval: [
      Math.max(0, Math.round((riskScore - confidenceMargin) * 100) / 100),
      Math.min(1, Math.round((riskScore + confidenceMargin) * 100) / 100)
    ],
    riskFactors: Array.from(selectedFactors),
    timeToEvent: {
      days: timeToEvent,
      confidence: eventConfidence
    },
    recommendedInterventions: Array.from(selectedInterventions),
    contributingFactors
  };
};

export {
  renderWithProviders,
  waitForRender,
  createMockData,
  createTrackedMock,
  TestErrorBoundary,
  mockConsoleError,
  AllProviders,
  ThemeContext,
  BrainVisualizationContext,
  createMockBrainRegions,
  createMockBiometricReadings,
  createMockRiskAssessment,
  // Types for neural-safe type checking
  type BrainRegion,
  type BiometricReading,
  type RiskAssessment,
  type ThemeMode,
  type RenderMode
};
