/**
 * WebGL Test Utilities for Puppeteer Tests
 * 
 * This module provides robust utilities for testing WebGL components with Puppeteer.
 * It includes functions for checking WebGL capabilities, monitoring WebGL errors,
 * and providing resilient interaction with 3D visualizations.
 */

import { Browser, Page, ElementHandle } from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Configuration options for WebGL testing
 */
export interface WebGLTestOptions {
  screenshotDir: string;
  timeouts: {
    render: number;      // Time to wait for initial WebGL rendering
    interaction: number; // Time to wait after interactions
    stabilization: number; // Time to wait for WebGL scene to stabilize
  };
  retries: {
    rendering: number;   // Number of rendering check retries
    interaction: number; // Number of interaction retries
  };
  logging: boolean;      // Whether to enable detailed logging
}

/**
 * Default configuration for WebGL tests
 */
export const DEFAULT_WEBGL_TEST_OPTIONS: WebGLTestOptions = {
  screenshotDir: path.join(process.cwd(), 'test-puppeteer/puppeteer-screenshots'),
  timeouts: {
    render: 10000,      // 10 seconds for initial WebGL rendering
    interaction: 2000,  // 2 seconds after interactions
    stabilization: 5000 // 5 seconds for scene stabilization
  },
  retries: {
    rendering: 3,       // 3 retries for rendering checks
    interaction: 2      // 2 retries for interactions
  },
  logging: true
};

/**
 * Class to manage WebGL testing with Puppeteer
 */
export class WebGLTester {
  private page: Page;
  private options: WebGLTestOptions;
  private errors: string[] = [];
  private warnings: string[] = [];
  private webglErrors: string[] = [];
  private performanceMetrics: Record<string, number[]> = {};

  constructor(page: Page, options: Partial<WebGLTestOptions> = {}) {
    this.page = page;
    this.options = { ...DEFAULT_WEBGL_TEST_OPTIONS, ...options };
    
    // Ensure screenshot directory exists
    fs.mkdir(this.options.screenshotDir, { recursive: true }).catch(err => {
      console.error(`Failed to create screenshot directory: ${err.message}`);
    });
  }

