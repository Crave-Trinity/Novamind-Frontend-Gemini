/**
 * Example Test: Brain Region Visualizer
 * 
 * This test demonstrates how to properly test Three.js visualization components
 * using the WebGL mock system. It shows how to avoid common test hangs and
 * memory issues when testing complex 3D visualizations.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupWebGLMocks, cleanupWebGLMocks, ThreeMocks } from '../index';

/**
 * Simple mock Brain Region visualization component
 * This simulates a real Novamind brain visualization component
 */
class BrainRegionVisualizer {
  private scene: InstanceType<typeof ThreeMocks.Scene>;
  private camera: InstanceType<typeof ThreeMocks.PerspectiveCamera>;
  private renderer: InstanceType<typeof ThreeMocks.WebGLRenderer>;
  private regions: Map<string, InstanceType<typeof ThreeMocks.Mesh>> = new Map();
  private disposed = false;
  
  constructor(container: HTMLElement, regions: string[] = []) {
    // Initialize Three.js scene
    this.scene = new ThreeMocks.Scene();
    this.camera = new ThreeMocks.PerspectiveCamera();
    // Setting properties individually since our mock doesn't use constructor parameters
    this.camera.fov = 75;
    this.camera.aspect = 1.5;
    this.camera.near = 0.1;
    this.camera.far = 1000;
    this.camera.position.z = 5;
    
    // Initialize renderer
    this.renderer = new ThreeMocks.WebGLRenderer({ antialias: true });
    this.renderer.setSize(900, 600);
    container.appendChild(this.renderer.domElement);
    
    // Add brain regions
    this.addRegions(regions.length > 0 ? regions : [
      'prefrontal_cortex', 
      'motor_cortex', 
      'parietal_lobe', 
      'temporal_lobe',
      'occipital_lobe',
      'hippocampus',
      'amygdala',
      'thalamus'
    ]);
  }
  
  /**
   * Add brain regions to the scene
   */
  addRegions(regionNames: string[]): void {
    regionNames.forEach((name, index) => {
      // Create region mesh
      const geometry = new ThreeMocks.SphereGeometry();
      const material = new ThreeMocks.MeshStandardMaterial();
      
      // Set position based on index
      const mesh = new ThreeMocks.Mesh(geometry, material);
      mesh.position.x = Math.cos(index * Math.PI / 4) * 3;
      mesh.position.y = Math.sin(index * Math.PI / 4) * 3;
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
    this.regions.forEach(mesh => {
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
    this.regions.forEach(mesh => {
      this.scene.remove(mesh);
      mesh.dispose();
    });
    
    // Clear region map
    this.regions.clear();
    
    // Clean up renderer
    this.renderer.dispose();
  }
}

describe('BrainRegionVisualizer', () => {
  let container: HTMLDivElement;
  let visualizer: BrainRegionVisualizer;
  
  beforeEach(() => {
    // Set up WebGL mocks for all tests
    setupWebGLMocks();
    
    // Create container element
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Create visualizer
    visualizer = new BrainRegionVisualizer(container);
  });
  
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
  
  it('should create all brain regions', () => {
    // Get all region names
    const regions = visualizer.getRegionNames();
    
    // Verify regions were created
    expect(regions.length).toBe(8);
    expect(regions).toContain('prefrontal_cortex');
    expect(regions).toContain('hippocampus');
  });
  
  it('should highlight a brain region', () => {
    // Highlight a region
    const success = visualizer.highlightRegion('amygdala');
    
    // Verify highlight was successful
    expect(success).toBe(true);
    
    // Verify region is active in internal state
    const scene = (visualizer as any).scene;
    const highlightedRegion = Array.from(scene.children).find(
      (child: any) => child.userData.regionName === 'amygdala'
    ) as any; // Type assertion to avoid TS errors
    
    expect(highlightedRegion).toBeDefined();
    expect(highlightedRegion.userData.active).toBe(true);
  });
  
  it('should render without errors', () => {
    // Set up spy on renderer
    const renderer = (visualizer as any).renderer;
    const renderSpy = vi.spyOn(renderer, 'render');
    
    // Call render method
    visualizer.render();
    
    // Verify render was called
    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(renderSpy).toHaveBeenCalledWith(
      (visualizer as any).scene,
      (visualizer as any).camera
    );
  });
  
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
