import type * as THREE from 'three';
import type { ReactThreeFiber } from '@react-three/fiber';

// Extend the LineDashedMaterial type to include dashOffset
declare module 'three' {
  interface LineDashedMaterial {
    dashOffset: number;
  }
}

// Augment the global JSX namespace to include R3F elements
// This helps TypeScript and ESLint understand elements like <mesh>, <line>, etc.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Core Three.js Primitives - explicitly override DOM elements
      line: ReactThreeFiber.Object3DNode<THREE.Line, typeof THREE.Line> & {
        geometry?: any // eslint-disable-line @typescript-eslint/no-explicit-any;
        onClick?: (event: any // eslint-disable-line @typescript-eslint/no-explicit-any) => void;
        onPointerOver?: (event: any // eslint-disable-line @typescript-eslint/no-explicit-any) => void;
        onPointerOut?: (event: any // eslint-disable-line @typescript-eslint/no-explicit-any) => void;
      };
      mesh: ReactThreeFiber.Object3DNode<THREE.Mesh, typeof THREE.Mesh>;
      lineSegments: ReactThreeFiber.Object3DNode<THREE.LineSegments, typeof THREE.LineSegments>;
      group: ReactThreeFiber.Object3DNode<THREE.Group, typeof THREE.Group>;
      points: ReactThreeFiber.Object3DNode<THREE.Points, typeof THREE.Points>;

      // Geometries
      bufferGeometry: ReactThreeFiber.Node<THREE.BufferGeometry, typeof THREE.BufferGeometry>;
      boxGeometry: ReactThreeFiber.Node<THREE.BoxGeometry, typeof THREE.BoxGeometry>;
      sphereGeometry: ReactThreeFiber.Node<THREE.SphereGeometry, typeof THREE.SphereGeometry>;
      planeGeometry: ReactThreeFiber.Node<THREE.PlaneGeometry, typeof THREE.PlaneGeometry>;
      cylinderGeometry: ReactThreeFiber.Node<THREE.CylinderGeometry, typeof THREE.CylinderGeometry>;
      coneGeometry: ReactThreeFiber.Node<THREE.ConeGeometry, typeof THREE.ConeGeometry>;
      circleGeometry: ReactThreeFiber.Node<THREE.CircleGeometry, typeof THREE.CircleGeometry>;
      tubeGeometry: ReactThreeFiber.Node<THREE.TubeGeometry, typeof THREE.TubeGeometry>;
      extrudeGeometry: ReactThreeFiber.Node<THREE.ExtrudeGeometry, typeof THREE.ExtrudeGeometry>;
      latheGeometry: ReactThreeFiber.Node<THREE.LatheGeometry, typeof THREE.LatheGeometry>;
      ringGeometry: ReactThreeFiber.Node<THREE.RingGeometry, typeof THREE.RingGeometry>;
      torusGeometry: ReactThreeFiber.Node<THREE.TorusGeometry, typeof THREE.TorusGeometry>;
      torusKnotGeometry: ReactThreeFiber.Node<
        THREE.TorusKnotGeometry,
        typeof THREE.TorusKnotGeometry
      >;
      shapeGeometry: ReactThreeFiber.Node<THREE.ShapeGeometry, typeof THREE.ShapeGeometry>;

      // Materials with explicit props
      lineBasicMaterial: ReactThreeFiber.Node<
        THREE.LineBasicMaterial,
        typeof THREE.LineBasicMaterial
      > & {
        color?: string | number;
        opacity?: number;
        transparent?: boolean;
        linewidth?: number;
      };
      lineDashedMaterial: ReactThreeFiber.Node<
        THREE.LineDashedMaterial,
        typeof THREE.LineDashedMaterial
      > & {
        color?: string | number;
        opacity?: number;
        transparent?: boolean;
        linewidth?: number;
        dashSize?: number;
        gapSize?: number;
        scale?: number;
        dashOffset?: number;
      };

      // Other materials
      material: ReactThreeFiber.Node<THREE.Material, typeof THREE.Material>;
      meshBasicMaterial: ReactThreeFiber.Node<
        THREE.MeshBasicMaterial,
        typeof THREE.MeshBasicMaterial
      >;
      meshStandardMaterial: ReactThreeFiber.Node<
        THREE.MeshStandardMaterial,
        typeof THREE.MeshStandardMaterial
      >;
      meshPhysicalMaterial: ReactThreeFiber.Node<
        THREE.MeshPhysicalMaterial,
        typeof THREE.MeshPhysicalMaterial
      >;
      meshPhongMaterial: ReactThreeFiber.Node<
        THREE.MeshPhongMaterial,
        typeof THREE.MeshPhongMaterial
      >;
      meshLambertMaterial: ReactThreeFiber.Node<
        THREE.MeshLambertMaterial,
        typeof THREE.MeshLambertMaterial
      >;
      meshDepthMaterial: ReactThreeFiber.Node<
        THREE.MeshDepthMaterial,
        typeof THREE.MeshDepthMaterial
      >;
      meshNormalMaterial: ReactThreeFiber.Node<
        THREE.MeshNormalMaterial,
        typeof THREE.MeshNormalMaterial
      >;
      pointsMaterial: ReactThreeFiber.Node<THREE.PointsMaterial, typeof THREE.PointsMaterial>;
      shaderMaterial: ReactThreeFiber.Node<THREE.ShaderMaterial, typeof THREE.ShaderMaterial>;
      shadowMaterial: ReactThreeFiber.Node<THREE.ShadowMaterial, typeof THREE.ShadowMaterial>;
      spriteMaterial: ReactThreeFiber.Node<THREE.SpriteMaterial, typeof THREE.SpriteMaterial>;

      // Lights
      ambientLight: ReactThreeFiber.Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
      directionalLight: ReactThreeFiber.Object3DNode<
        THREE.DirectionalLight,
        typeof THREE.DirectionalLight
      >;
      pointLight: ReactThreeFiber.Object3DNode<THREE.PointLight, typeof THREE.PointLight>;
      spotLight: ReactThreeFiber.Object3DNode<THREE.SpotLight, typeof THREE.SpotLight>;
      hemisphereLight: ReactThreeFiber.Object3DNode<
        THREE.HemisphereLight,
        typeof THREE.HemisphereLight
      >;
      rectAreaLight: ReactThreeFiber.Object3DNode<THREE.RectAreaLight, typeof THREE.RectAreaLight>;

      // Helpers
      axesHelper: ReactThreeFiber.Object3DNode<THREE.AxesHelper, typeof THREE.AxesHelper>;
      gridHelper: ReactThreeFiber.Object3DNode<THREE.GridHelper, typeof THREE.GridHelper>;
      cameraHelper: ReactThreeFiber.Object3DNode<THREE.CameraHelper, typeof THREE.CameraHelper>;

      // Textures
      texture: ReactThreeFiber.Node<THREE.Texture, typeof THREE.Texture>;
      canvasTexture: ReactThreeFiber.Node<THREE.CanvasTexture, typeof THREE.CanvasTexture>;
      videoTexture: ReactThreeFiber.Node<THREE.VideoTexture, typeof THREE.VideoTexture>;
    }
  }
}

// Export empty object to make this file a module
export {};
