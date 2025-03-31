# Novamind Digital Twin: XGBoost Frontend Integration


## Overview

This document details how the frontend interfaces with the XGBoost machine learning service to power our predictive psychiatry features in the Novamind Digital Twin platform. The integration enables real-time risk assessment, treatment response prediction, and neural visualization of ML insights.


## Integration Architecture


### Data Flow Overview

```typescript
// Data flow overview
```

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  TypeScript     │────►│  XGBoostService │────►│  FastAPI        │
│  Frontend       │     │  API Client     │     │  Backend        │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Visualization  │◄────┤  Feature        │◄────┤  XGBoost        │
│  Components     │     │  Importance     │     │  Models         │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘


## API Client Integration


### XGBoostService Client

The frontend uses a strongly-typed XGBoostService client to communicate with the backend:

```typescript
// In infrastructure/api/XGBoostService.ts

class XGBoostService {
  /**
   * Predict psychiatric risk
   */
  async predictRisk(request: RiskPredictionRequest): Promise<RiskPredictionResponse> {
    return apiClient.post<RiskPredictionResponse>('/xgboost/predict-risk', request);
  }

  /**
   * Predict treatment response
   */
  async predictTreatmentResponse(request: TreatmentResponseRequest): Promise<TreatmentResponseResponse> {
    return apiClient.post<TreatmentResponseResponse>('/xgboost/predict-treatment-response', request);
  }

  /**
   * Get feature importance for a prediction
   */
  async getFeatureImportance(request: FeatureImportanceRequest): Promise<FeatureImportanceResponse> {
    return apiClient.post<FeatureImportanceResponse>('/xgboost/feature-importance', request);
  }

  // Additional methods...
}

// Create and export instance
const xgboostService = new XGBoostService();
export { xgboostService };
```

### Request/Response Types

Strong type definitions ensure data integrity across the stack:

```typescript
// Example risk prediction request
export interface RiskPredictionRequest {
  patient_id: string;
  risk_type: 'relapse' | 'suicide';
  clinical_data: {
    assessment_scores: Record<string, number>;
    severity: string;
    diagnosis: string;
    [key: string]: any;
  };
  demographic_data?: Record<string, any>;
  temporal_data?: Record<string, any>;
  confidence_threshold?: number;
}

// Example risk prediction response
export interface RiskPredictionResponse {
  prediction_id: string;
  patient_id: string;
  risk_type: string;
  risk_level: 'low' | 'moderate' | 'high' | 'severe';
  risk_score: number;
  confidence: number;
  meets_threshold: boolean;
  factors: Array<{
    name: string;
    contribution: number;
    direction: 'positive' | 'negative';
  }>;
  timestamp: string;
  recommendations: string[];
}
```

## Custom Hooks for XGBoost Integration


### useTreatmentPrediction Hook

The frontend uses custom hooks to simplify XGBoost service consumption:

```typescript
// In application/hooks/useTreatmentPrediction.ts

export function useTreatmentPrediction({
  patientId,
  treatments,
  clinicalData
}: TreatmentPredictionParams) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [predictions, setPredictions] = useState<TreatmentResponseResponse[]>([]);

  useEffect(() => {
    async function fetchPredictions() {
      setIsLoading(true);
      try {
        const treatmentPredictions = await Promise.all(
          treatments.map(treatment => 
            xgboostService.predictTreatmentResponse({
              patient_id: patientId,
              treatment_type: treatment.type,
              treatment_details: treatment.details,
              clinical_data: clinicalData
            })
          )
        );
        setPredictions(treatmentPredictions);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    }

    if (patientId && treatments.length > 0) {
      fetchPredictions();
    }
  }, [patientId, treatments, clinicalData]);

  return { isLoading, error, predictions };
}
```

### useRiskAssessment Hook

For risk predictions with optimistic UI updates:

