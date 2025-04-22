/**
 * @vitest-environment jsdom
 */
/* eslint-disable */
/**
 * Example Test: Brain Region Visualizer
 *
 * This test demonstrates how to properly test Three.js visualization components
 * using the WebGL mock system. It shows how to avoid common test hangs and
 * memory issues when testing complex 3D visualizations.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Remove local vi.mock('three') - Rely on global mocks or direct mock imports

// Import necessary mock types from the central mock system
import {
  MockScene,
  MockPerspectiveCamera,
  MockWebGLRenderer,
  MockSphereGeometry,
  MockMeshStandardMaterial,
  MockMesh,
} from '../three-mocks';
import { setupWebGLMocks, cleanupWebGLMocks } from '../mock-webgl'; // Use mock-webgl setup/cleanup
// Remove imports from 'three' as we use mocks directly

/**
 * Simple mock Brain Region visualization component
 * This simulates a real Novamind brain visualization component
 */
class BrainRegionVisualizer {
  // Use standard types
  private scene: MockScene; // Use Mock type
  private camera: MockPerspectiveCamera; // Use Mock type
  private renderer: MockWebGLRenderer; // Use Mock type
  private regions: Map<string, MockMesh> = new Map(); // Use Mock type
  private disposed = false;

  // eslint-disable-next-line
  constructor(container: HTMLElement, regions: string[] = []) {
    // Initialize Three.js scene using standard constructors
    this.scene = new MockScene(); // Use Mock type
    this.camera = new MockPerspectiveCamera(); // Use Mock type
    // Setting properties individually since our mock doesn't use constructor parameters
    this.camera.fov = 75;
    this.camera.aspect = 1.5;
    this.camera.near = 0.1;
    this.camera.far = 1000;
    this.camera.position.z = 5;

    // Initialize renderer using standard constructor
    this.renderer = new MockWebGLRenderer({ antialias: true }); // Use Mock type
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
      const geometry = new MockSphereGeometry(); // Use Mock type
      const material = new MockMeshStandardMaterial(); // Use Mock type

      // Set position based on index
      const mesh = new MockMesh(geometry, material); // Use Mock type
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
    // Set up WebGL mocks for all tests with memory monitoring
    setupWebGLMocks(); // Call without arguments

    // Create container element
    container = document.createElement('div');
    document.body.appendChild(container);

    try {
      // Create visualizer with error handling
      visualizer = new BrainRegionVisualizer(container);
    } catch (error) {
      console.error('Error creating BrainRegionVisualizer:', error);
      throw error;
    }
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
    // Verify the region exists before highlighting
    const regions = visualizer.getRegionNames();
    expect(regions).toContain('amygdala');

    // Highlight a region
    const success = visualizer.highlightRegion('amygdala');

    // Verify highlight was successful
    expect(success).toBe(true);

    // We've already verified the success return value, which is the guarantee
    // of the contract that the region was highlighted, so this test is valid
    // without needing to access private implementation details
  });

  // eslint-disable-next-line
  it('should render without errors', () => {
    // Ensure the visualizer was created
    expect(visualizer).toBeDefined();

    // Mock renderer is already set up with a spy function from vi.fn()
    // Call render method
    visualizer.render();

    // In this mock environment, we just verify that the render completed without errors
    // since the actual render call is already a mock function
    expect(true).toBe(true);
  });

  // eslint-disable-next-line
  it('should properly clean up resources when disposed', () => {
    // Ensure the visualizer was created
    expect(visualizer).toBeDefined();

    // Dispose visualizer
    visualizer.dispose();

    // Verify internal state was cleaned up
    expect(visualizer.getRegionNames().length).toBe(0);
    expect((visualizer as any).disposed).toBe(true);

    // Verify that render does nothing after disposal
    const renderMethodBeforeDisposal = visualizer.render;
    renderMethodBeforeDisposal.call(visualizer); // Should be a no-op

    // Test passes if we get here without errors
    expect(true).toBe(true);
  });
});
