/**
 * WebGL Testing System Types
 *
 * This file defines TypeScript interfaces and types used throughout
 * the WebGL testing system.
 */

/**
 * Options for setting up WebGL mocks
 */
export interface SetupOptions {
  /**
   * Whether to monitor memory allocations and disposals
   * @default true
   */
  monitorMemory?: boolean;

  /**
   * Whether to print debugging information during tests
   * @default false
   */
  debugMode?: boolean;

  /**
   * Whether to use neural controller mocks
   * @default false
   */
  useNeuralControllerMocks?: boolean;
}

/**
 * Type representing a Three.js object that can be disposed
 */
export interface Disposable {
  dispose: () => void;
}

/**
 * Type for WebGLRendererParameters used to configure the renderer
 */
export interface WebGLRendererParameters {
  canvas?: HTMLCanvasElement;
  alpha?: boolean;
  antialias?: boolean;
  precision?: 'highp' | 'mediump' | 'lowp';
  preserveDrawingBuffer?: boolean;
  powerPreference?: 'high-performance' | 'low-power' | 'default';
  depth?: boolean;
  stencil?: boolean;
  premultipliedAlpha?: boolean;
  logarithmicDepthBuffer?: boolean;
}

/**
 * Type for mock materials
 */
export interface MockMaterial extends Disposable {
  type: string;
  uuid: string;
  name: string;
  transparent: boolean;
  opacity: number;
  side: number;
  visible: boolean;
  color?: {
    r: number;
    g: number;
    b: number;
    set: (value: string | number) => void;
  };
}

/**
 * Type for mock geometries
 */
export interface MockGeometry extends Disposable {
  type: string;
  uuid: string;
  name: string;
  vertices?: number[];
  attributes?: Record<string, any>;
}

/**
 * Type for mock WebGLRenderer
 */
export interface MockWebGLRenderer extends Disposable {
  domElement: HTMLCanvasElement;
  render: (scene: any, camera: any) => void;
  setSize: (width: number, height: number) => void;
  setClearColor: (color: any, alpha?: number) => void;
  clear: () => void;
  info: {
    memory: {
      geometries: number;
      textures: number;
    };
    render: {
      calls: number;
      triangles: number;
      points: number;
      lines: number;
    };
  };
}
