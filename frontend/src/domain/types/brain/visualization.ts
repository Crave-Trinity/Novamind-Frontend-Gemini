/**
 * NOVAMIND Neural-Safe Visualization Type Definitions
 * Brain visualization types with quantum-level type safety
 */

import { BrainModel, BrainRegion, NeuralConnection } from './models';

// Digital Twin visualization modes with clinical precision
export enum RenderMode {
  ANATOMICAL = 'anatomical',
  FUNCTIONAL = 'functional',
  CONNECTIVITY = 'connectivity',
  RISK = 'risk',
  TREATMENT_RESPONSE = 'treatment_response',
  NEUROTRANSMITTER = 'neurotransmitter',
  TEMPORAL_DYNAMICS = 'temporal_dynamics',
  NETWORK_ANALYSIS = 'network_analysis'
}

// Neural-safe visualization settings with mathematical precision
export interface VisualizationSettings {
  // Display settings
  showLabels: boolean;
  backgroundColor: string;
  cameraPosition: [number, number, number];
  fieldOfView: number;
  zoomLevel: number;
  
  // Region visualization
  regionOpacity: number;
  regionScale: number;
  inactiveRegionOpacity: number;
  highlightColor: string;
  selectionColor: string;
  
  // Connection visualization
  showConnections: boolean;
  connectionOpacity: number;
  connectionThickness: number;
  connectionColorMapping: 'strength' | 'type' | 'activity';
  minConnectionStrength: number;
  
  // Animation settings
  enableRotation: boolean;
  rotationSpeed: number;
  enablePulsation: boolean;
  pulsationIntensity: number;
  pulsationSpeed: number;
  
  // Rendering effects
  renderQuality: 'low' | 'medium' | 'high' | 'ultra';
  enableBloom: boolean;
  bloomIntensity: number;
  bloomThreshold: number;
  enableAmbientOcclusion: boolean;
  enableShadows: boolean;
  
  // Clinical visualization
  renderMode: RenderMode;
  activityColorScale: string[];
  riskColorScale: string[];
  treatmentResponseColorScale: string[];
  
  // Performance settings
  maxVisibleRegions: number;
  levelOfDetail: 'low' | 'medium' | 'high' | 'dynamic';
}

// Theme settings with sensory precision
export type ThemeOption = 'clinical' | 'dark' | 'high-contrast' | 'presentation' | 'research';

export interface ThemeSettings {
  name: ThemeOption;
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  regionBaseColor: string;
  activeRegionColor: string;
  connectionBaseColor: string;
  activeConnectionColor: string;
  uiBackgroundColor: string;
  uiTextColor: string;
  fontFamily: string;
  glowIntensity: number;
  useBloom: boolean;
}

// Theme settings map for all available themes
export const visualizationThemes: Record<ThemeOption, ThemeSettings> = {
  'clinical': {
    name: 'clinical',
    backgroundColor: '#FFFFFF',
    primaryColor: '#2C3E50',
    secondaryColor: '#3498DB',
    accentColor: '#E74C3C',
    textColor: '#2C3E50',
    regionBaseColor: '#3498DB',
    activeRegionColor: '#E74C3C',
    connectionBaseColor: '#95A5A6',
    activeConnectionColor: '#E67E22',
    uiBackgroundColor: '#F8F9FA',
    uiTextColor: '#2C3E50',
    fontFamily: 'Inter, system-ui, sans-serif',
    glowIntensity: 0,
    useBloom: false
  },
  'dark': {
    name: 'dark',
    backgroundColor: '#121212',
    primaryColor: '#6E64F0',
    secondaryColor: '#3CCFCF',
    accentColor: '#F06464',
    textColor: '#FFFFFF',
    regionBaseColor: '#6E64F0',
    activeRegionColor: '#F06464',
    connectionBaseColor: '#4A4A4A',
    activeConnectionColor: '#3CCFCF',
    uiBackgroundColor: '#1E1E1E',
    uiTextColor: '#FFFFFF',
    fontFamily: 'Inter, system-ui, sans-serif',
    glowIntensity: 0.8,
    useBloom: true
  },
  'high-contrast': {
    name: 'high-contrast',
    backgroundColor: '#000000',
    primaryColor: '#FFFFFF',
    secondaryColor: '#FFFF00',
    accentColor: '#FF0000',
    textColor: '#FFFFFF',
    regionBaseColor: '#FFFFFF',
    activeRegionColor: '#FFFF00',
    connectionBaseColor: '#888888',
    activeConnectionColor: '#FF0000',
    uiBackgroundColor: '#000000',
    uiTextColor: '#FFFFFF',
    fontFamily: 'Inter, system-ui, sans-serif',
    glowIntensity: 0.5,
    useBloom: true
  },
  'presentation': {
    name: 'presentation',
    backgroundColor: '#0A2463',
    primaryColor: '#3E92CC',
    secondaryColor: '#FFFAFF',
    accentColor: '#D8315B',
    textColor: '#FFFAFF',
    regionBaseColor: '#3E92CC',
    activeRegionColor: '#D8315B',
    connectionBaseColor: '#1E1B18',
    activeConnectionColor: '#FFFAFF',
    uiBackgroundColor: '#1E1B18',
    uiTextColor: '#FFFAFF',
    fontFamily: 'Inter, system-ui, sans-serif',
    glowIntensity: 0.6,
    useBloom: true
  },
  'research': {
    name: 'research',
    backgroundColor: '#F5F5F5',
    primaryColor: '#4D648D',
    secondaryColor: '#71A0D6',
    accentColor: '#CE796B',
    textColor: '#1F2041',
    regionBaseColor: '#4D648D',
    activeRegionColor: '#CE796B',
    connectionBaseColor: '#ACC6D9',
    activeConnectionColor: '#D1A39E',
    uiBackgroundColor: '#FFFFFF',
    uiTextColor: '#1F2041',
    fontFamily: 'Inter, system-ui, sans-serif',
    glowIntensity: 0.2,
    useBloom: false
  }
};

