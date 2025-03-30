"""
Visualization preprocessor module for preparing neurotransmitter data for visualization.

This module provides data transformation and formatting services for the
frontend visualization components, ensuring efficient and optimized
data structures for 3D brain visualizations.
"""
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Set, Optional, Any, Union
import uuid
from uuid import UUID

from app.domain.entities.digital_twin_enums import (
    BrainRegion, 
    Neurotransmitter,
    NeurotransmitterState,
    BrainNetwork
)
from app.domain.entities.temporal_neurotransmitter_mapping import TemporalNeurotransmitterMapping


class VisualizationPreprocessor:
    """
    Service that transforms neurotransmitter data for optimized visualization.
    
    This class converts raw neurotransmitter data from the TemporalNeurotransmitterMapping
    into formats optimized for the frontend visualization components, including:
    - 3D brain models
    - Time series charts
    - Heat maps
    - Network connectivity diagrams
    """
    
    def __init__(self):
        """Initialize a new visualization preprocessor."""
        # Mapping of brain regions to 3D coordinates (x, y, z)
        self.region_coordinates: Dict[BrainRegion, Tuple[float, float, float]] = {
            BrainRegion.PREFRONTAL_CORTEX: (0.0, 0.8, 0.4),
            BrainRegion.AMYGDALA: (0.3, 0.0, 0.0),
            BrainRegion.HIPPOCAMPUS: (0.3, -0.1, 0.1),
            BrainRegion.NUCLEUS_ACCUMBENS: (0.1, 0.3, -0.2),
            BrainRegion.VENTRAL_TEGMENTAL_AREA: (0.0, -0.3, -0.1),
            BrainRegion.RAPHE_NUCLEI: (0.0, -0.5, -0.2),
            BrainRegion.LOCUS_COERULEUS: (-0.1, -0.6, -0.1),
            BrainRegion.STRIATUM: (0.2, 0.2, 0.0),
            BrainRegion.SUBSTANTIA_NIGRA: (0.0, -0.4, -0.2),
            BrainRegion.HYPOTHALAMUS: (0.0, 0.0, -0.1),
            BrainRegion.THALAMUS: (0.0, 0.1, 0.2),
            BrainRegion.INSULA: (0.4, 0.2, 0.2),
            BrainRegion.ANTERIOR_CINGULATE_CORTEX: (0.0, 0.4, 0.3),
            BrainRegion.ORBITOFRONTAL_CORTEX: (0.0, 0.6, 0.0),
            BrainRegion.PARIETAL_CORTEX: (-0.3, 0.4, 0.5),
            BrainRegion.TEMPORAL_CORTEX: (0.5, 0.0, 0.0),
            BrainRegion.OCCIPITAL_CORTEX: (-0.5, -0.2, 0.2),
            BrainRegion.BASAL_GANGLIA: (0.2, 0.1, 0.1),
            BrainRegion.CEREBELLUM: (-0.2, -0.7, 0.0),
            BrainRegion.BRAIN_STEM: (0.0, -0.7, -0.3),
        }
        
        # Connectivity between brain regions (strength from 0.0 to 1.0)
        self.region_connectivity: Dict[BrainRegion, Dict[BrainRegion, float]] = self._initialize_connectivity()
        
        # Color mapping for neurotransmitters (hex colors)
        self.neurotransmitter_colors: Dict[Neurotransmitter, str] = {
            Neurotransmitter.SEROTONIN: "#FFA500",   # Orange
            Neurotransmitter.DOPAMINE: "#FF2D55",    # Red
            Neurotransmitter.NOREPINEPHRINE: "#007AFF",  # Blue
            Neurotransmitter.GABA: "#5856D6",        # Purple
            Neurotransmitter.GLUTAMATE: "#FF9500",   # Orange-yellow
            Neurotransmitter.ACETYLCHOLINE: "#4CD964",  # Green
            Neurotransmitter.ENDORPHINS: "#FF3B30",  # Bright red
            Neurotransmitter.SUBSTANCE_P: "#FF2D55", # Pink-red
            Neurotransmitter.OXYTOCIN: "#AF52DE",    # Purple
            Neurotransmitter.HISTAMINE: "#FF9500",   # Orange
            Neurotransmitter.GLYCINE: "#5AC8FA",     # Light blue
            Neurotransmitter.ADENOSINE: "#34C759",   # Green
        }
        
        # Brain networks
        self.brain_networks: Dict[BrainNetwork, List[BrainRegion]] = self._initialize_networks()
    
    def _initialize_connectivity(self) -> Dict[BrainRegion, Dict[BrainRegion, float]]:
        """
        Initialize the connectivity map between brain regions.
        
        Returns:
            Dictionary mapping source regions to target regions with connection strength
        """
        connectivity: Dict[BrainRegion, Dict[BrainRegion, float]] = {}
        
        # Initialize all regions with empty connectivity
        for region in BrainRegion:
            connectivity[region] = {}
        
        # Define key connections
        # Prefrontal connections
        connectivity[BrainRegion.PREFRONTAL_CORTEX][BrainRegion.ANTERIOR_CINGULATE_CORTEX] = 0.8
        connectivity[BrainRegion.PREFRONTAL_CORTEX][BrainRegion.ORBITOFRONTAL_CORTEX] = 0.9
        connectivity[BrainRegion.PREFRONTAL_CORTEX][BrainRegion.STRIATUM] = 0.7
        connectivity[BrainRegion.PREFRONTAL_CORTEX][BrainRegion.THALAMUS] = 0.6
        
        # Limbic system
        connectivity[BrainRegion.AMYGDALA][BrainRegion.HIPPOCAMPUS] = 0.7
        connectivity[BrainRegion.AMYGDALA][BrainRegion.HYPOTHALAMUS] = 0.6
        connectivity[BrainRegion.AMYGDALA][BrainRegion.PREFRONTAL_CORTEX] = 0.5
        
        # Reward pathway
        connectivity[BrainRegion.VENTRAL_TEGMENTAL_AREA][BrainRegion.NUCLEUS_ACCUMBENS] = 0.9
        connectivity[BrainRegion.VENTRAL_TEGMENTAL_AREA][BrainRegion.PREFRONTAL_CORTEX] = 0.6
        connectivity[BrainRegion.NUCLEUS_ACCUMBENS][BrainRegion.PREFRONTAL_CORTEX] = 0.5
        
        # More connections would be defined here in a complete implementation
        
        return connectivity
    
    def _initialize_networks(self) -> Dict[BrainNetwork, List[BrainRegion]]:
        """
        Initialize brain networks with their constituent regions.
        
        Returns:
            Dictionary mapping networks to lists of brain regions
        """
        networks: Dict[BrainNetwork, List[BrainRegion]] = {}
        
        # Default Mode Network
        networks[BrainNetwork.DEFAULT_MODE] = [
            BrainRegion.PREFRONTAL_CORTEX,
            BrainRegion.ANTERIOR_CINGULATE_CORTEX,
            BrainRegion.PARIETAL_CORTEX,
            BrainRegion.TEMPORAL_CORTEX,
            BrainRegion.HIPPOCAMPUS
        ]
        
        # Salience Network
        networks[BrainNetwork.SALIENCE] = [
            BrainRegion.ANTERIOR_CINGULATE_CORTEX,
            BrainRegion.INSULA,
            BrainRegion.AMYGDALA
        ]
        
        # Executive Control Network
        networks[BrainNetwork.EXECUTIVE_CONTROL] = [
            BrainRegion.PREFRONTAL_CORTEX,
            BrainRegion.ANTERIOR_CINGULATE_CORTEX,
            BrainRegion.PARIETAL_CORTEX
        ]
        
        # Reward Network
        networks[BrainNetwork.REWARD] = [
            BrainRegion.NUCLEUS_ACCUMBENS,
            BrainRegion.VENTRAL_TEGMENTAL_AREA,
            BrainRegion.ORBITOFRONTAL_CORTEX,
            BrainRegion.PREFRONTAL_CORTEX
        ]
        
        # Fear Network
        networks[BrainNetwork.FEAR] = [
            BrainRegion.AMYGDALA,
            BrainRegion.HYPOTHALAMUS,
            BrainRegion.ANTERIOR_CINGULATE_CORTEX,
            BrainRegion.LOCUS_COERULEUS
        ]
        
        # Memory Network
        networks[BrainNetwork.MEMORY] = [
            BrainRegion.HIPPOCAMPUS,
            BrainRegion.PREFRONTAL_CORTEX,
            BrainRegion.TEMPORAL_CORTEX
        ]
        
        return networks
    
    def prepare_brain_visualization_data(
        self,
        mapping: TemporalNeurotransmitterMapping,
        neurotransmitter: Optional[Neurotransmitter] = None,
        reference_time: Optional[datetime] = None,
        highlighted_regions: Optional[List[BrainRegion]] = None
    ) -> Dict[str, Any]:
        """
        Prepare data for 3D brain visualization.
        
        Args:
            mapping: The temporal neurotransmitter mapping to visualize
            neurotransmitter: Optional specific neurotransmitter to visualize
            reference_time: Optional reference time for data (defaults to latest)
            highlighted_regions: Optional list of regions to highlight
            
        Returns:
            Dictionary with visualization data
        """
        # Default to visualizing serotonin if not specified
        nt = neurotransmitter or Neurotransmitter.SEROTONIN
        
        # Data for brain regions
        regions_data = []
        
        # Process each brain region
        for region in BrainRegion:
            # Skip if region doesn't have coordinates defined
            if region not in self.region_coordinates:
                continue
            
            # Get coordinates
            coordinates = self.region_coordinates[region]
            
            # Get neurotransmitter level
            level = mapping.get_current_level(nt, region, reference_time) or 0.5
            
            # Get state
            state = mapping.get_neurotransmitter_state(nt, region, reference_time)
            
            # Calculate color based on neurotransmitter and level
            base_color = self.neurotransmitter_colors.get(nt, "#FFFFFF")
            
            # Determine if region is highlighted
            is_highlighted = highlighted_regions and region in highlighted_regions
            
            # Add region data
            regions_data.append({
                "id": region.value,
                "name": region.value.replace("_", " ").title(),
                "coordinates": coordinates,
                "level": level,
                "state": state.value,
                "color": base_color,
                "highlighted": is_highlighted,
                "size": 0.3 + (level * 0.2)  # Size varies based on level
            })
        
        # Generate connection data
        connections_data = []
        
        # Only include strong connections
        for source, targets in self.region_connectivity.items():
            for target, strength in targets.items():
                # Skip weak connections
                if strength < 0.5:
                    continue
                
                # Skip if either region is missing coordinates
                if source not in self.region_coordinates or target not in self.region_coordinates:
                    continue
                
                # Get source and target data
                source_data = next((r for r in regions_data if r["id"] == source.value), None)
                target_data = next((r for r in regions_data if r["id"] == target.value), None)
                
                if source_data and target_data:
                    # Calculate connection properties based on neurotransmitter levels
                    source_level = source_data["level"]
                    target_level = target_data["level"]
                    
                    # Activity level affects connection visibility
                    activity = (source_level + target_level) / 2 * strength
                    
                    # Only show active connections
                    if activity < 0.3:
                        continue
                    
                    connections_data.append({
                        "source": source.value,
                        "target": target.value,
                        "strength": strength,
                        "activity": activity,
                        "coordinates": [source_data["coordinates"], target_data["coordinates"]]
                    })
        
        # Prepare network data
        networks_data = []
        
        for network, regions in self.brain_networks.items():
            # Calculate average neurotransmitter level in this network
            network_levels = []
            for region in regions:
                level = mapping.get_current_level(nt, region, reference_time)
                if level is not None:
                    network_levels.append(level)
            
            # Skip networks with no data
            if not network_levels:
                continue
            
            # Calculate average level
            avg_level = sum(network_levels) / len(network_levels)
            
            networks_data.append({
                "id": network.value,
                "name": network.value.replace("_", " ").title(),
                "regions": [r.value for r in regions],
                "level": avg_level,
                "dominant": avg_level > 0.7  # Networks with high activity are dominant
            })
        
        # Return the prepared data
        return {
            "neurotransmitter": nt.value,
            "color": self.neurotransmitter_colors.get(nt, "#FFFFFF"),
            "timestamp": reference_time.isoformat() if reference_time else None,
            "regions": regions_data,
            "connections": connections_data,
            "networks": networks_data
        }
    
    def prepare_time_series_data(
        self,
        mapping: TemporalNeurotransmitterMapping,
        neurotransmitter: Neurotransmitter,
        brain_region: BrainRegion,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        include_baseline: bool = False
    ) -> Dict[str, Any]:
        """
        Prepare time series data for charts.
        
        Args:
            mapping: The temporal neurotransmitter mapping
            neurotransmitter: Target neurotransmitter
            brain_region: Target brain region
            start_time: Optional start time (defaults to earliest data)
            end_time: Optional end time (defaults to latest data)
            include_baseline: Whether to include baseline for comparison
            
        Returns:
            Dictionary with time series visualization data
        """
        # Get the sequence for this neurotransmitter and region
        sequence = mapping.get_measurement_sequence(neurotransmitter, brain_region)
        
        if not sequence or not sequence.events:
            return {
                "neurotransmitter": neurotransmitter.value,
                "brain_region": brain_region.value,
                "color": self.neurotransmitter_colors.get(neurotransmitter, "#FFFFFF"),
                "data_points": [],
                "statistics": {},
                "baseline": None
            }
        
        # Determine time range
        if not start_time:
            start_time = sequence.events[0].timestamp
        
        if not end_time:
            end_time = sequence.events[-1].timestamp
        
        # Get events in range
        events_in_range = sequence.get_events_in_range(start_time, end_time)
        
        # Prepare data points
        data_points = []
        for event in events_in_range:
            data_points.append({
                "timestamp": event.timestamp.isoformat(),
                "value": event.value,
                "metadata": event.metadata
            })
        
        # Get statistics
        stats = sequence.get_statistics()
        
        # Add trend
        trend = sequence.get_trend()
        
        # Get baseline data if requested
        baseline = None
        if include_baseline:
            # Use first 20% of data as baseline
            cutoff_idx = max(1, len(events_in_range) // 5)
            
            if cutoff_idx < len(events_in_range):
                baseline_events = events_in_range[:cutoff_idx]
                baseline_values = [e.value for e in baseline_events]
                
                if baseline_values:
                    baseline = {
                        "mean": sum(baseline_values) / len(baseline_values),
                        "start": baseline_events[0].timestamp.isoformat(),
                        "end": baseline_events[-1].timestamp.isoformat()
                    }
        
        return {
            "neurotransmitter": neurotransmitter.value,
            "brain_region": brain_region.value,
            "color": self.neurotransmitter_colors.get(neurotransmitter, "#FFFFFF"),
            "data_points": data_points,
            "statistics": stats,
            "trend": trend,
            "baseline": baseline
        }
    
    def prepare_heatmap_data(
        self,
        mapping: TemporalNeurotransmitterMapping,
        neurotransmitters: Optional[List[Neurotransmitter]] = None,
        brain_regions: Optional[List[BrainRegion]] = None,
        reference_time: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Prepare heatmap data for visualizing neurotransmitter levels across brain regions.
        
        Args:
            mapping: The temporal neurotransmitter mapping
            neurotransmitters: List of neurotransmitters to include (defaults to all)
            brain_regions: List of brain regions to include (defaults to all)
            reference_time: Optional reference time (defaults to latest)
            
        Returns:
            Dictionary with heatmap visualization data
        """
        # Default to all neurotransmitters if not specified
        target_nts = neurotransmitters or list(Neurotransmitter)
        
        # Default to all brain regions if not specified
        target_regions = brain_regions or list(BrainRegion)
        
        # Prepare the data rows
        rows = []
        
        for nt in target_nts:
            row_data = []
            
            for region in target_regions:
                # Get level at reference time
                level = mapping.get_current_level(nt, region, reference_time) or 0.0
                
                # Get state
                state = mapping.get_neurotransmitter_state(nt, region, reference_time)
                
                row_data.append({
                    "region": region.value,
                    "level": level,
                    "state": state.value
                })
            
            rows.append({
                "neurotransmitter": nt.value,
                "color": self.neurotransmitter_colors.get(nt, "#FFFFFF"),
                "data": row_data
            })
        
        # Prepare the column headers
        columns = [region.value.replace("_", " ").title() for region in target_regions]
        
        return {
            "rows": rows,
            "columns": columns,
            "timestamp": reference_time.isoformat() if reference_time else None
        }


class NeurotransmitterVisualizationPreprocessor(VisualizationPreprocessor):
    """
    Specialized preprocessor for neurotransmitter visualization.
    
    This class extends the base visualization preprocessor with specialized
    methods for processing neurotransmitter data for the frontend visualization
    components, including additional optimizations and neurotransmitter-specific
    transformations.
    """
    
    def __init__(self, color_palette: Optional[Dict[Neurotransmitter, str]] = None):
        """
        Initialize a neurotransmitter visualization preprocessor.
        
        Args:
            color_palette: Optional custom color palette for neurotransmitters
        """
        super().__init__()
        
        # Override default colors if provided
        if color_palette:
            self.neurotransmitter_colors.update(color_palette)
        
        # Scaling factors for different visualization types
        self._visualization_scaling_factors = {
            "3d_model": 1.0,
            "heatmap": 1.2,
            "network": 0.8,
            "time_series": 1.0
        }
    
    def prepare_neurotransmitter_network_data(
        self,
        mapping: TemporalNeurotransmitterMapping,
        reference_time: Optional[datetime] = None,
        receptor_threshold: float = 0.5
    ) -> Dict[str, Any]:
        """
        Prepare data for visualizing the neurotransmitter signaling network.
        
        Args:
            mapping: The temporal neurotransmitter mapping
            reference_time: Optional reference time (defaults to latest)
            receptor_threshold: Minimum receptor density to include
            
        Returns:
            Dictionary with network visualization data
        """
        # Nodes represent neurotransmitters
        nodes = []
        
        # Edges represent receptor relationships
        edges = []
        
        # Process each neurotransmitter
        for nt in Neurotransmitter:
            # Basic node data
            node = {
                "id": nt.value,
                "name": nt.value.replace("_", " ").title(),
                "color": self.neurotransmitter_colors.get(nt, "#FFFFFF"),
                "type": "neurotransmitter"
            }
            
            # Calculate average level across brain regions
            levels = []
            for region in BrainRegion:
                level = mapping.get_current_level(nt, region, reference_time)
                if level is not None:
                    levels.append(level)
            
            if levels:
                avg_level = sum(levels) / len(levels)
                node["level"] = avg_level
                node["size"] = 10 + (avg_level * 15)  # Size based on level
            else:
                node["level"] = 0.0
                node["size"] = 10
            
            nodes.append(node)
            
            # Create edges for receptor relationships
            receptor_regions = []
            for region in BrainRegion:
                affinity = mapping.analyze_receptor_affinity(nt, region)
                if affinity >= receptor_threshold:
                    receptor_regions.append((region, affinity))
            
            # Add edges for each receptor region
            for region, affinity in receptor_regions:
                # Look for other neurotransmitters in this region
                for other_nt in Neurotransmitter:
                    if other_nt == nt:
                        continue
                    
                    other_level = mapping.get_current_level(other_nt, region, reference_time)
                    if other_level and other_level > 0.2:
                        # This region has both neurotransmitters, create an edge
                        edge = {
                            "source": nt.value,
                            "target": other_nt.value,
                            "value": (affinity + other_level) / 2,
                            "label": f"Via {region.value.replace('_', ' ').title()}"
                        }
                        
                        # Check if this edge already exists
                        duplicate = False
                        for existing in edges:
                            if (existing["source"] == edge["source"] and
                                existing["target"] == edge["target"]):
                                duplicate = True
                                break
                        
                        if not duplicate:
                            edges.append(edge)
        
        return {
            "nodes": nodes,
            "edges": edges,
            "timestamp": reference_time.isoformat() if reference_time else None
        }
    
    def optimize_for_visualization_type(
        self,
        data: Dict[str, Any],
        visualization_type: str,
        detail_level: str = "high"
    ) -> Dict[str, Any]:
        """
        Optimize the data structure for a specific visualization type.
        
        Args:
            data: The visualization data to optimize
            visualization_type: Type of visualization (3d_model, heatmap, network, time_series)
            detail_level: Level of detail (low, medium, high)
            
        Returns:
            Optimized data structure
        """
        # Apply scaling based on visualization type
        scaling = self._visualization_scaling_factors.get(visualization_type, 1.0)
        
        # Apply detail level filtering
        if detail_level == "low":
            # Remove detailed metadata
            if "regions" in data:
                for region in data["regions"]:
                    if "metadata" in region:
                        region.pop("metadata", None)
            
            # Simplify time series by sampling
            if "data_points" in data and len(data["data_points"]) > 20:
                sampling_rate = len(data["data_points"]) // 20
                data["data_points"] = data["data_points"][::sampling_rate]
        
        elif detail_level == "medium":
            # Apply moderate optimizations
            pass
        
        # Apply type-specific optimizations
        if visualization_type == "3d_model":
            # Scale node sizes for 3D
            if "regions" in data:
                for region in data["regions"]:
                    if "size" in region:
                        region["size"] *= scaling
        
        elif visualization_type == "heatmap":
            # Normalize values for heatmap
            pass
        
        elif visualization_type == "network":
            # Scale node sizes and edge thicknesses for network
            if "nodes" in data:
                for node in data["nodes"]:
                    if "size" in node:
                        node["size"] *= scaling
        
        return data
    
    def create_comparative_visualization(
        self,
        before_mapping: TemporalNeurotransmitterMapping,
        after_mapping: TemporalNeurotransmitterMapping,
        neurotransmitter: Neurotransmitter,
        before_time: Optional[datetime] = None,
        after_time: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Create a visualization comparing before and after states.
        
        Args:
            before_mapping: Mapping representing the before state
            after_mapping: Mapping representing the after state
            neurotransmitter: Target neurotransmitter
            before_time: Optional reference time for before state
            after_time: Optional reference time for after state
            
        Returns:
            Comparative visualization data
        """
        # Prepare data for before state
        before_data = self.prepare_brain_visualization_data(
            before_mapping, neurotransmitter, before_time
        )
        
        # Prepare data for after state
        after_data = self.prepare_brain_visualization_data(
            after_mapping, neurotransmitter, after_time
        )
        
        # Create a differential view
        diff_data = {
            "neurotransmitter": neurotransmitter.value,
            "color": self.neurotransmitter_colors.get(neurotransmitter, "#FFFFFF"),
            "regions": []
        }
        
        # Map regions by ID for easier lookup
        before_regions = {r["id"]: r for r in before_data["regions"]}
        after_regions = {r["id"]: r for r in after_data["regions"]}
        
        # Calculate differences for each region
        for region_id in set(before_regions.keys()) | set(after_regions.keys()):
            before_region = before_regions.get(region_id, {"level": 0.0})
            after_region = after_regions.get(region_id, {"level": 0.0})
            
            # Calculate difference
            level_diff = after_region.get("level", 0.0) - before_region.get("level", 0.0)
            
            # Only include regions with significant changes
            if abs(level_diff) >= 0.1:
                # Use data from after_region as base
                diff_region = after_region.copy() if region_id in after_regions else before_region.copy()
                
                # Add differential data
                diff_region["change"] = level_diff
                diff_region["percent_change"] = (
                    (level_diff / before_region["level"]) * 100
                    if before_region["level"] > 0 else float('inf')
                )
                
                # Determine change direction
                if level_diff > 0:
                    diff_region["direction"] = "increase"
                elif level_diff < 0:
                    diff_region["direction"] = "decrease"
                else:
                    diff_region["direction"] = "unchanged"
                
                diff_data["regions"].append(diff_region)
        
        return {
            "before": before_data,
            "after": after_data,
            "difference": diff_data,
            "before_time": before_time.isoformat() if before_time else None,
            "after_time": after_time.isoformat() if after_time else None
        }


class NeurotransmitterEffectVisualizer:
    """
    Specialized class for visualizing neurotransmitter effects.
    
    This class provides methods for visualizing the effects of neurotransmitters,
    including comparison of effects between different neurotransmitters and over time.
    """
    
    def __init__(self):
        """Initialize a new neurotransmitter effect visualizer."""
        # Color mapping for different effect magnitudes
        self.effect_magnitude_colors = {
            "large": "#FF3B30",  # Red for large effects
            "medium": "#FF9500", # Orange for medium effects
            "small": "#4CD964",  # Green for small effects
            "minimal": "#5AC8FA" # Blue for minimal effects
        }
        
        # Default timeline steps for effect prediction
        self.default_timeline_steps = 10
    
    def generate_effect_comparison(self, effects: List) -> Dict[str, Any]:
        """
        Generate a comparison of multiple neurotransmitter effects.
        
        Args:
            effects: List of NeurotransmitterEffect objects to compare
            
        Returns:
            Dictionary with comparison visualization data
        """
        if not effects:
            return {"effects": [], "comparison_metrics": {}}
        
        # Process each effect
        effect_data = []
        for effect in effects:
            effect_data.append({
                "neurotransmitter": effect.neurotransmitter.value,
                "effect_size": effect.effect_size,
                "confidence_interval": effect.confidence_interval,
                "p_value": effect.p_value,
                "is_significant": effect.is_statistically_significant,
                "magnitude": effect.effect_magnitude,
                "direction": effect.direction,
                "clinical_significance": effect.clinical_significance.value
            })
        
        # Sort effects by absolute effect size
        effect_data.sort(key=lambda x: abs(x["effect_size"]), reverse=True)
        
        # Generate comparison metrics
        comparison_metrics = {}
        
        # Find most significant effect
        significant_effects = [e for e in effect_data if e["is_significant"]]
        if significant_effects:
            comparison_metrics["most_significant"] = significant_effects[0]["neurotransmitter"]
        
        # Find largest effect
        if effect_data:
            comparison_metrics["largest_effect"] = effect_data[0]["neurotransmitter"]
        
        # Generate magnitude ranking
        comparison_metrics["magnitude_ranking"] = [e["neurotransmitter"] for e in effect_data]
        
        return {
            "effects": effect_data,
            "comparison_metrics": comparison_metrics
        }
    
    def generate_effect_timeline(self, effect) -> Dict[str, Any]:
        """
        Generate a timeline of an effect, including prediction of future trajectory.
        
        Args:
            effect: NeurotransmitterEffect object
            
        Returns:
            Dictionary with timeline visualization data
        """
        # Start with current effect
        timeline = []
        
        # Add current effect as starting point
        current_point = {
            "timestamp": datetime.now().isoformat(),
            "effect_size": effect.effect_size,
            "confidence_interval": effect.confidence_interval,
            "is_prediction": False
        }
        timeline.append(current_point)
        
        # Generate future predictions
        # This is a simplified model - in reality would use more sophisticated predictive analytics
        for i in range(1, self.default_timeline_steps):
            # Simplified decay model with some randomness
            decay_factor = 0.95  # 5% reduction per step
            randomness = 0.02  # Small random fluctuations
            
            previous = timeline[-1]["effect_size"]
            predicted = previous * decay_factor
            
            # Add small random fluctuation
            import random
            fluctuation = (random.random() * 2 - 1) * randomness
            predicted += fluctuation
            
            # Ensure effect size doesn't go negative
            predicted = max(0, predicted)
            
            # Widen confidence interval for future predictions
            ci_width = effect.confidence_interval[1] - effect.confidence_interval[0]
            ci_width_increase = 0.02 * i  # Confidence interval widens by 2% per step
            new_ci_width = ci_width * (1 + ci_width_increase)
            
            # Calculate new confidence interval
            ci_center = predicted
            ci_low = max(0, ci_center - new_ci_width / 2)
            ci_high = ci_center + new_ci_width / 2
            
            # Add prediction point
            prediction_point = {
                "timestamp": (datetime.now() + timedelta(days=i)).isoformat(),
                "effect_size": predicted,
                "confidence_interval": (ci_low, ci_high),
                "is_prediction": True
            }
            timeline.append(prediction_point)
        
        # Add metrics about the timeline
        metrics = {
            "initial_effect": effect.effect_size,
            "half_life": self.default_timeline_steps // 2,  # Simplified half-life estimate
            "trend": "decreasing" if timeline[-1]["effect_size"] < effect.effect_size else "stable"
        }
        
        return {
            "neurotransmitter": effect.neurotransmitter.value,
            "timeline": timeline,
            "metrics": metrics
        }
    
    def precompute_cascade_geometry(self, cascade_data: Dict[BrainRegion, List[float]]) -> Dict[str, Any]:
        """
        Precompute geometry for cascade visualization.
        
        Args:
            cascade_data: Dictionary mapping brain regions to lists of values over time
            
        Returns:
            Dictionary with precomputed geometry data
        """
        # Create a map of brain regions to 3D coordinates
        region_coordinates = {
            BrainRegion.PREFRONTAL_CORTEX: (0.0, 0.8, 0.4),
            BrainRegion.AMYGDALA: (0.3, 0.0, 0.0),
            BrainRegion.HIPPOCAMPUS: (0.3, -0.1, 0.1),
            BrainRegion.NUCLEUS_ACCUMBENS: (0.1, 0.3, -0.2),
            BrainRegion.VENTRAL_TEGMENTAL_AREA: (0.0, -0.3, -0.1),
            BrainRegion.RAPHE_NUCLEI: (0.0, -0.5, -0.2),
            BrainRegion.LOCUS_COERULEUS: (-0.1, -0.6, -0.1),
            BrainRegion.STRIATUM: (0.2, 0.2, 0.0),
            # Additional regions would be defined here
        }
        
        # Calculate the number of time steps
        num_time_steps = max(len(values) for values in cascade_data.values())
        
        # Precompute vertices for each time step
        vertices_by_time = []
        colors_by_time = []
        
        for t in range(num_time_steps):
            vertices = []
            colors = []
            
            for region, values in cascade_data.items():
                # Skip regions without coordinates
                if region not in region_coordinates:
                    continue
                
                # Get value for this time step (or 0 if not available)
                value = values[t] if t < len(values) else 0
                
                # Skip inactive regions
                if value < 0.1:
                    continue
                
                # Get coordinates
                x, y, z = region_coordinates[region]
                
                # Add vertex
                vertices.extend([x, y, z])
                
                # Calculate color based on activity level (grayscale for simplicity)
                # In a real implementation, this would use proper color mapping
                color_intensity = min(1.0, value)
                colors.extend([color_intensity, color_intensity, color_intensity])
            
            vertices_by_time.append(vertices)
            colors_by_time.append(colors)
        
        # Calculate connections between brain regions
        connections = []
        for region1 in cascade_data.keys():
            for region2 in cascade_data.keys():
                if region1 != region2 and region1 in region_coordinates and region2 in region_coordinates:
                    # Check if these regions should be connected (simplified)
                    # In a real implementation, would use proper connectivity data
                    connections.append({
                        "source": region1.value,
                        "target": region2.value,
                        "source_coords": region_coordinates[region1],
                        "target_coords": region_coordinates[region2]
                    })
        
        return {
            "vertices_by_time": vertices_by_time,
            "colors_by_time": colors_by_time,
            "connections": connections,
            "time_steps": num_time_steps
        }