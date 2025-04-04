/**
 * Tests for the Three.js mock system
 * 
 * This test verifies that our Three.js mocking system works correctly
 * for complex Three.js components used in brain visualizations.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ThreeMocks,
  MockScene,
  MockPerspectiveCamera,
  MockMesh,
  MockMeshBasicMaterial,
  MockSphereGeometry,
  MockObject3D,
  MockWebGLRenderer
} from './three-mocks';
import { setupWebGLMocks, cleanupWebGLMocks } from './mock-webgl';

describe('Three.js Mocking', () => {
  beforeEach(() => {
    // Set up WebGL mocks before each test
    setupWebGLMocks();
    
    // Set up fake timers for animation frame testing
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Clean up after each test to avoid polluting other tests
    cleanupWebGLMocks();
    
    // Reset timers
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should create a basic Three.js scene', () => {
    // Create a scene
    const scene = new MockScene();
    
    // Create a camera
    const camera = new MockPerspectiveCamera();
    camera.position.z = 5;
    
    // Create mesh with geometry and material
    const geometry = new MockSphereGeometry();
    const material = new MockMeshBasicMaterial();
    material.color = { r: 1, g: 0, b: 0, set: vi.fn() };
    
    const mesh = new MockMesh(geometry, material);
    mesh.position.x = 1;
    
    // Add mesh to scene
    scene.add(mesh);
    
    // Verify scene structure
    expect(scene.children.length).toBe(1);
    expect(scene.children[0]).toBe(mesh);
    expect(mesh.parent).toBe(scene);
    
    // Verify position
    expect(mesh.position.x).toBe(1);
    expect(camera.position.z).toBe(5);
  });

  it('should handle cleanup and memory management', () => {
    // Create objects
    const scene = new MockScene();
    const geometry = new MockSphereGeometry();
    const material = new MockMeshBasicMaterial();
    const mesh = new MockMesh(geometry, material);
    
    // Set up spy on dispose methods
    const geometryDisposeSpy = vi.spyOn(geometry, 'dispose');
    const materialDisposeSpy = vi.spyOn(material, 'dispose');
    
    // Add to scene
    scene.add(mesh);
    expect(scene.children.length).toBe(1);
    
    // Dispose mesh
    mesh.dispose();
    
    // Verify dispose was called on geometry and material
    expect(geometryDisposeSpy).toHaveBeenCalled();
    expect(materialDisposeSpy).toHaveBeenCalled();
  });

  it('should handle parent-child relationships correctly', () => {
    const parent = new MockObject3D();
    const child1 = new MockObject3D();
    const child2 = new MockObject3D();
    
    parent.add(child1);
    parent.add(child2);
    
    expect(parent.children.length).toBe(2);
    expect(child1.parent).toBe(parent);
    expect(child2.parent).toBe(parent);
    
    // Test removal
    parent.remove(child1);
    
    expect(parent.children.length).toBe(1);
    expect(parent.children[0]).toBe(child2);
    expect(child1.parent).toBe(null);
  });

  it('should support traversal of object hierarchies', () => {
    const root = new MockObject3D();
    const child1 = new MockObject3D();
    const child2 = new MockObject3D();
    const grandchild = new MockObject3D();
    
    root.add(child1);
    root.add(child2);
    child1.add(grandchild);
    
    const visited: MockObject3D[] = [];
    
    root.traverse((object) => {
      visited.push(object);
    });
    
    expect(visited.length).toBe(4);
    expect(visited).toContain(root);
    expect(visited).toContain(child1);
    expect(visited).toContain(child2);
    expect(visited).toContain(grandchild);
  });
});

// Add a test specifically for the renderer, which is critical for performance
describe('Three.js Renderer Mocking', () => {
  let renderer: MockWebGLRenderer;
  let scene: MockScene;
  let camera: MockPerspectiveCamera;
  
  beforeEach(() => {
    setupWebGLMocks();
    
    renderer = new MockWebGLRenderer();
    scene = new MockScene();
    camera = new MockPerspectiveCamera();
  });
  
  afterEach(() => {
    renderer.dispose();
    cleanupWebGLMocks();
  });
  
  it('should handle rendering without errors', () => {
    // This would normally crash in JSDOM without proper mocking
    renderer.render(scene, camera);
    
    // If no error is thrown, the test passes
    expect(true).toBe(true);
  });
  
  it('should support renderer configuration', () => {
    renderer.setSize(800, 600);
    renderer.setPixelRatio(2);
    renderer.setClearColor({ r: 0, g: 0, b: 0 }, 1);
    
    // Verify renderer has expected properties
    expect(renderer.domElement).toBeInstanceOf(HTMLCanvasElement);
    expect(renderer.domElement.width).toBe(800);
    expect(renderer.domElement.height).toBe(600);
  });
});
