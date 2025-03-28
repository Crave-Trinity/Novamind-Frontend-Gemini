# -*- coding: utf-8 -*-
"""
Unit tests for the Symptom Forecasting XGBoost Model.

These tests verify that the XGBoost Model correctly processes
time series data and generates accurate forecasts with feature importance.
"""

import pytest
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import UUID, uuid4

from app.infrastructure.ml.symptom_forecasting.xgboost_model import XGBoostTimeSeriesModel


class TestXGBoostTimeSeriesModel:
    """Tests for the XGBoostTimeSeriesModel."""

    @pytest.fixture
    def model(self):
        """Create an XGBoostTimeSeriesModel with mocked internals."""
        with patch('app.infrastructure.ml.symptom_forecasting.xgboost_model.xgb', autospec=True):
            model = XGBoostTimeSeriesModel(
                model_path="test_model_path",
                feature_importance_method="gain"
            )
            # Mock the internal XGBoost model
            model._model = MagicMock()
            model._model.predict = MagicMock(return_value=np.array([4.3, 4.1, 3.9, 3.6]))
            model._model.feature_importances_ = np.array([0.5, 0.3, 0.2])
            model._feature_names = ["feature1", "feature2", "feature3"]
            model.is_initialized = True
            return model

    @pytest.fixture
    def sample_input_data(self):
        """Create sample input data for testing."""
        # Create a DataFrame with symptom severity data
        dates = pd.date_range(start=datetime.now() - timedelta(days=10), periods=10, freq='D')
        data = {
            'date': dates,
            'symptom_type': ['anxiety'] * 10,
            'severity': [5, 6, 7, 6, 5, 4, 5, 6, 5, 4]
        }
        return pd.DataFrame(data)

    async def test_initialize_loads_model(self):
        """Test that initialize loads the model correctly."""
        # Setup
        with patch('app.infrastructure.ml.symptom_forecasting.xgboost_model.xgb', autospec=True) as mock_xgb, \
             patch('app.infrastructure.ml.symptom_forecasting.xgboost_model.joblib', autospec=True) as mock_joblib, \
             patch('app.infrastructure.ml.symptom_forecasting.xgboost_model.os.path.exists', return_value=True):
            
            # Create model instance
            model = XGBoostTimeSeriesModel(model_path="test_model_path")
            
            # Mock joblib.load to return a mock model
            mock_model = MagicMock()
            mock_joblib.load.return_value = {
                'model': mock_model,
                'feature_names': ['feature1', 'feature2', 'feature3'],
                'metadata': {'version': '1.0'}
            }
            
            # Execute
            await model.initialize()
            
            # Verify
            mock_joblib.load.assert_called_once()
            assert model.is_initialized
            assert model._model is not None
            assert model._feature_names == ['feature1', 'feature2', 'feature3']
            assert model._metadata == {'version': '1.0'}

    async def test_initialize_handles_missing_model(self):
        """Test that initialize handles missing model files gracefully."""
        # Setup
        with patch('app.infrastructure.ml.symptom_forecasting.xgboost_model.xgb', autospec=True) as mock_xgb, \
             patch('app.infrastructure.ml.symptom_forecasting.xgboost_model.os.path.exists', return_value=False):
            
            # Create model instance
            model = XGBoostTimeSeriesModel(model_path="nonexistent_path")
            
            # Execute
            await model.initialize()
            
            # Verify
            mock_xgb.XGBRegressor.assert_called_once()
            assert model.is_initialized
            assert model._model is not None

    async def test_predict_returns_forecast(self, model, sample_input_data):
        """Test that predict returns a forecast with the expected structure."""
        # Execute
        result = await model.predict(sample_input_data, horizon=4)
        
        # Verify
        assert "predictions" in result
        assert "feature_importance" in result
        assert "model_metrics" in result
        
        # Check predictions shape
        assert len(result["predictions"]) == 4
        
        # Check feature importance
        assert "feature1" in result["feature_importance"]
        assert "feature2" in result["feature_importance"]
        assert "feature3" in result["feature_importance"]
        
        # Check metrics
        assert "mae" in result["model_metrics"]
        assert "rmse" in result["model_metrics"]

    async def test_predict_handles_empty_data(self, model):
        """Test that predict handles empty input data gracefully."""
        # Setup
        empty_df = pd.DataFrame()
        
        # Execute and verify exception is raised
        with pytest.raises(ValueError) as excinfo:
            await model.predict(empty_df, horizon=4)
        
        assert "Empty input data" in str(excinfo.value)

    async def test_predict_handles_missing_columns(self, model):
        """Test that predict handles input data with missing required columns."""
        # Setup
        incomplete_df = pd.DataFrame({
            'date': pd.date_range(start=datetime.now() - timedelta(days=5), periods=5, freq='D'),
            # Missing 'severity' column
            'symptom_type': ['anxiety'] * 5
        })
        
        # Execute and verify exception is raised
        with pytest.raises(ValueError) as excinfo:
            await model.predict(incomplete_df, horizon=4)
        
        assert "Missing required column" in str(excinfo.value)

    async def test_extract_features(self, model, sample_input_data):
        """Test that _extract_features correctly transforms the input data."""
        # Setup
        with patch.object(model, '_extract_features', wraps=model._extract_features) as mock_extract:
            
            # Execute
            await model.predict(sample_input_data, horizon=4)
            
            # Verify
            mock_extract.assert_called_once_with(sample_input_data)
            
            # Get the extracted features
            features = mock_extract.return_value
            
            # Verify the features have the expected structure
            assert isinstance(features, np.ndarray)
            assert features.ndim == 2  # 2D array: [samples, features]

    async def test_get_feature_importance(self, model, sample_input_data):
        """Test that _get_feature_importance returns the correct feature importance."""
        # Setup
        with patch.object(model, '_get_feature_importance', wraps=model._get_feature_importance) as mock_importance:
            
            # Execute
            await model.predict(sample_input_data, horizon=4)
            
            # Verify
            mock_importance.assert_called_once()
            
            # Call directly to test
            importance = model._get_feature_importance()
            
            # Verify the importance has the expected structure
            assert isinstance(importance, dict)
            assert "feature1" in importance
            assert "feature2" in importance
            assert "feature3" in importance
            assert importance["feature1"] == 0.5
            assert importance["feature2"] == 0.3
            assert importance["feature3"] == 0.2

    async def test_different_feature_importance_methods(self):
        """Test that different feature importance methods work correctly."""
        # Setup
        with patch('app.infrastructure.ml.symptom_forecasting.xgboost_model.xgb', autospec=True):
            # Create models with different feature importance methods
            gain_model = XGBoostTimeSeriesModel(
                model_path="test_model_path",
                feature_importance_method="gain"
            )
            weight_model = XGBoostTimeSeriesModel(
                model_path="test_model_path",
                feature_importance_method="weight"
            )
            cover_model = XGBoostTimeSeriesModel(
                model_path="test_model_path",
                feature_importance_method="cover"
            )
            
            # Mock the internal XGBoost models
            for model in [gain_model, weight_model, cover_model]:
                model._model = MagicMock()
                model._model.get_booster = MagicMock()
                model._model.get_booster().get_score = MagicMock(return_value={
                    'feature1': 0.5,
                    'feature2': 0.3,
                    'feature3': 0.2
                })
                model._feature_names = ["feature1", "feature2", "feature3"]
                model.is_initialized = True
            
            # Execute
            gain_importance = gain_model._get_feature_importance()
            weight_importance = weight_model._get_feature_importance()
            cover_importance = cover_model._get_feature_importance()
            
            # Verify
            for importance in [gain_importance, weight_importance, cover_importance]:
                assert isinstance(importance, dict)
                assert "feature1" in importance
                assert "feature2" in importance
                assert "feature3" in importance
                assert importance["feature1"] == 0.5
                assert importance["feature2"] == 0.3
                assert importance["feature3"] == 0.2
            
            # Verify each model called get_score with the correct importance_type
            gain_model._model.get_booster().get_score.assert_called_with(importance_type="gain")
            weight_model._model.get_booster().get_score.assert_called_with(importance_type="weight")
            cover_model._model.get_booster().get_score.assert_called_with(importance_type="cover")