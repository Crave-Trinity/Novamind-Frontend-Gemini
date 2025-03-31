# Novamind Digital Twin Frontend Implementation Guide

## Getting Started

### Prerequisites
- Node.js 18+ and npm 8+
- Git for version control
- AWS account with appropriate permissions

### Initial Setup
```bash
# Clone repository if not already done
git clone <repository-url>
cd novamind-digitaltwin/frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
```

## Core Implementation Guidelines

### 1. Component Development

#### Atomic Design Pattern
Follow the atomic design methodology rigorously:

```javascript
// Example Atom: Button
// src/components/atoms/Button.tsx
import React from 'react';

interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary';
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button = ({ variant, label, onClick, disabled }: ButtonProps) => {
  const baseClasses = "px-4 py-2 rounded font-medium transition-all duration-200";
  
  const variantClasses = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-slate-800 text-white hover:bg-slate-700",
    tertiary: "bg-transparent border border-slate-700 text-slate-700 hover:bg-slate-50"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};
```

#### Container/Presentation Pattern
Strictly separate data fetching from presentation:

```typescript
// Container Component: src/components/organisms/RiskAssessmentPanel/RiskAssessmentContainer.tsx
import React from 'react';
import { useQuery } from 'react-query';
import { riskAssessmentAPI } from '../../../api/riskAssessment';
import { RiskAssessmentPresentation } from './RiskAssessmentPresentation';
import { LoadingSpinner, ErrorDisplay } from '../../atoms';

export const RiskAssessmentContainer = ({ patientId }: { patientId: string }) => {
  const { data, isLoading, error } = useQuery(
    ['riskAssessment', patientId],
    () => riskAssessmentAPI.getRiskAssessment(patientId),
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );
  
  if (isLoading) return <LoadingSpinner size="large" />;
  if (error) return <ErrorDisplay error={error} />;
  
  return <RiskAssessmentPresentation data={data} />;
};
```

### 2. Brain Visualization Implementation

Implement advanced 3D brain visualization with optimized rendering:

```typescript
// src/visualizations/BrainModel.tsx
import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { NeuralRegion, NeuralConnection } from '../models/brain';

interface BrainModelProps {
  regions: NeuralRegion[];
  connections: NeuralConnection[];
  highlightedRegions?: string[];
  rotationSpeed?: number;
}

export const BrainModel: React.FC<BrainModelProps> = ({
  regions,
  connections,
  highlightedRegions = [],
  rotationSpeed = 0.001
}) => {
  // Use instanced meshes for performance
  const regionInstances = useMemo(() => {
    // Implementation details for creating instanced meshes
    // This would map regions to THREE.InstancedMesh
  }, [regions]);
  
  // Use THREE.LineSegments for connections
  const connectionGeometry = useMemo(() => {
    // Implementation for creating optimized line geometries
  }, [connections]);
  
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden">
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 100], fov: 45 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#0a0a0f']} />
        <ambientLight intensity={0.3} />
        <spotLight position={[100, 100, 100]} intensity={0.8} />
        
        <BrainModelInner
          regionInstances={regionInstances}
          connectionGeometry={connectionGeometry}
          highlightedRegions={highlightedRegions}
          rotationSpeed={rotationSpeed}
        />
        
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} intensity={1.5} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

// Inner component to handle animations
const BrainModelInner = ({ /* props */ }) => {
  const groupRef = useRef();
  
  // Handle rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed;
    }
  });
  
  // Handle highlighted regions
  useEffect(() => {
    // Implementation for highlighting specific regions
  }, [highlightedRegions]);
  
  return (
    <group ref={groupRef}>
      {/* Render brain components */}
    </group>
  );
};
```

### 3. Data Visualization Guidelines

For clinical data visualization:

```typescript
// src/visualizations/TimeSeriesChart.tsx
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useResizeObserver } from '../hooks/useResizeObserver';
import { ClinicalTimeSeries } from '../models/clinical';

export const TimeSeriesChart: React.FC<{
  data: ClinicalTimeSeries;
  metric: string;
  showConfidenceInterval?: boolean;
}> = ({ data, metric, showConfidenceInterval = true }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dimensions = useResizeObserver(wrapperRef);
  const [tooltipData, setTooltipData] = useState(null);
  
  useEffect(() => {
    if (!dimensions) return;
    
    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;
    
    // Clear svg
    svg.selectAll('*').remove();
    
    // Create scales, axes, and lines
    // Implementation would include proper scales, smooth transitions,
    // and optimized rendering for large datasets
    
    // Cleanup function for proper resource management
    return () => {
      // Clean up any D3 resources
    };
  }, [data, dimensions, metric]);
  
  return (
    <div ref={wrapperRef} className="w-full h-64 md:h-96">
      <svg ref={svgRef} className="w-full h-full" />
      {tooltipData && <div className="tooltip">{/* Tooltip content */}</div>}
    </div>
  );
};
```

### 4. State Management

Use Context API for global state:

