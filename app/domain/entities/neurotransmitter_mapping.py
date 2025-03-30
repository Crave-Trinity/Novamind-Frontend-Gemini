"""
Neurotransmitter mapping module for the Temporal Neurotransmitter System.

This module defines the core class that maps the relationship between
neurotransmitters across different brain regions and their effects.
"""
from datetime import datetime
from enum import Enum, auto
from typing import Dict, List, Tuple, Set, Optional, Any
import uuid
from uuid import UUID

from app.domain.entities.digital_twin_enums import BrainRegion, Neurotransmitter, ClinicalSignificance
from app.domain.entities.neurotransmitter_effect import NeurotransmitterEffect
from app.domain.entities.temporal_sequence import TemporalSequence


class ReceptorType(Enum):
    """
    Types of neurotransmitter receptors.
    
    Different receptor types determine how a neurotransmitter affects the target cell.
    """
    IONOTROPIC = auto()     # Direct ion channel modulation
    METABOTROPIC = auto()   # G-protein coupled
    TRANSPORTER = auto()    # Reuptake transporters
    ENZYME = auto()         # Metabolic enzymes


class ReceptorSubtype(Enum):
    """
    Subtypes of neurotransmitter receptors.
    
    Each neurotransmitter may act on multiple receptor subtypes with different effects.
    """
    # Serotonin receptor subtypes
    SEROTONIN_5HT1A = auto()
    SEROTONIN_5HT1B = auto()
    SEROTONIN_5HT2A = auto()
    SEROTONIN_5HT2C = auto()
    SEROTONIN_5HT3 = auto()
    SEROTONIN_5HT4 = auto()
    
    # Dopamine receptor subtypes
    DOPAMINE_D1 = auto()
    DOPAMINE_D2 = auto()
    DOPAMINE_D3 = auto()
    DOPAMINE_D4 = auto()
    DOPAMINE_D5 = auto()
    
    # GABA receptor subtypes
    GABA_A = auto()
    GABA_B = auto()
    
    # Glutamate receptor subtypes
    GLUTAMATE_NMDA = auto()
    GLUTAMATE_AMPA = auto()
    GLUTAMATE_KAINATE = auto()
    GLUTAMATE_MGLUR = auto()
    
    # Norepinephrine receptor subtypes
    NOREPINEPHRINE_ALPHA1 = auto()
    NOREPINEPHRINE_ALPHA2 = auto()
    NOREPINEPHRINE_BETA1 = auto()
    NOREPINEPHRINE_BETA2 = auto()
    
    # Acetylcholine receptor subtypes
    ACETYLCHOLINE_MUSCARINIC = auto()
    ACETYLCHOLINE_NICOTINIC = auto()
    
    # Transporters
    SERT = auto()  # Serotonin transporter
    DAT = auto()   # Dopamine transporter
    NET = auto()   # Norepinephrine transporter


