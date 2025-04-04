import * as THREE from 'three';

/**
 * Extended THREE.Mesh with ShaderMaterial for advanced visualization effects
 */
export interface MeshWithShaderMaterial extends THREE.Mesh {
  material: THREE.ShaderMaterial & {
    uniforms: {
      [key: string]: {
        value: any;
      };
    };
  };
}

/**
 * Extended THREE.Object3D with material property for scene graph manipulation
 */
export interface Object3DWithMaterial extends THREE.Object3D {
  material?: THREE.Material & {
    uniforms?: {
      [key: string]: {
        value: any;
      };
    };
  };
}