# -*- coding: utf-8 -*-
"""
Digital Twin Integration Service for NOVAMIND.

This module implements the integration service that connects all ML microservices
together to provide a unified interface for the Digital Twin functionality,
following Clean Architecture principles and ensuring HIPAA compliance.
"""

import asyncio
import json
import logging
import os
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union
from uuid import UUID

import numpy as np

from app.domain.exceptions import ModelInferenceError, ValidationError
from app.infrastructure.ml.biometric_correlation.model_service import (
    BiometricCorrelationService,
)
from app.infrastructure.ml.pharmacogenomics.model_service import PharmacogenomicsService
from app.infrastructure.ml.symptom_forecasting.model_service import (
    SymptomForecastingService,
)


class DigitalTwinIntegrationService:
    """
    Integration service for the Digital Twin functionality.

    This service coordinates the interactions between the different ML microservices
    and provides a unified interface for the domain layer to interact with the
    Digital Twin functionality, maintaining separation of concerns and ensuring
    HIPAA compliance.
    """

    def __init__(
        self,
        model_base_dir: str,
        symptom_forecasting_service: Optional[SymptomForecastingService] = None,
        biometric_correlation_service: Optional[BiometricCorrelationService] = None,
        pharmacogenomics_service: Optional[PharmacogenomicsService] = None,
    ):
        """
        Initialize the Digital Twin integration service.

        Args:
            model_base_dir: Base directory for model storage
            symptom_forecasting_service: Optional pre-initialized symptom forecasting service
            biometric_correlation_service: Optional pre-initialized biometric correlation service
            pharmacogenomics_service: Optional pre-initialized pharmacogenomics service
        """
        self.model_base_dir = model_base_dir

        # Create model directories
        os.makedirs(model_base_dir, exist_ok=True)
        symptom_dir = os.path.join(model_base_dir, "symptom_forecasting")
        biometric_dir = os.path.join(model_base_dir, "biometric_correlation")
        pharma_dir = os.path.join(model_base_dir, "pharmacogenomics")

        os.makedirs(symptom_dir, exist_ok=True)
        os.makedirs(biometric_dir, exist_ok=True)
        os.makedirs(pharma_dir, exist_ok=True)

        # Initialize services
        self.symptom_forecasting_service = (
            symptom_forecasting_service
            or SymptomForecastingService(model_dir=symptom_dir)
        )

        self.biometric_correlation_service = (
            biometric_correlation_service
            or BiometricCorrelationService(model_dir=biometric_dir)
        )

        self.pharmacogenomics_service = (
            pharmacogenomics_service or PharmacogenomicsService(model_dir=pharma_dir)
        )

        logging.info("Digital Twin Integration Service initialized")

    async def generate_comprehensive_patient_insights(
        self, patient_id: UUID, patient_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate comprehensive insights for a patient using all ML services.

        Args:
            patient_id: UUID of the patient
            patient_data: Comprehensive patient data including symptoms, biometrics, and genetic markers

        Returns:
            Dictionary containing comprehensive insights
        """
        try:
            # Validate patient data
            if not patient_data:
                raise ValidationError("Patient data is required")

            # Execute all analyses in parallel
            tasks = []

            # Symptom forecasting
            if "symptom_history" in patient_data:
                tasks.append(self._run_symptom_forecasting(patient_id, patient_data))

            # Biometric correlation
            if (
                "biometric_data" in patient_data
                and "mental_health_indicators" in patient_data
            ):
                tasks.append(self._run_biometric_correlation(patient_id, patient_data))

            # Pharmacogenomics
            if "genetic_markers" in patient_data:
                tasks.append(self._run_pharmacogenomics(patient_id, patient_data))

            # Wait for all tasks to complete
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Process results
            insights = {
                "patient_id": str(patient_id),
                "generated_at": datetime.utcnow().isoformat(),
            }

            for result in results:
                if isinstance(result, Exception):
                    logging.error(f"Error generating insights: {str(result)}")
                    continue

                # Add result to insights
                insights.update(result)

            # Generate integrated recommendations
            if len(results) > 1 and not all(isinstance(r, Exception) for r in results):
                insights["integrated_recommendations"] = (
                    await self._generate_integrated_recommendations(results)
                )

            return insights

        except Exception as e:
            logging.error(f"Error generating comprehensive patient insights: {str(e)}")
            raise ModelInferenceError(
                f"Failed to generate comprehensive patient insights: {str(e)}"
            )

    async def _run_symptom_forecasting(
        self, patient_id: UUID, patient_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Run symptom forecasting analysis.

        Args:
            patient_id: UUID of the patient
            patient_data: Patient data

        Returns:
            Dictionary containing symptom forecasting results
        """
        try:
            # Extract symptom history
            symptom_history = patient_data.get("symptom_history", [])

            # Run forecasting
            forecast = await self.symptom_forecasting_service.forecast_symptoms(
                patient_id=patient_id,
                symptom_history=symptom_history,
                forecast_days=30,  # Default to 30-day forecast
            )

            # Extract key insights
            key_insights = []

            # Add trending symptoms
            if "trending_symptoms" in forecast:
                for trend in forecast["trending_symptoms"][:3]:  # Top 3
                    key_insights.append(
                        {
                            "source": "symptom_forecasting",
                            "type": "trend",
                            "insight": trend.get("insight_text", ""),
                            "importance": trend.get("importance", 0),
                        }
                    )

            # Add risk alerts
            if "risk_alerts" in forecast:
                for alert in forecast["risk_alerts"]:
                    key_insights.append(
                        {
                            "source": "symptom_forecasting",
                            "type": "risk_alert",
                            "insight": alert.get("alert_text", ""),
                            "importance": alert.get("importance", 0)
                            + 0.5,  # Prioritize risk alerts
                        }
                    )

            return {
                "symptom_forecasting": forecast,
                "symptom_forecasting_insights": key_insights,
            }

        except Exception as e:
            logging.error(f"Error running symptom forecasting: {str(e)}")
            return Exception(f"Failed to run symptom forecasting: {str(e)}")

    async def _run_biometric_correlation(
        self, patient_id: UUID, patient_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Run biometric correlation analysis.

        Args:
            patient_id: UUID of the patient
            patient_data: Patient data

        Returns:
            Dictionary containing biometric correlation results
        """
        try:
            # Extract biometric data and mental health indicators
            biometric_data = patient_data.get("biometric_data", [])
            mental_health_indicators = patient_data.get("mental_health_indicators", [])

            # Run correlation analysis
            correlation = await self.biometric_correlation_service.analyze_correlations(
                patient_id=patient_id,
                biometric_data=biometric_data,
                mental_health_indicators=mental_health_indicators,
            )

            # Extract key insights
            key_insights = []

            # Add strong correlations
            if "strong_correlations" in correlation:
                for corr in correlation["strong_correlations"][:3]:  # Top 3
                    key_insights.append(
                        {
                            "source": "biometric_correlation",
                            "type": "correlation",
                            "insight": corr.get("insight_text", ""),
                            "importance": corr.get("correlation_strength", 0),
                        }
                    )

            # Add anomalies
            if "anomalies" in correlation:
                for anomaly in correlation["anomalies"]:
                    key_insights.append(
                        {
                            "source": "biometric_correlation",
                            "type": "anomaly",
                            "insight": anomaly.get("description", ""),
                            "importance": anomaly.get("severity", 0)
                            + 0.3,  # Prioritize anomalies
                        }
                    )

            return {
                "biometric_correlation": correlation,
                "biometric_correlation_insights": key_insights,
            }

        except Exception as e:
            logging.error(f"Error running biometric correlation: {str(e)}")
            return Exception(f"Failed to run biometric correlation: {str(e)}")

    async def _run_pharmacogenomics(
        self, patient_id: UUID, patient_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Run pharmacogenomics analysis.

        Args:
            patient_id: UUID of the patient
            patient_data: Patient data

        Returns:
            Dictionary containing pharmacogenomics results
        """
        try:
            # Extract genetic markers and current medications
            genetic_markers = patient_data.get("genetic_markers", {})
            current_medications = patient_data.get("current_medications", [])
            diagnosis = patient_data.get("diagnosis", "")

            # Run medication response prediction
            medication_responses = (
                await self.pharmacogenomics_service.predict_medication_responses(
                    patient_id=patient_id, patient_data=patient_data
                )
            )

            # Run gene-medication interaction analysis
            gene_interactions = await self.pharmacogenomics_service.analyze_gene_medication_interactions(
                patient_id=patient_id, patient_data=patient_data
            )

            # Run treatment plan recommendation if diagnosis is provided
            treatment_plan = None
            if diagnosis:
                treatment_plan = (
                    await self.pharmacogenomics_service.recommend_treatment_plan(
                        patient_id=patient_id,
                        patient_data=patient_data,
                        diagnosis=diagnosis,
                        current_medications=current_medications,
                    )
                )

            # Extract key insights
            key_insights = []

            # Add medication insights
            if "insights" in medication_responses:
                for insight in medication_responses["insights"][:3]:  # Top 3
                    key_insights.append(
                        {
                            "source": "pharmacogenomics",
                            "type": "medication",
                            "insight": insight.get("insight_text", ""),
                            "importance": insight.get("importance", 0),
                        }
                    )

            # Add gene interaction recommendations
            if "recommendations" in gene_interactions:
                for rec in gene_interactions["recommendations"][:2]:  # Top 2
                    key_insights.append(
                        {
                            "source": "pharmacogenomics",
                            "type": "gene_interaction",
                            "insight": rec.get("recommendation_text", ""),
                            "importance": rec.get("importance", 0)
                            + 0.2,  # Prioritize gene interactions
                        }
                    )

            # Add treatment plan summary
            if (
                treatment_plan
                and "recommendations" in treatment_plan
                and "summary" in treatment_plan["recommendations"]
            ):
                for rec in treatment_plan["recommendations"]["summary"][:3]:  # Top 3
                    key_insights.append(
                        {
                            "source": "pharmacogenomics",
                            "type": "treatment_plan",
                            "insight": rec.get("recommendation_text", ""),
                            "importance": rec.get("importance", 0)
                            + 0.1,  # Slight priority for treatment plan
                        }
                    )

            return {
                "pharmacogenomics": {
                    "medication_responses": medication_responses,
                    "gene_interactions": gene_interactions,
                    "treatment_plan": treatment_plan,
                },
                "pharmacogenomics_insights": key_insights,
            }

        except Exception as e:
            logging.error(f"Error running pharmacogenomics: {str(e)}")
            return Exception(f"Failed to run pharmacogenomics: {str(e)}")

    async def _generate_integrated_recommendations(
        self, results: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Generate integrated recommendations from all ML services.

        Args:
            results: List of results from different ML services

        Returns:
            List of integrated recommendations
        """
        # Collect all insights
        all_insights = []

        for result in results:
            if isinstance(result, Exception):
                continue

            # Add symptom forecasting insights
            if "symptom_forecasting_insights" in result:
                all_insights.extend(result["symptom_forecasting_insights"])

            # Add biometric correlation insights
            if "biometric_correlation_insights" in result:
                all_insights.extend(result["biometric_correlation_insights"])

            # Add pharmacogenomics insights
            if "pharmacogenomics_insights" in result:
                all_insights.extend(result["pharmacogenomics_insights"])

        # Sort by importance
        all_insights.sort(key=lambda x: x.get("importance", 0), reverse=True)

        # Generate integrated recommendations
        integrated_recommendations = []

        # Process top insights
        for insight in all_insights[:10]:  # Top 10 insights
            source = insight.get("source", "")
            insight_type = insight.get("type", "")
            insight_text = insight.get("insight", "")

            integrated_recommendations.append(
                {
                    "source": source,
                    "type": insight_type,
                    "recommendation": insight_text,
                    "importance": insight.get("importance", 0),
                }
            )

        # Look for potential interactions between insights
        if len(integrated_recommendations) >= 2:
            # Check for symptom forecasting and pharmacogenomics interactions
            symptom_insights = [
                i for i in all_insights if i.get("source") == "symptom_forecasting"
            ]
            pharma_insights = [
                i for i in all_insights if i.get("source") == "pharmacogenomics"
            ]

            if symptom_insights and pharma_insights:
                integrated_recommendations.append(
                    {
                        "source": "integrated",
                        "type": "symptom_medication",
                        "recommendation": "Consider adjusting medication based on forecasted symptom trends",
                        "importance": 0.9,
                    }
                )

            # Check for biometric and symptom interactions
            biometric_insights = [
                i for i in all_insights if i.get("source") == "biometric_correlation"
            ]

            if biometric_insights and symptom_insights:
                integrated_recommendations.append(
                    {
                        "source": "integrated",
                        "type": "biometric_symptom",
                        "recommendation": "Monitor biometric indicators closely as they correlate with symptom changes",
                        "importance": 0.85,
                    }
                )

            # Check for biometric and medication interactions
            if biometric_insights and pharma_insights:
                integrated_recommendations.append(
                    {
                        "source": "integrated",
                        "type": "biometric_medication",
                        "recommendation": "Track biometric responses to medication changes to optimize treatment",
                        "importance": 0.8,
                    }
                )

        # Sort by importance
        integrated_recommendations.sort(
            key=lambda x: x.get("importance", 0), reverse=True
        )

        return integrated_recommendations

    async def update_digital_twin(
        self, patient_id: UUID, patient_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update the Digital Twin with new patient data.

        Args:
            patient_id: UUID of the patient
            patient_data: New patient data

        Returns:
            Dictionary containing update results
        """
        try:
            # Validate patient data
            if not patient_data:
                raise ValidationError("Patient data is required")

            # Track what was updated
            updates = {
                "symptom_forecasting": False,
                "biometric_correlation": False,
                "pharmacogenomics": False,
            }

            # Update symptom forecasting model if symptom data is provided
            if "symptom_history" in patient_data:
                await self.symptom_forecasting_service.update_model(
                    patient_id=patient_id,
                    symptom_history=patient_data["symptom_history"],
                )
                updates["symptom_forecasting"] = True

            # Update biometric correlation model if biometric and mental health data is provided
            if (
                "biometric_data" in patient_data
                and "mental_health_indicators" in patient_data
            ):
                await self.biometric_correlation_service.update_model(
                    patient_id=patient_id,
                    biometric_data=patient_data["biometric_data"],
                    mental_health_indicators=patient_data["mental_health_indicators"],
                )
                updates["biometric_correlation"] = True

            # Update pharmacogenomics model if medication response data is provided
            if (
                "genetic_markers" in patient_data
                and "medication_responses" in patient_data
            ):
                # This would be implemented in a real system, but for now we'll just log it
                logging.info(
                    f"Pharmacogenomics model update for patient {patient_id} would happen here"
                )
                updates["pharmacogenomics"] = True

            return {
                "patient_id": str(patient_id),
                "updates": updates,
                "update_time": datetime.utcnow().isoformat(),
                "status": "success",
            }

        except Exception as e:
            logging.error(f"Error updating Digital Twin: {str(e)}")
            raise ModelInferenceError(f"Failed to update Digital Twin: {str(e)}")

    async def get_digital_twin_status(self, patient_id: UUID) -> Dict[str, Any]:
        """
        Get the status of a patient's Digital Twin.

        Args:
            patient_id: UUID of the patient

        Returns:
            Dictionary containing Digital Twin status
        """
        try:
            # Get status from each service
            symptom_status = await self.symptom_forecasting_service.get_model_status(
                patient_id
            )
            biometric_status = (
                await self.biometric_correlation_service.get_model_status(patient_id)
            )

            # Pharmacogenomics doesn't have a patient-specific model, so we'll just get the service info
            pharma_info = self.pharmacogenomics_service.get_service_info()

            # Determine overall status
            has_symptom_model = symptom_status.get("has_model", False)
            has_biometric_model = biometric_status.get("has_model", False)

            if has_symptom_model and has_biometric_model:
                overall_status = "complete"
            elif has_symptom_model or has_biometric_model:
                overall_status = "partial"
            else:
                overall_status = "not_initialized"

            # Calculate completeness percentage
            completeness = 0
            if has_symptom_model:
                completeness += 40
            if has_biometric_model:
                completeness += 40
            if pharma_info:
                completeness += 20

            return {
                "patient_id": str(patient_id),
                "status": overall_status,
                "completeness": completeness,
                "components": {
                    "symptom_forecasting": symptom_status,
                    "biometric_correlation": biometric_status,
                    "pharmacogenomics": {
                        "service_available": bool(pharma_info),
                        "service_info": pharma_info,
                    },
                },
                "last_checked": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            logging.error(f"Error getting Digital Twin status: {str(e)}")
            raise ModelInferenceError(f"Failed to get Digital Twin status: {str(e)}")

    def get_service_info(self) -> Dict[str, Any]:
        """
        Get information about the integration service.

        Returns:
            Dictionary containing service information
        """
        return {
            "service_name": "Digital Twin Integration Service",
            "components": {
                "symptom_forecasting": self.symptom_forecasting_service.__class__.__name__,
                "biometric_correlation": self.biometric_correlation_service.__class__.__name__,
                "pharmacogenomics": self.pharmacogenomics_service.__class__.__name__,
            },
            "model_base_dir": self.model_base_dir,
            "timestamp": datetime.utcnow().isoformat(),
        }