  /**
   * Initialize WebGL testing environment
   */
  async initialize(): Promise<void> {
    // Set up error and warning collection
    await this.page.evaluateOnNewDocument(() => {
      // Track WebGL context creation and loss
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      // @ts-ignore - Overriding for WebGL tracking
      HTMLCanvasElement.prototype.getContext = function(...args) {
        const context = originalGetContext.apply(this, args);
        if (args[0] === 'webgl' || args[0] === 'webgl2') {
          // Track context loss
          // @ts-ignore - WebGLContextEvent may not be recognized by TypeScript
          this.addEventListener('webglcontextlost', (event: any) => {
            const statusMessage = event.statusMessage || 'Unknown reason';
            console.error(`[WebGL] Context lost: ${statusMessage}`);
            window.dispatchEvent(new CustomEvent('webgl-error', {
              detail: { type: 'contextLost', message: statusMessage }
            }));
          });
          
          // Track context restoration
          this.addEventListener('webglcontextrestored', () => {
            console.log('[WebGL] Context restored');
            window.dispatchEvent(new CustomEvent('webgl-restored'));
          });
          
          console.log(`[WebGL] Context created: ${args[0]}`);
        }
        return context;
      };
      
      // Track WebGL errors through console errors
      const originalConsoleError = console.error;
      console.error = function(...args) {
        const errorMessage = args.join(' ');
        if (errorMessage.includes('WebGL') || 
            errorMessage.includes('shader') || 
            errorMessage.includes('gl.') || 
            errorMessage.includes('GLSL') ||
            errorMessage.includes('three.js')) {
          window.dispatchEvent(new CustomEvent('webgl-error', { 
            detail: { type: 'error', message: errorMessage } 
          }));
        }
        originalConsoleError.apply(this, args);
      };
      
      // Track WebGL warnings
      const originalConsoleWarn = console.warn;
      console.warn = function(...args) {
        const warnMessage = args.join(' ');
        if (warnMessage.includes('WebGL') || 
            warnMessage.includes('shader') || 
            warnMessage.includes('gl.') || 
            warnMessage.includes('GLSL') ||
            warnMessage.includes('three.js')) {
          window.dispatchEvent(new CustomEvent('webgl-warning', { 
            detail: { message: warnMessage } 
          }));
        }
        originalConsoleWarn.apply(this, args);
      };
      
      // Add performance monitoring
      window.addEventListener('webgl-frame-rendered', (event: any) => {
        if (event.detail && event.detail.timing) {
          // @ts-ignore - Custom event data
          const metric = { 
            renderTime: event.detail.timing.renderTime,
            frameTime: event.detail.timing.frameTime
          };
          
          // Send metrics to Puppeteer context
          console.log(`[WebGL-Perf] ${JSON.stringify(metric)}`);
        }
      });
    });
    
    // Set up listeners for WebGL events
    this.page.on('console', msg => {
      const text = msg.text();
      
      // Collect WebGL performance metrics
      if (text.startsWith('[WebGL-Perf]')) {
        try {
          const metricData = JSON.parse(text.substring('[WebGL-Perf]'.length).trim());
          Object.entries(metricData).forEach(([key, value]) => {
            if (!this.performanceMetrics[key]) {
              this.performanceMetrics[key] = [];
            }
            this.performanceMetrics[key].push(value as number);
          });
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      // Log WebGL info messages
      if (this.options.logging && text.includes('[WebGL]')) {
        console.log(`Browser: ${text}`);
      }
    });
    
    // Handle page errors
    this.page.on('pageerror', err => {
      this.errors.push(err.message);
      
      // Collect WebGL-specific errors
      if (err.message.includes('WebGL') || 
          err.message.includes('shader') || 
          err.message.includes('gl.') || 
          err.message.includes('GLSL') ||
          err.message.includes('three.js')) {
        this.webglErrors.push(err.message);
      }
    });
    
    // Set up client-side event listeners
    await this.page.evaluate(() => {
      window.addEventListener('webgl-error', (event: any) => {
        console.error(`[WebGL-Error] ${event.detail.type}: ${event.detail.message}`);
      });
      
      window.addEventListener('webgl-warning', (event: any) => {
        console.warn(`[WebGL-Warning] ${event.detail.message}`);
      });
    });
  }
  
  /**
   * Check if WebGL is available and working
   */
  async checkWebGLAvailability(): Promise<boolean> {
    const isWebGLAvailable = await this.page.evaluate(() => {
      // Try to create a WebGL context
      const canvas = document.createElement('canvas');
      let gl: WebGLRenderingContext | null = null;
      
      try {
        // Use type assertion to fix type error with experimental-webgl
        gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      } catch (e) {
        return { available: false, error: e instanceof Error ? e.message : String(e) };
      }
      
      if (!gl) {
        return { available: false, error: 'WebGL context creation failed' };
      }
      
      // Check WebGL capabilities
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        return { 
          available: true, 
          vendor, 
          renderer,
          version: gl.getParameter(gl.VERSION),
          glslVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
        };
      }
      
      return { available: true, limited: true };
    });
    
    if (this.options.logging) {
      console.log('WebGL availability check:', isWebGLAvailable);
    }
    
    return isWebGLAvailable.available === true;
  }
  
  /**
   * Wait for WebGL canvas to be rendered
   */
  async waitForWebGLCanvas(selector = 'canvas', timeout = this.options.timeouts.render): Promise<ElementHandle<Element> | null> {
    // Wait for canvas to appear in the DOM
    let canvas: ElementHandle<Element> | null = null;
    
    try {
      canvas = await this.page.waitForSelector(selector, { timeout });
      
      // Canvas is possibly null, so add null check
      if (!canvas) {
        throw new Error('Canvas element not found');
      }
      
      // Check if canvas actually has content (dimensions > 0)
      const hasContent = await canvas.evaluate((el: Element) => {
        const canvasEl = el as HTMLCanvasElement;
        return canvasEl.width > 0 && canvasEl.height > 0;
      });
      
      if (!hasContent) {
        throw new Error('Canvas has zero dimensions');
      }
      
      // Additional check to ensure WebGL context exists
      const hasWebGLContext = await canvas.evaluate((el: Element) => {
        const canvasEl = el as HTMLCanvasElement;
        const gl = canvasEl.getContext('webgl') || canvasEl.getContext('webgl2');
        return !!gl;
      });
      
      if (!hasWebGLContext) {
        throw new Error('Canvas does not have a WebGL context');
      }
      
      return canvas;
    } catch (error) {
      if (this.options.logging) {
        console.error(`Failed to find rendered WebGL canvas: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Take a screenshot for debugging
      await this.takeErrorScreenshot('webgl-canvas-error');
      
      return null;
    }
  }
  
  /**
   * Interact with a 3D visualization with retry logic
   */
  async interact3DVisualization(
    actionFn: (page: Page) => Promise<void>,
    stabilizationTime = this.options.timeouts.stabilization
  ): Promise<boolean> {
    let success = false;
    let attempts = 0;
    
    while (!success && attempts < this.options.retries.interaction) {
      try {
        // Clear previous errors before attempting interaction
        this.webglErrors = [];
        
        // Perform the interaction
        await actionFn(this.page);
        
        // Wait for scene to stabilize
        // Use type assertion for Puppeteer's waitForTimeout
        await (this.page as any).waitForTimeout(stabilizationTime);
        
        // Check if any WebGL errors occurred during interaction
        if (this.webglErrors.length > 0) {
          throw new Error(`WebGL errors during interaction: ${this.webglErrors.join(', ')}`);
        }
        
        success = true;
      } catch (error) {
        attempts++;
        await this.takeErrorScreenshot(`interaction-attempt-${attempts}-error`);
        
        if (this.options.logging) {
          console.warn(`Interaction attempt ${attempts} failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        // Wait before retry
        // Use type assertion for Puppeteer's waitForTimeout
        await (this.page as any).waitForTimeout(1000);
      }
    }
    
    return success;
  }
  
  /**
   * Check for WebGL performance issues
   */
  getPerformanceStats(): Record<string, { min: number; max: number; avg: number }> {
    const stats: Record<string, { min: number; max: number; avg: number }> = {};
    
    Object.entries(this.performanceMetrics).forEach(([key, values]) => {
      if (values.length > 0) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        
        stats[key] = { min, max, avg };
      }
    });
    
    return stats;
  }
  
  /**
   * Take a screenshot for error debugging
   */
  async takeErrorScreenshot(prefix: string): Promise<string | null> {
    try {
      const timestamp = Date.now();
      const screenshotPath = path.join(this.options.screenshotDir, `${prefix}-${timestamp}.png`);
      await this.page.screenshot({ path: screenshotPath });
      if (this.options.logging) {
        console.log(`Screenshot saved to ${screenshotPath}`);
      }
      return screenshotPath;
    } catch (error) {
      if (this.options.logging) {
        console.error(`Failed to take screenshot: ${error instanceof Error ? error.message : String(error)}`);
      }
      return null;
    }
  }
  
  /**
   * Get any WebGL errors that occurred
   */
  getWebGLErrors(): string[] {
    return [...this.webglErrors];
  }
  
  /**
   * Clear collected errors and metrics
   */
  clearErrors(): void {
    this.errors = [];
    this.warnings = [];
    this.webglErrors = [];
  }
  
  /**
   * Inject WebGL monitoring code
   * This helps track performance in Three.js applications
   */
  async injectThreeJsMonitoring(): Promise<void> {
    await this.page.evaluate(() => {
      // Check if Three.js is loaded
      if (typeof (window as any).THREE === 'undefined') {
        console.warn('[WebGL] Three.js not detected, skipping monitoring injection');
        return;
      }
      
      const THREE = (window as any).THREE;
      
      // Hook into the WebGLRenderer to monitor performance
      if (THREE.WebGLRenderer) {
        const originalRender = THREE.WebGLRenderer.prototype.render;
        THREE.WebGLRenderer.prototype.render = function(scene: any, camera: any) {
          const startTime = performance.now();
          
          // Call original render
          const result = originalRender.call(this, scene, camera);
          
          const endTime = performance.now();
          const renderTime = endTime - startTime;
          
          // Dispatch custom event with timing information
          window.dispatchEvent(new CustomEvent('webgl-frame-rendered', {
            detail: {
              timing: {
                renderTime,
                frameTime: renderTime, // Simplified metric
                timestamp: Date.now()
              }
            }
          }));
          
          return result;
        };
        
        console.log('[WebGL] Successfully injected Three.js monitoring');
      }
    });
  }
}

/**
 * Create a WebGLTester instance for a Puppeteer page
 */
export async function createWebGLTester(
  page: Page, 
  options: Partial<WebGLTestOptions> = {}
): Promise<WebGLTester> {
  const tester = new WebGLTester(page, options);
  await tester.initialize();
  return tester;
}

/**
 * Helper to save a failure screenshot
 */
export async function saveFailureScreenshot(
  page: Page | undefined, 
  screenshotDir: string, 
  filename: string
): Promise<string | null> {
  if (!page) {
    console.error('[Puppeteer] Cannot take screenshot: page object is undefined');
    return null;
  }
  
  try {
    const timestamp = Date.now();
    const screenshotPath = path.join(screenshotDir, `${filename}-${timestamp}.png`);
    await fs.mkdir(screenshotDir, { recursive: true }); // Ensure directory exists
    await page.screenshot({ path: screenshotPath });
    console.log(`[Puppeteer] Screenshot saved to ${screenshotPath}`);
    return screenshotPath;
  } catch (error) {
    console.error(`[Puppeteer] Failed to take or save screenshot: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}