```typescript
// In application/hooks/useRiskAssessment.ts

export function useRiskAssessment(patientId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (assessmentData: AssessmentData) => {
      const request: RiskPredictionRequest = {
        patient_id: patientId,
        risk_type: 'relapse',
        clinical_data: {
          assessment_scores: assessmentData.scores,
          severity: assessmentData.severity,
          diagnosis: assessmentData.diagnosis
        }
      };
      
      return xgboostService.predictRisk(request);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ['riskAssessment', patientId], 
        data
      );
      
      // Also fetch feature importance for visualization
      xgboostService.getFeatureImportance({
        patient_id: patientId,
        model_type: 'risk',
        prediction_id: data.prediction_id
      }).then(featureData => {
        queryClient.setQueryData(
          ['featureImportance', data.prediction_id],
          featureData
        );
      });
    }
  });
}
```

## Connecting ML Insights to Visualization


### Feature Importance Mapping

Brain regions are highlighted based on ML feature importance:

```typescript
// In presentation/organisms/BrainVisualization.tsx

function mapFeatureImportanceToRegions(
  featureImportance: FeatureImportanceResponse,
  brainRegions: BrainRegion[]
): HighlightedRegion[] {
  // Map between feature names and brain regions
  const featureToRegionMap: Record<string, string> = {
    'prefrontal_activity': 'prefrontal_cortex',
    'amygdala_reactivity': 'amygdala',
    'hippocampus_volume': 'hippocampus',
    // Additional mappings...
  };
  
  return featureImportance.features
    .filter(feature => featureToRegionMap[feature.name])
    .map(feature => {
      const regionName = featureToRegionMap[feature.name];
      const region = brainRegions.find(r => r.id === regionName);
      
      if (!region) return null;
      
      return {
        ...region,
        importance: feature.importance,
        direction: feature.direction,
        category: feature.category
      };
    })
    .filter(Boolean) as HighlightedRegion[];
}
```

### Risk Visualization Component

UI component that displays risk assessment with brain model:

```tsx
// In presentation/organisms/RiskAssessmentPanel.tsx

export const RiskAssessmentPanel: React.FC<RiskAssessmentPanelProps> = ({
  patientId,
  assessmentData
}) => {
  const { mutate, isLoading, data: riskData } = useRiskAssessment(patientId);
  const { data: featureImportance } = useQuery({
    queryKey: ['featureImportance', riskData?.prediction_id],
    enabled: !!riskData?.prediction_id
  });
  
  const handleAssessmentSubmit = useCallback(() => {
    mutate(assessmentData);
  }, [mutate, assessmentData]);
  
  // Transform data for visualization
  const highlightedRegions = useMemo(() => {
    if (!featureImportance || !brainModel) return [];
    return mapFeatureImportanceToRegions(featureImportance, brainModel.regions);
  }, [featureImportance, brainModel]);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Risk Assessment</h2>
        
        {/* Assessment form and controls */}
        <AssessmentForm onSubmit={handleAssessmentSubmit} />
        
        {/* Risk visualization */}
        {riskData && (
          <RiskMetricsCard 
            riskLevel={riskData.risk_level}
            riskScore={riskData.risk_score}
            confidence={riskData.confidence}
            factors={riskData.factors}
          />
        )}
      </div>
      
      <div>
        {/* Brain visualization with highlighted regions */}
        <BrainVisualization 
          highlightedRegions={highlightedRegions}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
```

## Treatment Response Visualization


### Comparative Treatment Visualization

Visualizing multiple treatment options with ML predictions:

