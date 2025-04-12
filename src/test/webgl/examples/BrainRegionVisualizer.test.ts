/* eslint-disable */
/**
 * Example Test: Brain Region Visualizer
 *
 * This test demonstrates how to properly test Three.js visualization components
 * using the WebGL mock system. It shows how to avoid common test hangs and
 * memory issues when testing complex 3D visualizations.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Explicitly mock the 'three' module for this test file ONLY
// eslint-disable-next-line
vi.mock('three', async (importOriginal) => {
  const actualThree = (await importOriginal()) as any; // Get actual exports if needed
  // Import mock classes using vi.importActual AFTER the mock setup
  const { CoreWebGLRenderer, MockWebGLTexture, MockWebGLGeometry, MockWebGLMaterial } =
    await vi.importActual('../mock-webgl');

  return {
    ...actualThree, // Spread actual exports first
    __esModule: true, // Ensure ES module compatibility
    WebGLRenderer: CoreWebGLRenderer,
    Texture: MockWebGLTexture,
    BufferGeometry: MockWebGLGeometry,
    MeshStandardMaterial: MockWebGLMaterial, // Use MeshStandardMaterial as used by the class
    MeshBasicMaterial: MockWebGLMaterial, // Keep basic mock too if needed elsewhere
    SphereGeometry: MockWebGLGeometry, // Mock SphereGeometry too
    Scene: vi.fn(() => ({ add: vi.fn(), remove: vi.fn() })), // Add mock methods used by class
// eslint-disable-next-line
    PerspectiveCamera: vi.fn().mockImplementation(() => ({
      position: { x: 0, y: 0, z: 0, set: vi.fn() },
      near: 0.1,
      far: 1000,
      fov: 75,
      aspect: 1,
      updateProjectionMatrix: vi.fn(),
    })),
// eslint-disable-next-line
    Mesh: vi.fn().mockImplementation((geometry, material) => ({
      // Mock Mesh constructor
      geometry,
      material,
      position: { x: 0, y: 0, z: 0, set: vi.fn() },
      userData: {},
      dispose: vi.fn(), // Add dispose mock
    })),
    // Add other necessary mocks as needed by the application
  };
});
import { setupWebGLMocks, cleanupWebGLMocks } from '../index'; // Keep setup/cleanup
// Import standard Three.js names - alias will provide mocks
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  SphereGeometry,
  MeshStandardMaterial,
  Mesh,
} from 'three';

/**
 * Simple mock Brain Region visualization component
 * This simulates a real Novamind brain visualization component
 */
class BrainRegionVisualizer {
  // Use standard types
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private regions: Map<string, Mesh> = new Map();
  private disposed = false;

// eslint-disable-next-line
  constructor(container: HTMLElement, regions: string[] = []) {
    // Initialize Three.js scene using standard constructors
    this.scene = new Scene();
    this.camera = new PerspectiveCamera();
    // Setting properties individually since our mock doesn't use constructor parameters
    this.camera.fov = 75;
    this.camera.aspect = 1.5;
    this.camera.near = 0.1;
    this.camera.far = 1000;
    this.camera.position.z = 5;

    // Initialize renderer using standard constructor
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setSize(900, 600);
    container.appendChild(this.renderer.domElement);

    // Add brain regions
    this.addRegions(
      regions.length > 0
        ? regions
        : [
            'prefrontal_cortex',
            'motor_cortex',
            'parietal_lobe',
            'temporal_lobe',
            'occipital_lobe',
            'hippocampus',
            'amygdala',
            'thalamus',
          ]
    );
  }

  /**
   * Add brain regions to the scene
   */
  addRegions(regionNames: string[]): void {
// eslint-disable-next-line
    regionNames.forEach((name, index) => {
      // Create region mesh using standard constructors
      const geometry = new SphereGeometry();
      const material = new MeshStandardMaterial();

      // Set position based on index
      const mesh = new Mesh(geometry, material);
      mesh.position.x = Math.cos((index * Math.PI) / 4) * 3;
      mesh.position.y = Math.sin((index * Math.PI) / 4) * 3;
      mesh.position.z = 0;

      // Store region metadata
      mesh.userData.regionName = name;
      mesh.userData.active = false;

      // Add to scene and tracking
      this.scene.add(mesh);
      this.regions.set(name, mesh);
    });
  }

  /**
   * Get all region names
   */
  getRegionNames(): string[] {
    return Array.from(this.regions.keys());
  }

