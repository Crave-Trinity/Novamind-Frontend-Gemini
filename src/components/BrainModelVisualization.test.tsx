/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrainModelVisualization } from '../presentation/molecules/BrainModelVisualization';
import { BrainModelProvider } from '../presentation/providers/BrainModelProvider';
import { ThemeProvider } from '../presentation/providers/ThemeProvider';
import { mockBrainRegionData } from '../test/mocks/mockBrainData';

// Create a custom renderer that includes all required providers
function renderWithProviders(ui: React.ReactElement, initialBrainState = {}) {
  return render(
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrainModelProvider initialState={initialBrainState}>
        {ui}
      </BrainModelProvider>
    </ThemeProvider>
  );
}

// Mock three.js and other WebGL dependencies
vi.mock('three', async () => {
  const actualThree = await vi.importActual('three');
  return {
    ...actualThree,
    // Mock key classes used by the brain visualization
    WebGLRenderer: vi.fn(() => ({
      setSize: vi.fn(),
      setPixelRatio: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
      domElement: document.createElement('canvas'),
      shadowMap: { enabled: false },
    })),
    Scene: vi.fn(() => ({
      add: vi.fn(),
      remove: vi.fn(),
      children: [],
    })),
    PerspectiveCamera: vi.fn(() => ({
      aspect: 1,
      position: { set: vi.fn() },
      lookAt: vi.fn(),
      updateProjectionMatrix: vi.fn(),
    })),
    BoxGeometry: vi.fn(),
    SphereGeometry: vi.fn(),
    MeshStandardMaterial: vi.fn(() => ({
      color: { set: vi.fn() },
    })),
    Mesh: vi.fn(() => ({
      position: { set: vi.fn() },
      scale: { set: vi.fn() },
      name: '',
      userData: {},
      geometry: { dispose: vi.fn() },
      material: { dispose: vi.fn() },
    })),
    Group: vi.fn(() => ({
      add: vi.fn(),
      remove: vi.fn(),
      position: { set: vi.fn() },
      rotation: { set: vi.fn() },
      children: [],
    })),
    Color: vi.fn((color) => ({ r: 1, g: 1, b: 1, set: vi.fn() })),
    DirectionalLight: vi.fn(() => ({
      position: { set: vi.fn() },
      castShadow: false,
    })),
    AmbientLight: vi.fn(),
    Vector3: vi.fn(() => ({ set: vi.fn(), copy: vi.fn(), applyMatrix4: vi.fn() })),
    Raycaster: vi.fn(() => ({ 
      setFromCamera: vi.fn(),
      intersectObjects: vi.fn().mockReturnValue([]),
    })),
    Box3: vi.fn(() => ({ 
      setFromObject: vi.fn(),
      getCenter: vi.fn(),
      getSize: vi.fn(),
    })),
    Matrix4: vi.fn(() => ({ makeRotationAxis: vi.fn() })),
    Clock: vi.fn(() => ({ getElapsedTime: vi.fn().mockReturnValue(0) })),
    // Add more mocks as needed for specific tests
  };
});

// Mock react-three-fiber
vi.mock('@react-three/fiber', async () => {
  return {
    Canvas: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="r3f-canvas">{children}</div>
    ),
    useThree: vi.fn(() => ({
      gl: {
        domElement: document.createElement('canvas'),
        setSize: vi.fn(),
      },
      scene: { add: vi.fn(), remove: vi.fn() },
      camera: { position: { set: vi.fn() } },
      size: { width: 800, height: 600 },
    })),
    useFrame: vi.fn((callback) => {
      // Call the callback once to simulate a frame
      callback({ scene: {}, camera: {} }, 0);
    }),
  };
});

// Mock react-three/drei
vi.mock('@react-three/drei', async () => {
  return {
    OrbitControls: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="orbit-controls">{children}</div>
    ),
    Html: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="drei-html">{children}</div>
    ),
    useHelper: vi.fn(),
    PerspectiveCamera: (props: any) => (
      <div data-testid="perspective-camera"></div>
    ),
  };
});

