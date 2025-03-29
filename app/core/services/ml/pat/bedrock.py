"""
AWS Bedrock implementation of the Physical Activity Tracker (PAT) service.

This module provides a production implementation of the PAT service using
AWS Bedrock for ML model inference, with DynamoDB and S3 for storage.
"""

import json
import logging
import time
import uuid
from datetime import datetime
from typing import Any, Dict, List

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from app.core.services.ml.pat.exceptions import (
    AnalysisError,
    AuthorizationError,
    EmbeddingError,
    InitializationError,
    ResourceNotFoundError,
    StorageError,
    ValidationError,
)
from app.core.services.ml.pat.interface import PATInterface
from app.core.utils.aws import get_aws_session, sanitize_logs

# Set up logging with no PHI
logger = logging.getLogger(__name__)


class BedrockPAT(PATInterface):
    """AWS Bedrock implementation of the PAT service.
    
    This class provides a production implementation of the PAT service
    using AWS Bedrock for ML model inference, with DynamoDB for analysis
    storage and S3 for raw data storage.
    """
    
    def __init__(self) -> None:
        """Initialize the Bedrock PAT service."""
        self._initialized = False
        self._bedrock_client = None
        self._s3_client = None
        self._dynamodb_resource = None
        self._dynamodb_client = None
        self._s3_bucket = None
        self._dynamodb_table = None
        self._model_id = None
        self._kms_key_id = None
        logger.info("BedrockPAT instance created")
    
    def initialize(self, config: Dict[str, Any]) -> None:
        """Initialize the Bedrock PAT service with configuration.
        
        Args:
            config: Configuration dictionary
            
        Raises:
            InitializationError: If initialization fails
        """
        try:
            logger.info("Initializing BedrockPAT")
            
            # Get AWS session
            session = get_aws_session(
                region_name=config.get("aws_region"),
                access_key_id=config.get("aws_access_key_id"),
                secret_access_key=config.get("aws_secret_access_key")
            )
            
            # Create clients
            self._bedrock_client = session.client('bedrock-runtime')
            self._s3_client = session.client('s3')
            self._dynamodb_resource = session.resource('dynamodb')
            self._dynamodb_client = session.client('dynamodb')
            
            # Get configuration
            self._s3_bucket = config.get("pat_s3_bucket")
            self._dynamodb_table = config.get("pat_dynamodb_table")
            self._model_id = config.get("pat_bedrock_model_id")
            self._kms_key_id = config.get("pat_kms_key_id")
            
            # Validate required configuration
            if not self._s3_bucket:
                raise InitializationError("S3 bucket name is required")
                
            if not self._dynamodb_table:
                raise InitializationError("DynamoDB table name is required")
                
            if not self._model_id:
                raise InitializationError("Bedrock model ID is required")
            
            # Verify S3 bucket exists
            try:
                self._s3_client.head_bucket(Bucket=self._s3_bucket)
            except ClientError as e:
                error_code = e.response.get('Error', {}).get('Code')
                if error_code == '404':
                    logger.error(f"S3 bucket {self._s3_bucket} not found")
                    raise InitializationError(f"S3 bucket {self._s3_bucket} not found")
                else:
                    logger.error(f"Error accessing S3 bucket: {str(e)}")
                    raise InitializationError(f"Error accessing S3 bucket: {str(e)}")
            
            # Verify DynamoDB table exists
            try:
                self._dynamodb_client.describe_table(TableName=self._dynamodb_table)
            except ClientError as e:
                if e.response['Error']['Code'] == 'ResourceNotFoundException':
                    logger.error(f"DynamoDB table {self._dynamodb_table} not found")
                    raise InitializationError(f"DynamoDB table {self._dynamodb_table} not found")
                else:
                    logger.error(f"Error accessing DynamoDB table: {str(e)}")
                    raise InitializationError(f"Error accessing DynamoDB table: {str(e)}")
            
            self._initialized = True
            logger.info("BedrockPAT initialized successfully")
        
        except InitializationError:
            # Re-raise initialization errors
            raise
            
        except (BotoCoreError, ClientError) as e:
            logger.error(f"AWS error during initialization: {str(e)}")
            raise InitializationError(f"AWS error during initialization: {str(e)}")
            
        except Exception as e:
            logger.error(f"Failed to initialize BedrockPAT: {str(e)}")
            raise InitializationError(f"Initialization error: {str(e)}")
    
    def _check_initialized(self) -> None:
        """Check if the service is initialized.
        
        Raises:
            InitializationError: If the service is not initialized
        """
        if not self._initialized:
            logger.error("BedrockPAT not initialized")
            raise InitializationError("BedrockPAT not initialized")
    
    def _store_readings_in_s3(
        self,
        patient_id: str,
        readings: List[Dict[str, Any]],
        analysis_id: str
    ) -> str:
        """Store accelerometer readings in S3.
        
        Args:
            patient_id: Patient ID
            readings: List of accelerometer readings
            analysis_id: Analysis ID
            
        Returns:
            S3 object key
            
        Raises:
            StorageError: If storage fails
        """
        try:
            # Create S3 key with proper partitioning for HIPAA compliance
            # Format: pat/patients/{patient_id}/analyses/{analysis_id}/readings.json
            s3_key = f"pat/patients/{patient_id}/analyses/{analysis_id}/readings.json"
            
            # Prepare data for storage
            data = {
                "analysis_id": analysis_id,
                "patient_id": patient_id,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "readings": readings
            }
            
            # Convert to JSON
            json_data = json.dumps(data)
            
            # Store in S3 with encryption
            encryption_args = {}
            if self._kms_key_id:
                encryption_args = {
                    'ServerSideEncryption': 'aws:kms',
                    'SSEKMSKeyId': self._kms_key_id
                }
            else:
                encryption_args = {'ServerSideEncryption': 'AES256'}
            
            self._s3_client.put_object(
                Bucket=self._s3_bucket,
                Key=s3_key,
                Body=json_data,
                ContentType='application/json',
                **encryption_args
            )
            
            return s3_key
        
        except (BotoCoreError, ClientError) as e:
            logger.error(f"AWS error storing readings in S3: {str(e)}")
            raise StorageError(f"Failed to store readings: {str(e)}")
            
        except Exception as e:
            logger.error(f"Error storing readings in S3: {str(e)}")
            raise StorageError(f"Failed to store readings: {str(e)}")
    
    def _store_analysis_in_dynamodb(
        self,
        analysis_result: Dict[str, Any]
    ) -> None:
        """Store analysis results in DynamoDB.
        
        Args:
            analysis_result: Analysis results
            
        Raises:
            StorageError: If storage fails
        """
        try:
            # Get table
            table = self._dynamodb_resource.Table(self._dynamodb_table)
            
            # Clean up any unsupported types
            # Convert to JSON and back to ensure all types are supported by DynamoDB
            clean_result = json.loads(json.dumps(analysis_result, default=str))
            
            # Store in DynamoDB
            table.put_item(Item=clean_result)
            
            # Create a simpler summary item for listing
            summary_item = {
                "PK": f"PATIENT#{analysis_result['patient_id']}",
                "SK": f"ANALYSIS#{analysis_result['analysis_id']}",
                "GSI1PK": "ANALYSES",
                "GSI1SK": f"TIMESTAMP#{analysis_result['created_at']}",
                "patient_id": analysis_result['patient_id'],
                "analysis_id": analysis_result['analysis_id'],
                "created_at": analysis_result['created_at'],
                "analysis_types": analysis_result['analysis_types'],
                "start_time": analysis_result['start_time'],
                "end_time": analysis_result['end_time'],
                "device_type": analysis_result['device_info'].get('device_type', 'unknown'),
                "summary": self._generate_summary(analysis_result['results']),
                "item_type": "ANALYSIS_SUMMARY"
            }
            
            # Store the summary item
            table.put_item(Item=summary_item)
        
        except (BotoCoreError, ClientError) as e:
            logger.error(f"AWS error storing analysis in DynamoDB: {str(e)}")
            raise StorageError(f"Failed to store analysis: {str(e)}")
            
        except Exception as e:
            logger.error(f"Error storing analysis in DynamoDB: {str(e)}")
            raise StorageError(f"Failed to store analysis: {str(e)}")
    
    def _generate_summary(self, results: Dict[str, Any]) -> str:
        """Generate a summary of analysis results.
        
        Args:
            results: Analysis results
            
        Returns:
            Summary string
        """
        summary_parts = []
        
        if "sleep" in results:
            sleep_data = results["sleep"]
            total_sleep = sleep_data.get("total_sleep_minutes", 0)
            summary_parts.append(f"Sleep: {total_sleep // 60}h {total_sleep % 60}m")
        
        if "activity" in results:
            activity_data = results["activity"]
            steps = activity_data.get("activity_summary", {}).get("steps", 0)
            summary_parts.append(f"Steps: {steps}")
        
        if "stress" in results:
            stress_data = results["stress"]
            stress_score = stress_data.get("overall_stress_score", 0)
            summary_parts.append(f"Stress: {stress_score}/100")
        
        if len(summary_parts) > 0:
            return " | ".join(summary_parts)
        else:
            return "Analysis completed"
    
    def _invoke_bedrock_model(
        self,
        prompt: Dict[str, Any],
        service_operation: str
    ) -> Dict[str, Any]:
        """Invoke Bedrock model for inference.
        
        Args:
            prompt: Input prompt for the model
            service_operation: Description of the operation being performed
            
        Returns:
            Model inference results
            
        Raises:
            AnalysisError: If inference fails
        """
        try:
            # Log sanitized request (no PHI)
            sanitized_prompt = sanitize_logs(prompt)
            logger.info(f"Invoking Bedrock model for {service_operation}: {sanitized_prompt}")
            
            # Invoke model
            start_time = time.time()
            response = self._bedrock_client.invoke_model(
                modelId=self._model_id,
                body=json.dumps(prompt)
            )
            end_time = time.time()
            
            # Calculate response time
            response_time_ms = (end_time - start_time) * 1000
            logger.info(f"Bedrock model response time: {response_time_ms:.2f}ms")
            
            # Parse response
            response_body = json.loads(response.get("body").read())
            
            # Log sanitized response (no PHI)
            sanitized_response = sanitize_logs(response_body)
            logger.info(f"Bedrock model response: {sanitized_response}")
            
            return response_body
        
        except (BotoCoreError, ClientError) as e:
            logger.error(f"AWS error invoking Bedrock model: {str(e)}")
            raise AnalysisError(f"Model inference error: {str(e)}")
            
        except Exception as e:
            logger.error(f"Error invoking Bedrock model: {str(e)}")
            raise AnalysisError(f"Model inference error: {str(e)}")
    
    def _generate_clinical_insights(
        self,
        analysis_type: str,
        results: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate clinical insights from analysis results.
        
        Args:
            analysis_type: Type of analysis
            results: Analysis results
            
        Returns:
            List of clinical insights
        """
        prompt = {
            "inputText": json.dumps({
                "analysis_type": analysis_type,
                "results": results
            }),
            "task": "Generate clinical insights from the physical activity data, identifying patterns and making actionable recommendations."
        }
        
        try:
            response = self._invoke_bedrock_model(prompt, "clinical insights generation")
            return response.get("insights", [])
        except AnalysisError:
            # Return empty list on error to avoid failing the entire analysis
            logger.warning("Failed to generate clinical insights, returning empty list")
            return []
    
    def _detect_anomalies(
        self,
        analysis_type: str,
        results: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Detect anomalies in analysis results.
        
        Args:
            analysis_type: Type of analysis
            results: Analysis results
            
        Returns:
            List of detected anomalies
        """
        prompt = {
            "inputText": json.dumps({
                "analysis_type": analysis_type,
                "results": results
            }),
            "task": "Detect anomalies in the physical activity data that may indicate unusual patterns or potential health concerns."
        }
        
        try:
            response = self._invoke_bedrock_model(prompt, "anomaly detection")
            return response.get("anomalies", [])
        except AnalysisError:
            # Return empty list on error to avoid failing the entire analysis
            logger.warning("Failed to detect anomalies, returning empty list")
            return []
    
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
            # Check if initialized
            self._check_initialized()
            
            # Validate inputs
            if not patient_id:
                raise ValidationError("patient_id is required")
                
            if not readings or len(readings) < 10:
                raise ValidationError("At least 10 readings are required")
                
            if not start_time or not end_time:
                raise ValidationError("start_time and end_time are required")
                
            if sampling_rate_hz <= 0:
                raise ValidationError("sampling_rate_hz must be positive")
                
            if not device_info:
                raise ValidationError("device_info is required")
                
            if not analysis_types or len(analysis_types) == 0:
                raise ValidationError("At least one analysis_type is required")
            
            # Generate analysis ID
            analysis_id = str(uuid.uuid4())
            
            # Store raw readings in S3
            s3_key = self._store_readings_in_s3(patient_id, readings, analysis_id)
            
            # Prepare request for Bedrock model
            analysis_request = {
                "patient_id": patient_id,
                "analysis_id": analysis_id,
                "start_time": start_time,
                "end_time": end_time,
                "sampling_rate_hz": sampling_rate_hz,
                "device_info": device_info,
                "analysis_types": analysis_types,
                "reading_count": len(readings),
                "reading_sample": readings[:10]  # Only send sample for prompt
            }
            
            prompt = {
                "inputText": json.dumps(analysis_request),
                "task": "Analyze actigraphy data to extract insights, patterns, and health indicators."
            }
            
            # Invoke Bedrock model for analysis
            analysis_response = self._invoke_bedrock_model(prompt, "actigraphy analysis")
            
            # Process results
            results = analysis_response.get("results", {})
            confidence_scores = analysis_response.get("confidence_scores", {})
            
            # Generate clinical insights and detect anomalies
            clinical_insights = []
            anomalies = []
            
            for analysis_type in analysis_types:
                if analysis_type in results:
                    # Generate insights for this analysis type
                    type_insights = self._generate_clinical_insights(
                        analysis_type, results[analysis_type]
                    )
                    clinical_insights.extend(type_insights)
                    
                    # Detect anomalies for this analysis type
                    type_anomalies = self._detect_anomalies(
                        analysis_type, results[analysis_type]
                    )
                    anomalies.extend(type_anomalies)
            
            # Create analysis result
            analysis_result = {
                "analysis_id": analysis_id,
                "patient_id": patient_id,
                "created_at": datetime.utcnow().isoformat() + "Z",
                "analysis_types": analysis_types,
                "device_info": device_info,
                "start_time": start_time,
                "end_time": end_time,
                "results": results,
                "confidence_scores": confidence_scores,
                "clinical_insights": clinical_insights,
                "anomalies": anomalies,
                "metadata": {
                    "samples_processed": len(readings),
                    "sampling_rate_hz": sampling_rate_hz,
                    "model_id": self._model_id,
                    "storage_location": s3_key
                }
            }
            
            # Store analysis in DynamoDB
            self._store_analysis_in_dynamodb(analysis_result)
            
            return analysis_result
        
        except ValidationError:
            # Re-raise validation errors
            raise
            
        except InitializationError:
            # Re-raise initialization errors
            raise
            
        except StorageError:
            # Re-raise storage errors
            raise
            
        except AnalysisError:
            # Re-raise analysis errors
            raise
            
        except Exception as e:
            logger.error(f"Error in analyze_actigraphy: {str(e)}")
            raise AnalysisError(f"Analysis error: {str(e)}")
    
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
            # Check if initialized
            self._check_initialized()
            
            # Validate inputs
            if not patient_id:
                raise ValidationError("patient_id is required")
                
            if not readings or len(readings) < 10:
                raise ValidationError("At least 10 readings are required")
                
            if not start_time or not end_time:
                raise ValidationError("start_time and end_time are required")
                
            if sampling_rate_hz <= 0:
                raise ValidationError("sampling_rate_hz must be positive")
            
            # Generate embedding ID
            embedding_id = str(uuid.uuid4())
            
            # Store raw readings in S3
            s3_key = self._store_readings_in_s3(patient_id, readings, embedding_id)
            
            # Prepare request for Bedrock model
            embedding_request = {
                "patient_id": patient_id,
                "embedding_id": embedding_id,
                "start_time": start_time,
                "end_time": end_time,
                "sampling_rate_hz": sampling_rate_hz,
                "reading_count": len(readings),
                "reading_sample": readings[:10]  # Only send sample for prompt
            }
            
            prompt = {
                "inputText": json.dumps(embedding_request),
                "task": "Generate vector embeddings from the actigraphy data for similarity comparison and pattern recognition."
            }
            
            # Invoke Bedrock model for embedding generation
            embedding_response = self._invoke_bedrock_model(prompt, "embedding generation")
            
            # Create embedding result
            embedding_result = {
                "embedding_id": embedding_id,
                "patient_id": patient_id,
                "created_at": datetime.utcnow().isoformat() + "Z",
                "start_time": start_time,
                "end_time": end_time,
                "embedding": embedding_response.get("embedding", []),
                "dimensions": len(embedding_response.get("embedding", [])),
                "model_version": embedding_response.get("model_version", "unknown"),
                "metadata": {
                    "samples_processed": len(readings),
                    "sampling_rate_hz": sampling_rate_hz,
                    "model_id": self._model_id,
                    "storage_location": s3_key
                }
            }
            
            # Store embedding in DynamoDB
            table = self._dynamodb_resource.Table(self._dynamodb_table)
            clean_result = json.loads(json.dumps(embedding_result, default=str))
            table.put_item(Item=clean_result)
            
            return embedding_result
        
        except ValidationError:
            # Re-raise validation errors
            raise
            
        except InitializationError:
            # Re-raise initialization errors
            raise
            
        except StorageError:
            # Re-raise storage errors
            raise
            
        except AnalysisError as e:
            # Convert AnalysisError to EmbeddingError
            logger.error(f"Analysis error in get_actigraphy_embeddings: {str(e)}")
            raise EmbeddingError(f"Embedding error: {str(e)}")
            
        except Exception as e:
            logger.error(f"Error in get_actigraphy_embeddings: {str(e)}")
            raise EmbeddingError(f"Embedding error: {str(e)}")
    
    def get_analysis_by_id(self, analysis_id: str) -> Dict[str, Any]:
        """Retrieve an analysis by its ID.
        
        Args:
            analysis_id: Unique identifier for the analysis
        
        Returns:
            Dictionary containing the analysis
            
        Raises:
            ResourceNotFoundError: If the analysis is not found
            StorageError: If retrieval fails
            InitializationError: If service is not initialized
        """
        try:
            # Check if initialized
            self._check_initialized()
            
            # Validate inputs
            if not analysis_id:
                raise ValidationError("analysis_id is required")
            
            # Get table
            table = self._dynamodb_resource.Table(self._dynamodb_table)
            
            # Retrieve analysis from DynamoDB
            # First try to get the complete analysis
            response = table.get_item(
                Key={
                    "analysis_id": analysis_id
                }
            )
            
            item = response.get("Item")
            if not item:
                # Try to find the summary item to get patient_id
                summary_response = table.query(
                    IndexName="GSI1",
                    KeyConditionExpression="GSI1PK = :pk AND begins_with(GSI1SK, :sk)",
                    ExpressionAttributeValues={
                        ":pk": "ANALYSES",
                        ":sk": f"ANALYSIS#{analysis_id}"
                    }
                )
                
                items = summary_response.get("Items", [])
                if not items:
                    raise ResourceNotFoundError(f"Analysis with ID {analysis_id} not found")
                
                # Get analysis using patient_id
                patient_id = items[0].get("patient_id")
                response = table.get_item(
                    Key={
                        "PK": f"PATIENT#{patient_id}",
                        "SK": f"ANALYSIS#{analysis_id}"
                    }
                )
                
                item = response.get("Item")
                if not item:
                    raise ResourceNotFoundError(f"Analysis with ID {analysis_id} not found")
            
            return item
        
        except ResourceNotFoundError:
            # Re-raise resource not found errors
            raise
            
        except ValidationError:
            # Re-raise validation errors
            raise
            
        except InitializationError:
            # Re-raise initialization errors
            raise
            
        except (BotoCoreError, ClientError) as e:
            logger.error(f"AWS error in get_analysis_by_id: {str(e)}")
            raise StorageError(f"Storage error: {str(e)}")
            
        except Exception as e:
            logger.error(f"Error in get_analysis_by_id: {str(e)}")
            raise StorageError(f"Storage error: {str(e)}")
    
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
            StorageError: If retrieval fails
            InitializationError: If service is not initialized
        """
        try:
            # Check if initialized
            self._check_initialized()
            
            # Validate inputs
            if not patient_id:
                raise ValidationError("patient_id is required")
                
            if limit < 1:
                raise ValidationError("limit must be positive")
                
            if offset < 0:
                raise ValidationError("offset must be non-negative")
            
            # Get table
            table = self._dynamodb_resource.Table(self._dynamodb_table)
            
            # Query DynamoDB for analyses summaries
            query_params = {
                "KeyConditionExpression": "PK = :pk AND begins_with(SK, :sk)",
                "ExpressionAttributeValues": {
                    ":pk": f"PATIENT#{patient_id}",
                    ":sk": "ANALYSIS#"
                },
                "ScanIndexForward": False  # Sort by most recent first
            }
            
            # Get total count first (might need to be optimized for large datasets)
            count_response = table.query(
                **query_params,
                Select="COUNT"
            )
            total = count_response.get("Count", 0)
            
            # Apply pagination in query
            if offset > 0:
                # For DynamoDB, we need to fetch and discard
                all_items = []
                last_evaluated_key = None
                
                while len(all_items) < offset + limit:
                    if last_evaluated_key:
                        query_params["ExclusiveStartKey"] = last_evaluated_key
                    
                    page_response = table.query(**query_params, Limit=min(100, offset + limit - len(all_items)))
                    items = page_response.get("Items", [])
                    
                    if not items:
                        break
                    
                    all_items.extend(items)
                    last_evaluated_key = page_response.get("LastEvaluatedKey")
                    
                    if not last_evaluated_key:
                        break
                
                # Apply offset and limit
                items = all_items[offset:offset + limit]
            else:
                # Simple case - just apply limit directly
                response = table.query(**query_params, Limit=limit)
                items = response.get("Items", [])
            
            # Format response
            return {
                "items": items,
                "total": total,
                "limit": limit,
                "offset": offset,
                "has_more": (offset + limit) < total
            }
        
        except ValidationError:
            # Re-raise validation errors
            raise
            
        except InitializationError:
            # Re-raise initialization errors
            raise
            
        except (BotoCoreError, ClientError) as e:
            logger.error(f"AWS error in get_patient_analyses: {str(e)}")
            raise StorageError(f"Storage error: {str(e)}")
            
        except Exception as e:
            logger.error(f"Error in get_patient_analyses: {str(e)}")
            raise StorageError(f"Storage error: {str(e)}")
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the PAT model.
        
        Returns:
            Dictionary containing model information
            
        Raises:
            InitializationError: If service is not initialized
        """
        try:
            # Check if initialized
            self._check_initialized()
            
            # Return model information
            return {
                "name": "BedrockPAT",
                "version": "1.0.0",
                "description": "AWS Bedrock implementation of the PAT service",
                "model_id": self._model_id,
                "s3_bucket": self._s3_bucket,
                "dynamodb_table": self._dynamodb_table,
                "capabilities": [
                    "sleep_analysis",
                    "activity_tracking",
                    "stress_assessment",
                    "circadian_rhythm_analysis",
                    "movement_quality_assessment",
                    "energy_expenditure_estimation",
                    "gait_analysis",
                    "tremor_analysis"
                ],
                "input_format": {
                    "supported_devices": [
                        "smartwatch",
                        "fitness_tracker",
                        "medical_grade",
                        "smartphone",
                        "research_device", 
                        "custom"
                    ],
                    "minimum_sampling_rate_hz": 10.0,
                    "recommended_sampling_rate_hz": 50.0,
                    "minimum_duration_minutes": 5
                }
            }
        
        except InitializationError:
            # Re-raise initialization errors
            raise
            
        except Exception as e:
            logger.error(f"Error in get_model_info: {str(e)}")
            return {
                "name": "BedrockPAT",
                "version": "1.0.0",
                "description": "AWS Bedrock implementation of the PAT service",
                "error": str(e)
            }
    
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
            # Check if initialized
            self._check_initialized()
            
            # Validate inputs
            if not patient_id:
                raise ValidationError("patient_id is required")
                
            if not profile_id:
                raise ValidationError("profile_id is required")
                
            if not analysis_id:
                raise ValidationError("analysis_id is required")
            
            # Get the analysis
            analysis = self.get_analysis_by_id(analysis_id)
            
            # Check if the analysis belongs to the patient
            if analysis.get("patient_id") != patient_id:
                raise AuthorizationError("Analysis does not belong to the patient")
            
            # Prepare request for Bedrock model
            integration_request = {
                "patient_id": patient_id,
                "profile_id": profile_id,
                "analysis_id": analysis_id,
                "analysis_summary": {
                    "analysis_types": analysis.get("analysis_types", []),
                    "device_info": analysis.get("device_info", {}),
                    "start_time": analysis.get("start_time"),
                    "end_time": analysis.get("end_time"),
                    "created_at": analysis.get("created_at")
                }
            }
            
            prompt = {
                "inputText": json.dumps(integration_request),
                "task": "Integrate actigraphy analysis with a digital twin profile to enhance understanding of the patient's physical activity patterns."
            }
            
            # Invoke Bedrock model for integration
            integration_response = self._invoke_bedrock_model(prompt, "digital twin integration")
            
            # Generate integration ID
            integration_id = str(uuid.uuid4())
            
            # Create integration result
            integration_result = {
                "integration_id": integration_id,
                "patient_id": patient_id,
                "profile_id": profile_id,
                "analysis_id": analysis_id,
                "created_at": datetime.utcnow().isoformat() + "Z",
                "status": "completed",
                "insights_added": integration_response.get("insights_added", []),
                "profile_update_summary": integration_response.get("profile_update_summary", {})
            }
            
            # Store integration in DynamoDB
            table = self._dynamodb_resource.Table(self._dynamodb_table)
            clean_result = json.loads(json.dumps(integration_result, default=str))
            table.put_item(Item=clean_result)
            
            return integration_result
        
        except ResourceNotFoundError:
            # Re-raise resource not found errors
            raise
            
        except AuthorizationError:
            # Re-raise authorization errors
            raise
            
        except ValidationError:
            # Re-raise validation errors
            raise
            
        except InitializationError:
            # Re-raise initialization errors
            raise
            
        except StorageError:
            # Re-raise storage errors
            raise
            
        except AnalysisError as e:
            # Convert AnalysisError to IntegrationError
            logger.error(f"Analysis error in integrate_with_digital_twin: {str(e)}")
            raise IntegrationError(f"Integration error: {str(e)}")
            
        except Exception as e:
            logger.error(f"Error in integrate_with_digital_twin: {str(e)}")
            raise IntegrationError(f"Integration error: {str(e)}")