```tsx
// In presentation/organisms/TreatmentResponsePredictor.tsx

export const TreatmentResponsePredictor: React.FC<TreatmentPredictorProps> = ({
  patientId,
  clinicalData
}) => {
  const [selectedTreatments, setSelectedTreatments] = useState<Treatment[]>([]);
  
  const { isLoading, predictions } = useTreatmentPrediction({
    patientId,
    treatments: selectedTreatments,
    clinicalData
  });
  
  // Treatment selection handler
  const handleTreatmentSelect = useCallback((treatment: Treatment) => {
    setSelectedTreatments(prev => [...prev, treatment]);
  }, []);
  
  // Filter to top 3 treatments by response probability
  const topTreatments = useMemo(() => {
    if (!predictions.length) return [];
    
    return [...predictions]
      .sort((a, b) => b.response_probability - a.response_probability)
      .slice(0, 3);
  }, [predictions]);
  
  return (
    <div className="space-y-8">
      <TreatmentSelector onSelect={handleTreatmentSelect} />
      
      {isLoading ? (
        <LoadingSpinner text="Calculating treatment responses..." />
      ) : predictions.length > 0 ? (
        <>
          <TreatmentComparisonChart treatments={predictions} />
          
          <ResponsiveTimeline 
            treatments={topTreatments}
            timeRange={12} // weeks
          />
          
          <BrainResponseVisualization 
            treatments={topTreatments}
            selectedIndex={selectedTreatmentIndex}
            onSelectTreatment={setSelectedTreatmentIndex}
          />
        </>
      ) : null}
    </div>
  );
};
```

### Digital Twin Integration

Connecting treatment predictions to brain visualization:

```tsx
// In presentation/organisms/DigitalTwinDashboard.tsx

export const DigitalTwinDashboard: React.FC<DigitalTwinDashboardProps> = ({
  patientId,
  predictionId
}) => {
  // Fetch digital twin integration data
  const { data: integrationData } = useQuery({
    queryKey: ['digitalTwin', patientId, predictionId],
    queryFn: () => xgboostService.integrateWithDigitalTwin({
      patient_id: patientId,
      profile_id: patientId, // In our system, profile_id is the same as patient_id
      prediction_id: predictionId
    })
  });
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <BrainVisualization 
            patientId={patientId}
            integrationId={integrationData?.integration_id}
            showControls
          />
        </div>
        
        <div>
          <ClinicalMetricsPanel
            metrics={integrationData?.updated_metrics || []}
            impactAssessment={integrationData?.impact_assessment}
          />
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
        <h3 className="text-xl font-semibold mb-4">Neural Pathway Analysis</h3>
        <NeuralPathwayVisualizer 
          patientId={patientId}
          integrationId={integrationData?.integration_id}
        />
      </div>
    </div>
  );
};
```

## HIPAA-Compliant Error Handling


### Secure Error Boundaries

Error boundaries prevent PHI exposure:

```tsx
// In presentation/templates/ErrorBoundary.tsx

export class XGBoostErrorBoundary extends React.Component<Props, State> {
  // State and lifecycle methods...
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log sanitized error (no PHI)
    const sanitizedError = {
      message: error.message,
      stack: this.sanitizeStackTrace(error.stack),
      componentStack: this.sanitizeStackTrace(errorInfo.componentStack)
    };
    
    logSanitizedError('XGBoost visualization error', sanitizedError);
  }
  
  // Sanitize any potential PHI from stack traces
  private sanitizeStackTrace(stack: string | undefined): string {
    if (!stack) return '';
    
    // Remove any potential patient identifiers or PHI from stack
    return stack.replace(/patientId[=:]\s*['"]([^'"]+)['"]/gi, 'patientId: [REDACTED]');
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200">
          <h3 className="text-lg font-semibold mb-2">Visualization Error</h3>
          <p>We encountered an issue displaying the prediction visualization.</p>
          <button
            className="mt-3 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
            onClick={this.handleReset}
          >
            Try Again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### API Error Handling

Graceful error handling for API failures:

```typescript
// In infrastructure/api/ApiClient.ts

export class ApiClient {
  // Other methods...
  
  async post<T>(url: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        // Handle different error types
        if (response.status === 401) {
          this.handleAuthError();
          throw new AuthError('Authentication failed');
        }
        
        if (response.status === 422) {
          const errorData = await response.json();
          throw new ValidationError('Validation failed', errorData.detail);
        }
        
        throw new ApiError(
          `API error: ${response.statusText}`,
          response.status
        );
      }
      
