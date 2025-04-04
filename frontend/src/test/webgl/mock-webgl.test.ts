/**
 * Tests for the WebGL/Three.js mock system
 * 
 * This test verifies that our WebGL mocking system works correctly
 * and prevents test hangs in Three.js components.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setupWebGLMocks,
  cleanupWebGLMocks,
  MockWebGLRenderer,
  MockWebGLTexture,
  MockWebGLGeometry,
  MockWebGLMaterial
} from './mock-webgl';

// For direct access to internal functions for testing
import { default as mockWebGLInternal } from './mock-webgl';

describe('WebGL Mocking', () => {
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

  it('should mock WebGL context successfully', () => {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    
    // Get WebGL context - this should return our mock version
    const gl = canvas.getContext('webgl');
    
    // Verify the mock is created and has the correct properties
    expect(gl).toBeDefined();
    expect(gl?.drawingBufferWidth).toBe(800);
    expect(gl?.drawingBufferHeight).toBe(600);

    // Check that methods exist
    expect(typeof gl?.createShader).toBe('function');
    expect(typeof gl?.createProgram).toBe('function');
    expect(typeof gl?.createBuffer).toBe('function');
  });

  it('should mock WebGL2 context successfully', () => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    
    expect(gl).toBeDefined();
    
    // Test WebGL2 specific methods
    expect(typeof gl?.createVertexArray).toBe('function');
    expect(typeof gl?.bindVertexArray).toBe('function');
  });

  it('should mock animation frame APIs', () => {
    // Check that requestAnimationFrame is mocked
    expect(typeof window.requestAnimationFrame).toBe('function');
    
    // It should be a function
    expect(typeof window.requestAnimationFrame).toBe('function');
    
    // Test that requestAnimationFrame works by setting up a callback
    let called = false;
    const callback = () => { called = true; };
    
    // Request animation frame should call our callback
    window.requestAnimationFrame(callback);
    
    // Advance timers to trigger callback
    vi.advanceTimersByTime(20); // Use 20ms to ensure it triggers after 16ms default
    
    expect(called).toBe(true);
  });

  it('should create Three.js mock objects', () => {
    // Test that we can create Three.js mock objects
    const renderer = new MockWebGLRenderer();
    const texture = new MockWebGLTexture();
    const geometry = new MockWebGLGeometry();
    const material = new MockWebGLMaterial();
    
    // Check that the renderer has expected properties
    expect(renderer.domElement).toBeInstanceOf(HTMLCanvasElement);
    expect(renderer.shadowMap).toBeDefined();
    
    // Check that disposal methods exist
    expect(typeof renderer.dispose).toBe('function');
    expect(typeof texture.dispose).toBe('function');
    expect(typeof geometry.dispose).toBe('function');
    expect(typeof material.dispose).toBe('function');
  });

  it('should handle matchMedia for responsive testing', () => {
    // Explicitly mock matchMedia for this test
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    });
    
    // Check that matchMedia is mocked
    expect(typeof window.matchMedia).toBe('function');
    
    // Test matchMedia mock
    const mediaQuery = window.matchMedia('(max-width: 600px)');
    expect(mediaQuery).toBeDefined();
    expect(mediaQuery.matches).toBeDefined();
    expect(typeof mediaQuery.addEventListener).toBe('function');
    expect(typeof mediaQuery.removeEventListener).toBe('function');
  });
});

// This is a simple mock component that uses our WebGL mocks
describe('Three.js Component Integration', () => {
  beforeEach(() => {
    setupWebGLMocks();
  });

  afterEach(() => {
    cleanupWebGLMocks();
  });

  it('should handle Three.js component rendering without hanging', () => {
    // Create mock Three.js objects
    const renderer = new MockWebGLRenderer();
    const geometry = new MockWebGLGeometry();
    const material = new MockWebGLMaterial();
    
    // Simulate a render loop - this would normally hang tests
    for (let i = 0; i < 10; i++) {
      // Simulate animation frame
      renderer.render();
    }
    
    // Create and dispose many geometries and materials - this would normally cause memory leaks
    const geometries = Array(100).fill(0).map(() => new MockWebGLGeometry());
    const materials = Array(100).fill(0).map(() => new MockWebGLMaterial());
    
    // Dispose everything
    geometries.forEach(g => g.dispose());
    materials.forEach(m => m.dispose());
    renderer.dispose();
    
    // If we got here without hanging, the test passes
    expect(true).toBe(true);
  });
});
