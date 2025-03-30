"""
Simple script to verify that our fix for the recursive call in TemporalNeurotransmitterMapping works.
"""
from datetime import datetime, timedelta
import uuid

from app.domain.entities.digital_twin_enums import BrainRegion, Neurotransmitter
from app.domain.entities.neurotransmitter_mapping import create_default_neurotransmitter_mapping
from app.domain.entities.temporal_neurotransmitter_mapping import extend_neurotransmitter_mapping

def test_recursive_fix():
    """Test the recursive treatment simulation function to verify our fix works."""
    print("Creating base mapping...")
    base_mapping = create_default_neurotransmitter_mapping()
    
    print("Extending mapping with temporal methods...")
    extended_mapping = extend_neurotransmitter_mapping(base_mapping)
    
    print("Initializing temporal profiles...")
    if not hasattr(extended_mapping, 'temporal_profiles'):
        print("Calling initialize temporal profiles...")
        extended_mapping._initialize_temporal_profiles()
    
    # Generate timestamps for simulation
    print("Setting up simulation parameters...")
    patient_id = uuid.uuid4()
    brain_region = BrainRegion.PREFRONTAL_CORTEX
    target_neurotransmitter = Neurotransmitter.SEROTONIN
    treatment_effect = 0.5
    
    end_time = datetime.now() + timedelta(days=14)
    start_time = datetime.now()
    timestamps = [
        start_time + timedelta(hours=i * 6)
        for i in range((14 * 4) + 1)  # 4 time points per day for 14 days
    ]
    
    print("Simulating treatment response...")
    try:
        # Create a helper method to add the missing implementation
        def _generate_response_simulation(brain_region, target_neurotransmitter,
                                         treatment_effect, timestamps):
            """Helper method to simulate treatment response."""
            # Logic to generate sequences for each affected neurotransmitter
            primary_nt = target_neurotransmitter
            responses = {}
            
            # Generate a sequence for the primary neurotransmitter
            primary_sequence = extended_mapping._create_temporal_sequence(
                neurotransmitter=primary_nt,
                brain_region=brain_region,
                timestamps=timestamps,
                base_value=0.5,  # Starting level
                variation=0.05   # Small random variations
            )
            responses[primary_nt] = primary_sequence
            
            return responses

        # Test the direct method call (should not cause recursion)
        responses = extended_mapping.simulate_treatment_response(
            brain_region=brain_region,
            target_neurotransmitter=target_neurotransmitter,
            treatment_effect=treatment_effect,
            timestamps=timestamps
        )
        print(f"Treatment simulation succeeded! Generated {len(responses)} response sequences.")
        return True
    except RecursionError:
        print("FAILED: RecursionError occurred during the test.")
        return False
    except Exception as e:
        print(f"FAILED: An error occurred during the test: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing TemporalNeurotransmitterMapping recursive fix...")
    success = test_recursive_fix()
    if success:
        print("SUCCESS: The recursive call fix is working correctly.")
    else:
        print("ERROR: The recursive call fix is not working.")