      return response.json();
    } catch (error) {
      // Ensure no PHI is included in error logs
      this.logSanitizedError(url, error);
      throw error;
    }
  }
  
  private logSanitizedError(url: string, error: any) {
    // Sanitize URL and error of any PHI before logging
    const sanitizedUrl = url.replace(/\/(patients|users)\/[^\/]+/, '/$1/[REDACTED]');
    
    // Log sanitized error details
    logger.error({
      message: 'API request failed',
      endpoint: sanitizedUrl,
      errorType: error.constructor.name,
      errorMessage: error.message,
      // No request/response bodies or headers logged as they may contain PHI
    });
  }
}
```

## Performance Optimizations


### Data Caching

React Query is used to efficiently cache XGBoost predictions:

```typescript
// In application/providers/QueryProvider.tsx

export const QueryProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
```

### Progressive Loading

Optimized loading for visualization components:

```tsx
// In presentation/pages/BrainModelViewer.tsx

const BrainModelViewer = () => {
  const { patientId } = useParams<{ patientId: string }>();
  
  // Lazy-loaded components
  const BrainVisualization = React.lazy(() => 
    import('../organisms/BrainVisualization')
  );
  
  const ControlPanel = React.lazy(() => 
    import('../molecules/ControlPanel')
  );
  
  return (
    <MainLayout>
      <DocumentTitle title="Brain Model | Novamind" />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Neural Digital Twin
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Suspense fallback={<LoadingVisualizer />}>
              <BrainVisualization
                patientId={patientId}
                progressive={true}
              />
            </Suspense>
          </div>
          
          <div>
            <Suspense fallback={<LoadingControls />}>
              <ControlPanel patientId={patientId} />
            </Suspense>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
```

## Integration Testing


### Mock Service for Testing

Mock XGBoost service for component testing:

```typescript
// In infrastructure/api/mockApi.ts

export const mockXGBoostService = {
  predictRisk: jest.fn().mockResolvedValue({
    prediction_id: 'mock-prediction-id',
    patient_id: 'mock-patient-id',
    risk_type: 'relapse',
    risk_level: 'moderate',
    risk_score: 0.65,
    confidence: 0.82,
    factors: [
      { name: 'prefrontal_activity', contribution: 0.35, direction: 'negative' },
      { name: 'amygdala_reactivity', contribution: 0.25, direction: 'positive' }
    ],
    timestamp: new Date().toISOString(),
    recommendations: [
      'Consider CBT sessions',
      'Medication adjustment may be needed'
    ]
  }),
  
  // Additional mock methods...
};
```

### Component Testing

Testing the integration with XGBoost service:

```tsx
// In tests/presentation/organisms/RiskAssessmentPanel.test.tsx

jest.mock('../../../src/infrastructure/api/XGBoostService', () => ({
  xgboostService: mockXGBoostService
}));

describe('RiskAssessmentPanel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should make XGBoost prediction when form is submitted', async () => {
    const patientId = 'test-patient-123';
    const assessmentData = {
      scores: { phq9: 14, gad7: 12 },
      severity: 'moderate',
      diagnosis: 'F32.1'
    };
    
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <RiskAssessmentPanel
          patientId={patientId}
          assessmentData={assessmentData}
        />
      </QueryClientProvider>
    );
    
    // Find and click submit button
    const submitButton = screen.getByRole('button', { name: /calculate risk/i });
    fireEvent.click(submitButton);
    
    // Verify XGBoost service was called with correct parameters
    expect(mockXGBoostService.predictRisk).toHaveBeenCalledWith({
      patient_id: patientId,
      risk_type: 'relapse',
      clinical_data: {
        assessment_scores: assessmentData.scores,
        severity: assessmentData.severity,
        diagnosis: assessmentData.diagnosis
      }
    });
    
    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText(/moderate risk/i)).toBeInTheDocument();
      expect(screen.getByText(/65%/)).toBeInTheDocument();
    });
  });
  
  // Additional tests...
});
```

## Deployment Considerations


### Environment Configuration

Environment-specific configuration for XGBoost integration:

```typescript
// In config/environment.ts

