import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Instances, Instance, useAnimations } from "@react-three/drei";
import { EffectComposer, Bloom, Outline } from "@react-three/postprocessing";
import * as THREE from "three";
import { auditLogService, AuditEventType } from "@infrastructure/services/AuditLogService";
import { useTheme } from "@application/hooks/useTheme";

interface BrainRegion {
  id: string;
  name: string;
  activity: number;
  connections: string[];
}

interface BrainModelContainerProps {
  regions: BrainRegion[];
  activeRegions: string[];
  viewMode: "normal" | "activity" | "connections";
  rotationSpeed: number;
  onRegionClick: (regionId: string) => void;
}

// BrainModel component manages the actual 3D model of the brain
const BrainModel: React.FC<{
  regions: BrainRegion[];
  activeRegions: string[];
  viewMode: "normal" | "activity" | "connections";
  rotationSpeed: number;
  onRegionClick: (regionId: string) => void;
}> = ({ regions, activeRegions, viewMode, rotationSpeed, onRegionClick }) => {
  const { theme } = useTheme();
  const { scene, camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [instancesReady, setInstancesReady] = useState(false);
  
  // References for neural node instances
  const neuronRefs = useRef<{ [key: string]: THREE.InstancedMesh }>({});
  
  // Calculate positions for brain regions
  const regionPositions = useMemo(() => {
    // Simplified brain region layout algorithm
    // In a real app, this would use actual anatomical positions
    const positions: { [key: string]: THREE.Vector3 } = {};
    
    // Create a layout resembling a brain
    const radius = 2.5;
    const spacing = Math.PI * 2 / regions.length;
    
    regions.forEach((region, i) => {
      // Create a 3D spherical distribution
      const phi = Math.acos(-1 + (2 * i) / regions.length);
      const theta = spacing * i;
      
      // Vary positions slightly to create a more natural distribution
      const x = radius * Math.sin(phi) * Math.cos(theta) + (Math.random() - 0.5) * 0.5;
      const y = radius * Math.sin(phi) * Math.sin(theta) + (Math.random() - 0.5) * 0.5;
      const z = radius * Math.cos(phi) + (Math.random() - 0.5) * 0.5;
      
      positions[region.id] = new THREE.Vector3(x, y, z);
    });
    
    return positions;
  }, [regions]);
  
  // Colors based on activity level and theme
  const getRegionColor = useCallback((region: BrainRegion, isActive: boolean, isHovered: boolean) => {
    const isDark = theme === 'dark';
    
    // Base color when not active
    if (!isActive && !isHovered) {
      return isDark ? new THREE.Color(0x444444) : new THREE.Color(0xCCCCCC);
    }
    
    // Hover color
    if (isHovered) {
      return new THREE.Color(0xFFB638);
    }
    
    // Activity-based colors in "activity" mode
    if (viewMode === "activity") {
      if (region.activity < 0) {
        // Inhibited/negative activity
        return new THREE.Color(0x3498DB).multiplyScalar(Math.abs(region.activity) + 0.5);
      } else if (region.activity > 0.8) {
        // High activity
        return new THREE.Color(0xE74C3C).multiplyScalar(region.activity + 0.5);
      } else {
        // Medium activity
        return new THREE.Color(0xF1C40F).multiplyScalar(region.activity + 0.5);
      }
    }
    
    // Default active color for other view modes
    return new THREE.Color(0x2ECC71);
  }, [theme, viewMode]);
  
  // Draw connections between regions
  const connectionLines = useMemo(() => {
    if (viewMode !== "connections") return [];
    
    const lines: JSX.Element[] = [];
    let lineIndex = 0;
    
    regions.forEach(region => {
      const sourcePos = regionPositions[region.id];
      
      // Only show connections for active regions
      if (activeRegions.includes(region.id)) {
        region.connections.forEach(targetId => {
          const targetPos = regionPositions[targetId];
          
          // Skip if target region is not in the active list
          if (!activeRegions.includes(targetId)) return;
          
          if (sourcePos && targetPos) {
            // Calculate connection line vertices
            const points = [
              sourcePos.clone(),
              targetPos.clone()
            ];
            
            // Create line geometry
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            
            // Connection color based on source region activity
            const connectionStrength = (region.activity + 1) / 2; // normalize to 0-1
            
            lines.push(
              <line key={`line-${lineIndex++}`} geometry={lineGeometry}>
                <lineBasicMaterial 
                  attach="material" 
                  color={new THREE.Color(0x3498DB).lerp(new THREE.Color(0xE74C3C), connectionStrength)}
                  linewidth={1}
                  opacity={0.7}
                  transparent
                />
              </line>
            );
          }
        });
      }
    });
    
    return lines;
  }, [regions, activeRegions, regionPositions, viewMode]);
  
  // Handle automatic rotation
  useFrame((state, delta) => {
    if (groupRef.current && rotationSpeed > 0) {
      groupRef.current.rotation.y += delta * rotationSpeed * 0.5;
    }
  });
  
  // Handle pointer events
  const handlePointerOver = (e: any, regionId: string) => {
    e.stopPropagation();
    setHovered(regionId);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = () => {
    setHovered(null);
    document.body.style.cursor = 'auto';
  };
  
  const handleClick = (e: any, regionId: string) => {
    e.stopPropagation();
    onRegionClick(regionId);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
      // Dispose of any resources that need cleanup
      Object.values(neuronRefs.current).forEach(instance => {
        if (instance && instance.geometry) {
          instance.geometry.dispose();
        }
        if (instance && instance.material) {
          if (Array.isArray(instance.material)) {
            instance.material.forEach(m => m.dispose());
          } else {
            instance.material.dispose();
          }
        }
      });
    };
  }, []);
  
  // Log render completed for HIPAA audit
  useEffect(() => {
    if (instancesReady) {
      auditLogService.log(AuditEventType.BRAIN_MODEL_VIEW, {
        action: "brain_model_rendered",
        details: `Brain model rendered with ${regions.length} regions, ${activeRegions.length} active`,
        result: "success",
      });
    }
  }, [instancesReady, regions.length, activeRegions.length]);
  
  // Instance render the neural nodes
  const handleInstancesReady = () => {
    setInstancesReady(true);
  };
  
  return (
    <group ref={groupRef}>
      {/* Environment lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.7} />
      <Environment preset="sunset" />
      
      {/* Connection lines between regions */}
      <group>{connectionLines}</group>
      
      {/* Neural nodes rendered with instancing for performance */}
      <Instances limit={regions.length} range={regions.length} onInstancesReady={handleInstancesReady}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial />
        
        {regions.map((region) => {
          const position = regionPositions[region.id];
          const isActive = activeRegions.includes(region.id);
          const isHovered = hovered === region.id;
          const scale = isActive || isHovered ? 1.2 : 1.0;
          
          return position ? (
            <Instance 
              key={region.id}
              ref={(instance: any) => { if (instance) neuronRefs.current[region.id] = instance; }}
              position={[position.x, position.y, position.z]}
              scale={[scale, scale, scale]}
              color={getRegionColor(region, isActive, isHovered)}
              onPointerOver={(e) => handlePointerOver(e, region.id)}
              onPointerOut={handlePointerOut}
              onClick={(e) => handleClick(e, region.id)}
            />
          ) : null;
        })}
      </Instances>
    </group>
  );
};