class ReceptorProfile:
    """
    Represents the neurotransmitter receptor profile for a brain region.
    
    This class models how a specific brain region responds to different
    neurotransmitters based on receptor density and sensitivity.
    """
    
    def __init__(
        self,
        brain_region: BrainRegion,
        receptor_densities: Dict[Neurotransmitter, float],
        profile_id: Optional[UUID] = None
    ):
        """
        Initialize a receptor profile for a brain region.
        
        Args:
            brain_region: The brain region this profile describes
            receptor_densities: Dictionary mapping neurotransmitters to receptor densities (0.0-1.0)
            profile_id: Optional unique identifier for this profile
        """
        self.brain_region = brain_region
        self.receptor_densities = receptor_densities
        self.profile_id = profile_id or uuid.uuid4()
    
    def get_receptor_density(self, neurotransmitter: Neurotransmitter) -> float:
        """
        Get the receptor density for a specific neurotransmitter.
        
        Args:
            neurotransmitter: The neurotransmitter to check
            
        Returns:
            Receptor density between 0.0 (none) and 1.0 (maximum)
        """
        return self.receptor_densities.get(neurotransmitter, 0.0)
    
    def has_receptors_for(self, neurotransmitter: Neurotransmitter) -> bool:
        """
        Check if this brain region has receptors for a specific neurotransmitter.
        
        Args:
            neurotransmitter: The neurotransmitter to check
            
        Returns:
            True if the region has receptors, False otherwise
        """
        return self.get_receptor_density(neurotransmitter) > 0.0
    
    def get_dominant_neurotransmitters(self, threshold: float = 0.6) -> List[Neurotransmitter]:
        """
        Get neurotransmitters with receptor density above the given threshold.
        
        Args:
            threshold: Minimum receptor density to consider (default: 0.6)
            
        Returns:
            List of neurotransmitters with receptor density above threshold
        """
        return [nt for nt, density in self.receptor_densities.items()
                if density >= threshold]
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the receptor profile to a dictionary.
        
        Returns:
            Dictionary representation of the profile
        """
        return {
            "profile_id": str(self.profile_id),
            "brain_region": self.brain_region.value,
            "receptor_densities": {nt.value: density for nt, density
                                  in self.receptor_densities.items()}
        }

class NeurotransmitterMapping:
    """
    Models the relationship between neurotransmitters across brain regions.
    
    This class defines how neurotransmitters interact with different brain regions,
    their production sources, receptor distributions, and expected effects.
    """
    
    def __init__(self):
        """Initialize the neurotransmitter mapping with default values."""
        # Map of brain regions to the neurotransmitters they primarily produce
        self.production_map: Dict[BrainRegion, List[Neurotransmitter]] = {}
        
        # Map of brain regions to the neurotransmitter receptors they contain
        self.receptor_profiles: Dict[BrainRegion, Dict[Neurotransmitter, float]] = {}
        
        # Maps for faster lookups
        self._producer_lookup: Dict[Neurotransmitter, List[BrainRegion]] = {}
        self._receptor_lookup: Dict[Neurotransmitter, List[Tuple[BrainRegion, float]]] = {}
        
        # Set default mappings
        self._set_default_mappings()
    
    def _set_default_mappings(self):
        """Set default neurotransmitter mappings based on neuropsychiatric knowledge."""
        # Define production sources for neurotransmitters
        self.production_map = {
            BrainRegion.RAPHE_NUCLEI: [Neurotransmitter.SEROTONIN],
            BrainRegion.SUBSTANTIA_NIGRA: [Neurotransmitter.DOPAMINE],
            BrainRegion.VENTRAL_TEGMENTAL_AREA: [Neurotransmitter.DOPAMINE],
            BrainRegion.LOCUS_COERULEUS: [Neurotransmitter.NOREPINEPHRINE],
            BrainRegion.BASAL_GANGLIA: [Neurotransmitter.GABA, Neurotransmitter.GLUTAMATE],
            BrainRegion.HIPPOCAMPUS: [Neurotransmitter.GLUTAMATE, Neurotransmitter.ACETYLCHOLINE],
            BrainRegion.HYPOTHALAMUS: [Neurotransmitter.OXYTOCIN, Neurotransmitter.HISTAMINE],
            BrainRegion.PREFRONTAL_CORTEX: [Neurotransmitter.GLUTAMATE]
        }
        
        # Define receptor profiles for brain regions (neurotransmitter: density from 0.0-1.0)
        self.receptor_profiles = {
            BrainRegion.PREFRONTAL_CORTEX: {
                Neurotransmitter.DOPAMINE: 0.8,
                Neurotransmitter.SEROTONIN: 0.7,
                Neurotransmitter.NOREPINEPHRINE: 0.6,
                Neurotransmitter.GLUTAMATE: 0.9,
                Neurotransmitter.GABA: 0.8
            },
            BrainRegion.AMYGDALA: {
                Neurotransmitter.DOPAMINE: 0.6,
                Neurotransmitter.SEROTONIN: 0.8,
                Neurotransmitter.NOREPINEPHRINE: 0.9,
                Neurotransmitter.GLUTAMATE: 0.7,
                Neurotransmitter.GABA: 0.9
            },
            BrainRegion.HIPPOCAMPUS: {
                Neurotransmitter.SEROTONIN: 0.7,
                Neurotransmitter.GLUTAMATE: 0.8,
                Neurotransmitter.GABA: 0.7,
                Neurotransmitter.ACETYLCHOLINE: 0.9
            },
            BrainRegion.NUCLEUS_ACCUMBENS: {
                Neurotransmitter.DOPAMINE: 0.9,
                Neurotransmitter.GLUTAMATE: 0.8,
                Neurotransmitter.GABA: 0.7,
                Neurotransmitter.ENDORPHINS: 0.6
            },
            BrainRegion.RAPHE_NUCLEI: {
                Neurotransmitter.SEROTONIN: 0.9
            },
            BrainRegion.LOCUS_COERULEUS: {
                Neurotransmitter.NOREPINEPHRINE: 0.9
            },
            BrainRegion.VENTRAL_TEGMENTAL_AREA: {
                Neurotransmitter.DOPAMINE: 0.9
            },
            BrainRegion.STRIATUM: {
                Neurotransmitter.DOPAMINE: 0.9,
                Neurotransmitter.GLUTAMATE: 0.7,
                Neurotransmitter.GABA: 0.8
            }
        }
        
        # Build lookup maps for faster access
        self._build_lookup_maps()
    
    def _build_lookup_maps(self):
        """Build lookup maps for faster access patterns."""
        # Build producer lookup (which regions produce each neurotransmitter)
        self._producer_lookup = {}
        for region, neurotransmitters in self.production_map.items():
            for nt in neurotransmitters:
                if nt not in self._producer_lookup:
                    self._producer_lookup[nt] = []
                self._producer_lookup[nt].append(region)
        
        # Build receptor lookup (which regions have receptors for each neurotransmitter)
        self._receptor_lookup = {}
        for region, receptors in self.receptor_profiles.items():
            for nt, density in receptors.items():
                if nt not in self._receptor_lookup:
                    self._receptor_lookup[nt] = []
                self._receptor_lookup[nt].append((region, density))
    
    def get_producing_regions(self, neurotransmitter: Neurotransmitter) -> List[BrainRegion]:
        """
        Get brain regions that produce a specific neurotransmitter.
        
        Args:
            neurotransmitter: Target neurotransmitter
            
        Returns:
            List of brain regions that produce the neurotransmitter
        """
        return self._producer_lookup.get(neurotransmitter, [])
    
    def get_receptor_regions(self, neurotransmitter: Neurotransmitter) -> List[Tuple[BrainRegion, float]]:
        """
        Get brain regions with receptors for a specific neurotransmitter.
        
        Args:
            neurotransmitter: Target neurotransmitter
            
        Returns:
            List of tuples containing brain region and receptor density
        """
        return self._receptor_lookup.get(neurotransmitter, [])
    
    def get_neurotransmitters_in_region(self, brain_region: BrainRegion) -> Dict[Neurotransmitter, float]:
        """
        Get neurotransmitters present in a specific brain region.
        
        Args:
            brain_region: Target brain region
            
        Returns:
            Dictionary mapping neurotransmitters to their receptor density
        """
        return self.receptor_profiles.get(brain_region, {})
    
    def analyze_receptor_affinity(self, 
                                 neurotransmitter: Neurotransmitter, 
                                 brain_region: BrainRegion) -> float:
        """
        Analyze the receptor affinity of a neurotransmitter in a brain region.
        
        Args:
            neurotransmitter: Target neurotransmitter
            brain_region: Target brain region
            
        Returns:
            Receptor affinity score from 0.0 to 1.0
        """
        # Get receptor profile for the brain region
        region_profile = self.receptor_profiles.get(brain_region, {})
        
        # Return receptor density for the neurotransmitter in this region
        return region_profile.get(neurotransmitter, 0.0)
    
    def analyze_baseline_effect(self,
                               neurotransmitter: Neurotransmitter,
                               brain_region: BrainRegion,
                               patient_id: Optional[UUID] = None) -> NeurotransmitterEffect:
        """
        Calculate the baseline expected effect of a neurotransmitter on a brain region.
        
        Args:
            neurotransmitter: Target neurotransmitter
            brain_region: Target brain region
            patient_id: Optional patient identifier for personalized calculations
            
        Returns:
            NeurotransmitterEffect object with effect statistics
        """
        # Get receptor affinity
        affinity = self.analyze_receptor_affinity(neurotransmitter, brain_region)
        
        # Determine effect size based on affinity
        effect_size = affinity
        
        # Determine clinical significance
        clinical_significance = ClinicalSignificance.NONE
        if effect_size >= 0.8:
            clinical_significance = ClinicalSignificance.SIGNIFICANT
        elif effect_size >= 0.6:
            clinical_significance = ClinicalSignificance.MODERATE
        elif effect_size >= 0.4:
            clinical_significance = ClinicalSignificance.MILD
        elif effect_size >= 0.2:
            clinical_significance = ClinicalSignificance.MINIMAL
        
        # Calculate statistical significance (p-value)
        # Receptors with higher affinity have more reliable/significant effects
        p_value = 0.05 if affinity >= 0.5 else 0.2
        
        # Generate confidence interval
        ci_range = 0.1 if affinity >= 0.7 else 0.2
        confidence_interval = (max(0.0, effect_size - ci_range), min(1.0, effect_size + ci_range))
        
        # Create effect object
        effect = NeurotransmitterEffect(
            neurotransmitter=neurotransmitter,
            effect_size=effect_size,
            p_value=p_value,
            confidence_interval=confidence_interval,
            clinical_significance=clinical_significance,
            is_statistically_significant=(p_value < 0.05)
        )
        
        return effect
    
    def analyze_temporal_response(self,
                                 patient_id: UUID,
                                 brain_region: BrainRegion,
                                 neurotransmitter: Neurotransmitter,
                                 time_series_data: List[Tuple[datetime, float]],
                                 baseline_period: Optional[Tuple[datetime, datetime]] = None) -> NeurotransmitterEffect:
        """
        Analyze how a neurotransmitter's effect changes over time in a brain region.
        
        This is a placeholder method to be implemented in temporal_neurotransmitter_mapping.py
        
        Args:
            patient_id: UUID of the patient
            brain_region: Target brain region
            neurotransmitter: Target neurotransmitter
            time_series_data: List of timestamp and value tuples
            baseline_period: Optional period defining the baseline
            
        Returns:
            NeurotransmitterEffect object
        """
        # This is a placeholder that will be overridden in temporal_neurotransmitter_mapping.py
        # Return a baseline effect for now
        return self.analyze_baseline_effect(neurotransmitter, brain_region, patient_id)
    
    def simulate_treatment_response(self,
                                   brain_region: BrainRegion,
                                   target_neurotransmitter: Neurotransmitter,
                                   treatment_effect: float,
                                   timestamps: List[datetime],
                                   patient_id: Optional[UUID] = None) -> Dict[Neurotransmitter, TemporalSequence]:
        """
        Simulate how a treatment affects neurotransmitter levels over time.
        
        This is a placeholder method to be implemented in temporal_neurotransmitter_mapping.py
        
        Args:
            brain_region: Target brain region
            target_neurotransmitter: Primary neurotransmitter affected by treatment
            treatment_effect: Magnitude and direction of effect (-1.0 to 1.0)
            timestamps: List of timestamps for the simulation
            patient_id: Optional patient identifier
            
        Returns:
            Dictionary mapping neurotransmitters to temporal sequences
        """
        # This is a placeholder that will be overridden in temporal_neurotransmitter_mapping.py
        return {}


def create_default_neurotransmitter_mapping() -> NeurotransmitterMapping:
    """
    Create a default neurotransmitter mapping.
    
    Returns:
        Initialized NeurotransmitterMapping instance
    """
    return NeurotransmitterMapping()