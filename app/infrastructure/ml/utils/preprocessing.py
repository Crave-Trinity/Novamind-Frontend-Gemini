"""
Preprocessing utilities for ML models in the NOVAMIND system.

This module provides standardized methods for preprocessing data for machine learning
models used in the Digital Twin system, ensuring consistent data handling across
all ML services and proper handling of patient data in accordance with HIPAA regulations.
"""

import numpy as np
import pandas as pd
from typing import Any, Dict, List, Optional, Tuple, Union
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
from sklearn.impute import SimpleImputer, KNNImputer

from app.infrastructure.logging.logger import get_logger


logger = get_logger(__name__)


class DataPreprocessor:
    """
    Utility class for preprocessing data for ML models.
    
    This class provides standardized methods for preprocessing data for different
    types of machine learning models, including time series, classification, and
    regression models, ensuring consistent data handling across all ML services.
    """
    
    @staticmethod
    def normalize_time_series(
        data: Union[np.ndarray, pd.DataFrame],
        method: str = 'standard',
        feature_range: Tuple[float, float] = (0, 1),
        return_scaler: bool = False
    ) -> Union[np.ndarray, Tuple[np.ndarray, Any]]:
        """
        Normalize time series data.
        
        Args:
            data: Time series data to normalize
            method: Normalization method ('standard', 'minmax', or 'robust')
            feature_range: Range for MinMaxScaler
            return_scaler: Whether to return the scaler object
            
        Returns:
            Normalized data, optionally with the scaler object
            
        Raises:
            ValueError: If the normalization method is not supported
        """
        # Convert to numpy array if pandas DataFrame
        if isinstance(data, pd.DataFrame):
            data_values = data.values
        else:
            data_values = data
            
        # Select scaler based on method
        if method == 'standard':
            scaler = StandardScaler()
        elif method == 'minmax':
            scaler = MinMaxScaler(feature_range=feature_range)
        elif method == 'robust':
            scaler = RobustScaler()
        else:
            raise ValueError(f"Unsupported normalization method: {method}")
            
        # Reshape for 1D arrays
        if len(data_values.shape) == 1:
            data_values = data_values.reshape(-1, 1)
            
        # Fit and transform
        normalized_data = scaler.fit_transform(data_values)
        
        # Reshape back to original shape if 1D
        if len(data.shape) == 1:
            normalized_data = normalized_data.flatten()
            
        if return_scaler:
            return normalized_data, scaler
        else:
            return normalized_data
    
    @staticmethod
    def create_time_windows(
        data: Union[np.ndarray, pd.DataFrame],
        window_size: int,
        horizon: int = 1,
        stride: int = 1,
        flatten_features: bool = False
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Create sliding windows for time series forecasting.
        
        Args:
            data: Time series data
            window_size: Size of the sliding window
            horizon: Number of future time steps to predict
            stride: Step size between consecutive windows
            flatten_features: Whether to flatten the features dimension
            
        Returns:
            Tuple of (X, y) where X contains the sliding windows and
            y contains the target values
            
        Raises:
            ValueError: If the window size is larger than the data length
        """
        # Convert to numpy array if pandas DataFrame
        if isinstance(data, pd.DataFrame):
            data_values = data.values
        else:
            data_values = data
            
        # Check if data is long enough
        if len(data_values) < window_size + horizon:
            raise ValueError(
                f"Data length ({len(data_values)}) must be at least "
                f"window_size + horizon ({window_size + horizon})"
            )
            
        # Create sliding windows
        X, y = [], []
        for i in range(0, len(data_values) - window_size - horizon + 1, stride):
            X.append(data_values[i:i+window_size])
            y.append(data_values[i+window_size:i+window_size+horizon])
            
        X = np.array(X)
        y = np.array(y)
        
        # Flatten features if requested
        if flatten_features and len(X.shape) > 2:
            X = X.reshape(X.shape[0], -1)
            
        # If horizon is 1, flatten y
        if horizon == 1:
            y = y.reshape(y.shape[0], -1)
            
        return X, y
    
    @staticmethod
    def handle_missing_values(
        data: Union[np.ndarray, pd.DataFrame],
        method: str = 'mean',
        k_neighbors: int = 5,
        categorical_features: Optional[List[int]] = None
    ) -> Union[np.ndarray, pd.DataFrame]:
        """
        Handle missing values in data.
        
        Args:
            data: Data with missing values
            method: Imputation method ('mean', 'median', 'most_frequent', or 'knn')
            k_neighbors: Number of neighbors for KNN imputation
            categorical_features: Indices of categorical features
            
        Returns:
            Data with imputed values
            
        Raises:
            ValueError: If the imputation method is not supported
        """
        # Keep track of original type
        is_pandas = isinstance(data, pd.DataFrame)
        
        # Handle categorical features
        if categorical_features is None:
            categorical_features = []
            
        # Select imputer based on method
        if method == 'knn':
            imputer = KNNImputer(n_neighbors=k_neighbors)
        else:
            imputer = SimpleImputer(strategy=method)
            
        # Impute
        if is_pandas:
            # For pandas DataFrame, impute and preserve index/columns
            column_names = data.columns
            index = data.index
            imputed_data = pd.DataFrame(
                imputer.fit_transform(data),
                columns=column_names,
                index=index
            )
        else:
            # For numpy array, just impute
            imputed_data = imputer.fit_transform(data)
            
        return imputed_data
    
    @staticmethod
    def extract_temporal_features(
        timestamps: Union[List[datetime], pd.Series],
        include_cyclical: bool = True
    ) -> pd.DataFrame:
        """
        Extract temporal features from timestamps.
        
        Args:
            timestamps: List or Series of timestamps
            include_cyclical: Whether to include cyclical encodings
            
        Returns:
            DataFrame with extracted temporal features
        """
        # Convert to pandas Series if list
        if not isinstance(timestamps, pd.Series):
            timestamps = pd.Series(timestamps)
            
        # Extract basic features
        features = pd.DataFrame({
            'hour': timestamps.dt.hour,
            'day': timestamps.dt.day,
            'day_of_week': timestamps.dt.dayofweek,
            'day_of_year': timestamps.dt.dayofyear,
            'week_of_year': timestamps.dt.isocalendar().week,
            'month': timestamps.dt.month,
            'quarter': timestamps.dt.quarter,
            'year': timestamps.dt.year,
            'is_weekend': timestamps.dt.dayofweek >= 5,
            'is_month_start': timestamps.dt.is_month_start,
            'is_month_end': timestamps.dt.is_month_end,
            'is_quarter_start': timestamps.dt.is_quarter_start,
            'is_quarter_end': timestamps.dt.is_quarter_end,
            'is_year_start': timestamps.dt.is_year_start,
            'is_year_end': timestamps.dt.is_year_end
        })
        
        # Add cyclical encodings
        if include_cyclical:
            # Hour of day (0-23)
            features['hour_sin'] = np.sin(2 * np.pi * features['hour'] / 24)
            features['hour_cos'] = np.cos(2 * np.pi * features['hour'] / 24)
            
            # Day of week (0-6)
            features['day_of_week_sin'] = np.sin(2 * np.pi * features['day_of_week'] / 7)
            features['day_of_week_cos'] = np.cos(2 * np.pi * features['day_of_week'] / 7)
            
            # Month (1-12)
            features['month_sin'] = np.sin(2 * np.pi * (features['month'] - 1) / 12)
            features['month_cos'] = np.cos(2 * np.pi * (features['month'] - 1) / 12)
            
        return features
    
    @staticmethod
    def encode_categorical_features(
        data: Union[np.ndarray, pd.DataFrame],
        categorical_columns: Optional[List[str]] = None,
        method: str = 'one-hot',
        max_categories: int = 10
    ) -> Union[np.ndarray, pd.DataFrame]:
        """
        Encode categorical features in data.
        
        Args:
            data: Data with categorical features
            categorical_columns: Names of categorical columns (for pandas DataFrame)
            method: Encoding method ('one-hot' or 'label')
            max_categories: Maximum number of categories for one-hot encoding
            
        Returns:
            Data with encoded categorical features
            
        Raises:
            ValueError: If the encoding method is not supported
        """
        # Only works with pandas DataFrame
        if not isinstance(data, pd.DataFrame):
            raise ValueError("Categorical encoding requires a pandas DataFrame")
            
        # If no categorical columns specified, try to infer
        if categorical_columns is None:
            categorical_columns = data.select_dtypes(include=['object', 'category']).columns.tolist()
            
        # Make a copy to avoid modifying the original
        encoded_data = data.copy()
        
        # Encode each categorical column
        for col in categorical_columns:
            if col not in encoded_data.columns:
                logger.warning(f"Column {col} not found in data")
                continue
                
            if method == 'one-hot':
                # Check if too many categories
                n_categories = encoded_data[col].nunique()
                if n_categories > max_categories:
                    logger.warning(
                        f"Column {col} has {n_categories} categories, "
                        f"which exceeds the maximum of {max_categories}. "
                        f"Using label encoding instead."
                    )
                    encoded_data[col] = encoded_data[col].astype('category').cat.codes
                else:
                    # One-hot encode
                    one_hot = pd.get_dummies(encoded_data[col], prefix=col, drop_first=False)
                    encoded_data = pd.concat([encoded_data.drop(col, axis=1), one_hot], axis=1)
            elif method == 'label':
                # Label encode
                encoded_data[col] = encoded_data[col].astype('category').cat.codes
            else:
                raise ValueError(f"Unsupported encoding method: {method}")
                
        return encoded_data
    
    @staticmethod
    def prepare_biometric_data(
        biometric_data: List[Dict[str, Any]],
        required_fields: Optional[List[str]] = None,
        normalize: bool = True
    ) -> pd.DataFrame:
        """
        Prepare biometric data for ML models.
        
        Args:
            biometric_data: List of biometric data dictionaries
            required_fields: List of required fields in the data
            normalize: Whether to normalize the data
            
        Returns:
            DataFrame with prepared biometric data
            
        Raises:
            ValueError: If required fields are missing
        """
        # Default required fields
        if required_fields is None:
            required_fields = [
                'timestamp', 'heart_rate', 'blood_pressure_systolic',
                'blood_pressure_diastolic', 'sleep_duration', 'activity_level'
            ]
            
        # Convert to DataFrame
        try:
            df = pd.DataFrame(biometric_data)
        except Exception as e:
            logger.error(f"Failed to convert biometric data to DataFrame: {str(e)}")
            raise ValueError("Invalid biometric data format")
            
        # Check for required fields
        missing_fields = [field for field in required_fields if field not in df.columns]
        if missing_fields:
            logger.warning(f"Missing required fields in biometric data: {missing_fields}")
            
        # Convert timestamp to datetime
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
        # Handle missing values
        numeric_columns = df.select_dtypes(include=['number']).columns
        df[numeric_columns] = DataPreprocessor.handle_missing_values(
            df[numeric_columns], method='median'
        )
        
        # Normalize if requested
        if normalize:
            df[numeric_columns] = DataPreprocessor.normalize_time_series(
                df[numeric_columns], method='robust'
            )
            
        return df
    
    @staticmethod
    def prepare_symptom_data(
        symptom_data: List[Dict[str, Any]],
        required_fields: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """
        Prepare symptom data for ML models.
        
        Args:
            symptom_data: List of symptom data dictionaries
            required_fields: List of required fields in the data
            
        Returns:
            DataFrame with prepared symptom data
            
        Raises:
            ValueError: If required fields are missing
        """
        # Default required fields
        if required_fields is None:
            required_fields = [
                'timestamp', 'symptom_type', 'severity', 'duration'
            ]
            
        # Convert to DataFrame
        try:
            df = pd.DataFrame(symptom_data)
        except Exception as e:
            logger.error(f"Failed to convert symptom data to DataFrame: {str(e)}")
            raise ValueError("Invalid symptom data format")
            
        # Check for required fields
        missing_fields = [field for field in required_fields if field not in df.columns]
        if missing_fields:
            logger.warning(f"Missing required fields in symptom data: {missing_fields}")
            
        # Convert timestamp to datetime
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
        # Encode categorical features
        categorical_columns = ['symptom_type']
        if set(categorical_columns).issubset(df.columns):
            df = DataPreprocessor.encode_categorical_features(
                df, categorical_columns=categorical_columns
            )
            
        # Handle missing values
        numeric_columns = df.select_dtypes(include=['number']).columns
        df[numeric_columns] = DataPreprocessor.handle_missing_values(
            df[numeric_columns], method='median'
        )
            
        return df
    
    @staticmethod
    def prepare_medication_data(
        medication_data: List[Dict[str, Any]],
        genetic_data: Optional[Dict[str, Any]] = None
    ) -> pd.DataFrame:
        """
        Prepare medication and genetic data for pharmacogenomics models.
        
        Args:
            medication_data: List of medication data dictionaries
            genetic_data: Optional genetic data dictionary
            
        Returns:
            DataFrame with prepared medication and genetic data
            
        Raises:
            ValueError: If the data format is invalid
        """
        # Convert medication data to DataFrame
        try:
            med_df = pd.DataFrame(medication_data)
        except Exception as e:
            logger.error(f"Failed to convert medication data to DataFrame: {str(e)}")
            raise ValueError("Invalid medication data format")
            
        # Convert timestamp to datetime
        if 'timestamp' in med_df.columns:
            med_df['timestamp'] = pd.to_datetime(med_df['timestamp'])
            
        # Process genetic data if provided
        if genetic_data is not None:
            # Flatten genetic data
            flat_genetic = {}
            for category, genes in genetic_data.items():
                for gene, value in genes.items():
                    flat_genetic[f"gene_{category}_{gene}"] = value
                    
            # Create DataFrame with genetic data
            genetic_df = pd.DataFrame([flat_genetic])
            
            # Replicate for each medication entry
            genetic_df = pd.concat([genetic_df] * len(med_df), ignore_index=True)
            
            # Combine medication and genetic data
            combined_df = pd.concat([med_df.reset_index(drop=True), genetic_df], axis=1)
        else:
            combined_df = med_df
            
        # Encode categorical features
        categorical_columns = [
            col for col in combined_df.columns 
            if col in ['medication_name', 'medication_class', 'dosage_unit']
        ]
        if categorical_columns:
            combined_df = DataPreprocessor.encode_categorical_features(
                combined_df, categorical_columns=categorical_columns
            )
            
        # Handle missing values
        numeric_columns = combined_df.select_dtypes(include=['number']).columns
        combined_df[numeric_columns] = DataPreprocessor.handle_missing_values(
            combined_df[numeric_columns], method='median'
        )
            
        return combined_df