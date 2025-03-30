"""
Temporal neurotransmitter mapping module for the Digital Twin model.

This module extends the base neurotransmitter mapping with temporal features,
enabling the tracking and analysis of neurotransmitter dynamics over time.
"""

def extend_neurotransmitter_mapping(base_mapping):
    """
    Extend a base neurotransmitter mapping with temporal capabilities.
    
    This factory function creates a TemporalNeurotransmitterMapping
    using an existing NeurotransmitterMapping as its foundation.
    
    Args:
        base_mapping: Base NeurotransmitterMapping to extend
        
    Returns:
        TemporalNeurotransmitterMapping with data from the base mapping
    """
    if not base_mapping:
        return None
        
    # Create a new temporal mapping
    temporal_mapping = TemporalNeurotransmitterMapping(
        patient_id=getattr(base_mapping, 'patient_id', None)
    )
    
    # Copy production map
    if hasattr(base_mapping, 'production_map'):
        temporal_mapping.production_map = base_mapping.production_map.copy()
    
    # Copy receptor profiles
    if hasattr(base_mapping, 'receptor_profiles'):
        temporal_mapping.receptor_profiles = base_mapping.receptor_profiles.copy()
    
    # Rebuild lookup maps
    temporal_mapping._build_lookup_maps()
    
    return temporal_mapping
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Set, Optional, Any, Union
import uuid
from uuid import UUID
import statistics
from copy import deepcopy

from app.domain.entities.digital_twin_enums import (
    BrainRegion, 
    Neurotransmitter, 
    ClinicalSignificance,
    TemporalResolution,
    NeurotransmitterState
)
from app.domain.entities.neurotransmitter_mapping import NeurotransmitterMapping
from app.domain.entities.neurotransmitter_effect import NeurotransmitterEffect
from app.domain.entities.temporal_sequence import TemporalSequence
from app.domain.entities.temporal_events import TemporalEvent, EventChain