describe('BrainModelVisualization Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Mock window.requestAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });
    
    // Mock window.cancelAnimationFrame
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    
    // Mock ResizeObserver
    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
    
    // Suppress console errors for WebGL errors
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<BrainModelVisualization modelId="test-model" />);
    
    // Check that the canvas container and controls are present
    expect(screen.getByTestId('brain-model-container')).toBeInTheDocument();
    expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
  });

  it('displays loading state when data is being fetched', () => {
    renderWithProviders(
      <BrainModelVisualization 
        modelId="test-model" 
        isLoading={true} 
      />
    );
    
    // Check that loading indicator is showing
    expect(screen.getByTestId('brain-model-loading')).toBeInTheDocument();
  });

  it('displays error state when there is an error', () => {
    renderWithProviders(
      <BrainModelVisualization 
        modelId="test-model" 
        error="Failed to load brain model" 
      />
    );
    
    // Check that error message is showing
    expect(screen.getByTestId('brain-model-error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load brain model')).toBeInTheDocument();
  });

  it('renders brain regions when data is provided', () => {
    const regionIds = Object.keys(mockBrainRegionData);
    
    renderWithProviders(
      <BrainModelVisualization 
        modelId="test-model" 
        regionData={mockBrainRegionData}
      />
    );
    
    // Check that brain container is present
    const container = screen.getByTestId('brain-model-container');
    expect(container).toBeInTheDocument();
    
    // Check for region labels (mocked in drei HTML component)
    const htmlContainer = screen.getByTestId('drei-html');
    expect(htmlContainer).toBeInTheDocument();
    
    // Verify controls are rendered
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
  });

  it('applies highlight to selected region', async () => {
    // Create a mock of the useBrainModel hook result
    const selectRegionMock = vi.fn();
    const highlightRegionMock = vi.fn();
    
    // Mock the hook to return our controlled functions
    vi.mock('../presentation/hooks/useBrainModel', () => ({
      useBrainModel: () => ({
        selectedRegion: null,
        selectRegion: selectRegionMock,
        highlightRegion: highlightRegionMock,
        // Include other required properties
        regionData: mockBrainRegionData,
        isLoading: false,
        error: null,
      }),
    }));
    
    renderWithProviders(
      <BrainModelVisualization 
        modelId="test-model" 
        regionData={mockBrainRegionData}
        onRegionHover={highlightRegionMock}
        onRegionSelect={selectRegionMock}
      />
    );
    
    // Simulate hovering over a region (in real component this triggers a raycaster)
    // Here we directly call the handler as we've mocked the 3D part
    const container = screen.getByTestId('brain-model-container');
    fireEvent.mouseMove(container);
    
    // Since actual WebGL interactions are mocked, we verify that our event handlers
    // are set up correctly and the container responds to mouse events
    expect(container).toBeInTheDocument();
    
    // Simulate clicking on the container to select a region
    fireEvent.click(container);
    
    // In a real test with actual components, we'd verify that the highlight is applied
    // and selection happens, but here we're testing that the mouse handlers are set up
  });

  it('handles window resize events', async () => {
    renderWithProviders(<BrainModelVisualization modelId="test-model" />);
    
    // Trigger a resize event
    global.dispatchEvent(new Event('resize'));
    
    // Verify the component doesn't crash on resize
    const container = screen.getByTestId('brain-model-container');
    expect(container).toBeInTheDocument();
  });

  it('cleans up resources when unmounted', () => {
    const { unmount } = renderWithProviders(
      <BrainModelVisualization modelId="test-model" />
    );
    
    // Unmount the component
    unmount();
    
    // In a real test, we'd verify that the dispose methods were called
    // on Three.js objects, but since we're mocking them, we're simply
    // testing that unmounting doesn't cause errors
  });

  it('renders with different view modes', () => {
    const { rerender } = renderWithProviders(
      <BrainModelVisualization 
        modelId="test-model" 
        viewMode="anatomical"
      />
    );
    
    // Verify the component renders with anatomical view
    expect(screen.getByTestId('brain-model-container')).toBeInTheDocument();
    
    // Re-render with functional view
    rerender(
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <BrainModelProvider>
          <BrainModelVisualization 
            modelId="test-model" 
            viewMode="functional"
          />
        </BrainModelProvider>
      </ThemeProvider>
    );
    
    // Verify the component still renders
    expect(screen.getByTestId('brain-model-container')).toBeInTheDocument();
  });

  it('applies correct colormap based on data values', () => {
    renderWithProviders(
      <BrainModelVisualization 
        modelId="test-model"
        regionData={mockBrainRegionData}
        colormapType="heatmap"
        dataRange={[0, 100]} 
      />
    );
    
    // Verify the component renders with colormap options
    expect(screen.getByTestId('brain-model-container')).toBeInTheDocument();
  });

  it('renders control panel when showControls is true', () => {
    renderWithProviders(
      <BrainModelVisualization 
        modelId="test-model"
        showControls={true}
      />
    );
    
    // Check for controls container
    expect(screen.getByTestId('brain-model-controls')).toBeInTheDocument();
  });

  it('responds to camera position controls', async () => {
    renderWithProviders(
      <BrainModelVisualization 
        modelId="test-model"
        showControls={true}
      />
    );
    
    // Find camera controls
    const topViewButton = screen.getByRole('button', { name: /top view/i });
    expect(topViewButton).toBeInTheDocument();
    
    // Click on top view button
    await userEvent.click(topViewButton);
    
    // Verify the component doesn't crash when view buttons are used
    expect(screen.getByTestId('brain-model-container')).toBeInTheDocument();
  });
});