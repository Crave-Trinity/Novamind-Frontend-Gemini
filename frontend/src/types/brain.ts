/**
 * Types for Brain Visualization Components
 */

export type ThemeType = "sleek-dark" | "retro" | "wes" | "clinical";

export type RegionType =
  | "cortical"
  | "subcortical"
  | "cerebellum"
  | "brainstem";

export interface BrainRegion {
  id: string;
  name: string;
  position: [number, number, number];
  scale: number;
  color?: string;
  isActive: boolean;
  type: RegionType;
  metrics?: {
    activity: number;
    connectivity: number;
    volume: number;
  };
}

export interface NeuralConnection {
  id: string;
  sourceId: string;
  targetId: string;
  strength: number;
  type: "excitatory" | "inhibitory";
  active: boolean;
}

export interface BrainData {
  regions: BrainRegion[];
  connections: NeuralConnection[];
  metadata?: {
    patientId?: string;
    scanDate?: string;
    scanType?: string;
  };
}

export interface BrainVisualizationProps {
  /**
   * Brain data to visualize
   */
  brainData: BrainData;
  /**
   * Currently active brain regions
   */
  activeRegions?: string[];
  /**
   * Theme to use for visualization
   */
  theme?: ThemeType;
  /**
   * Whether to show connections between regions
   */
  showConnections?: boolean;
  /**
   * Size settings for the visualization
   */
  size?: {
    width?: string | number;
    height?: string | number;
  };
  /**
   * Callback when a region is clicked
   */
  onRegionClick?: (regionId: string) => void;
  /**
   * Callback when a connection is clicked
   */
  onConnectionClick?: (connectionId: string) => void;
  /**
   * Whether to auto-rotate the visualization
   */
  autoRotate?: boolean;
  /**
   * Camera position
   */
  cameraPosition?: [number, number, number];
  /**
   * Mode of visualization
   */
  mode?: "anatomical" | "functional" | "activity";
  /**
   * Class name for custom styling
   */
  className?: string;
}

export interface ThemeSettings {
  bgColor: string;
  glowIntensity: number;
  useBloom: boolean;
  activeRegionColor: string;
  inactiveRegionColor: string;
  excitationColor: string;
  inhibitionColor: string;
  regionOpacity: number;
  connectionOpacity: number;
}