  /**
   * Highlight a specific region
   */
  highlightRegion(regionName: string): boolean {
    const region = this.regions.get(regionName);
    if (!region) return false;

    // Reset all regions
// eslint-disable-next-line
    this.regions.forEach((mesh) => {
      (mesh.material as any).color = { r: 0.5, g: 0.5, b: 0.8, set: vi.fn() };
      mesh.userData.active = false;
    });

    // Highlight selected region
    (region.material as any).color = { r: 1.0, g: 0.2, b: 0.2, set: vi.fn() };
    region.userData.active = true;

    return true;
  }

  /**
   * Main render method
   */
  render(): void {
    if (this.disposed) return;

    // Render scene with camera
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Clean up all resources to prevent memory leaks
   */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    // Clean up all meshes
// eslint-disable-next-line
    this.regions.forEach((mesh) => {
      this.scene.remove(mesh);
      // Assuming the Mesh mock has a dispose method (as per three.ts mock)
// eslint-disable-next-line
      if (typeof (mesh as any).dispose === 'function') {
        (mesh as any).dispose();
      }
      // Also dispose geometry and material if necessary
// eslint-disable-next-line
      if (typeof (mesh.geometry as any).dispose === 'function') {
        (mesh.geometry as any).dispose();
      }
// eslint-disable-next-line
      if (typeof (mesh.material as any).dispose === 'function') {
        (mesh.material as any).dispose();
      }
    });

    // Clear region map
    this.regions.clear();

    // Clean up renderer
    this.renderer.dispose();
  }
}

// eslint-disable-next-line
describe('BrainRegionVisualizer', () => {
  // Tests enabled with enhanced WebGL mocks
  let container: HTMLDivElement;
  let visualizer: BrainRegionVisualizer;

// eslint-disable-next-line
  beforeEach(() => {
    // Set up WebGL mocks for all tests
    setupWebGLMocks();

    // Create container element
    container = document.createElement('div');
    document.body.appendChild(container);

    // Create visualizer
    visualizer = new BrainRegionVisualizer(container);
  });

// eslint-disable-next-line
  afterEach(() => {
    // Clean up visualizer
    visualizer.dispose();

    // Remove container
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }

    // Clean up WebGL mocks
    cleanupWebGLMocks();
  });

// eslint-disable-next-line
  it('should create all brain regions', () => {
    // Get all region names
    const regions = visualizer.getRegionNames();

    // Verify regions were created
    expect(regions.length).toBe(8);
    expect(regions).toContain('prefrontal_cortex');
    expect(regions).toContain('hippocampus');
  });

// eslint-disable-next-line
  it('should highlight a brain region', () => {
    // Highlight a region
    const success = visualizer.highlightRegion('amygdala');

    // Verify highlight was successful
    expect(success).toBe(true);

    // Verify region is active in internal state
    // Use a two-step type assertion pattern for accessing private properties in tests
    // First cast to unknown to bypass TypeScript's type checking, then to the appropriate shape
    const scene = (visualizer as unknown as { scene: { children: Array<{ userData: { regionName: string; active: boolean } }> } }).scene;
    
    // Find highlighted region with proper typing
    const highlightedRegion = Array.from(scene.children).find(
      (child) => child.userData.regionName === 'amygdala'
    );

    expect(highlightedRegion).toBeDefined();
    if (highlightedRegion) {
      expect(highlightedRegion.userData.active).toBe(true);
    }
  });

// eslint-disable-next-line
  it('should render without errors', () => {
    // Set up spy on renderer
    const renderer = (visualizer as any).renderer;
    const renderSpy = vi.spyOn(renderer, 'render');

    // Call render method
    visualizer.render();

    // Verify render was called
    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(renderSpy).toHaveBeenCalledWith((visualizer as any).scene, (visualizer as any).camera);
  });

// eslint-disable-next-line
  it('should properly clean up resources when disposed', () => {
    // Set up spy on renderer dispose
    const renderer = (visualizer as any).renderer;
    const disposeSpy = vi.spyOn(renderer, 'dispose');

    // Dispose visualizer
    visualizer.dispose();

    // Verify resources were cleaned up
    expect(disposeSpy).toHaveBeenCalledTimes(1);
    expect((visualizer as any).regions.size).toBe(0);
    expect((visualizer as any).disposed).toBe(true);

    // Verify that render is a no-op after disposal
    const renderSpy = vi.spyOn(renderer, 'render');
    visualizer.render();
    expect(renderSpy).not.toHaveBeenCalled();
  });
});
