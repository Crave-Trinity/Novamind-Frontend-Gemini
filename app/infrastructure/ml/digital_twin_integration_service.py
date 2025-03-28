# -*- coding: utf-8 -*-
"""
Digital Twin Integration Service Module.

This module provides a HIPAA-compliant digital twin service for
tracking patient data and generating insights over time.
"""

import os
import json
import uuid
import logging
import asyncio
import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple, Set, Union, cast
from datetime import datetime, timedelta

import boto3
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError

from app.api.schemas.ml_schemas import (
    DigitalTwinDataPoint,
    DigitalTwinInsight,
    DigitalTwinDataRequest,
    DigitalTwinDataResponse,
    DigitalTwinQueryRequest,
    DigitalTwinQueryResponse,
    DigitalTwinInsightRequest,
    DigitalTwinInsightResponse,
    InsightType
)
from app.core.config.ml_settings import DigitalTwinSettings
from app.core.exceptions.ml_exceptions import (
    DigitalTwinException,
    DigitalTwinStorageError,
    DigitalTwinQueryError,
    DigitalTwinInsightError,
    DigitalTwinConfigurationError
)
from app.core.utils.logging import get_logger


# Setup logger
logger = get_logger(__name__)


class DigitalTwinStorageStrategy:
    """Base class for digital twin storage strategies."""
    
    async def store_data_points(
        self, 
        patient_id: str, 
        data_points: List[DigitalTwinDataPoint]
    ) -> int:
        """
        Store data points.
        
        Args:
            patient_id: Patient ID
            data_points: Data points to store
            
        Returns:
            Number of data points stored
            
        Raises:
            NotImplementedError: Method must be implemented by subclasses
        """
        raise NotImplementedError("Subclasses must implement store_data_points")
    
    async def query_data_points(
        self, 
        patient_id: str, 
        data_types: Optional[List[str]] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        aggregation: Optional[str] = None
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Query data points.
        
        Args:
            patient_id: Patient ID
            data_types: Data types to retrieve (None for all)
            start_date: Start date for date range
            end_date: End date for date range
            aggregation: Aggregation method (daily, weekly, monthly)
            
        Returns:
            Data points by type
            
        Raises:
            NotImplementedError: Method must be implemented by subclasses
        """
        raise NotImplementedError("Subclasses must implement query_data_points")
    
    async def store_insights(
        self, 
        patient_id: str, 
        insights: List[DigitalTwinInsight]
    ) -> int:
        """
        Store insights.
        
        Args:
            patient_id: Patient ID
            insights: Insights to store
            
        Returns:
            Number of insights stored
            
        Raises:
            NotImplementedError: Method must be implemented by subclasses
        """
        raise NotImplementedError("Subclasses must implement store_insights")
    
    async def query_insights(
        self, 
        patient_id: str, 
        insight_types: Optional[List[InsightType]] = None,
        data_types: Optional[List[str]] = None,
        time_range_days: int = 30
    ) -> List[DigitalTwinInsight]:
        """
        Query insights.
        
        Args:
            patient_id: Patient ID
            insight_types: Types of insights to retrieve (None for all)
            data_types: Data types to filter by (None for all)
            time_range_days: Number of days to look back
            
        Returns:
            List of insights
            
        Raises:
            NotImplementedError: Method must be implemented by subclasses
        """
        raise NotImplementedError("Subclasses must implement query_insights")


class LocalStorageStrategy(DigitalTwinStorageStrategy):
    """Local file storage strategy for digital twin data."""
    
    def __init__(self, storage_path: Path):
        """
        Initialize local storage strategy.
        
        Args:
            storage_path: Path to local storage directory
        """
        self.storage_path = storage_path
        self._ensure_directories()
    
    def _ensure_directories(self) -> None:
        """
        Ensure required directories exist.
        
        Raises:
            DigitalTwinStorageError: If directory creation fails
        """
        try:
            # Create base directory
            self.storage_path.mkdir(parents=True, exist_ok=True)
            
            # Create subdirectories for data and insights
            (self.storage_path / "data").mkdir(exist_ok=True)
            (self.storage_path / "insights").mkdir(exist_ok=True)
            
            logger.info(
                f"Initialized local storage at {self.storage_path}",
                extra={"storage_type": "local"}
            )
        except Exception as e:
            error_msg = f"Failed to create storage directories: {str(e)}"
            logger.error(error_msg)
            raise DigitalTwinStorageError(
                message=error_msg,
                details={"storage_path": str(self.storage_path)}
            )
    
    def _get_patient_data_dir(self, patient_id: str) -> Path:
        """
        Get patient data directory.
        
        Args:
            patient_id: Patient ID
            
        Returns:
            Path to patient data directory
        """
        patient_dir = self.storage_path / "data" / patient_id
        patient_dir.mkdir(exist_ok=True)
        return patient_dir
    
    def _get_patient_insights_dir(self, patient_id: str) -> Path:
        """
        Get patient insights directory.
        
        Args:
            patient_id: Patient ID
            
        Returns:
            Path to patient insights directory
        """
        insights_dir = self.storage_path / "insights" / patient_id
        insights_dir.mkdir(exist_ok=True)
        return insights_dir
    
    async def store_data_points(
        self, 
        patient_id: str, 
        data_points: List[DigitalTwinDataPoint]
    ) -> int:
        """
        Store data points locally.
        
        Args:
            patient_id: Patient ID
            data_points: Data points to store
            
        Returns:
            Number of data points stored
            
        Raises:
            DigitalTwinStorageError: If storage fails
        """
        try:
            patient_dir = self._get_patient_data_dir(patient_id)
            stored_count = 0
            
            # Group data points by type
            data_by_type: Dict[str, List[Dict[str, Any]]] = {}
            
            for point in data_points:
                data_type = point.data_type
                
                if data_type not in data_by_type:
                    data_by_type[data_type] = []
                
                # Convert to dict
                point_dict = point.model_dump()
                
                # Ensure timestamp is string
                if isinstance(point_dict["timestamp"], datetime):
                    point_dict["timestamp"] = point_dict["timestamp"].isoformat()
                
                data_by_type[data_type].append(point_dict)
            
            # Store each data type in a separate file
            for data_type, points in data_by_type.items():
                # File path for this data type
                type_file = patient_dir / f"{data_type}.json"
                
                # Load existing data
                existing_data = []
                if type_file.exists():
                    try:
                        with open(type_file, "r", encoding="utf-8") as f:
                            existing_data = json.load(f)
                    except json.JSONDecodeError:
                        # If file is corrupted, start fresh
                        existing_data = []
                
                # Append new data
                existing_data.extend(points)
                
                # Write back to file
                with open(type_file, "w", encoding="utf-8") as f:
                    json.dump(existing_data, f, indent=2)
                
                stored_count += len(points)
            
            return stored_count
        except Exception as e:
            error_msg = f"Failed to store data points: {str(e)}"
            logger.error(
                error_msg,
                extra={
                    "patient_id": patient_id,
                    "points_count": len(data_points)
                }
            )
            raise DigitalTwinStorageError(
                message=error_msg,
                details={
                    "patient_id": patient_id,
                    "storage_type": "local"
                }
            )
    
    async def query_data_points(
        self, 
        patient_id: str, 
        data_types: Optional[List[str]] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        aggregation: Optional[str] = None
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Query data points from local storage.
        
        Args:
            patient_id: Patient ID
            data_types: Data types to retrieve (None for all)
            start_date: Start date for date range
            end_date: End date for date range
            aggregation: Aggregation method (daily, weekly, monthly)
            
        Returns:
            Data points by type
            
        Raises:
            DigitalTwinQueryError: If query fails
        """
        try:
            patient_dir = self._get_patient_data_dir(patient_id)
            result: Dict[str, List[Dict[str, Any]]] = {}
            
            # List of data types to query
            types_to_query = data_types or []
            
            # If no specific types requested, get all available types
            if not types_to_query:
                for file_path in patient_dir.glob("*.json"):
                    types_to_query.append(file_path.stem)
            
            # Query each data type
            for data_type in types_to_query:
                type_file = patient_dir / f"{data_type}.json"
                
                if not type_file.exists():
                    # Skip if no data for this type
                    continue
                
                # Load data
                with open(type_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                
                # Filter by date range
                filtered_data = self._filter_by_date_range(
                    data, start_date, end_date
                )
                
                # Apply aggregation if requested
                if aggregation:
                    filtered_data = self._aggregate_data(
                        filtered_data, aggregation
                    )
                
                result[data_type] = filtered_data
            
            return result
        except Exception as e:
            error_msg = f"Failed to query data points: {str(e)}"
            logger.error(
                error_msg,
                extra={
                    "patient_id": patient_id,
                    "data_types": data_types
                }
            )
            raise DigitalTwinQueryError(
                message=error_msg,
                details={
                    "patient_id": patient_id,
                    "storage_type": "local"
                }
            )
    
    def _filter_by_date_range(
        self, 
        data: List[Dict[str, Any]],
        start_date: Optional[datetime],
        end_date: Optional[datetime]
    ) -> List[Dict[str, Any]]:
        """
        Filter data by date range.
        
        Args:
            data: Data points to filter
            start_date: Start date (inclusive)
            end_date: End date (inclusive)
            
        Returns:
            Filtered data points
        """
        if not start_date and not end_date:
            return data
        
        filtered = []
        
        for point in data:
            timestamp_str = point.get("timestamp")
            if not timestamp_str:
                continue
            
            try:
                # Parse timestamp
                timestamp = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
                
                # Check range
                if start_date and timestamp < start_date:
                    continue
                if end_date and timestamp > end_date:
                    continue
                
                filtered.append(point)
            except (ValueError, TypeError):
                # Skip points with invalid timestamps
                continue
        
        return filtered
    
    def _aggregate_data(
        self, 
        data: List[Dict[str, Any]],
        aggregation: str
    ) -> List[Dict[str, Any]]:
        """
        Aggregate data by time period.
        
        Args:
            data: Data points to aggregate
            aggregation: Aggregation method (daily, weekly, monthly)
            
        Returns:
            Aggregated data points
        """
        if not data:
            return []
        
        # Sort by timestamp
        data.sort(key=lambda x: x.get("timestamp", ""))
        
        # Group by time period
        grouped: Dict[str, List[Dict[str, Any]]] = {}
        
        for point in data:
            timestamp_str = point.get("timestamp")
            if not timestamp_str:
                continue
            
            try:
                # Parse timestamp
                timestamp = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
                
                # Get time period key
                if aggregation == "daily":
                    key = timestamp.strftime("%Y-%m-%d")
                elif aggregation == "weekly":
                    # Start of week (Monday)
                    week_start = timestamp - timedelta(days=timestamp.weekday())
                    key = week_start.strftime("%Y-%m-%d")
                elif aggregation == "monthly":
                    key = timestamp.strftime("%Y-%m")
                else:
                    # Invalid aggregation, return as is
                    return data
                
                if key not in grouped:
                    grouped[key] = []
                
                grouped[key].append(point)
            except (ValueError, TypeError):
                # Skip points with invalid timestamps
                continue
        
        # Aggregate each group
        result = []
        
        for period, points in grouped.items():
            # Take the average of numeric values, or the most recent value
            if all(isinstance(p.get("value"), (int, float)) for p in points):
                # Average of numeric values
                avg_value = sum(p.get("value", 0) for p in points) / len(points)
                
                # Use the most recent point as template
                aggregated = points[-1].copy()
                aggregated["value"] = avg_value
                aggregated["aggregated"] = True
                aggregated["aggregation_method"] = aggregation
                aggregated["aggregation_count"] = len(points)
                
                result.append(aggregated)
            else:
                # For non-numeric values, use the most recent
                most_recent = points[-1].copy()
                most_recent["aggregated"] = True
                most_recent["aggregation_method"] = aggregation
                most_recent["aggregation_count"] = len(points)
                
                result.append(most_recent)
        
        return result
    
    async def store_insights(
        self, 
        patient_id: str, 
        insights: List[DigitalTwinInsight]
    ) -> int:
        """
        Store insights locally.
        
        Args:
            patient_id: Patient ID
            insights: Insights to store
            
        Returns:
            Number of insights stored
            
        Raises:
            DigitalTwinStorageError: If storage fails
        """
        try:
            insights_dir = self._get_patient_insights_dir(patient_id)
            insights_file = insights_dir / "insights.json"
            
            # Load existing insights
            existing_insights = []
            if insights_file.exists():
                try:
                    with open(insights_file, "r", encoding="utf-8") as f:
                        existing_insights = json.load(f)
                except json.JSONDecodeError:
                    # If file is corrupted, start fresh
                    existing_insights = []
            
            # Convert insights to dicts
            new_insights = [insight.model_dump() for insight in insights]
            
            # Add timestamp to insights
            timestamp = datetime.now().isoformat()
            for insight in new_insights:
                insight["generated_at"] = timestamp
                insight["insight_id"] = str(uuid.uuid4())
            
            # Append new insights
            existing_insights.extend(new_insights)
            
            # Write back to file
            with open(insights_file, "w", encoding="utf-8") as f:
                json.dump(existing_insights, f, indent=2)
            
            return len(new_insights)
        except Exception as e:
            error_msg = f"Failed to store insights: {str(e)}"
            logger.error(
                error_msg,
                extra={
                    "patient_id": patient_id,
                    "insights_count": len(insights)
                }
            )
            raise DigitalTwinStorageError(
                message=error_msg,
                details={
                    "patient_id": patient_id,
                    "storage_type": "local"
                }
            )
    
    async def query_insights(
        self, 
        patient_id: str, 
        insight_types: Optional[List[InsightType]] = None,
        data_types: Optional[List[str]] = None,
        time_range_days: int = 30
    ) -> List[DigitalTwinInsight]:
        """
        Query insights from local storage.
        
        Args:
            patient_id: Patient ID
            insight_types: Types of insights to retrieve (None for all)
            data_types: Data types to filter by (None for all)
            time_range_days: Number of days to look back
            
        Returns:
            List of insights
            
        Raises:
            DigitalTwinQueryError: If query fails
        """
        try:
            insights_dir = self._get_patient_insights_dir(patient_id)
            insights_file = insights_dir / "insights.json"
            
            if not insights_file.exists():
                return []
            
            # Load insights
            with open(insights_file, "r", encoding="utf-8") as f:
                all_insights = json.load(f)
            
            # Calculate date threshold
            now = datetime.now()
            threshold = now - timedelta(days=time_range_days)
            threshold_str = threshold.isoformat()
            
            # Filter insights
            filtered_insights = []
            for insight in all_insights:
                # Filter by date
                generated_at = insight.get("generated_at", "")
                if not generated_at or generated_at < threshold_str:
                    continue
                
                # Filter by insight type
                if insight_types:
                    insight_type_val = insight.get("insight_type")
                    if not insight_type_val or insight_type_val not in [t.value for t in insight_types]:
                        continue
                
                # Filter by data types
                if data_types:
                    insight_data_types = insight.get("data_types", [])
                    if not any(dt in insight_data_types for dt in data_types):
                        continue
                
                filtered_insights.append(insight)
            
            # Convert to DigitalTwinInsight objects
            result = []
            for insight in filtered_insights:
                try:
                    result.append(DigitalTwinInsight(**insight))
                except Exception:
                    # Skip invalid insights
                    continue
            
            return result
        except Exception as e:
            error_msg = f"Failed to query insights: {str(e)}"
            logger.error(
                error_msg,
                extra={
                    "patient_id": patient_id,
                    "insight_types": [t.value for t in insight_types] if insight_types else None
                }
            )
            raise DigitalTwinQueryError(
                message=error_msg,
                details={
                    "patient_id": patient_id,
                    "storage_type": "local"
                }
            )


class AWSStorageStrategy(DigitalTwinStorageStrategy):
    """AWS storage strategy for digital twin data."""
    
    def __init__(
        self,
        aws_region: str,
        storage_bucket: Optional[str] = None,
        table_name: Optional[str] = None,
        aws_access_key_id: Optional[str] = None,
        aws_secret_access_key: Optional[str] = None
    ):
        """
        Initialize AWS storage strategy.
        
        Args:
            aws_region: AWS region
            storage_bucket: S3 bucket name
            table_name: DynamoDB table name
            aws_access_key_id: AWS access key ID
            aws_secret_access_key: AWS secret access key
        """
        self.aws_region = aws_region
        self.storage_bucket = storage_bucket
        self.table_name = table_name
        
        # Initialize AWS clients
        session_kwargs = {"region_name": aws_region}
        if aws_access_key_id and aws_secret_access_key:
            session_kwargs["aws_access_key_id"] = aws_access_key_id
            session_kwargs["aws_secret_access_key"] = aws_secret_access_key
        
        self.session = boto3.Session(**session_kwargs)
        
        # Initialize S3 client if bucket is provided
        self.s3 = None
        if storage_bucket:
            self.s3 = self.session.client("s3")
        
        # Initialize DynamoDB client if table is provided
        self.dynamodb = None
        self.table = None
        if table_name:
            self.dynamodb = self.session.resource("dynamodb")
            self.table = self.dynamodb.Table(table_name)
        
        # Validate at least one storage method is available
        if not self.s3 and not self.table:
            raise DigitalTwinConfigurationError(
                message="No AWS storage method configured",
                details={
                    "storage_bucket": storage_bucket,
                    "table_name": table_name
                }
            )
        
        logger.info(
            "Initialized AWS storage",
            extra={
                "storage_type": "aws",
                "s3_enabled": self.s3 is not None,
                "dynamodb_enabled": self.table is not None
            }
        )
    
    async def store_data_points(
        self, 
        patient_id: str, 
        data_points: List[DigitalTwinDataPoint]
    ) -> int:
        """
        Store data points in AWS.
        
        Args:
            patient_id: Patient ID
            data_points: Data points to store
            
        Returns:
            Number of data points stored
            
        Raises:
            DigitalTwinStorageError: If storage fails
        """
        try:
            # Prefer DynamoDB for data points
            if self.table:
                return await self._store_data_points_dynamodb(patient_id, data_points)
            elif self.s3:
                return await self._store_data_points_s3(patient_id, data_points)
            else:
                raise DigitalTwinStorageError(
                    message="No AWS storage method available",
                    details={"patient_id": patient_id}
                )
        except Exception as e:
            error_msg = f"Failed to store data points in AWS: {str(e)}"
            logger.error(
                error_msg,
                extra={
                    "patient_id": patient_id,
                    "points_count": len(data_points)
                }
            )
            raise DigitalTwinStorageError(
                message=error_msg,
                details={
                    "patient_id": patient_id,
                    "storage_type": "aws"
                }
            )
    
    async def _store_data_points_dynamodb(
        self, 
        patient_id: str, 
        data_points: List[DigitalTwinDataPoint]
    ) -> int:
        """
        Store data points in DynamoDB.
        
        Args:
            patient_id: Patient ID
            data_points: Data points to store
            
        Returns:
            Number of data points stored
            
        Raises:
            DigitalTwinStorageError: If storage fails
        """
        if not self.table:
            raise DigitalTwinStorageError(
                message="DynamoDB table not configured",
                details={"patient_id": patient_id}
            )
        
        stored_count = 0
        
        # Use a loop instead of batch writer to ensure all points are written
        for point in data_points:
            # Convert to dict
            point_dict = point.model_dump()
            
            # Ensure timestamp is string
            if isinstance(point_dict["timestamp"], datetime):
                point_dict["timestamp"] = point_dict["timestamp"].isoformat()
            
            # Add patient ID and unique ID
            item = {
                "patient_id": patient_id,
                "data_id": f"{patient_id}#{point.data_type}#{uuid.uuid4()}",
                "data_type": point.data_type,
                **point_dict
            }
            
            # Store in DynamoDB
            try:
                self.table.put_item(Item=item)
                stored_count += 1
            except ClientError as e:
                logger.error(
                    f"Failed to store data point in DynamoDB: {str(e)}",
                    extra={
                        "patient_id": patient_id,
                        "data_type": point.data_type
                    }
                )
                # Continue with next point
        
        return stored_count
    
    async def _store_data_points_s3(
        self, 
        patient_id: str, 
        data_points: List[DigitalTwinDataPoint]
    ) -> int:
        """
        Store data points in S3.
        
        Args:
            patient_id: Patient ID
            data_points: Data points to store
            
        Returns:
            Number of data points stored
            
        Raises:
            DigitalTwinStorageError: If storage fails
        """
        if not self.s3 or not self.storage_bucket:
            raise DigitalTwinStorageError(
                message="S3 bucket not configured",
                details={"patient_id": patient_id}
            )
        
        # Group data points by type
        data_by_type: Dict[str, List[Dict[str, Any]]] = {}
        
        for point in data_points:
            data_type = point.data_type
            
            if data_type not in data_by_type:
                data_by_type[data_type] = []
            
            # Convert to dict
            point_dict = point.model_dump()
            
            # Ensure timestamp is string
            if isinstance(point_dict["timestamp"], datetime):
                point_dict["timestamp"] = point_dict["timestamp"].isoformat()
            
            data_by_type[data_type].append(point_dict)
        
        stored_count = 0
        
        # Store each data type separately
        for data_type, points in data_by_type.items():
            # S3 key for this data type
            s3_key = f"data/{patient_id}/{data_type}.json"
            
            try:
                # Get existing data if it exists
                existing_data = []
                try:
                    response = self.s3.get_object(
                        Bucket=self.storage_bucket, 
                        Key=s3_key
                    )
                    existing_data = json.loads(response["Body"].read().decode("utf-8"))
                except ClientError as e:
                    # Object doesn't exist, start fresh
                    if e.response["Error"]["Code"] != "NoSuchKey":
                        raise
                
                # Append new data
                existing_data.extend(points)
                
                # Write back to S3
                self.s3.put_object(
                    Bucket=self.storage_bucket,
                    Key=s3_key,
                    Body=json.dumps(existing_data),
                    ContentType="application/json"
                )
                
                stored_count += len(points)
            except Exception as e:
                logger.error(
                    f"Failed to store data in S3: {str(e)}",
                    extra={
                        "patient_id": patient_id,
                        "data_type": data_type
                    }
                )
                # Continue with next data type
        
        return stored_count
    
    async def query_data_points(
        self, 
        patient_id: str, 
        data_types: Optional[List[str]] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        aggregation: Optional[str] = None
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Query data points from AWS.
        
        Args:
            patient_id: Patient ID
            data_types: Data types to retrieve (None for all)
            start_date: Start date for date range
            end_date: End date for date range
            aggregation: Aggregation method (daily, weekly, monthly)
            
        Returns:
            Data points by type
            
        Raises:
            DigitalTwinQueryError: If query fails
        """
        try:
            # Prefer DynamoDB for queries
            if self.table:
                return await self._query_data_points_dynamodb(
                    patient_id, data_types, start_date, end_date, aggregation
                )
            elif self.s3:
                return await self._query_data_points_s3(
                    patient_id, data_types, start_date, end_date, aggregation
                )
            else:
                raise DigitalTwinQueryError(
                    message="No AWS storage method available",
                    details={"patient_id": patient_id}
                )
        except Exception as e:
            error_msg = f"Failed to query data points from AWS: {str(e)}"
            logger.error(
                error_msg,
                extra={
                    "patient_id": patient_id,
                    "data_types": data_types
                }
            )
            raise DigitalTwinQueryError(
                message=error_msg,
                details={
                    "patient_id": patient_id,
                    "storage_type": "aws"
                }
            )
    
    async def _query_data_points_dynamodb(
        self, 
        patient_id: str, 
        data_types: Optional[List[str]] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        aggregation: Optional[str] = None
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Query data points from DynamoDB.
        
        Args:
            patient_id: Patient ID
            data_types: Data types to retrieve (None for all)
            start_date: Start date for date range
            end_date: End date for date range
            aggregation: Aggregation method (daily, weekly, monthly)
            
        Returns:
            Data points by type
            
        Raises:
            DigitalTwinQueryError: If query fails
        """
        if not self.table:
            raise DigitalTwinQueryError(
                message="DynamoDB table not configured",
                details={"patient_id": patient_id}
            )
        
        result: Dict[str, List[Dict[str, Any]]] = {}
        
        # Convert dates to strings for comparison
        start_date_str = start_date.isoformat() if start_date else None
        end_date_str = end_date.isoformat() if end_date else None
        
        # Query all data for this patient
        try:
            response = self.table.query(
                KeyConditionExpression=Key("patient_id").eq(patient_id)
            )
            items = response.get("Items", [])
            
            # Get all pages
            while "LastEvaluatedKey" in response:
                response = self.table.query(
                    KeyConditionExpression=Key("patient_id").eq(patient_id),
                    ExclusiveStartKey=response["LastEvaluatedKey"]
                )
                items.extend(response.get("Items", []))
            
            # Group by data type
            grouped: Dict[str, List[Dict[str, Any]]] = {}
            
            for item in items:
                data_type = item.get("data_type")
                if not data_type:
                    continue
                
                # Filter by data type if specified
                if data_types and data_type not in data_types:
                    continue
                
                # Filter by date range
                timestamp = item.get("timestamp")
                if start_date_str and (not timestamp or timestamp < start_date_str):
                    continue
                if end_date_str and (not timestamp or timestamp > end_date_str):
                    continue
                
                if data_type not in grouped:
                    grouped[data_type] = []
                
                grouped[data_type].append(item)
            
            # Apply aggregation if requested
            for data_type, points in grouped.items():
                if aggregation:
                    # Use helper method for aggregation
                    local_strategy = LocalStorageStrategy(Path("./"))
                    result[data_type] = local_strategy._aggregate_data(points, aggregation)
                else:
                    result[data_type] = points
            
            return result
        except ClientError as e:
            logger.error(
                f"DynamoDB query error: {str(e)}",
                extra={"patient_id": patient_id}
            )
            raise DigitalTwinQueryError(
                message=f"DynamoDB query error: {str(e)}",
                details={"patient_id": patient_id}
            )
    
    async def _query_data_points_s3(
        self, 
        patient_id: str, 
        data_types: Optional[List[str]] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        aggregation: Optional[str] = None
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Query data points from S3.
        
        Args:
            patient_id: Patient ID
            data_types: Data types to retrieve (None for all)
            start_date: Start date for date range
            end_date: End date for date range
            aggregation: Aggregation method (daily, weekly, monthly)
            
        Returns:
            Data points by type
            
        Raises:
            DigitalTwinQueryError: If query fails
        """
        if not self.s3 or not self.storage_bucket:
            raise DigitalTwinQueryError(
                message="S3 bucket not configured",
                details={"patient_id": patient_id}
            )
        
        result: Dict[str, List[Dict[str, Any]]] = {}
        
        # If no specific data types, list all available types
        if not data_types:
            try:
                # List objects in the patient's directory
                response = self.s3.list_objects_v2(
                    Bucket=self.storage_bucket,
                    Prefix=f"data/{patient_id}/"
                )
                
                data_types = []
                for obj in response.get("Contents", []):
                    key = obj.get("Key", "")
                    if key.endswith(".json"):
                        # Extract data type from key (e.g., data/P12345/mood.json -> mood)
                        data_type = key.split("/")[-1].replace(".json", "")
                        data_types.append(data_type)
            except ClientError as e:
                logger.error(
                    f"S3 list objects error: {str(e)}",
                    extra={"patient_id": patient_id}
                )
                # Continue with empty data_types
        
        # Query each data type
        for data_type in data_types:
            s3_key = f"data/{patient_id}/{data_type}.json"
            
            try:
                # Get data from S3
                response = self.s3.get_object(
                    Bucket=self.storage_bucket, 
                    Key=s3_key
                )
                data = json.loads(response["Body"].read().decode("utf-8"))
                
                # Filter by date range
                local_strategy = LocalStorageStrategy(Path("./"))
                filtered_data = local_strategy._filter_by_date_range(
                    data, start_date, end_date
                )
                
                # Apply aggregation if requested
                if aggregation:
                    filtered_data = local_strategy._aggregate_data(
                        filtered_data, aggregation
                    )
                
                result[data_type] = filtered_data
            except ClientError as e:
                # Skip if file doesn't exist
                if e.response["Error"]["Code"] == "NoSuchKey":
                    continue
                
                logger.error(
                    f"S3 get object error: {str(e)}",
                    extra={
                        "patient_id": patient_id,
                        "data_type": data_type
                    }
                )
                # Continue with next data type
        
        return result
    
    async def store_insights(
        self, 
        patient_id: str, 
        insights: List[DigitalTwinInsight]
    ) -> int:
        """
        Store insights in AWS.
        
        Args:
            patient_id: Patient ID
            insights: Insights to store
            
        Returns:
            Number of insights stored
            
        Raises:
            DigitalTwinStorageError: If storage fails
        """
        try:
            # Prefer DynamoDB for insights
            if self.table:
                return await self._store_insights_dynamodb(patient_id, insights)
            elif self.s3:
                return await self._store_insights_s3(patient_id, insights)
            else:
                raise DigitalTwinStorageError(
                    message="No AWS storage method available",
                    details={"patient_id": patient_id}
                )
        except Exception as e:
            error_msg = f"Failed to store insights in AWS: {str(e)}"
            logger.error(
                error_msg,
                extra={
                    "patient_id": patient_id,
                    "insights_count": len(insights)
                }
            )
            raise DigitalTwinStorageError(
                message=error_msg,
                details={
                    "patient_id": patient_id,
                    "storage_type": "aws"
                }
            )
    
    async def _store_insights_dynamodb(
        self, 
        patient_id: str, 
        insights: List[DigitalTwinInsight]
    ) -> int:
        """
        Store insights in DynamoDB.
        
        Args:
            patient_id: Patient ID
            insights: Insights to store
            
        Returns:
            Number of insights stored
        """
        if not self.table:
            raise DigitalTwinStorageError(
                message="DynamoDB table not configured",
                details={"patient_id": patient_id}
            )
        
        stored_count = 0
        timestamp = datetime.now().isoformat()
        
        # Use a loop instead of batch writer to ensure all insights are written
        for insight in insights:
            # Convert to dict
            insight_dict = insight.model_dump()
            
            # Add patient ID, timestamp, and unique ID
            item = {
                "patient_id": patient_id,
                "insight_id": f"{patient_id}#insight#{uuid.uuid4()}",
                "generated_at": timestamp,
                **insight_dict
            }
            
            # Store in DynamoDB
            try:
                self.table.put_item(Item=item)
                stored_count += 1
            except ClientError as e:
                logger.error(
                    f"Failed to store insight in DynamoDB: {str(e)}",
                    extra={
                        "patient_id": patient_id,
                        "insight_type": insight.insight_type
                    }
                )
                # Continue with next insight
        
        return stored_count
    
    async def _store_insights_s3(
        self, 
        patient_id: str, 
        insights: List[DigitalTwinInsight]
    ) -> int:
        """
        Store insights in S3.
        
        Args:
            patient_id: Patient ID
            insights: Insights to store
            
        Returns:
            Number of insights stored
        """
        if not self.s3 or not self.storage_bucket:
            raise DigitalTwinStorageError(
                message="S3 bucket not configured",
                details={"patient_id": patient_id}
            )
        
        # S3 key for insights
        s3_key = f"insights/{patient_id}/insights.json"
        
        # Convert insights to dicts
        new_insights = [insight.model_dump() for insight in insights]
        
        # Add timestamp and unique ID to insights
        timestamp = datetime.now().isoformat()
        for insight in new_insights:
            insight["generated_at"] = timestamp
            insight["insight_id"] = str(uuid.uuid4())
        
        try:
            # Get existing insights if file exists
            existing_insights = []
            try:
                response = self.s3.get_object(
                    Bucket=self.storage_bucket, 
                    Key=s3_key
                )
                existing_insights = json.loads(response["Body"].read().decode("utf-8"))
            except ClientError as e:
                # Object doesn't exist, start fresh
                if e.response["Error"]["Code"] != "NoSuchKey":
                    raise
            
            # Append new insights
            existing_insights.extend(new_insights)
            
            # Write back to S3
            self.s3.put_object(
                Bucket=self.storage_bucket,
                Key=s3_key,
                Body=json.dumps(existing_insights),
                ContentType="application/json"
            )
            
            return len(new_insights)
        except Exception as e:
            logger.error(
                f"Failed to store insights in S3: {str(e)}",
                extra={"patient_id": patient_id}
            )
            raise
    
    async def query_insights(
        self, 
        patient_id: str, 
        insight_types: Optional[List[InsightType]] = None,
        data_types: Optional[List[str]] = None,
        time_range_days: int = 30
    ) -> List[DigitalTwinInsight]:
        """
        Query insights from AWS.
        
        Args:
            patient_id: Patient ID
            insight_types: Types of insights to retrieve (None for all)
            data_types: Data types to filter by (None for all)
            time_range_days: Number of days to look back
            
        Returns:
            List of insights
            
        Raises:
            DigitalTwinQueryError: If query fails
        """
        try:
            # Prefer DynamoDB for queries
            if self.table:
                return await self._query_insights_dynamodb(
                    patient_id, insight_types, data_types, time_range_days
                )
            elif self.s3:
                return await self._query_insights_s3(
                    patient_id, insight_types, data_types, time_range_days
                )
            else:
                raise DigitalTwinQueryError(
                    message="No AWS storage method available",
                    details={"patient_id": patient_id}
                )
        except Exception as e:
            error_msg = f"Failed to query insights from AWS: {str(e)}"
            logger.error(
                error_msg,
                extra={
                    "patient_id": patient_id,
                    "insight_types": [t.value for t in insight_types] if insight_types else None
                }
            )
            raise DigitalTwinQueryError(
                message=error_msg,
                details={
                    "patient_id": patient_id,
                    "storage_type": "aws"
                }
            )
    
    async def _query_insights_dynamodb(
        self, 
        patient_id: str, 
        insight_types: Optional[List[InsightType]] = None,
        data_types: Optional[List[str]] = None,
        time_range_days: int = 30
    ) -> List[DigitalTwinInsight]:
        """
        Query insights from DynamoDB.
        
        Args:
            patient_id: Patient ID
            insight_types: Types of insights to retrieve (None for all)
            data_types: Data types to filter by (None for all)
            time_range_days: Number of days to look back
            
        Returns:
            List of insights
        """
        if not self.table:
            raise DigitalTwinQueryError(
                message="DynamoDB table not configured",
                details={"patient_id": patient_id}
            )
        
        # Calculate date threshold
        now = datetime.now()
        threshold = now - timedelta(days=time_range_days)
        threshold_str = threshold.isoformat()
        
        # Query all insights for this patient
        try:
            response = self.table.query(
                KeyConditionExpression=Key("patient_id").eq(patient_id)
            )
            items = response.get("Items", [])
            
            # Get all pages
            while "LastEvaluatedKey" in response:
                response = self.table.query(
                    KeyConditionExpression=Key("patient_id").eq(patient_id),
                    ExclusiveStartKey=response["LastEvaluatedKey"]
                )
                items.extend(response.get("Items", []))
            
            # Filter insights
            filtered_items = []
            for item in items:
                # Check if it's an insight
                if "insight_type" not in item:
                    continue
                
                # Filter by date
                generated_at = item.get("generated_at", "")
                if not generated_at or generated_at < threshold_str:
                    continue
                
                # Filter by insight type
                if insight_types:
                    insight_type_val = item.get("insight_type")
                    if not insight_type_val or insight_type_val not in [t.value for t in insight_types]:
                        continue
                
                # Filter by data types
                if data_types:
                    item_data_types = item.get("data_types", [])
                    if not any(dt in item_data_types for dt in data_types):
                        continue
                
                filtered_items.append(item)
            
            # Convert to DigitalTwinInsight objects
            result = []
            for item in filtered_items:
                try:
                    result.append(DigitalTwinInsight(**item))
                except Exception:
                    # Skip invalid insights
                    continue
            
            return result
        except ClientError as e:
            logger.error(
                f"DynamoDB query error: {str(e)}",
                extra={"patient_id": patient_id}
            )
            raise DigitalTwinQueryError(
                message=f"DynamoDB query error: {str(e)}",
                details={"patient_id": patient_id}
            )
    
    async def _query_insights_s3(
        self, 
        patient_id: str, 
        insight_types: Optional[List[InsightType]] = None,
        data_types: Optional[List[str]] = None,
        time_range_days: int = 30
    ) -> List[DigitalTwinInsight]:
        """
        Query insights from S3.
        
        Args:
            patient_id: Patient ID
            insight_types: Types of insights to retrieve (None for all)
            data_types: Data types to filter by (None for all)
            time_range_days: Number of days to look back
            
        Returns:
            List of insights
        """
        if not self.s3 or not self.storage_bucket:
            raise DigitalTwinQueryError(
                message="S3 bucket not configured",
                details={"patient_id": patient_id}
            )
        
        # S3 key for insights
        s3_key = f"insights/{patient_id}/insights.json"
        
        try:
            # Get insights from S3
            response = self.s3.get_object(
                Bucket=self.storage_bucket, 
                Key=s3_key
            )
            all_insights = json.loads(response["Body"].read().decode("utf-8"))
            
            # Calculate date threshold
            now = datetime.now()
            threshold = now - timedelta(days=time_range_days)
            threshold_str = threshold.isoformat()
            
            # Filter insights
            filtered_insights = []
            for insight in all_insights:
                # Filter by date
                generated_at = insight.get("generated_at", "")
                if not generated_at or generated_at < threshold_str:
                    continue
                
                # Filter by insight type
                if insight_types:
                    insight_type_val = insight.get("insight_type")
                    if not insight_type_val or insight_type_val not in [t.value for t in insight_types]:
                        continue
                
                # Filter by data types
                if data_types:
                    insight_data_types = insight.get("data_types", [])
                    if not any(dt in insight_data_types for dt in data_types):
                        continue
                
                filtered_insights.append(insight)
            
            # Convert to DigitalTwinInsight objects
            result = []
            for insight in filtered_insights:
                try:
                    result.append(DigitalTwinInsight(**insight))
                except Exception:
                    # Skip invalid insights
                    continue
            
            return result
        except ClientError as e:
            # Return empty list if file doesn't exist
            if e.response["Error"]["Code"] == "NoSuchKey":
                return []
            
            logger.error(
                f"S3 get object error: {str(e)}",
                extra={"patient_id": patient_id}
            )
            raise DigitalTwinQueryError(
                message=f"S3 get object error: {str(e)}",
                details={"patient_id": patient_id}
            )


class DigitalTwinService:
    """Service for managing digital twin data and insights."""
    
    def __init__(self, settings: DigitalTwinSettings):
        """
        Initialize Digital Twin service.
        
        Args:
            settings: Digital Twin settings
        """
        self.settings = settings
        self.storage_strategy: DigitalTwinStorageStrategy = self._create_storage_strategy()
        
        logger.info(
            "Initialized Digital Twin service",
            extra={
                "aws_enabled": settings.enable_aws_storage,
                "local_enabled": settings.enable_local_storage
            }
        )
    
    def _create_storage_strategy(self) -> DigitalTwinStorageStrategy:
        """
        Create the storage strategy based on settings.
        
        Returns:
            Storage strategy
            
        Raises:
            DigitalTwinConfigurationError: If no storage method is available
        """
        # Check if AWS storage is enabled
        if self.settings.enable_aws_storage:
            try:
                return AWSStorageStrategy(
                    aws_region=self.settings.aws_region or "us-east-1",
                    storage_bucket=self.settings.storage_bucket,
                    table_name=self.settings.table_name,
                    aws_access_key_id=self.settings.aws_access_key_id,
                    aws_secret_access_key=self.settings.aws_secret_access_key
                )
            except Exception as e:
                logger.warning(
                    f"Failed to initialize AWS storage: {str(e)}. Falling back to local storage."
                )
                # Fall back to local storage
        
        # Check if local storage is enabled
        if self.settings.enable_local_storage:
            storage_path = self.settings.local_storage_path
            if isinstance(storage_path, str):
                storage_path = Path(storage_path)
            
            return LocalStorageStrategy(storage_path)
        
        # If we get here, no storage method is available
        raise DigitalTwinConfigurationError(
            message="No storage method available",
            details={
                "aws_enabled": self.settings.enable_aws_storage,
                "local_enabled": self.settings.enable_local_storage
            }
        )
    
    async def store_data(self, request: DigitalTwinDataRequest) -> DigitalTwinDataResponse:
        """
        Store digital twin data.
        
        Args:
            request: Data storage request
            
        Returns:
            Data storage response
            
        Raises:
            DigitalTwinStorageError: If storage fails
        """
        try:
            stored_count = await self.storage_strategy.store_data_points(
                request.patient_id,
                request.data_points
            )
            
            return DigitalTwinDataResponse(
                success=True,
                patient_id=request.patient_id,
                message="Data stored successfully",
                data_count=stored_count
            )
        except Exception as e:
            logger.error(
                f"Error storing digital twin data: {str(e)}",
                extra={"patient_id": request.patient_id}
            )
            raise DigitalTwinStorageError(
                message=f"Error storing digital twin data: {str(e)}",
                details={"patient_id": request.patient_id}
            )
    
    async def query_data(self, request: DigitalTwinQueryRequest) -> DigitalTwinQueryResponse:
        """
        Query digital twin data.
        
        Args:
            request: Data query request
            
        Returns:
            Data query response
            
        Raises:
            DigitalTwinQueryError: If query fails
        """
        try:
            data = await self.storage_strategy.query_data_points(
                request.patient_id,
                request.data_types,
                request.start_date,
                request.end_date,
                request.aggregation
            )
            
            # Count total data points
            total_count = sum(len(points) for points in data.values())
            
            return DigitalTwinQueryResponse(
                patient_id=request.patient_id,
                data=data,
                count=total_count,
                aggregation=request.aggregation
            )
        except Exception as e:
            logger.error(
                f"Error querying digital twin data: {str(e)}",
                extra={"patient_id": request.patient_id}
            )
            raise DigitalTwinQueryError(
                message=f"Error querying digital twin data: {str(e)}",
                details={"patient_id": request.patient_id}
            )
    
    async def generate_insights(self, request: DigitalTwinInsightRequest) -> DigitalTwinInsightResponse:
        """
        Generate and store insights from digital twin data.
        
        Args:
            request: Insight request
            
        Returns:
            Insight response
            
        Raises:
            DigitalTwinInsightError: If insight generation fails
        """
        try:
            # First, query the data
            data_response = await self.query_data(
                DigitalTwinQueryRequest(
                    patient_id=request.patient_id,
                    data_types=request.data_types,
                    start_date=datetime.now() - timedelta(days=request.time_range_days),
                    end_date=None,
                    aggregation=None
                )
            )
            
            # Generate insights from the data
            insights = await self._generate_insights_from_data(
                request.patient_id,
                data_response.data,
                request.insight_types
            )
            
            # Store the insights
            if insights:
                await self.storage_strategy.store_insights(
                    request.patient_id,
                    insights
                )
            
            return DigitalTwinInsightResponse(
                patient_id=request.patient_id,
                insights=insights,
                count=len(insights)
            )
        except Exception as e:
            logger.error(
                f"Error generating insights: {str(e)}",
                extra={"patient_id": request.patient_id}
            )
            raise DigitalTwinInsightError(
                message=f"Error generating insights: {str(e)}",
                details={"patient_id": request.patient_id}
            )
    
    async def query_insights(self, request: DigitalTwinInsightRequest) -> DigitalTwinInsightResponse:
        """
        Query existing insights.
        
        Args:
            request: Insight request
            
        Returns:
            Insight response
            
        Raises:
            DigitalTwinQueryError: If query fails
        """
        try:
            insights = await self.storage_strategy.query_insights(
                request.patient_id,
                request.insight_types,
                request.data_types,
                request.time_range_days
            )
            
            return DigitalTwinInsightResponse(
                patient_id=request.patient_id,
                insights=insights,
                count=len(insights)
            )
        except Exception as e:
            logger.error(
                f"Error querying insights: {str(e)}",
                extra={"patient_id": request.patient_id}
            )
            raise DigitalTwinQueryError(
                message=f"Error querying insights: {str(e)}",
                details={"patient_id": request.patient_id}
            )
    
    async def _generate_insights_from_data(
        self,
        patient_id: str,
        data: Dict[str, List[Dict[str, Any]]],
        insight_types: Optional[List[InsightType]] = None
    ) -> List[DigitalTwinInsight]:
        """
        Generate insights from patient data.
        
        Args:
            patient_id: Patient ID
            data: Patient data by type
            insight_types: Types of insights to generate (None for all)
            
        Returns:
            Generated insights
        """
        # If no insight types specified, use all types
        if not insight_types:
            insight_types = list(InsightType)
        
        insights: List[DigitalTwinInsight] = []
        
        # Generate each type of insight
        for insight_type in insight_types:
            if insight_type == InsightType.TREND:
                trend_insights = self._generate_trend_insights(data)
                insights.extend(trend_insights)
            
            elif insight_type == InsightType.CORRELATION:
                correlation_insights = self._generate_correlation_insights(data)
                insights.extend(correlation_insights)
            
            elif insight_type == InsightType.ANOMALY:
                anomaly_insights = self._generate_anomaly_insights(data)
                insights.extend(anomaly_insights)
            
            elif insight_type == InsightType.PREDICTION:
                prediction_insights = self._generate_prediction_insights(data)
                insights.extend(prediction_insights)
            
            elif insight_type == InsightType.RECOMMENDATION:
                recommendation_insights = self._generate_recommendation_insights(data)
                insights.extend(recommendation_insights)
        
        return insights
    
    def _generate_trend_insights(self, data: Dict[str, List[Dict[str, Any]]]) -> List[DigitalTwinInsight]:
        """
        Generate trend insights.
        
        Args:
            data: Patient data by type
            
        Returns:
            Trend insights
        """
        insights: List[DigitalTwinInsight] = []
        
        # Process each data type
        for data_type, points in data.items():
            # Skip if not enough data points
            if len(points) < 3:
                continue
            
            # Only process numeric data
            if not all(isinstance(p.get("value"), (int, float)) for p in points):
                continue
            
            # Sort by timestamp
            points.sort(key=lambda x: x.get("timestamp", ""))
            
            # Calculate trend
            values = [float(p.get("value", 0)) for p in points]
            
            # Simple trend detection (mean of first half vs second half)
            mid_point = len(values) // 2
            first_half = values[:mid_point]
            second_half = values[mid_point:]
            
            if not first_half or not second_half:
                continue
            
            first_mean = sum(first_half) / len(first_half)
            second_mean = sum(second_half) / len(second_half)
            
            # Calculate percent change
            percent_change = ((second_mean - first_mean) / first_mean * 100) if first_mean != 0 else 0
            
            # Generate insight if significant change
            if abs(percent_change) >= 5:
                direction = "increasing" if percent_change > 0 else "decreasing"
                
                insight = DigitalTwinInsight(
                    insight_type=InsightType.TREND,
                    data_types=[data_type],
                    description=f"{data_type.capitalize()} has been {direction} over time (change: {percent_change:.1f}%).",
                    confidence=min(0.5 + abs(percent_change) / 100, 0.95),
                    metadata={
                        "data_type": data_type,
                        "first_mean": first_mean,
                        "second_mean": second_mean,
                        "percent_change": percent_change,
                        "data_points": len(values)
                    }
                )
                
                insights.append(insight)
        
        return insights
    
    def _generate_correlation_insights(self, data: Dict[str, List[Dict[str, Any]]]) -> List[DigitalTwinInsight]:
        """
        Generate correlation insights.
        
        Args:
            data: Patient data by type
            
        Returns:
            Correlation insights
        """
        insights: List[DigitalTwinInsight] = []
        data_types = list(data.keys())
        
        # Need at least 2 data types to find correlations
        if len(data_types) < 2:
            return insights
        
        # Check pairs of data types
        for i in range(len(data_types)):
            for j in range(i + 1, len(data_types)):
                type_a = data_types[i]
                type_b = data_types[j]
                
                points_a = data[type_a]
                points_b = data[type_b]
                
                # Skip if not enough data points
                if len(points_a) < 5 or len(points_b) < 5:
                    continue
                
                # Only process numeric data
                if not all(isinstance(p.get("value"), (int, float)) for p in points_a + points_b):
                    continue
                
                # Get corresponding values
                # This is a simplified approach; a real implementation would need
                # to align timestamps or use time-series analysis
                values_a = [float(p.get("value", 0)) for p in points_a][:min(len(points_a), len(points_b))]
                values_b = [float(p.get("value", 0)) for p in points_b][:min(len(points_a), len(points_b))]
                
                # Simple correlation calculation
                # Calculate means
                mean_a = sum(values_a) / len(values_a)
                mean_b = sum(values_b) / len(values_b)
                
                # Calculate covariance and standard deviations
                covariance = sum((a - mean_a) * (b - mean_b) for a, b in zip(values_a, values_b)) / len(values_a)
                std_a = (sum((a - mean_a) ** 2 for a in values_a) / len(values_a)) ** 0.5
                std_b = (sum((b - mean_b) ** 2 for b in values_b) / len(values_b)) ** 0.5
                
                # Calculate correlation coefficient
                correlation = covariance / (std_a * std_b) if std_a * std_b != 0 else 0
                
                # Generate insight if significant correlation
                if abs(correlation) >= 0.5:
                    direction = "positive" if correlation > 0 else "negative"
                    strength = "strong" if abs(correlation) >= 0.7 else "moderate"
                    
                    insight = DigitalTwinInsight(
                        insight_type=InsightType.CORRELATION,
                        data_types=[type_a, type_b],
                        description=f"There appears to be a {strength} {direction} correlation between {type_a} and {type_b} (correlation: {correlation:.2f}).",
                        confidence=min(0.5 + abs(correlation) / 2, 0.95),
                        metadata={
                            "data_types": [type_a, type_b],
                            "correlation": correlation,
                            "data_points": min(len(points_a), len(points_b))
                        }
                    )
                    
                    insights.append(insight)
        
        return insights
    
    def _generate_anomaly_insights(self, data: Dict[str, List[Dict[str, Any]]]) -> List[DigitalTwinInsight]:
        """
        Generate anomaly insights.
        
        Args:
            data: Patient data by type
            
        Returns:
            Anomaly insights
        """
        insights: List[DigitalTwinInsight] = []
        
        # Process each data type
        for data_type, points in data.items():
            # Skip if not enough data points
            if len(points) < 5:
                continue
            
            # Only process numeric data
            if not all(isinstance(p.get("value"), (int, float)) for p in points):
                continue
            
            # Sort by timestamp
            points.sort(key=lambda x: x.get("timestamp", ""))
            
            # Calculate mean and standard deviation
            values = [float(p.get("value", 0)) for p in points]
            mean = sum(values) / len(values)
            std_dev = (sum((x - mean) ** 2 for x in values) / len(values)) ** 0.5
            
            # Find anomalies (values outside 2 standard deviations)
            anomalies = []
            
            for i, point in enumerate(points):
                value = float(point.get("value", 0))
                if abs(value - mean) > 2 * std_dev:
                    anomalies.append({
                        "index": i,
                        "value": value,
                        "timestamp": point.get("timestamp", ""),
                        "z_score": (value - mean) / std_dev if std_dev != 0 else 0
                    })
            
            # Generate insight if anomalies found
            if anomalies:
                # Get the most significant anomaly
                most_significant = max(anomalies, key=lambda a: abs(a["z_score"]))
                
                insight = DigitalTwinInsight(
                    insight_type=InsightType.ANOMALY,
                    data_types=[data_type],
                    description=f"Detected an anomaly in {data_type} data. The value {most_significant['value']:.1f} is significantly different from the average ({mean:.1f}).",
                    confidence=min(0.5 + abs(most_significant["z_score"]) / 10, 0.95),
                    metadata={
                        "data_type": data_type,
                        "mean": mean,
                        "std_dev": std_dev,
                        "anomalies_count": len(anomalies),
                        "most_significant": most_significant
                    }
                )
                
                insights.append(insight)
        
        return insights
    
    def _generate_prediction_insights(self, data: Dict[str, List[Dict[str, Any]]]) -> List[DigitalTwinInsight]:
        """
        Generate prediction insights.
        
        Args:
            data: Patient data by type
            
        Returns:
            Prediction insights
        """
        # This is a placeholder for a more sophisticated prediction algorithm
        # In a real implementation, this would use time-series forecasting
        
        insights: List[DigitalTwinInsight] = []
        
        # Process each data type
        for data_type, points in data.items():
            # Skip if not enough data points
            if len(points) < 7:
                continue
            
            # Only process numeric data
            if not all(isinstance(p.get("value"), (int, float)) for p in points):
                continue
            
            # Sort by timestamp
            points.sort(key=lambda x: x.get("timestamp", ""))
            
            # Get recent values (last 7 points)
            recent_values = [float(p.get("value", 0)) for p in points[-7:]]
            
            # Simple prediction: linear extrapolation
            slope = (recent_values[-1] - recent_values[0]) / 6
            predicted_value = recent_values[-1] + slope
            
            # Calculate confidence based on consistency of trend
            diffs = [recent_values[i+1] - recent_values[i] for i in range(len(recent_values)-1)]
            consistency = 1 - (max(diffs) - min(diffs)) / (max(recent_values) - min(recent_values)) if max(recent_values) != min(recent_values) else 0
            
            insight = DigitalTwinInsight(
                insight_type=InsightType.PREDICTION,
                data_types=[data_type],
                description=f"Based on recent {data_type} data, the predicted next value is {predicted_value:.1f}, continuing the current trend.",
                confidence=min(0.5 + consistency / 2, 0.85),
                metadata={
                    "data_type": data_type,
                    "current_value": recent_values[-1],
                    "predicted_value": predicted_value,
                    "slope": slope,
                    "data_points": len(recent_values)
                }
            )
            
            insights.append(insight)
        
        return insights
    
    def _generate_recommendation_insights(self, data: Dict[str, List[Dict[str, Any]]]) -> List[DigitalTwinInsight]:
        """
        Generate recommendation insights.
        
        Args:
            data: Patient data by type
            
        Returns:
            Recommendation insights
        """
        insights: List[DigitalTwinInsight] = []
        
        # Check for mood data
        if "mood" in data and len(data["mood"]) >= 5:
            mood_points = data["mood"]
            
            # Only process numeric data
            if all(isinstance(p.get("value"), (int, float)) for p in mood_points):
                # Sort by timestamp
                mood_points.sort(key=lambda x: x.get("timestamp", ""))
                
                # Calculate average mood
                mood_values = [float(p.get("value", 0)) for p in mood_points]
                avg_mood = sum(mood_values) / len(mood_values)
                
                # Generate recommendation based on mood
                if avg_mood < 5:
                    insight = DigitalTwinInsight(
                        insight_type=InsightType.RECOMMENDATION,
                        data_types=["mood"],
                        description="Based on lower mood scores, consider scheduling a follow-up appointment to discuss potential adjustments to the treatment plan.",
                        confidence=0.8,
                        metadata={
                            "data_type": "mood",
                            "avg_mood": avg_mood,
                            "data_points": len(mood_values)
                        }
                    )
                    
                    insights.append(insight)
        
        # Check for sleep data
        if "sleep" in data and len(data["sleep"]) >= 5:
            sleep_points = data["sleep"]
            
            # Only process numeric data
            if all(isinstance(p.get("value"), (int, float)) for p in sleep_points):
                # Sort by timestamp
                sleep_points.sort(key=lambda x: x.get("timestamp", ""))
                
                # Calculate average sleep
                sleep_values = [float(p.get("value", 0)) for p in sleep_points]
                avg_sleep = sum(sleep_values) / len(sleep_values)
                
                # Generate recommendation based on sleep
                if avg_sleep < 6:
                    insight = DigitalTwinInsight(
                        insight_type=InsightType.RECOMMENDATION,
                        data_types=["sleep"],
                        description="Sleep duration appears to be below recommended levels. Consider discussing sleep hygiene strategies during the next session.",
                        confidence=0.8,
                        metadata={
                            "data_type": "sleep",
                            "avg_sleep": avg_sleep,
                            "data_points": len(sleep_values)
                        }
                    )
                    
                    insights.append(insight)
        
        # Check for medication data and mood data
        if "medication" in data and "mood" in data:
            medication_points = data["medication"]
            mood_points = data["mood"]
            
            # Check if we have enough data
            if len(medication_points) >= 5 and len(mood_points) >= 5:
                # Sort by timestamp
                medication_points.sort(key=lambda x: x.get("timestamp", ""))
                mood_points.sort(key=lambda x: x.get("timestamp", ""))
                
                # Generate recommendation
                insight = DigitalTwinInsight(
                    insight_type=InsightType.RECOMMENDATION,
                    data_types=["medication", "mood"],
                    description="Consider reviewing the correlation between medication adherence and mood during the next session to optimize treatment outcomes.",
                    confidence=0.75,
                    metadata={
                        "data_types": ["medication", "mood"],
                        "medication_points": len(medication_points),
                        "mood_points": len(mood_points)
                    }
                )
                
                insights.append(insight)
        
        return insights
