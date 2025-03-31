import * as THREE from "three";

declare module "three" {
  export interface ShaderMaterial {
    uniforms: {
      [key: string]: {
        value: any;
      };
    };
  }

  // Removed conflicting Mesh interface declaration
  // export interface Mesh {
  //   material: THREE.Material | THREE.Material[];
  //   geometry: THREE.BufferGeometry;
  // }
}

// Neural-specific shader material
export interface NeuralShaderMaterial extends THREE.ShaderMaterial {
  uniforms: {
    time: { value: number };
    color: { value: THREE.Color | THREE.Vector3 };
    intensity: { value: number };
    isActive: { value: boolean };
    [key: string]: { value: any };
  };
}

// Type for Object3D with material property
export type Object3DWithMaterial = THREE.Object3D & {
  material: NeuralShaderMaterial;
};

// Type for Mesh with shader material
export type MeshWithShaderMaterial = THREE.Mesh & {
  material: NeuralShaderMaterial;
};