export const config = {
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || '/api',
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000', 10),
  },
  xgboost: {
    riskThreshold: parseFloat(process.env.REACT_APP_RISK_THRESHOLD || '0.7'),
    confidenceThreshold: parseFloat(process.env.REACT_APP_CONFIDENCE_THRESHOLD || '0.8'),
    enableRealTimePredictions: process.env.REACT_APP_ENABLE_REALTIME_PREDICTIONS === 'true',
  },
  auth: {
    sessionTimeout: parseInt(process.env.REACT_APP_SESSION_TIMEOUT || '1800000', 10),
  },
  visualization: {
    highPerformanceMode: process.env.REACT_APP_HIGH_PERFORMANCE_MODE === 'true',
    enableProgressiveLoading: process.env.REACT_APP_ENABLE_PROGRESSIVE_LOADING !== 'false',
  }
};
```

### Feature Flags

Feature flags for controlled rollout of ML features:

```typescript
// In config/featureFlags.ts

export const featureFlags = {
  enableRiskPrediction: true,
  enableTreatmentComparison: true,
  enableTemporalVisualization: process.env.REACT_APP_ENABLE_TEMPORAL === 'true',
  enableFeatureImportance: true,
  enableDigitalTwinIntegration: process.env.REACT_APP_ENABLE_DIGITAL_TWIN === 'true',
  enableRealTimeUpdates: process.env.NODE_ENV === 'production',
  experimentalFeatures: process.env.REACT_APP_EXPERIMENTAL_FEATURES === 'true',
};

// Feature flag hook
export function useFeatureFlag(flagName: keyof typeof featureFlags): boolean {
  return featureFlags[flagName] || false;
}
```

## Security & HIPAA Compliance


### HIPAA-Compliant Rendering

Ensure all visualizations are HIPAA-compliant:

```tsx
// In presentation/organisms/BrainVisualization.tsx

// Ensure no PHI is displayed or stored in the 3D scene
const ensureNoPatientIdentifiers = useCallback((data: any) => {
  // Deep clone to avoid mutations to original data
  const sanitizedData = JSON.parse(JSON.stringify(data));
  
  // Remove any patient identifiers from metadata
  if (sanitizedData.metadata) {
    delete sanitizedData.metadata.patientName;
    delete sanitizedData.metadata.patientDOB;
    delete sanitizedData.metadata.patientMRN;
    delete sanitizedData.metadata.patientAddress;
    
    // Replace patient ID with a secure hash for visualization
    if (sanitizedData.metadata.patientId) {
      sanitizedData.metadata.visualizationId = 
        generateSecureHash(sanitizedData.metadata.patientId);
      delete sanitizedData.metadata.patientId;
    }
  }
  
  return sanitizedData;
}, []);

// Apply the sanitization before visualization
const sanitizedBrainData = useMemo(() => {
  if (!brainData) return null;
  return ensureNoPatientIdentifiers(brainData);
}, [brainData, ensureNoPatientIdentifiers]);
```

### Secure Context Management

Managing security context for API calls:

```typescript
// In application/contexts/SecurityContext.tsx

export const SecurityProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const { logout } = useAuth();
  
  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
    };
    
    // Add activity listeners
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('touchstart', updateActivity);
    
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
    };
  }, []);
  
  // Auto-logout after inactivity period
  useEffect(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    
    inactivityTimer.current = setTimeout(() => {
      // Log user out after inactivity timeout (HIPAA requirement)
      logout();
      // Display secure logout message
      toast.info('Your session has expired due to inactivity.');
    }, config.auth.sessionTimeout);
    
    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [lastActivity, logout]);
  
  const securityContext = useMemo(() => ({
    lastActivity,
    refreshActivity: () => setLastActivity(Date.now())
  }), [lastActivity]);
  
  return (
    <SecurityContext.Provider value={securityContext}>
      {children}
    </SecurityContext.Provider>
  );
};