// Default visualization settings with clinical precision
export const defaultVisualizationSettings: VisualizationSettings = {
  showLabels: true,
  backgroundColor: '#121212',
  cameraPosition: [0, 0, 30],
  fieldOfView: 50,
  zoomLevel: 1,
  
  regionOpacity: 0.9,
  regionScale: 1,
  inactiveRegionOpacity: 0.6,
  highlightColor: '#F06464',
  selectionColor: '#3CCFCF',
  
  showConnections: true,
  connectionOpacity: 0.7,
  connectionThickness: 1,
  connectionColorMapping: 'strength',
  minConnectionStrength: 0.2,
  
  enableRotation: true,
  rotationSpeed: 0.5,
  enablePulsation: true,
  pulsationIntensity: 0.1,
  pulsationSpeed: 1,
  
  renderQuality: 'high',
  enableBloom: true,
  bloomIntensity: 1.5,
  bloomThreshold: 0.2,
  enableAmbientOcclusion: true,
  enableShadows: false,
  
  renderMode: RenderMode.ANATOMICAL,
  activityColorScale: ['#3498DB', '#2ECC71', '#F1C40F', '#E67E22', '#E74C3C'],
  riskColorScale: ['#2ECC71', '#F1C40F', '#E67E22', '#E74C3C', '#C0392B'],
  treatmentResponseColorScale: ['#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#3498DB'],
  
  maxVisibleRegions: 200,
  levelOfDetail: 'dynamic'
};

// Brain visualization props with neural-safe typing
export interface BrainVisualizationProps {
  brainModel: BrainModel;
  settings?: Partial<VisualizationSettings>;
  theme?: ThemeOption;
  activeRegionIds?: string[];
  selectedRegionId?: string;
  onRegionClick?: (region: BrainRegion) => void;
  onRegionHover?: (region: BrainRegion | null) => void;
  onConnectionClick?: (connection: NeuralConnection) => void;
  className?: string;
  width?: string | number;
  height?: string | number;
  showControls?: boolean;
  showLegend?: boolean;
  showStats?: boolean;
  disableInteraction?: boolean;
}

// Brain visualization state with discriminated union for type safety
export type BrainVisualizationState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; brainModel: BrainModel; processedData: ProcessedBrainData };

// Processed data for visualization with mathematical precision
export interface ProcessedBrainData {
  regions: ProcessedBrainRegion[];
  connections: ProcessedNeuralConnection[];
  centerOfMass: [number, number, number];
  boundingSphere: number;
  activeRegions: string[];
  stats: {
    regionCount: number;
    connectionCount: number;
    averageActivity: number;
    maxActivity: number;
    minActivity: number;
    densityScore: number;
  };
}

// Processed brain region with rendering data
export interface ProcessedBrainRegion extends BrainRegion {
  renderPosition: [number, number, number];
  renderColor: string;
  renderSize: number;
  renderOpacity: number;
  isActive: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  connectionCount: number;
  normalizedActivity: number;
}

// Processed neural connection with rendering data
export interface ProcessedNeuralConnection extends NeuralConnection {
  sourcePosition: [number, number, number];
  targetPosition: [number, number, number];
  renderColor: string;
  renderThickness: number;
  renderOpacity: number;
  isActive: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  normalizedStrength: number;
}

// Type guard for theme option
export function isValidTheme(theme: unknown): theme is ThemeOption {
  return typeof theme === 'string' && 
    Object.keys(visualizationThemes).includes(theme as ThemeOption);
}

// Type guard for render mode
export function isValidRenderMode(mode: unknown): mode is RenderMode {
  return typeof mode === 'string' && 
    Object.values(RenderMode).includes(mode as RenderMode);
}