class TemporalNeurotransmitterMapping(NeurotransmitterMapping):
    """
    Extends NeurotransmitterMapping to include temporal dynamics.
    
    This class tracks how neurotransmitter levels change over time across
    different brain regions, enabling temporal analysis, pattern detection,
    and treatment simulation.
    """
    
    def __init__(self, patient_id: Optional[UUID] = None):
        """
        Initialize a temporal neurotransmitter mapping.
        
        Args:
            patient_id: Optional patient identifier for personalized mappings
        """
        super().__init__()
        
        self.patient_id = patient_id
        
        # Map of neurotransmitters to temporal sequences by brain region
        self.temporal_profiles: Dict[
            Neurotransmitter, 
            Dict[BrainRegion, TemporalSequence[float]]
        ] = {}
        
        # Map of treatment effects by neurotransmitter
        self.treatment_effects: Dict[
            str,  # Treatment identifier
            Dict[Neurotransmitter, Dict[BrainRegion, float]]
        ] = {}
        
        # Sequence IDs for lookups
        self.sequence_lookup: Dict[UUID, Tuple[Neurotransmitter, BrainRegion]] = {}
        
        # Initialize temporal profiles for all neurotransmitters and regions
        self._initialize_temporal_profiles()
    
    def _initialize_temporal_profiles(self) -> None:
        """Initialize empty temporal profiles for all neurotransmitters and regions."""
        for nt in Neurotransmitter:
            self.temporal_profiles[nt] = {}
            
            # Add profile for each brain region with receptors for this neurotransmitter
            for region, density in self.get_receptor_regions(nt):
                sequence_name = f"{nt.value}_{region.value}_levels"
                sequence = TemporalSequence[float](
                    name=sequence_name,
                    patient_id=self.patient_id,
                    brain_region=region,
                    neurotransmitter=nt,
                    metadata={
                        "receptor_density": density,
                        "is_producing_region": region in self.get_producing_regions(nt)
                    }
                )
                
                self.temporal_profiles[nt][region] = sequence
                self.sequence_lookup[sequence.sequence_id] = (nt, region)
    
    def add_neurotransmitter_measurement(
        self,
        neurotransmitter: Neurotransmitter,
        brain_region: BrainRegion,
        timestamp: datetime,
        level: float,
        metadata: Optional[Dict[str, Any]] = None
    ) -> UUID:
        """
        Add a neurotransmitter level measurement for a specific time.
        
        Args:
            neurotransmitter: Target neurotransmitter
            brain_region: Target brain region
            timestamp: When the measurement was taken
            level: Measured neurotransmitter level (normalized to 0.0-1.0)
            metadata: Additional measurement information
            
        Returns:
            UUID of the created temporal event
        """
        # Ensure profile exists
        if neurotransmitter not in self.temporal_profiles:
            self.temporal_profiles[neurotransmitter] = {}
        
        if brain_region not in self.temporal_profiles[neurotransmitter]:
            sequence_name = f"{neurotransmitter.value}_{brain_region.value}_levels"
            sequence = TemporalSequence[float](
                name=sequence_name,
                patient_id=self.patient_id,
                brain_region=brain_region,
                neurotransmitter=neurotransmitter,
                metadata={
                    "receptor_density": self.analyze_receptor_affinity(neurotransmitter, brain_region),
                    "is_producing_region": brain_region in self.get_producing_regions(neurotransmitter)
                }
            )
            self.temporal_profiles[neurotransmitter][brain_region] = sequence
        
        # Validate level
        normalized_level = max(0.0, min(1.0, level))
        
        # Add event to sequence
        event = TemporalEvent[float](
            timestamp=timestamp,
            value=normalized_level,
            patient_id=self.patient_id,
            metadata=metadata or {}
        )
        
        self.temporal_profiles[neurotransmitter][brain_region].add_event(event)
        
        return event.event_id
    
    def get_measurement_sequence(
        self,
        neurotransmitter: Neurotransmitter,
        brain_region: BrainRegion
    ) -> Optional[TemporalSequence[float]]:
        """
        Get the temporal sequence for a neurotransmitter in a specific brain region.
        
        Args:
            neurotransmitter: Target neurotransmitter
            brain_region: Target brain region
            
        Returns:
            TemporalSequence with measurements or None if not found
        """
        return self.temporal_profiles.get(neurotransmitter, {}).get(brain_region)
    
    def get_current_level(
        self,
        neurotransmitter: Neurotransmitter,
        brain_region: BrainRegion,
        reference_time: Optional[datetime] = None
    ) -> Optional[float]:
        """
        Get the current neurotransmitter level in a brain region.
        
        Args:
            neurotransmitter: Target neurotransmitter
            brain_region: Target brain region
            reference_time: Reference time (defaults to now)
            
        Returns:
            Current level or None if not available
        """
        sequence = self.get_measurement_sequence(neurotransmitter, brain_region)
        if not sequence or not sequence.events:
            return None
        
        # If reference time is provided, get the value at that time
        if reference_time:
            return sequence.get_value_at(reference_time)
        
        # Otherwise, return the most recent value
        return sequence.events[-1].value
    
    def get_neurotransmitter_state(
        self,
        neurotransmitter: Neurotransmitter,
        brain_region: BrainRegion,
        reference_time: Optional[datetime] = None
    ) -> NeurotransmitterState:
        """
        Get the state of a neurotransmitter in a brain region.
        
        Args:
            neurotransmitter: Target neurotransmitter
            brain_region: Target brain region
            reference_time: Reference time (defaults to now)
            
        Returns:
            NeurotransmitterState enum value
        """
        level = self.get_current_level(neurotransmitter, brain_region, reference_time)
        
        if level is None:
            return NeurotransmitterState.NORMAL
        
        if level < 0.2:
            return NeurotransmitterState.DEFICIENT
        elif level < 0.4:
            return NeurotransmitterState.BELOW_NORMAL
        elif level < 0.6:
            return NeurotransmitterState.NORMAL
        elif level < 0.8:
            return NeurotransmitterState.ABOVE_NORMAL
        else:
            return NeurotransmitterState.EXCESSIVE
    
    def analyze_temporal_effect(
        self,
        neurotransmitter: Neurotransmitter,
        brain_region: BrainRegion,
        start_time: datetime,
        end_time: datetime
    ) -> NeurotransmitterEffect:
        """
        Analyze the temporal effect of a neurotransmitter in a brain region.
        
        Args:
            neurotransmitter: Target neurotransmitter
            brain_region: Target brain region
            start_time: Start of analysis period
            end_time: End of analysis period
            
        Returns:
            NeurotransmitterEffect with temporal analysis
        """
        sequence = self.get_measurement_sequence(neurotransmitter, brain_region)
        
        if not sequence or not sequence.events:
            # If no data, return baseline effect
            return super().analyze_baseline_effect(neurotransmitter, brain_region, self.patient_id)
        
        # Get values in the time range
        events_in_range = sequence.get_events_in_range(start_time, end_time)
        values_in_range = [event.value for event in events_in_range]
        time_series_data = [(event.timestamp, event.value) for event in events_in_range]
        
        if not values_in_range:
            # If no values in range, return baseline effect
            return super().analyze_baseline_effect(neurotransmitter, brain_region, self.patient_id)
        
        # Calculate effect statistics
        mean_value = statistics.mean(values_in_range)
        
        # Calculate standard deviation if there are multiple values
        std_dev = statistics.stdev(values_in_range) if len(values_in_range) > 1 else 0.0
        
        # Calculate p-value based on receptor density and consistency of values
        # Lower p-value means more statistically significant effect
        receptor_density = self.analyze_receptor_affinity(neurotransmitter, brain_region)
        p_value = 0.05 if (receptor_density >= 0.5 and std_dev < 0.2) else 0.2
        
        # Effect size is the mean value
        effect_size = mean_value
        
        # Confidence interval
        ci_range = 0.1 + std_dev
        confidence_interval = (max(0.0, effect_size - ci_range), min(1.0, effect_size + ci_range))
        
        # Statistical significance
        is_statistically_significant = p_value < 0.05
        
        # Clinical significance based on effect size and receptor density
        clinical_significance = ClinicalSignificance.NONE
        if is_statistically_significant:
            if effect_size >= 0.7 and receptor_density >= 0.7:
                clinical_significance = ClinicalSignificance.SIGNIFICANT
            elif effect_size >= 0.5 and receptor_density >= 0.5:
                clinical_significance = ClinicalSignificance.MODERATE
            elif effect_size >= 0.3 and receptor_density >= 0.3:
                clinical_significance = ClinicalSignificance.MILD
            else:
                clinical_significance = ClinicalSignificance.MINIMAL
        
        # Create effect object
        effect = NeurotransmitterEffect(
            neurotransmitter=neurotransmitter,
            effect_size=effect_size,
            p_value=p_value,
            confidence_interval=confidence_interval,
            clinical_significance=clinical_significance,
            is_statistically_significant=is_statistically_significant,
            brain_region=brain_region,
            time_series_data=time_series_data,
            baseline_period=(start_time, end_time)
        )
        
        return effect
    
    def register_treatment_effect(
        self,
        treatment_id: str,
        primary_effect: Dict[Neurotransmitter, Dict[BrainRegion, float]],
        secondary_effect: Optional[Dict[Neurotransmitter, Dict[BrainRegion, float]]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Register how a treatment affects neurotransmitter levels.
        
        Args:
            treatment_id: Unique identifier for the treatment
            primary_effect: Primary effects on neurotransmitters
            secondary_effect: Secondary or indirect effects
            metadata: Additional treatment information
        """
        # Initialize treatment if not exists
        if treatment_id not in self.treatment_effects:
            self.treatment_effects[treatment_id] = {}
        
        # Add primary effects
        for nt, regions in primary_effect.items():
            if nt not in self.treatment_effects[treatment_id]:
                self.treatment_effects[treatment_id][nt] = {}
            
            self.treatment_effects[treatment_id][nt].update(regions)
        
        # Add secondary effects if provided
        if secondary_effect:
            for nt, regions in secondary_effect.items():
                if nt not in self.treatment_effects[treatment_id]:
                    self.treatment_effects[treatment_id][nt] = {}
                
                # Apply secondary effects with reduced magnitude
                for region, effect in regions.items():
                    # Secondary effects are half as strong as primary
                    if region in self.treatment_effects[treatment_id][nt]:
                        # If already has primary effect, add 25% of secondary
                        self.treatment_effects[treatment_id][nt][region] += effect * 0.25
                    else:
                        # Otherwise add 50% of secondary
                        self.treatment_effects[treatment_id][nt][region] = effect * 0.5
    
    def simulate_treatment_response(
        self,
        treatment_id: str,
        start_time: datetime,
        duration: timedelta,
        interval: timedelta,
        response_decay: float = 0.1
    ) -> Dict[Neurotransmitter, Dict[BrainRegion, TemporalSequence[float]]]:
        """
        Simulate how neurotransmitter levels respond to a treatment over time.
        
        Args:
            treatment_id: Identifier of the registered treatment
            start_time: When treatment begins
            duration: How long to simulate
            interval: Time interval between simulated points
            response_decay: Rate of decay for treatment response (0.0-1.0)
            
        Returns:
            Dictionary mapping neurotransmitters to brain regions to temporal sequences
        """
        if treatment_id not in self.treatment_effects:
            raise ValueError(f"Treatment {treatment_id} not registered")
        
        # Generate timestamps for simulation
        timestamps = []
        current_time = start_time
        while current_time <= start_time + duration:
            timestamps.append(current_time)
            current_time += interval
        
        # Create result container
        result: Dict[Neurotransmitter, Dict[BrainRegion, TemporalSequence[float]]] = {}
        
        # Iterate through neurotransmitters affected by treatment
        for nt, regions in self.treatment_effects[treatment_id].items():
            result[nt] = {}
            
            # Iterate through brain regions
            for region, effect_magnitude in regions.items():
                # Get current level to use as baseline
                baseline = self.get_current_level(nt, region) or 0.5  # Default to 0.5 if no existing level
                
                # Create new temporal sequence for simulation
                sequence_name = f"{treatment_id}_{nt.value}_{region.value}_simulation"
                sequence = TemporalSequence[float](
                    name=sequence_name,
                    patient_id=self.patient_id,
                    brain_region=region,
                    neurotransmitter=nt,
                    metadata={
                        "simulation": True,
                        "treatment_id": treatment_id,
                        "baseline_level": baseline,
                        "effect_magnitude": effect_magnitude
                    }
                )
                
                # Generate the temporal response curve
                for idx, timestamp in enumerate(timestamps):
                    # Calculate time factor (0.0 to 1.0) representing progress through treatment
                    time_factor = min(1.0, idx / (len(timestamps) - 1 if len(timestamps) > 1 else 1))
                    
                    # Calculate response curve
                    # - Initially rises rapidly
                    # - Then plateaus
                    # - Gradually decays if response_decay > 0
                    if time_factor < 0.2:
                        # Initial rapid rise (first 20% of time)
                        response_factor = time_factor * 5  # 0.0 to 1.0
                    elif time_factor < 0.7:
                        # Plateau (20% to 70% of time)
                        response_factor = 1.0
                    else:
                        # Gradual decay (after 70% of time)
                        decay_factor = (time_factor - 0.7) / 0.3  # 0.0 to 1.0
                        response_factor = 1.0 - (decay_factor * response_decay)
                    
                    # Calculate new level
                    # effect_magnitude can be positive (increase) or negative (decrease)
                    effect = effect_magnitude * response_factor
                    new_level = baseline + effect
                    
                    # Ensure level stays within valid range
                    new_level = max(0.0, min(1.0, new_level))
                    
                    # Add to sequence
                    sequence.add_value(
                        timestamp=timestamp,
                        value=new_level,
                        metadata={
                            "time_factor": time_factor,
                            "response_factor": response_factor,
                            "baseline": baseline,
                            "effect": effect
                        }
                    )
                
                # Add sequence to result
                result[nt][region] = sequence
        
        return result
    
    def analyze_temporal_response(
        self,
        patient_id: UUID,
        brain_region: BrainRegion,
        neurotransmitter: Neurotransmitter,
        time_series_data: List[Tuple[datetime, float]],
        baseline_period: Optional[Tuple[datetime, datetime]] = None
    ) -> NeurotransmitterEffect:
        """
        Analyze how a neurotransmitter's effect changes over time in a brain region.
        
        Args:
            patient_id: UUID of the patient
            brain_region: Target brain region
            neurotransmitter: Target neurotransmitter
            time_series_data: List of timestamp and value tuples
            baseline_period: Optional period defining the baseline
            
        Returns:
            NeurotransmitterEffect object
        """
        # If no data provided, try to use existing data
        if not time_series_data and self.patient_id == patient_id:
            sequence = self.get_measurement_sequence(neurotransmitter, brain_region)
            if sequence and sequence.events:
                time_series_data = [(event.timestamp, event.value) for event in sequence.events]
        
        # If still no data, return baseline effect
        if not time_series_data:
            return super().analyze_baseline_effect(neurotransmitter, brain_region, patient_id)
        
        # Sort by timestamp
        time_series_data.sort(key=lambda x: x[0])
        
        # Extract values
        values = [value for _, value in time_series_data]
        
        # Calculate statistics
        mean_value = statistics.mean(values)
        std_dev = statistics.stdev(values) if len(values) > 1 else 0.0
        
        # Calculate p-value based on receptor density and consistency
        receptor_density = self.analyze_receptor_affinity(neurotransmitter, brain_region)
        consistency = 1.0 - min(1.0, std_dev * 5)  # Convert std_dev to a 0-1 consistency score
        p_value = max(0.01, 0.05 * (1.0 - receptor_density * consistency))
        
        # Effect size is the mean value
        effect_size = mean_value
        
        # Confidence interval
        ci_range = 0.1 + std_dev
        confidence_interval = (max(0.0, effect_size - ci_range), min(1.0, effect_size + ci_range))
        
        # Statistical significance
        is_statistically_significant = p_value < 0.05
        
        # Clinical significance
        clinical_significance = ClinicalSignificance.NONE
        if is_statistically_significant:
            if effect_size >= 0.7 and receptor_density >= 0.7:
                clinical_significance = ClinicalSignificance.SIGNIFICANT
            elif effect_size >= 0.5 and receptor_density >= 0.5:
                clinical_significance = ClinicalSignificance.MODERATE
            elif effect_size >= 0.3 and receptor_density >= 0.3:
                clinical_significance = ClinicalSignificance.MILD
            else:
                clinical_significance = ClinicalSignificance.MINIMAL
        
        # Define comparison period and baseline if needed
        if not baseline_period and len(time_series_data) >= 2:
            # Use first 20% as baseline
            cutoff_idx = max(1, len(time_series_data) // 5)
            baseline_period = (time_series_data[0][0], time_series_data[cutoff_idx-1][0])
            comparison_period = (time_series_data[cutoff_idx][0], time_series_data[-1][0])
        else:
            comparison_period = None
        
        # Create effect object
        effect = NeurotransmitterEffect(
            neurotransmitter=neurotransmitter,
            effect_size=effect_size,
            p_value=p_value,
            confidence_interval=confidence_interval,
            clinical_significance=clinical_significance,
            is_statistically_significant=is_statistically_significant,
            brain_region=brain_region,
            time_series_data=time_series_data,
            baseline_period=baseline_period,
            comparison_period=comparison_period
        )
        
        return effect
    
    def find_correlated_regions(
        self,
        neurotransmitter: Neurotransmitter,
        brain_region: BrainRegion,
        threshold: float = 0.7,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> List[Tuple[BrainRegion, float]]:
        """
        Find brain regions with correlated neurotransmitter levels.
        
        Args:
            neurotransmitter: Target neurotransmitter
            brain_region: Target brain region
            threshold: Correlation threshold (0.0-1.0)
            start_time: Optional start time for correlation window
            end_time: Optional end time for correlation window
            
        Returns:
            List of tuples with brain region and correlation score
        """
        if neurotransmitter not in self.temporal_profiles:
            return []
        
        # Get sequence for target region
        target_sequence = self.temporal_profiles.get(neurotransmitter, {}).get(brain_region)
        if not target_sequence or len(target_sequence.events) < 3:
            return []
        
        # Filter events by time range if provided
        if start_time and end_time:
            target_events = target_sequence.get_events_in_range(start_time, end_time)
        else:
            target_events = target_sequence.events
        
        # Not enough data points
        if len(target_events) < 3:
            return []
        
        # Extract timestamps and values
        target_timestamps = [event.timestamp for event in target_events]
        target_values = [event.value for event in target_events]
        
        correlations = []
        
        # Check each brain region
        for region, sequence in self.temporal_profiles[neurotransmitter].items():
            # Skip the target region itself
            if region == brain_region:
                continue
            
            # Not enough data points
            if len(sequence.events) < 3:
                continue
            
            # Get values at matching timestamps
            region_values = []
            for ts in target_timestamps:
                value = sequence.get_value_at(ts)
                if value is not None:
                    region_values.append(value)
                else:
                    # If no value at this timestamp, use 0.5 as default
                    region_values.append(0.5)
            
            # Calculate correlation if we have enough matching points
            if len(region_values) >= 3:
                correlation = self._calculate_correlation(target_values, region_values)
                
                # Add to results if above threshold
                if abs(correlation) >= threshold:
                    correlations.append((region, correlation))
        
        # Sort by absolute correlation (highest first)
        correlations.sort(key=lambda x: abs(x[1]), reverse=True)
        
        return correlations
    
    def _calculate_correlation(self, values1: List[float], values2: List[float]) -> float:
        """
        Calculate Pearson correlation coefficient between two value lists.
        
        Args:
            values1: First list of values
            values2: Second list of values
            
        Returns:
            Correlation coefficient (-1.0 to 1.0)
        """
        if len(values1) != len(values2) or len(values1) < 2:
            return 0.0
        
        n = len(values1)
        
        # Calculate means
        mean1 = sum(values1) / n
        mean2 = sum(values2) / n
        
        # Calculate covariance and variances
        covariance = sum((values1[i] - mean1) * (values2[i] - mean2) for i in range(n))
        variance1 = sum((x - mean1) ** 2 for x in values1)
        variance2 = sum((x - mean2) ** 2 for x in values2)
        
        # Calculate correlation
        if variance1 == 0 or variance2 == 0:
            return 0.0
        
        correlation = covariance / (variance1 ** 0.5 * variance2 ** 0.5)
        
        return max(-1.0, min(1.0, correlation))
        
    def _generate_response_simulation(
        self,
        treatment_id: str,
        start_time: datetime,
        duration: timedelta,
        interval: timedelta,
        response_decay: float = 0.1
    ) -> Dict[Neurotransmitter, Dict[BrainRegion, TemporalSequence[float]]]:
        """
        Private helper method to generate a treatment response simulation.
        
        Args:
            treatment_id: Identifier of the registered treatment
            start_time: When treatment begins
            duration: How long to simulate
            interval: Time interval between simulated points
            response_decay: Rate of decay for treatment response (0.0-1.0)
            
        Returns:
            Dictionary mapping neurotransmitters to brain regions to temporal sequences
        """
        if treatment_id not in self.treatment_effects:
            raise ValueError(f"Treatment {treatment_id} not registered")
        
        # Generate timestamps for simulation
        timestamps = []
        current_time = start_time
        while current_time <= start_time + duration:
            timestamps.append(current_time)
            current_time += interval
        
        # Create result container
        result: Dict[Neurotransmitter, Dict[BrainRegion, TemporalSequence[float]]] = {}
        
        # Iterate through neurotransmitters affected by treatment
        for nt, regions in self.treatment_effects[treatment_id].items():
            result[nt] = {}
            
            # Iterate through brain regions
            for region, effect_magnitude in regions.items():
                # Get current level to use as baseline
                baseline = self.get_current_level(nt, region) or 0.5  # Default to 0.5 if no existing level
                
                # Create new temporal sequence for simulation
                sequence_name = f"{treatment_id}_{nt.value}_{region.value}_simulation"
                sequence = TemporalSequence[float](
                    name=sequence_name,
                    patient_id=self.patient_id,
                    brain_region=region,
                    neurotransmitter=nt,
                    metadata={
                        "simulation": True,
                        "treatment_id": treatment_id,
                        "baseline_level": baseline,
                        "effect_magnitude": effect_magnitude
                    }
                )
                
                # Generate the temporal response curve
                for idx, timestamp in enumerate(timestamps):
                    # Calculate time factor (0.0 to 1.0) representing progress through treatment
                    time_factor = min(1.0, idx / (len(timestamps) - 1 if len(timestamps) > 1 else 1))
                    
                    # Calculate response curve
                    # - Initially rises rapidly
                    # - Then plateaus
                    # - Gradually decays if response_decay > 0
                    if time_factor < 0.2:
                        # Initial rapid rise (first 20% of time)
                        response_factor = time_factor * 5  # 0.0 to 1.0
                    elif time_factor < 0.7:
                        # Plateau (20% to 70% of time)
                        response_factor = 1.0
                    else:
                        # Gradual decay (after 70% of time)
                        decay_factor = (time_factor - 0.7) / 0.3  # 0.0 to 1.0
                        response_factor = 1.0 - (decay_factor * response_decay)
                    
                    # Calculate new level
                    # effect_magnitude can be positive (increase) or negative (decrease)
                    effect = effect_magnitude * response_factor
                    new_level = baseline + effect
                    
                    # Ensure level stays within valid range
                    new_level = max(0.0, min(1.0, new_level))
                    
                    # Add to sequence
                    sequence.add_value(
                        timestamp=timestamp,
                        value=new_level,
                        metadata={
                            "time_factor": time_factor,
                            "response_factor": response_factor,
                            "baseline": baseline,
                            "effect": effect
                        }
                    )
                
                # Add sequence to result
                result[nt][region] = sequence
        
        return result
        
    def generate_temporal_sequence(
        self,
        brain_region: BrainRegion,
        neurotransmitter: Neurotransmitter,
        timestamps: List[datetime],
        baseline_level: float = 0.5,
        random_seed: Optional[int] = None
    ) -> TemporalSequence:
        """
        Generate a temporal sequence for a neurotransmitter in a specific brain region.
        
        Args:
            brain_region: Target brain region
            neurotransmitter: Target neurotransmitter
            timestamps: List of timestamps for the sequence
            baseline_level: Starting baseline level (0.0-1.0)
            random_seed: Optional random seed for reproducibility
            
        Returns:
            TemporalSequence with generated values
        """
        import random
        
        # Set random seed if provided
        if random_seed is not None:
            random.seed(random_seed)
        
        # Create a sequence
        sequence_name = f"{neurotransmitter.value}_{brain_region.value}_temporal"
        sequence = TemporalSequence[float](
            name=sequence_name,
            patient_id=self.patient_id,
            brain_region=brain_region,
            neurotransmitter=neurotransmitter,
            metadata={
                "generated": True,
                "baseline_level": baseline_level,
                "receptor_density": self.analyze_receptor_affinity(neurotransmitter, brain_region),
                "is_producing_region": brain_region in self.get_producing_regions(neurotransmitter)
            }
        )
        
        # Get receptor affinity to determine stability
        affinity = self.analyze_receptor_affinity(neurotransmitter, brain_region)
        
        # Higher affinity means more stable levels (less variance)
        variance = 0.15 * (1.0 - affinity)
        
        # Generate values for all neurotransmitters
        nt_count = len(list(Neurotransmitter))
        all_values = []
        
        # Set initial level
        current_level = baseline_level
        
        # Generate sequence for each timestamp
        for timestamp in timestamps:
            # Create array of values for all neurotransmitters
            values = [0.0] * nt_count
            
            # Add random variation to current level
            variation = random.uniform(-variance, variance)
            new_level = current_level + variation
            
            # Ensure level stays within valid range
            new_level = max(0.0, min(1.0, new_level))
            
            # Get index of current neurotransmitter
            nt_idx = list(Neurotransmitter).index(neurotransmitter)
            
            # Set value for current neurotransmitter
            values[nt_idx] = new_level
            
            # Set values for other neurotransmitters
            for idx, nt in enumerate(Neurotransmitter):
                if idx != nt_idx:
                    # Generate random correlation with main neurotransmitter
                    # Some neurotransmitters will have inverse correlation
                    if random.random() < 0.3:  # 30% chance of correlation
                        # Strong inverse correlation for opposing neurotransmitters
                        if (nt in [Neurotransmitter.GABA] and
                            neurotransmitter in [Neurotransmitter.GLUTAMATE]):
                            values[idx] = 1.0 - new_level + random.uniform(-0.1, 0.1)
                        # Strong positive correlation for related neurotransmitters
                        elif (nt in [Neurotransmitter.DOPAMINE] and
                              neurotransmitter in [Neurotransmitter.SEROTONIN]):
                            values[idx] = new_level + random.uniform(-0.1, 0.1)
                        else:
                            # Random level for unrelated neurotransmitters
                            values[idx] = random.uniform(0.2, 0.8)
                    else:
                        # Default level around 0.5 with some randomness
                        values[idx] = random.uniform(0.4, 0.6)
                    
                    # Ensure value stays within valid range
                    values[idx] = max(0.0, min(1.0, values[idx]))
            
            # Update current level for next iteration
            current_level = new_level
            
            # Add to values
            all_values.append(values)
            
            # Add event to sequence
            sequence.add_value(
                timestamp=timestamp,
                value=new_level,
                metadata={
                    "all_neurotransmitters": values,
                    "variation": variation
                }
            )
        
        return sequence
    
    def predict_cascade_effect(
        self,
        starting_region: BrainRegion,
        neurotransmitter: Neurotransmitter,
        initial_level: float,
        time_steps: int = 5,
        step_duration: timedelta = timedelta(minutes=15)
    ) -> Dict[BrainRegion, List[float]]:
        """
        Predict how a neurotransmitter change cascades across brain regions.
        
        Args:
            starting_region: Region where the change begins
            neurotransmitter: Target neurotransmitter
            initial_level: Initial level in the starting region
            time_steps: Number of time steps to simulate
            step_duration: Duration of each time step
            
        Returns:
            Dictionary mapping brain regions to lists of levels over time
        """
        # Initialize results dictionary
        cascade_results: Dict[BrainRegion, List[float]] = {}
        
        # Set initial level for starting region
        cascade_results[starting_region] = [initial_level]
        
        # Set all other regions to default initial level
        for region in BrainRegion:
            if region != starting_region:
                cascade_results[region] = [0.0]
        
        # Get brain region connectivity for cascade
        # This simplifies the complex connectivity in the brain
        # In a real implementation, this would be based on actual neural pathways
        connectivity = {
            BrainRegion.PREFRONTAL_CORTEX: [
                (BrainRegion.ANTERIOR_CINGULATE_CORTEX, 0.8),
                (BrainRegion.STRIATUM, 0.7),
                (BrainRegion.AMYGDALA, 0.5),
                (BrainRegion.HIPPOCAMPUS, 0.4)
            ],
            BrainRegion.AMYGDALA: [
                (BrainRegion.HIPPOCAMPUS, 0.7),
                (BrainRegion.HYPOTHALAMUS, 0.6),
                (BrainRegion.PREFRONTAL_CORTEX, 0.5)
            ],
            BrainRegion.HIPPOCAMPUS: [
                (BrainRegion.PREFRONTAL_CORTEX, 0.6),
                (BrainRegion.AMYGDALA, 0.5)
            ],
            BrainRegion.NUCLEUS_ACCUMBENS: [
                (BrainRegion.VENTRAL_TEGMENTAL_AREA, 0.8),
                (BrainRegion.PREFRONTAL_CORTEX, 0.6)
            ],
            BrainRegion.VENTRAL_TEGMENTAL_AREA: [
                (BrainRegion.NUCLEUS_ACCUMBENS, 0.9),
                (BrainRegion.PREFRONTAL_CORTEX, 0.5)
            ],
            BrainRegion.RAPHE_NUCLEI: [
                (BrainRegion.PREFRONTAL_CORTEX, 0.7),
                (BrainRegion.HIPPOCAMPUS, 0.6),
                (BrainRegion.AMYGDALA, 0.5)
            ],
            BrainRegion.LOCUS_COERULEUS: [
                (BrainRegion.PREFRONTAL_CORTEX, 0.8),
                (BrainRegion.AMYGDALA, 0.7),
                (BrainRegion.HIPPOCAMPUS, 0.5)
            ],
            BrainRegion.STRIATUM: [
                (BrainRegion.PREFRONTAL_CORTEX, 0.7),
                (BrainRegion.NUCLEUS_ACCUMBENS, 0.6)
            ]
        }
        
        # Simulate cascade over time steps
        for step in range(1, time_steps):
            # For each region, calculate new level based on connected regions
            new_levels = {}
            
            for region in BrainRegion:
                # Skip regions not in connectivity map
                if region not in connectivity:
                    # Maintain previous level
                    new_levels[region] = cascade_results[region][-1]
                    continue
                
                # Get connections for this region
                connections = connectivity.get(region, [])
                
                # Get current level
                current_level = cascade_results[region][-1]
                
                # Calculate influence from connected regions
                total_influence = 0.0
                total_weight = 0.0
                
                for connected_region, strength in connections:
                    # Get level in connected region from previous time step
                    if step - 1 < len(cascade_results[connected_region]):
                        connected_level = cascade_results[connected_region][step - 1]
                        
                        # Apply receptor affinity as a modifier
                        receptor_factor = self.analyze_receptor_affinity(neurotransmitter, connected_region)
                        
                        # Calculate influence
                        influence = connected_level * strength * receptor_factor
                        total_influence += influence
                        total_weight += strength * receptor_factor
                
                # Calculate new level
                if total_weight > 0:
                    # Average influence from connected regions
                    influence_level = total_influence / total_weight
                    
                    # Blend with current level
                    decay_factor = 0.7  # How much previous level persists
                    propagation_factor = 0.3  # How much new influence affects level
                    
                    # For the starting region, apply a slower decay
                    if region == starting_region:
                        decay_factor = 0.9
                        propagation_factor = 0.1
                    
                    new_level = (current_level * decay_factor) + (influence_level * propagation_factor)
                else:
                    # If no connections, apply decay
                    new_level = current_level * 0.9
                
                # Ensure level stays within valid range
                new_level = max(0.0, min(1.0, new_level))
                
                # Store new level
                new_levels[region] = new_level
            
            # Update cascade results with new levels
            for region, level in new_levels.items():
                cascade_results[region].append(level)
        
        return cascade_results
    
    def simulate_treatment_response(
        self,
        brain_region: BrainRegion,
        target_neurotransmitter: Neurotransmitter,
        treatment_effect: float,
        timestamps: List[datetime]
    ) -> Dict[Neurotransmitter, TemporalSequence]:
        """
        Simulate how a treatment affects neurotransmitter levels over time.
        
        Args:
            brain_region: Target brain region
            target_neurotransmitter: Primary neurotransmitter affected by treatment
            treatment_effect: Magnitude and direction of effect (-1.0 to 1.0)
            timestamps: List of timestamps for the simulation
            
        Returns:
            Dictionary mapping neurotransmitters to temporal sequences
        """
        # Create a treatment ID based on parameters
        treatment_id = f"treatment_{target_neurotransmitter.value}_{brain_region.value}_{abs(treatment_effect):.1f}"
        
        # Determine if treatment increases or decreases the target neurotransmitter
        is_increasing = treatment_effect > 0
        
        # Define primary effect on target neurotransmitter in the target region
        primary_effect = {
            target_neurotransmitter: {
                brain_region: treatment_effect
            }
        }
        
        # Define secondary effects on other neurotransmitters
        secondary_effect = {}
        
        # Add opposite effect on opposing neurotransmitters
        # These are simplified neurobiological relationships
        if target_neurotransmitter == Neurotransmitter.SEROTONIN:
            # Serotonin increase can affect dopamine and GABA
            secondary_effect[Neurotransmitter.DOPAMINE] = {
                brain_region: -treatment_effect * 0.3  # Inverse relationship
            }
            secondary_effect[Neurotransmitter.GABA] = {
                brain_region: treatment_effect * 0.4  # Similar direction
            }
        elif target_neurotransmitter == Neurotransmitter.DOPAMINE:
            # Dopamine affects serotonin and glutamate
            secondary_effect[Neurotransmitter.SEROTONIN] = {
                brain_region: -treatment_effect * 0.2  # Inverse relationship
            }
            secondary_effect[Neurotransmitter.GLUTAMATE] = {
                brain_region: treatment_effect * 0.5  # Similar direction
            }
        elif target_neurotransmitter == Neurotransmitter.GABA:
            # GABA affects glutamate and serotonin
            secondary_effect[Neurotransmitter.GLUTAMATE] = {
                brain_region: -treatment_effect * 0.7  # Strong inverse relationship
            }
            secondary_effect[Neurotransmitter.SEROTONIN] = {
                brain_region: treatment_effect * 0.3  # Similar direction
            }
        elif target_neurotransmitter == Neurotransmitter.GLUTAMATE:
            # Glutamate affects GABA and dopamine
            secondary_effect[Neurotransmitter.GABA] = {
                brain_region: -treatment_effect * 0.6  # Inverse relationship
            }
            secondary_effect[Neurotransmitter.DOPAMINE] = {
                brain_region: treatment_effect * 0.4  # Similar direction
            }
        
        # Register the treatment effect
        self.register_treatment_effect(
            treatment_id=treatment_id,
            primary_effect=primary_effect,
            secondary_effect=secondary_effect,
            metadata={
                "treatment_type": "medication" if abs(treatment_effect) > 0.5 else "therapy",
                "target_system": "serotonergic" if target_neurotransmitter == Neurotransmitter.SEROTONIN else
                               "dopaminergic" if target_neurotransmitter == Neurotransmitter.DOPAMINE else
                               "GABAergic" if target_neurotransmitter == Neurotransmitter.GABA else
                               "glutamatergic"
            }
        )
        
        # Calculate duration based on timestamps
        if len(timestamps) >= 2:
            duration = timestamps[-1] - timestamps[0]
            interval = duration / (len(timestamps) - 1)
        else:
            # Default values
            duration = timedelta(days=1)
            interval = timedelta(hours=1)
        
        # Simulate the treatment response
        response = self._generate_response_simulation(
            treatment_id=treatment_id,
            start_time=timestamps[0],
            duration=duration,
            interval=interval,
            response_decay=0.2  # Moderate decay
        )
        
        return response