/**
 * Brain Model Container
 * 
 * High-performance 3D visualization of neural network activity
 * using Three.js with optimized rendering and instance rendering.
 * 
 * Implements various visualization modes and interactive capabilities
 * while maintaining strict resource management.
 */
const BrainModelContainer: React.FC<BrainModelContainerProps> = ({
  regions,
  activeRegions,
  viewMode,
  rotationSpeed,
  onRegionClick
}) => {
  // Log component mount for HIPAA audit
  useEffect(() => {
    auditLogService.log(AuditEventType.BRAIN_MODEL_VIEW, {
      action: "brain_container_mounted",
      details: "3D brain visualization container mounted",
      result: "success"
    });
    
    return () => {
      auditLogService.log(AuditEventType.BRAIN_MODEL_VIEW, {
        action: "brain_container_unmounted",
        details: "3D brain visualization container unmounted",
        result: "success"
      });
    };
  }, []);
  
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 2]} // Optimize for performance by limiting resolution scaling
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <color attach="background" args={["#f8fafc"]} />
        
        {/* Main brain model */}
        <BrainModel
          regions={regions}
          activeRegions={activeRegions}
          viewMode={viewMode}
          rotationSpeed={rotationSpeed}
          onRegionClick={onRegionClick}
        />
        
        {/* Controls */}
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          autoRotate={false}
          makeDefault
        />
        
        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom intensity={0.3} luminanceThreshold={0.6} luminanceSmoothing={0.4} />
          <Outline
            selection={regions
              .filter(r => activeRegions.includes(r.id))
              .map(r => {
                const ref = neuronRefs.current?.[r.id];
                return ref as unknown as THREE.Object3D;
              })
              .filter(Boolean)}
            visibleEdgeColor={0x22CC77}
            hiddenEdgeColor={0x444444}
            edgeStrength={3}
            pulse={0.5}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default React.memo(BrainModelContainer);