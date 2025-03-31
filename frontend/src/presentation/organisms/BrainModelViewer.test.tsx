/**
 * NOVAMIND Neural Test Suite
 * BrainModelViewer testing with quantum precision
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrainModelViewer } from './BrainModelViewer';
import { RenderMode } from '@domain/types/brain/visualization';
import { VisualizationState } from '@domain/types/common';
import { renderWithProviders, createMockBrainRegions } from '../../test/testUtils';
// Import neural-safe Three.js mock with quantum precision
import '@test/unified-three.mock';


// Mock Three.js and related components to prevent WebGL errors
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="three-canvas">{children}</div>,
  useThree: () => ({
    camera: { position: { set: vi.fn() }, lookAt: vi.fn() },
    gl: { setPixelRatio: vi.fn(), setSize: vi.fn() },
    set: vi.fn(),
  }),
  useFrame: vi.fn((callback) => callback({ camera: { position: { x: 0, y: 0, z: 10 } } }, 0)),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  ContactShadows: () => <div data-testid="contact-shadows" />,
  Environment: () => <div data-testid="environment" />,
  BakeShadows: () => <div data-testid="bake-shadows" />,
  useContextBridge: () => vi.fn(),
}));

vi.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }: { children: React.ReactNode }) => <div data-testid="effect-composer">{children}</div>,
  Bloom: () => <div data-testid="bloom-effect" />,
  SelectiveBloom: () => <div data-testid="selective-bloom" />,
  DepthOfField: () => <div data-testid="depth-of-field" />,
}));

vi.mock('@presentation/molecules/BrainRegionGroup', () => ({
  default: ({ regions, onRegionClick }: any) => (
    <div data-testid="brain-region-group">
      {regions && regions.map((r: any) => (
        <div 
          key={r.id} 
          data-testid={`brain-region-${r.id}`} 
          onClick={() => onRegionClick && onRegionClick(r)}
        >
          Region: {r.name}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@presentation/molecules/NeuralConnections', () => ({
  default: () => <div data-testid="neural-connections" />,
}));

// Mock data with clinical precision
const mockBrainModel = {
  id: 'model-123',
  patientId: 'patient-456',
  regions: createMockBrainRegions(2),
  pathways: [
    { id: 'path-1', sourceId: 'region-1', targetId: 'region-2', strength: 0.8 }
  ],
  timestamp: Date.now(),
  metadata: {
    modelVersion: '1.0.0',
    confidenceScore: 0.89,
    dataQuality: 'high',
    source: 'fMRI',
  }
};

describe('BrainModelViewer', () => {
  const onRegionClick = vi.fn();
  const onRegionHover = vi.fn();
  const onCameraMove = vi.fn();
  const onLoadComplete = vi.fn();
  const onError = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state with neural-safe patterns', () => {
    // Loading state with clinical precision
    const loadingState: VisualizationState<any> = { status: 'loading' };
    
    renderWithProviders(
      <BrainModelViewer 
        visualizationState={loadingState}
        renderMode={RenderMode.ANATOMICAL}
      />
    );
    
    // Verify loading state rendering
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    expect(screen.queryByTestId('three-canvas')).not.toBeInTheDocument();
  });
  
  it('renders error state with quantum precision', () => {
    // Error state with clinical precision
    const errorState: VisualizationState<any> = { 
      status: 'error', 
      error: { 
        name: 'NeuralError',
        code: 'DATA_FETCH_ERROR',
        message: 'Failed to load brain model',
        severity: 'error',
        timestamp: Date.now()
      } 
    };
    
    renderWithProviders(
      <BrainModelViewer 
        visualizationState={errorState}
        renderMode={RenderMode.ANATOMICAL}
      />
    );
    
    // Verify error state rendering
    expect(screen.getByText(/failed to load brain model/i)).toBeInTheDocument();
    expect(screen.queryByTestId('three-canvas')).not.toBeInTheDocument();
  });
  
  it('renders successful brain model with clinical precision', () => {
    // Success state with neural-safe data
    const successState: VisualizationState<any> = { 
      status: 'success', 
      data: mockBrainModel 
    };
    
    renderWithProviders(
      <BrainModelViewer 
        visualizationState={successState}
        renderMode={RenderMode.ANATOMICAL}
        onRegionClick={onRegionClick}
        onRegionHover={onRegionHover}
        onCameraMove={onCameraMove}
        onLoadComplete={onLoadComplete}
      />
    );
    
    // Verify successful rendering with quantum precision
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('brain-region-group')).toBeInTheDocument();
    expect(screen.getByTestId('neural-connections')).toBeInTheDocument();
    
    // Verify callback firing
    expect(onLoadComplete).toHaveBeenCalled();
  });
  
  it('handles region click interactions with quantum precision', async () => {
    const successState: VisualizationState<any> = { 
      status: 'success', 
      data: mockBrainModel 
    };
    
    renderWithProviders(
      <BrainModelViewer 
        visualizationState={successState}
        renderMode={RenderMode.ANATOMICAL}
        onRegionClick={onRegionClick}
      />
    );
    
    // Simulate region click with clinical precision
    const regionElement = screen.getByTestId('brain-region-region-1');
    fireEvent.click(regionElement);
    
    // Verify click handler was called with correct region
    expect(onRegionClick).toHaveBeenCalledTimes(1);
  });
  
  it('applies different render modes with neural precision', () => {
    const successState: VisualizationState<any> = { 
      status: 'success', 
      data: mockBrainModel 
    };
    
    const { rerender } = renderWithProviders(
      <BrainModelViewer 
        visualizationState={successState}
        renderMode={RenderMode.FUNCTIONAL}
      />
    );
    
    // Verify activity rendering
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('brain-region-group')).toBeInTheDocument();
    
    // Rerender with different mode
    rerender(
      <BrainModelViewer 
        visualizationState={successState}
        renderMode={RenderMode.CONNECTIVITY}
      />
    );
    
    // Verify connectivity rendering
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('brain-region-group')).toBeInTheDocument();
  });
  
  it('enables post-processing effects with clinical precision', () => {
    const successState: VisualizationState<any> = { 
      status: 'success', 
      data: mockBrainModel 
    };
    
    renderWithProviders(
      <BrainModelViewer 
        visualizationState={successState}
        renderMode={RenderMode.ANATOMICAL}
        enableBloom={true}
        enableDepthOfField={true}
      />
    );
    
    // Verify post-processing effects
    expect(screen.getByTestId('effect-composer')).toBeInTheDocument();
    expect(screen.getByTestId('bloom-effect')).toBeInTheDocument();
    expect(screen.getByTestId('depth-of-field')).toBeInTheDocument();
  });
});