```typescript
// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState } from 'react';

type Theme = 'sleek-dark' | 'clinical' | 'high-contrast';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('sleek-dark');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

### 5. API Integration

Create a clean API layer:

```typescript
// src/api/client.ts
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (401, 403, etc.)
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
    }
    return Promise.reject(error);
  }
);
```

### 6. HIPAA Compliance Implementation

Implement strict PHI protection:

```typescript
// src/utils/phiSanitizer.ts
import { SanitizedData } from '../models/compliance';

export function sanitizeDataForLogs<T>(data: T): SanitizedData<T> {
  if (!data) return data as SanitizedData<T>;
  
  // PHI fields to be sanitized
  const phiFields = [
    'patientName', 'dob', 'phoneNumber', 'emailAddress', 'address',
    'ssn', 'mrn', 'insuranceId'
  ];
  
  if (typeof data === 'object') {
    const result = { ...data } as any;
    
    for (const key in result) {
      if (phiFields.includes(key)) {
        result[key] = '[REDACTED]';
      } else if (typeof result[key] === 'object') {
        result[key] = sanitizeDataForLogs(result[key]);
      }
    }
    
    return result as SanitizedData<T>;
  }
  
  return data as SanitizedData<T>;
}

export const logSafely = (message: string, data?: any) => {
  if (data) {
    console.log(message, sanitizeDataForLogs(data));
  } else {
    console.log(message);
  }
};
```

## Performance Optimization

### Code Splitting Strategy

```typescript
// src/routes/index.tsx
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loading } from '../components/atoms';

// Lazy-loaded components
const Dashboard = React.lazy(() => import('../components/pages/Dashboard'));
const PatientProfile = React.lazy(() => import('../components/pages/PatientProfile'));
const BrainVisualizer = React.lazy(() => import('../components/pages/BrainVisualizer'));
const RiskAssessment = React.lazy(() => import('../components/pages/RiskAssessment'));
const TreatmentSimulator = React.lazy(() => import('../components/pages/TreatmentSimulator'));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients/:id" element={<PatientProfile />} />
        <Route path="/visualize/:id" element={<BrainVisualizer />} />
        <Route path="/risk/:id" element={<RiskAssessment />} />
        <Route path="/treatment/:id" element={<TreatmentSimulator />} />
      </Routes>
    </Suspense>
  );
};
```

### Memoization for Complex Components

```typescript
// src/components/organisms/DataCorrelationMatrix.tsx
import React, { useMemo } from 'react';
import { MetricCorrelation } from '../../models/metrics';

interface DataCorrelationMatrixProps {
  data: MetricCorrelation[];
  threshold: number;
}

export const DataCorrelationMatrix: React.FC<DataCorrelationMatrixProps> = React.memo(
  ({ data, threshold }) => {
    // Expensive computation for correlation visualization
    const processedData = useMemo(() => {
      return data.filter(item => Math.abs(item.strength) > threshold)
                 .sort((a, b) => Math.abs(b.strength) - Math.abs(a.strength));
    }, [data, threshold]);
    
    // Component implementation
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {processedData.map((correlation) => (
          <div 
            key={`${correlation.source}-${correlation.target}`}
            className="p-4 rounded-lg bg-slate-800"
          >
            {/* Correlation visualization */}
          </div>
        ))}
      </div>
    );
  },
  // Custom equality function for optimization
  (prevProps, nextProps) => {
    return (
      prevProps.threshold === nextProps.threshold &&
      prevProps.data.length === nextProps.data.length &&
      prevProps.data.every((item, i) => item.id === nextProps.data[i].id)
    );
  }
);
```

## Testing Strategy

### Unit Testing Components

```typescript
// src/components/atoms/Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  test('renders with correct label', () => {
    const handleClick = jest.fn();
    render(<Button variant="primary" label="Test Button" onClick={handleClick} />);
    
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });
  
  test('triggers onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button variant="primary" label="Test Button" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Test Button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  test('applies different styles based on variant', () => {
    const handleClick = jest.fn();
    const { rerender } = render(
      <Button variant="primary" label="Primary" onClick={handleClick} />
    );
    
    const primaryButton = screen.getByText('Primary');
    expect(primaryButton).toHaveClass('bg-indigo-600');
    
    rerender(<Button variant="secondary" label="Secondary" onClick={handleClick} />);
    const secondaryButton = screen.getByText('Secondary');
    expect(secondaryButton).toHaveClass('bg-slate-800');
  });
});
```

### Mock Service Worker for API Testing

```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/patients/:id', (req, res, ctx) => {
    const { id } = req.params;
    
    return res(
      ctx.status(200),
      ctx.json({
        id,
        riskFactors: [
          { name: 'medication_adherence', score: 0.8 },
          { name: 'sleep_quality', score: 0.6 }
        ],
        // Additional mock data
      })
    );
  }),
  
  rest.post('/api/treatments/predict', (req, res, ctx) => {
    const { patientId, treatmentType } = req.body;
    
    return res(
      ctx.status(200),
      ctx.json({
        id: 'pred-12345',
        patientId,
        treatmentType,
        probability: 0.78,
        confidence: 0.85,
        // Additional mock response data
      })
    );
  })
];
```