export interface BrainVisualizationProps {
  patientId: string;
  height: number;
  showLabels?: boolean;
  interactive?: boolean;
  onRegionClick?: (regionId: string) => void;
}
