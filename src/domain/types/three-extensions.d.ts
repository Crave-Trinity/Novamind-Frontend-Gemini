/**
 * Type declarations for Three.js ecosystem libraries
 */

declare module '@react-three/drei' {
  import { FC, ReactNode, MutableRefObject, Ref } from 'react';
  import { Object3D, Texture, Material, Mesh, Group, BufferGeometry, Camera, Color } from 'three';
  import { RootState } from '@react-three/fiber';

  export interface OrbitControlsProps {
    makeDefault?: boolean;
    camera?: Camera;
    regress?: boolean;
    domElement?: HTMLElement;
    enablePan?: boolean;
    enableZoom?: boolean;
    enableRotate?: boolean;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
    minPolarAngle?: number;
    maxPolarAngle?: number;
    minAzimuthAngle?: number;
    maxAzimuthAngle?: number;
    maxDistance?: number;
    minDistance?: number;
    zoomSpeed?: number;
    panSpeed?: number;
    rotateSpeed?: number;
    dampingFactor?: number;
    onChange?: (e?: any) => void;
    onStart?: (e?: any) => void;
    onEnd?: (e?: any) => void;
  }

  export const OrbitControls: FC<OrbitControlsProps>;

  export interface UseGLTFResult<T extends string | string[]> {
    nodes: Record<string, Mesh>;
    materials: Record<string, Material>;
    scene: Group;
    animations: any[];
  }

  export function useGLTF<T extends string | string[]>(
    path: T,
    useDraco?: boolean | string,
    useMeshOpt?: boolean
  ): UseGLTFResult<T>;

  export interface EnvironmentProps {
    preset?: string;
    background?: boolean;
    path?: string;
    scene?: Object3D;
    files?: string | string[];
    extensions?: any;
  }

  export const Environment: FC<EnvironmentProps>;

  export interface InstancesProps {
    limit?: number;
    range?: number;
    children?: ReactNode;
    onInstancesReady?: () => void;
  }

  export const Instances: FC<InstancesProps>;

  export interface InstanceProps {
    color?: Color | number | string;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number | [number, number, number];
    onClick?: (e: any) => void;
    onPointerOver?: (e: any) => void;
    onPointerOut?: (e: any) => void;
    ref?: Ref<any>;
  }

  export const Instance: FC<InstanceProps>;

  export function useAnimations(
    animations: any[],
    ref?: MutableRefObject<Object3D | undefined>
  ): {
    ref: MutableRefObject<Object3D | undefined>;
    names: string[];
    clips: any[];
    actions: Record<string, any>;
  };
}

declare module '@react-three/postprocessing' {
  import { FC, ReactNode } from 'react';
  import { Object3D } from 'three';

  interface OutlineProps {
    selection: Object3D[];
    visibleEdgeColor?: number;
    hiddenEdgeColor?: number;
    edgeStrength?: number;
    pulseSpeed?: number;
    pulse?: number;
    xRay?: boolean;
  }

  interface BloomProps {
    intensity?: number;
    luminanceThreshold?: number;
    luminanceSmoothing?: number;
    kernelSize?: number;
  }

  interface EffectComposerProps {
    enabled?: boolean;
    children?: ReactNode;
    multisampling?: number;
    renderPriority?: number;
    autoClear?: boolean;
    depthBuffer?: boolean;
    stencilBuffer?: boolean;
    anisotropy?: number;
    debug?: boolean;
  }

  export const EffectComposer: FC<EffectComposerProps>;
  export const Bloom: FC<BloomProps>;
  export const Outline: FC<OutlineProps>;
}
