"""
Mock implementation of the PAT service.

This module provides a mock implementation of the PAT service for testing
and development purposes.
"""

import datetime
import json
import logging
import random
import time
import uuid
from typing import Any, Dict, List, Optional

from app.core.services.ml.pat.exceptions import (
    AnalysisError,
    AuthorizationError,
    EmbeddingError,
    InitializationError,
    IntegrationError,
    ResourceNotFoundError,
    ValidationError,
)
from app.core.services.ml.pat.interface import PATInterface

# Set up logging with no PHI
logger = logging.getLogger(__name__)


class MockPAT(PATInterface):
    """Mock implementation of the PAT service.
    
    This implementation simulates the behavior of a real actigraphy analysis
    service, providing realistic-looking results without actual processing.
    It's useful for testing and development without requiring the real
    machine learning infrastructure.
    """
    
    def __init__(self) -> None:
        """Initialize the mock PAT service."""
        self._initialized = False
        self._config: Dict[str, Any] = {}
        self._analyses: Dict[str, Dict[str, Any]] = {}
        self._embeddings: Dict[str, Dict[str, Any]] = {}
        self._integrations: Dict[str, Dict[str, Any]] = {}
        self._mock_delay_ms = 0
    
    def initialize(self, config: Dict[str, Any]) -> None:
        """Initialize the PAT service with configuration.
        
        Args:
            config: Configuration dictionary
            
        Raises:
            InitializationError: If initialization fails
        """
        try:
            logger.info("Initializing MockPAT service")
            
            # Simulate delay if configured
            self._mock_delay_ms = config.get("mock_delay_ms", 0)
            
            # Store configuration
            self._config = config
            
            # Mark as initialized
            self._initialized = True
            
            logger.info("MockPAT service initialized successfully")
        
        except Exception as e:
            error_msg = f"Failed to initialize MockPAT service: {str(e)}"
            logger.error(error_msg)
            raise InitializationError(error_msg)
    
    def _check_initialized(self) -> None:
        """Check if the service is initialized.
        
        Raises:
            InitializationError: If the service is not initialized
        """
        if not self._initialized:
            raise InitializationError("MockPAT service is not initialized")
    
    def _simulate_delay(self) -> None:
        """Simulate processing delay if configured."""
        if self._mock_delay_ms > 0:
            time.sleep(self._mock_delay_ms / 1000.0)
    
    def analyze_actigraphy(
        self,
        patient_id: str,
        readings: List[Dict[str, Any]],
        start_time: str,
        end_time: str,
        sampling_rate_hz: float,
        device_info: Dict[str, Any],
        analysis_types: List[str]
    ) -> Dict[str, Any]:
        """Analyze actigraphy data and return insights.
        
        Args:
            patient_id: Unique identifier for the patient
            readings: List of accelerometer readings
            start_time: ISO-8601 formatted start time
            end_time: ISO-8601 formatted end time
            sampling_rate_hz: Sampling rate in Hz
            device_info: Information about the device
            analysis_types: List of analysis types to perform
        
        Returns:
            Dictionary containing analysis results
            
        Raises:
            ValidationError: If input validation fails
            AnalysisError: If analysis fails
            InitializationError: If service is not initialized
        """
        try:
            # Check if service is initialized
            self._check_initialized()
            
            # Log the request (without PHI)
            logger.info(
                f"Analyzing actigraphy data: "
                f"readings_count={len(readings)}, "
                f"analysis_types={analysis_types}"
            )
            
            # Validate inputs
            self._validate_actigraphy_inputs(
                patient_id, readings, start_time, end_time, 
                sampling_rate_hz, device_info, analysis_types
            )
            
            # Simulate processing delay
            self._simulate_delay()
            
            # Generate mock analysis result
            analysis_id = str(uuid.uuid4())
            timestamp = datetime.datetime.utcnow().isoformat() + "Z"
            
            # Create basic analysis results
            analysis_result = {
                "analysis_id": analysis_id,
                "patient_id": patient_id,
                "timestamp": timestamp,
                "analysis_types": analysis_types,
                "device_info": device_info,
                "data_summary": {
                    "start_time": start_time,
                    "end_time": end_time,
                    "duration_seconds": self._calculate_duration(start_time, end_time),
                    "readings_count": len(readings),
                    "sampling_rate_hz": sampling_rate_hz,
                },
                "results": {},
            }
            
            # Generate results for each requested analysis type
            for analysis_type in analysis_types:
                analysis_result["results"][analysis_type] = self._generate_mock_result(
                    analysis_type, readings, start_time, end_time
                )
            
            # Store the analysis for later retrieval
            self._analyses[analysis_id] = analysis_result
            
            # Log success (without PHI)
            logger.info(f"Successfully analyzed actigraphy data: analysis_id={analysis_id}")
            
            return analysis_result
        
        except ValidationError as e:
            logger.warning(f"Validation error in MockPAT analyze_actigraphy: {str(e)}")
            raise
        
        except InitializationError as e:
            logger.error(f"Initialization error in MockPAT analyze_actigraphy: {str(e)}")
            raise
        
        except Exception as e:
            error_msg = f"Error in MockPAT analyze_actigraphy: {str(e)}"
            logger.error(error_msg)
            raise AnalysisError(error_msg)
    
    def get_actigraphy_embeddings(
        self,
        patient_id: str,
        readings: List[Dict[str, Any]],
        start_time: str,
        end_time: str,
        sampling_rate_hz: float
    ) -> Dict[str, Any]:
        """Generate embeddings from actigraphy data.
        
        Args:
            patient_id: Unique identifier for the patient
            readings: List of accelerometer readings
            start_time: ISO-8601 formatted start time
            end_time: ISO-8601 formatted end time
            sampling_rate_hz: Sampling rate in Hz
        
        Returns:
            Dictionary containing embedding vector and metadata
            
        Raises:
            ValidationError: If input validation fails
            EmbeddingError: If embedding generation fails
            InitializationError: If service is not initialized
        """
        try:
            # Check if service is initialized
            self._check_initialized()
            
            # Log the request (without PHI)
            logger.info(
                f"Generating actigraphy embeddings: "
                f"readings_count={len(readings)}"
            )
            
            # Validate inputs
            self._validate_embedding_inputs(
                patient_id, readings, start_time, end_time, sampling_rate_hz
            )
            
            # Simulate processing delay
            self._simulate_delay()
            
            # Generate mock embedding result
            embedding_id = str(uuid.uuid4())
            timestamp = datetime.datetime.utcnow().isoformat() + "Z"
            
            # Create embedding vector (random values for mock)
            vector_dim = 256  # Typical embedding dimension
            embedding_vector = [random.uniform(-1.0, 1.0) for _ in range(vector_dim)]
            
            # Create embedding result
            embedding_result = {
                "embedding_id": embedding_id,
                "patient_id": patient_id,
                "timestamp": timestamp,
                "data_summary": {
                    "start_time": start_time,
                    "end_time": end_time,
                    "duration_seconds": self._calculate_duration(start_time, end_time),
                    "readings_count": len(readings),
                    "sampling_rate_hz": sampling_rate_hz,
                },
                "embedding": {
                    "vector": embedding_vector,
                    "dimension": vector_dim,
                    "model_version": "mock-embedding-v1.0",
                },
            }
            
            # Store the embedding for later retrieval
            self._embeddings[embedding_id] = embedding_result
            
            # Log success (without PHI)
            logger.info(f"Successfully generated actigraphy embeddings: embedding_id={embedding_id}")
            
            return embedding_result
        
        except ValidationError as e:
            logger.warning(f"Validation error in MockPAT get_actigraphy_embeddings: {str(e)}")
            raise
        
        except InitializationError as e:
            logger.error(f"Initialization error in MockPAT get_actigraphy_embeddings: {str(e)}")
            raise
        
        except Exception as e:
            error_msg = f"Error in MockPAT get_actigraphy_embeddings: {str(e)}"
            logger.error(error_msg)
            raise EmbeddingError(error_msg)
    
    def get_analysis_by_id(self, analysis_id: str) -> Dict[str, Any]:
        """Retrieve an analysis by its ID.
        
        Args:
            analysis_id: Unique identifier for the analysis
        
        Returns:
            Dictionary containing the analysis
            
        Raises:
            ResourceNotFoundError: If the analysis is not found
            InitializationError: If service is not initialized
        """
        try:
            # Check if service is initialized
            self._check_initialized()
            
            # Log the request
            logger.info(f"Retrieving analysis: analysis_id={analysis_id}")
            
            # Simulate processing delay
            self._simulate_delay()
            
            # Check if the analysis exists
            if analysis_id not in self._analyses:
                raise ResourceNotFoundError(f"Analysis not found: {analysis_id}")
            
            # Retrieve the analysis
            analysis = self._analyses[analysis_id]
            
            # Log success (without PHI)
            logger.info(f"Successfully retrieved analysis: analysis_id={analysis_id}")
            
            return analysis
        
        except ResourceNotFoundError as e:
            logger.warning(f"Analysis not found in MockPAT get_analysis_by_id: {str(e)}")
            raise
        
        except InitializationError as e:
            logger.error(f"Initialization error in MockPAT get_analysis_by_id: {str(e)}")
            raise
        
        except Exception as e:
            error_msg = f"Error in MockPAT get_analysis_by_id: {str(e)}"
            logger.error(error_msg)
            raise ResourceNotFoundError(error_msg)
    
    def get_patient_analyses(
        self,
        patient_id: str,
        limit: int = 10,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Retrieve analyses for a patient.
        
        Args:
            patient_id: Unique identifier for the patient
            limit: Maximum number of analyses to return
            offset: Offset for pagination
        
        Returns:
            Dictionary containing the analyses and pagination information
            
        Raises:
            InitializationError: If service is not initialized
        """
        try:
            # Check if service is initialized
            self._check_initialized()
            
            # Log the request (without PHI)
            logger.info(
                f"Retrieving patient analyses: "
                f"limit={limit}, offset={offset}"
            )
            
            # Simulate processing delay
            self._simulate_delay()
            
            # Filter analyses for this patient
            patient_analyses = [
                analysis for analysis in self._analyses.values()
                if analysis.get("patient_id") == patient_id
            ]
            
            # Sort by timestamp (most recent first)
            patient_analyses.sort(
                key=lambda a: a.get("timestamp", ""),
                reverse=True
            )
            
            # Apply pagination
            paginated_analyses = patient_analyses[offset:offset + limit]
            
            # Create summaries
            analysis_summaries = []
            for analysis in paginated_analyses:
                analysis_summaries.append({
                    "analysis_id": analysis.get("analysis_id"),
                    "timestamp": analysis.get("timestamp"),
                    "analysis_types": analysis.get("analysis_types", []),
                    "data_summary": analysis.get("data_summary", {}),
                })
            
            # Create result
            result = {
                "analyses": analysis_summaries,
                "pagination": {
                    "total": len(patient_analyses),
                    "limit": limit,
                    "offset": offset,
                    "has_more": (offset + limit) < len(patient_analyses),
                },
            }
            
            # Log success (without PHI)
            logger.info(
                f"Successfully retrieved patient analyses: "
                f"count={len(analysis_summaries)}"
            )
            
            return result
        
        except InitializationError as e:
            logger.error(f"Initialization error in MockPAT get_patient_analyses: {str(e)}")
            raise
        
        except Exception as e:
            error_msg = f"Error in MockPAT get_patient_analyses: {str(e)}"
            logger.error(error_msg)
            raise InitializationError(error_msg)
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the PAT model.
        
        Returns:
            Dictionary containing model information
            
        Raises:
            InitializationError: If service is not initialized
        """
        try:
            # Check if service is initialized
            self._check_initialized()
            
            # Log the request
            logger.info("Retrieving PAT model information")
            
            # Simulate processing delay
            self._simulate_delay()
            
            # Return mock model information
            model_info = {
                "name": "MockPAT",
                "version": "1.0.0",
                "description": "Mock implementation of the PAT service for testing",
                "capabilities": [
                    "activity_level_analysis",
                    "sleep_analysis",
                    "gait_analysis",
                    "tremor_analysis",
                    "embedding_generation",
                ],
                "maintainer": "Concierge Psychiatry Platform Team",
                "last_updated": "2025-03-28",
                "active": True,
            }
            
            # Log success
            logger.info("Successfully retrieved PAT model information")
            
            return model_info
        
        except InitializationError as e:
            logger.error(f"Initialization error in MockPAT get_model_info: {str(e)}")
            raise
        
        except Exception as e:
            error_msg = f"Error in MockPAT get_model_info: {str(e)}"
            logger.error(error_msg)
            raise InitializationError(error_msg)
    
    def integrate_with_digital_twin(
        self,
        patient_id: str,
        profile_id: str,
        analysis_id: str
    ) -> Dict[str, Any]:
        """Integrate actigraphy analysis with a digital twin profile.
        
        Args:
            patient_id: Unique identifier for the patient
            profile_id: Unique identifier for the digital twin profile
            analysis_id: Unique identifier for the analysis to integrate
        
        Returns:
            Dictionary containing the integration status and updated profile
            
        Raises:
            ResourceNotFoundError: If the analysis or profile is not found
            AuthorizationError: If the analysis does not belong to the patient
            IntegrationError: If integration fails
            InitializationError: If service is not initialized
        """
        try:
            # Check if service is initialized
            self._check_initialized()
            
            # Log the request (without PHI)
            logger.info(
                f"Integrating with Digital Twin: "
                f"profile_id={profile_id}, "
                f"analysis_id={analysis_id}"
            )
            
            # Validate inputs
            self._validate_integration_inputs(patient_id, profile_id, analysis_id)
            
            # Simulate processing delay
            self._simulate_delay()
            
            # Check if the analysis exists
            if analysis_id not in self._analyses:
                raise ResourceNotFoundError(f"Analysis not found: {analysis_id}")
            
            # Get the analysis
            analysis = self._analyses[analysis_id]
            
            # Check if the analysis belongs to the patient
            if analysis.get("patient_id") != patient_id:
                raise AuthorizationError(
                    "The analysis does not belong to the specified patient"
                )
            
            # Generate mock integration result
            integration_id = str(uuid.uuid4())
            timestamp = datetime.datetime.utcnow().isoformat() + "Z"
            
            # Create integration result
            integration_result = {
                "integration_id": integration_id,
                "patient_id": patient_id,
                "profile_id": profile_id,
                "analysis_id": analysis_id,
                "timestamp": timestamp,
                "status": "success",
                "insights": self._generate_mock_insights(analysis),
                "profile_update": {
                    "updated_aspects": [
                        "physical_activity_patterns",
                        "sleep_patterns",
                        "behavioral_patterns",
                    ],
                    "confidence_score": random.uniform(0.85, 0.98),
                    "updated_at": timestamp,
                },
            }
            
            # Store the integration for later retrieval
            self._integrations[integration_id] = integration_result
            
            # Log success (without PHI)
            logger.info(
                f"Successfully integrated with Digital Twin: "
                f"integration_id={integration_id}"
            )
            
            return integration_result
        
        except ResourceNotFoundError as e:
            logger.warning(f"Resource not found in MockPAT integrate_with_digital_twin: {str(e)}")
            raise
        
        except AuthorizationError as e:
            logger.warning(f"Authorization error in MockPAT integrate_with_digital_twin: {str(e)}")
            raise
        
        except InitializationError as e:
            logger.error(f"Initialization error in MockPAT integrate_with_digital_twin: {str(e)}")
            raise
        
        except Exception as e:
            error_msg = f"Error in MockPAT integrate_with_digital_twin: {str(e)}"
            logger.error(error_msg)
            raise IntegrationError(error_msg)
    
    # Helper methods
    
    def _validate_actigraphy_inputs(
        self,
        patient_id: str,
        readings: List[Dict[str, Any]],
        start_time: str,
        end_time: str,
        sampling_rate_hz: float,
        device_info: Dict[str, Any],
        analysis_types: List[str]
    ) -> None:
        """Validate inputs for actigraphy analysis.
        
        Args:
            patient_id: Unique identifier for the patient
            readings: List of accelerometer readings
            start_time: ISO-8601 formatted start time
            end_time: ISO-8601 formatted end time
            sampling_rate_hz: Sampling rate in Hz
            device_info: Information about the device
            analysis_types: List of analysis types to perform
            
        Raises:
            ValidationError: If validation fails
        """
        # Validate patient_id
        if not patient_id:
            raise ValidationError("patient_id is required")
        
        # Validate readings
        if not readings:
            raise ValidationError("readings is required and cannot be empty")
        
        # Validate times
        if not start_time:
            raise ValidationError("start_time is required")
        
        if not end_time:
            raise ValidationError("end_time is required")
        
        # Validate sampling rate
        if sampling_rate_hz <= 0:
            raise ValidationError("sampling_rate_hz must be positive")
        
        # Validate device info
        if not device_info:
            raise ValidationError("device_info is required")
        
        # Validate analysis types
        if not analysis_types:
            raise ValidationError("analysis_types is required and cannot be empty")
        
        # Validate that analysis types are supported
        supported_types = [
            "activity_level_analysis",
            "sleep_analysis",
            "gait_analysis",
            "tremor_analysis",
        ]
        
        for analysis_type in analysis_types:
            if analysis_type not in supported_types:
                raise ValidationError(f"Unsupported analysis type: {analysis_type}")
    
    def _validate_embedding_inputs(
        self,
        patient_id: str,
        readings: List[Dict[str, Any]],
        start_time: str,
        end_time: str,
        sampling_rate_hz: float
    ) -> None:
        """Validate inputs for embedding generation.
        
        Args:
            patient_id: Unique identifier for the patient
            readings: List of accelerometer readings
            start_time: ISO-8601 formatted start time
            end_time: ISO-8601 formatted end time
            sampling_rate_hz: Sampling rate in Hz
            
        Raises:
            ValidationError: If validation fails
        """
        # Validate patient_id
        if not patient_id:
            raise ValidationError("patient_id is required")
        
        # Validate readings
        if not readings:
            raise ValidationError("readings is required and cannot be empty")
        
        # Validate times
        if not start_time:
            raise ValidationError("start_time is required")
        
        if not end_time:
            raise ValidationError("end_time is required")
        
        # Validate sampling rate
        if sampling_rate_hz <= 0:
            raise ValidationError("sampling_rate_hz must be positive")
    
    def _validate_integration_inputs(
        self,
        patient_id: str,
        profile_id: str,
        analysis_id: str
    ) -> None:
        """Validate inputs for digital twin integration.
        
        Args:
            patient_id: Unique identifier for the patient
            profile_id: Unique identifier for the digital twin profile
            analysis_id: Unique identifier for the analysis to integrate
            
        Raises:
            ValidationError: If validation fails
        """
        # Validate patient_id
        if not patient_id:
            raise ValidationError("patient_id is required")
        
        # Validate profile_id
        if not profile_id:
            raise ValidationError("profile_id is required")
        
        # Validate analysis_id
        if not analysis_id:
            raise ValidationError("analysis_id is required")
    
    def _calculate_duration(self, start_time: str, end_time: str) -> float:
        """Calculate duration between two ISO-8601 timestamps in seconds.
        
        Args:
            start_time: ISO-8601 formatted start time
            end_time: ISO-8601 formatted end time
            
        Returns:
            Duration in seconds
        """
        try:
            # Parse ISO-8601 timestamps
            start = datetime.datetime.fromisoformat(start_time.replace("Z", "+00:00"))
            end = datetime.datetime.fromisoformat(end_time.replace("Z", "+00:00"))
            
            # Calculate duration
            duration = (end - start).total_seconds()
            
            return max(0.0, duration)
        
        except Exception:
            # Return a default value if parsing fails
            return 3600.0  # 1 hour
    
    def _generate_mock_result(
        self,
        analysis_type: str,
        readings: List[Dict[str, Any]],
        start_time: str,
        end_time: str
    ) -> Dict[str, Any]:
        """Generate mock analysis result for a specific analysis type.
        
        Args:
            analysis_type: Type of analysis to generate results for
            readings: List of accelerometer readings
            start_time: ISO-8601 formatted start time
            end_time: ISO-8601 formatted end time
            
        Returns:
            Mock analysis result
        """
        if analysis_type == "activity_level_analysis":
            return self._generate_mock_activity_result(readings, start_time, end_time)
        
        elif analysis_type == "sleep_analysis":
            return self._generate_mock_sleep_result(readings, start_time, end_time)
        
        elif analysis_type == "gait_analysis":
            return self._generate_mock_gait_result(readings, start_time, end_time)
        
        elif analysis_type == "tremor_analysis":
            return self._generate_mock_tremor_result(readings, start_time, end_time)
        
        # Default empty result for unknown types
        return {}
    
    def _generate_mock_activity_result(
        self,
        readings: List[Dict[str, Any]],
        start_time: str,
        end_time: str
    ) -> Dict[str, Any]:
        """Generate mock activity level analysis result.
        
        Args:
            readings: List of accelerometer readings
            start_time: ISO-8601 formatted start time
            end_time: ISO-8601 formatted end time
            
        Returns:
            Mock activity analysis result
        """
        # Calculate duration
        duration_seconds = self._calculate_duration(start_time, end_time)
        
        # Generate mock activity levels
        activity_levels = [
            "sedentary",
            "light",
            "moderate",
            "vigorous",
        ]
        
        # Assign random percentages to each activity level
        total = 0.0
        percentages = {}
        for level in activity_levels[:-1]:
            # Ensure we have some room left for the last level
            max_pct = 0.8 * (1.0 - total)
            pct = random.uniform(0.05, max_pct)
            percentages[level] = pct
            total += pct
        
        # Assign remaining percentage to the last level
        percentages[activity_levels[-1]] = 1.0 - total
        
        # Create result
        result = {
            "activity_levels": {
                level: {
                    "percentage": round(percentages[level], 4),
                    "duration_seconds": round(percentages[level] * duration_seconds, 2),
                } for level in activity_levels
            },
            "step_count": random.randint(500, 15000),
            "calories_burned": random.randint(500, 3000),
            "distance_km": round(random.uniform(0.5, 10.0), 2),
            "avg_heart_rate_bpm": random.randint(60, 100),
        }
        
        return result
    
    def _generate_mock_sleep_result(
        self,
        readings: List[Dict[str, Any]],
        start_time: str,
        end_time: str
    ) -> Dict[str, Any]:
        """Generate mock sleep analysis result.
        
        Args:
            readings: List of accelerometer readings
            start_time: ISO-8601 formatted start time
            end_time: ISO-8601 formatted end time
            
        Returns:
            Mock sleep analysis result
        """
        # Calculate duration
        duration_seconds = self._calculate_duration(start_time, end_time)
        
        # Generate mock sleep stages
        sleep_stages = [
            "awake",
            "light",
            "deep",
            "rem",
        ]
        
        # Assign random percentages to each sleep stage
        total = 0.0
        percentages = {}
        for stage in sleep_stages[:-1]:
            # Ensure we have some room left for the last stage
            max_pct = 0.8 * (1.0 - total)
            pct = random.uniform(0.05, max_pct)
            percentages[stage] = pct
            total += pct
        
        # Assign remaining percentage to the last stage
        percentages[sleep_stages[-1]] = 1.0 - total
        
        # Create result
        result = {
            "sleep_stages": {
                stage: {
                    "percentage": round(percentages[stage], 4),
                    "duration_seconds": round(percentages[stage] * duration_seconds, 2),
                } for stage in sleep_stages
            },
            "sleep_efficiency": round(random.uniform(0.7, 0.95), 2),
            "sleep_latency_seconds": random.randint(300, 1800),
            "interruptions_count": random.randint(0, 5),
            "avg_heart_rate_bpm": random.randint(45, 70),
            "respiratory_rate_bpm": round(random.uniform(10.0, 18.0), 1),
        }
        
        return result
    
    def _generate_mock_gait_result(
        self,
        readings: List[Dict[str, Any]],
        start_time: str,
        end_time: str
    ) -> Dict[str, Any]:
        """Generate mock gait analysis result.
        
        Args:
            readings: List of accelerometer readings
            start_time: ISO-8601 formatted start time
            end_time: ISO-8601 formatted end time
            
        Returns:
            Mock gait analysis result
        """
        # Create result
        result = {
            "cadence_steps_per_min": round(random.uniform(50.0, 120.0), 1),
            "stride_length_m": round(random.uniform(0.5, 1.5), 2),
            "gait_speed_m_per_s": round(random.uniform(0.5, 2.0), 2),
            "stride_time_s": round(random.uniform(0.8, 1.5), 2),
            "symmetry_ratio": round(random.uniform(0.85, 1.0), 2),
            "variability": {
                "stride_length_cv": round(random.uniform(0.01, 0.2), 3),
                "stride_time_cv": round(random.uniform(0.01, 0.2), 3),
                "cadence_cv": round(random.uniform(0.01, 0.2), 3),
            },
            "balance_metrics": {
                "mediolateral_jerk": round(random.uniform(0.1, 5.0), 2),
                "vertical_displacement_cm": round(random.uniform(1.0, 5.0), 2),
            },
        }
        
        return result
    
    def _generate_mock_tremor_result(
        self,
        readings: List[Dict[str, Any]],
        start_time: str,
        end_time: str
    ) -> Dict[str, Any]:
        """Generate mock tremor analysis result.
        
        Args:
            readings: List of accelerometer readings
            start_time: ISO-8601 formatted start time
            end_time: ISO-8601 formatted end time
            
        Returns:
            Mock tremor analysis result
        """
        # Create result
        result = {
            "tremor_frequency_hz": round(random.uniform(2.0, 12.0), 1),
            "tremor_amplitude_mg": round(random.uniform(10.0, 100.0), 2),
            "tremor_regularity": round(random.uniform(0.1, 0.9), 2),
            "tremor_type": random.choice([
                "rest", "postural", "kinetic", "intention", "mixed"
            ]),
            "tremor_distribution": {
                "upper_limbs": round(random.uniform(0.0, 1.0), 2),
                "lower_limbs": round(random.uniform(0.0, 1.0), 2),
                "head": round(random.uniform(0.0, 1.0), 2),
            },
            "tremor_severity": random.choice([
                "mild", "moderate", "severe"
            ]),
        }
        
        return result
    
    def _generate_mock_insights(self, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate mock insights from analysis.
        
        Args:
            analysis: Analysis result
            
        Returns:
            List of mock insights
        """
        insights = []
        
        # Generate insights based on analysis types
        analysis_types = analysis.get("analysis_types", [])
        
        if "activity_level_analysis" in analysis_types:
            insights.append({
                "type": "activity_pattern",
                "description": "Daily activity levels show a predominantly sedentary pattern",
                "recommendation": "Consider incorporating more light activity throughout the day",
                "confidence": round(random.uniform(0.7, 0.95), 2),
            })
        
        if "sleep_analysis" in analysis_types:
            insights.append({
                "type": "sleep_quality",
                "description": "Sleep efficiency suggests suboptimal rest quality",
                "recommendation": "Consistent sleep schedule and improved sleep hygiene may be beneficial",
                "confidence": round(random.uniform(0.7, 0.95), 2),
            })
        
        if "gait_analysis" in analysis_types:
            insights.append({
                "type": "mobility",
                "description": "Gait parameters are within normal range but show slight asymmetry",
                "recommendation": "Balance exercises may be beneficial to improve symmetry",
                "confidence": round(random.uniform(0.7, 0.95), 2),
            })
        
        if "tremor_analysis" in analysis_types:
            insights.append({
                "type": "tremor",
                "description": "Minor tremor detected during rest periods",
                "recommendation": "Monitor for changes and consider further clinical assessment if worsening",
                "confidence": round(random.uniform(0.7, 0.95), 2),
            })
        
        # Add general insight
        insights.append({
            "type": "behavioral_pattern",
            "description": "Activity patterns suggest consistent daily routine",
            "recommendation": "Maintain consistency while gradually increasing activity levels",
            "confidence": round(random.uniform(0.7, 0.95), 2),
        })
        
        return insights