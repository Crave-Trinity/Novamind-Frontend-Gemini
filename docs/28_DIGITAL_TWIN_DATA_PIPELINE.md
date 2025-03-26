# NOVAMIND: Digital Twin Data Pipeline

## 1. Data Pipeline Architecture

The Digital Twin Data Pipeline is responsible for collecting, processing, and preparing data for the AI models. This document details the ETL (Extract, Transform, Load) processes that power the Digital Twin system.

```markdown
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│                   │     │                   │     │                   │     │                   │
│  Data Sources     │────►│  Data Collection  │────►│  Data Processing  │────►│  Model Training   │
│                   │     │                   │     │                   │     │                   │
└───────────────────┘     └───────────────────┘     └───────────────────┘     └───────────────────┘
        │                         │                         │                         │
        │                         │                         │                         │
        ▼                         ▼                         ▼                         ▼
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│  Clinical EHR     │     │  Event-Driven     │     │  Feature          │     │  Model Registry   │
│  Wearable Devices │     │  Collection       │     │  Engineering      │     │  & Versioning     │
│  Patient Reporting│     │  Service          │     │  Pipeline         │     │  Service          │
└───────────────────┘     └───────────────────┘     └───────────────────┘     └───────────────────┘
```

## 2. Data Source Integration

### 2.1 Clinical EHR Integration

```python
class EHRIntegrationAdapter:
    """Adapter for EHR system integration"""
    
    def __init__(
        self,
        ehr_client: EHRClient,
        credentials_service: CredentialsService,
        security_service: SecurityService
    ):
        self.ehr_client = ehr_client
        self.credentials_service = credentials_service
        self.security_service = security_service
        
    async def extract_clinical_data(
        self,
        patient_id: str,
        data_types: List[ClinicalDataType],
        date_range: DateRange
    ) -> ClinicalDataBatch:
        """
        Extract clinical data from EHR system
        
        Args:
            patient_id: Patient identifier
            data_types: Types of clinical data to extract
            date_range: Date range for extraction
            
        Returns:
            Batch of clinical data
        """
        # Get credentials with minimal scope
        credentials = await self.credentials_service.get_ehr_credentials(
            system_id=self.ehr_client.system_id,
            required_scopes=[f"read:{data_type.value}" for data_type in data_types]
        )
        
        # Log data access attempt
        await self.security_service.log_data_access(
            user_id="system",
            patient_id=patient_id,
            data_types=[dt.value for dt in data_types],
            purpose="digital_twin_update"
        )
        
        # Extract data from EHR
        raw_data = await self.ehr_client.extract_data(
            patient_id=patient_id,
            data_types=[dt.value for dt in data_types],
            start_date=date_range.start,
            end_date=date_range.end,
            credentials=credentials
        )
        
        # Transform to domain model
        return self._transform_to_domain_model(raw_data)
        
    def _transform_to_domain_model(self, raw_data: Dict[str, Any]) -> ClinicalDataBatch:
        """Transform raw EHR data to domain model"""
        # Implementation details
```

### 2.2 Wearable Device Integration

```python
class WearableIntegrationService:
    """Service for wearable device data integration"""
    
    def __init__(
        self,
        adapter_factory: WearableAdapterFactory,
        patient_repository: PatientRepository,
        biometric_repository: BiometricRepository,
        oauth_service: OAuthService
    ):
        self.adapter_factory = adapter_factory
        self.patient_repository = patient_repository
        self.biometric_repository = biometric_repository
        self.oauth_service = oauth_service
        
    async def sync_wearable_data(
        self,
        patient_id: str,
        device_type: WearableDeviceType,
        data_types: List[BiometricType],
        days_to_sync: int = 30
    ) -> SyncResult:
        """
        Synchronize data from a wearable device
        
        Args:
            patient_id: Patient identifier
            device_type: Type of wearable device
            data_types: Types of biometric data to sync
            days_to_sync: Number of days to synchronize
            
        Returns:
            Results of the synchronization
        """
        # Get patient device info
        patient = await self.patient_repository.get_by_id(patient_id)
        device_info = patient.get_device_info(device_type)
        
        if not device_info:
            raise DeviceNotLinkedError(f"Patient has no linked {device_type.value} device")
        
        # Get OAuth tokens for device
        tokens = await self.oauth_service.get_tokens_for_device(
            patient_id=patient_id,
            device_type=device_type
        )
        
        # Create appropriate adapter for device
        adapter = self.adapter_factory.create_adapter(device_type)
        
        # Set date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_to_sync)
        date_range = DateRange(start=start_date, end=end_date)
        
        # Fetch data
        biometric_data = await adapter.fetch_data(
            user_id=device_info.external_user_id,
            auth_tokens=tokens,
            data_types=data_types,
            date_range=date_range
        )
        
        # Store in repository
        for datapoint in biometric_data:
            await self.biometric_repository.save(
                BiometricDatapoint(
                    id=str(uuid.uuid4()),
                    patient_id=patient_id,
                    biometric_type=datapoint.biometric_type,
                    value=datapoint.value,
                    unit=datapoint.unit,
                    timestamp=datapoint.timestamp,
                    source=device_type.value,
                    source_device_id=device_info.device_id
                )
            )
        
        return SyncResult(
            patient_id=patient_id,
            device_type=device_type,
            data_types=data_types,
            points_synced=len(biometric_data),
            sync_start=start_date,
            sync_end=end_date
        )
```

### 2.3 Patient Self-Reported Data Collection

```python
class PatientReportingService:
    """Service for collecting patient self-reported data"""
    
    def __init__(
        self,
        symptom_repository: SymptomRepository,
        assessment_repository: AssessmentRepository,
        validation_service: DataValidationService,
        audit_service: AuditService
    ):
        self.symptom_repository = symptom_repository
        self.assessment_repository = assessment_repository
        self.validation_service = validation_service
        self.audit_service = audit_service
        
    async def record_symptom_report(
        self,
        patient_id: str,
        symptom_report: SymptomReport
    ) -> SymptomRecord:
        """
        Record a symptom report from a patient
        
        Args:
            patient_id: Patient identifier
            symptom_report: Patient reported symptoms
            
        Returns:
            Created symptom record
        """
        # Validate report data
        validation_result = self.validation_service.validate_symptom_report(symptom_report)
        
        if not validation_result.is_valid:
            raise InvalidDataError(f"Invalid symptom report: {validation_result.error_message}")
        
        # Create symptom record
        symptom_record = SymptomRecord(
            id=str(uuid.uuid4()),
            patient_id=patient_id,
            symptom_type=symptom_report.symptom_type,
            severity=symptom_report.severity,
            recorded_at=datetime.now(),
            context=symptom_report.context,
            triggers=symptom_report.triggers,
            notes=symptom_report.notes
        )
        
        # Save to repository
        await self.symptom_repository.save(symptom_record)
        
        # Log for audit
        await self.audit_service.log_event(
            event_type=AuditEventType.DATA_COLLECTION,
            patient_id=patient_id,
            data_category="symptom_report",
            action="create"
        )
        
        return symptom_record
        
    async def record_assessment_completion(
        self,
        patient_id: str,
        assessment_type: AssessmentType,
        responses: List[AssessmentResponse]
    ) -> AssessmentResult:
        """
        Record a completed clinical assessment
        
        Args:
            patient_id: Patient identifier
            assessment_type: Type of assessment (PHQ-9, GAD-7, etc.)
            responses: Patient responses to assessment questions
            
        Returns:
            Assessment results with score and interpretation
        """
        # Validate assessment data
        validation_result = self.validation_service.validate_assessment(
            assessment_type=assessment_type,
            responses=responses
        )
        
        if not validation_result.is_valid:
            raise InvalidDataError(f"Invalid assessment: {validation_result.error_message}")
        
        # Calculate assessment score
        score = self._calculate_assessment_score(assessment_type, responses)
        
        # Determine severity level
        severity = self._determine_severity_level(assessment_type, score)
        
        # Create assessment result
        assessment_result = AssessmentResult(
            id=str(uuid.uuid4()),
            patient_id=patient_id,
            assessment_type=assessment_type,
            score=score,
            severity=severity,
            responses=responses,
            completed_at=datetime.now()
        )
        
        # Save to repository
        await self.assessment_repository.save(assessment_result)
        
        # Log for audit
        await self.audit_service.log_event(
            event_type=AuditEventType.DATA_COLLECTION,
            patient_id=patient_id,
            data_category=f"{assessment_type.value}_assessment",
            action="create"
        )
        
        return assessment_result
```

## 3. Data Processing Pipeline

### 3.1 Feature Engineering

```python
class FeatureEngineeringPipeline:
    """Pipeline for feature engineering from raw data"""
    
    def __init__(
        self,
        feature_transformers: Dict[DataType, FeatureTransformer],
        feature_selectors: Dict[ModelType, FeatureSelector],
        normalization_service: NormalizationService,
        missing_data_handler: MissingDataHandler
    ):
        self.feature_transformers = feature_transformers
        self.feature_selectors = feature_selectors
        self.normalization_service = normalization_service
        self.missing_data_handler = missing_data_handler
        
    async def process_timeseries_features(
        self,
        symptom_data: List[SymptomRecord],
        target_symptoms: List[SymptomType]
    ) -> TimeSeriesFeatureSet:
        """
        Process raw symptom data into features for time series models
        
        Args:
            symptom_data: Raw symptom records
            target_symptoms: Symptoms to include as features
            
        Returns:
            Processed feature set for time series modeling
        """
        # Group data by symptom type
        grouped_data = self._group_by_symptom_type(symptom_data)
        
        # Handle missing data points
        completed_data = await self.missing_data_handler.fill_missing_symptom_data(grouped_data)
        
        # Extract features
        features = {}
        for symptom_type in target_symptoms:
            if symptom_type in completed_data:
                # Get appropriate transformer
                transformer = self.feature_transformers.get(
                    DataType.SYMPTOM, 
                    self.feature_transformers[DataType.DEFAULT]
                )
                
                # Transform data
                symptom_features = await transformer.transform(
                    data=completed_data[symptom_type],
                    feature_config=self._get_feature_config(symptom_type)
                )
                
                features[symptom_type] = symptom_features
        
        # Normalize features
        normalized_features = self.normalization_service.normalize_timeseries_features(features)
        
        return TimeSeriesFeatureSet(
            features=normalized_features,
            symptom_types=target_symptoms,
            timestamp=datetime.now()
        )
        
    async def process_biometric_features(
        self,
        biometric_data: List[BiometricDatapoint],
        symptom_data: List[SymptomRecord],
        target_biometrics: List[BiometricType],
        target_symptoms: List[SymptomType]
    ) -> BiometricFeatureSet:
        """
        Process raw biometric and symptom data into features
        
        Args:
            biometric_data: Raw biometric data points
            symptom_data: Raw symptom records
            target_biometrics: Biometric types to include
            target_symptoms: Symptom types to include
            
        Returns:
            Processed feature set for biometric correlation
        """
        # Implementation details
        
    async def process_medication_features(
        self,
        genetic_data: GeneticProfile,
        medication_history: List[MedicationRecord],
        demographic_data: PatientDemographics,
        target_conditions: List[ConditionType]
    ) -> MedicationFeatureSet:
        """
        Process genetic and medication data into features
        
        Args:
            genetic_data: Patient genetic profile
            medication_history: Medication history records
            demographic_data: Patient demographics
            target_conditions: Conditions to target
            
        Returns:
            Processed feature set for medication prediction
        """
        # Implementation details
```

### 3.2 Data Quality Service

```python
class DataQualityService:
    """Service for ensuring data quality"""
    
    def __init__(
        self,
        outlier_detector: OutlierDetector,
        consistency_checker: ConsistencyChecker,
        quality_metrics: QualityMetricsCalculator
    ):
        self.outlier_detector = outlier_detector
        self.consistency_checker = consistency_checker
        self.quality_metrics = quality_metrics
        
    async def validate_symptom_data(
        self,
        symptom_data: List[SymptomRecord]
    ) -> DataQualityResult:
        """
        Validate symptom data quality
        
        Args:
            symptom_data: Symptom records to validate
            
        Returns:
            Data quality validation results
        """
        # Check for outliers
        outlier_result = await self.outlier_detector.detect_outliers(
            data=symptom_data,
            data_type=DataType.SYMPTOM
        )
        
        # Check data consistency
        consistency_result = await self.consistency_checker.check_consistency(
            data=symptom_data,
            data_type=DataType.SYMPTOM
        )
        
        # Calculate quality metrics
        metrics = self.quality_metrics.calculate_metrics(
            data=symptom_data,
            data_type=DataType.SYMPTOM
        )
        
        # Determine if data meets quality standards
        meets_standards = (
            outlier_result.outlier_percentage < 0.1 and
            consistency_result.consistency_score > 0.8 and
            metrics.completeness > 0.9
        )
        
        return DataQualityResult(
            data_type=DataType.SYMPTOM,
            outlier_result=outlier_result,
            consistency_result=consistency_result,
            quality_metrics=metrics,
            meets_quality_standards=meets_standards,
            validation_timestamp=datetime.now()
        )
```

## 4. Training Data Preparation

### 4.1 Training Dataset Service

```python
class TrainingDatasetService:
    """Service for preparing model training datasets"""
    
    def __init__(
        self,
        feature_engineering_pipeline: FeatureEngineeringPipeline,
        data_quality_service: DataQualityService,
        train_test_splitter: TrainTestSplitter,
        sampling_service: SamplingService
    ):
        self.feature_engineering_pipeline = feature_engineering_pipeline
        self.data_quality_service = data_quality_service
        self.train_test_splitter = train_test_splitter
        self.sampling_service = sampling_service
        
    async def prepare_timeseries_dataset(
        self,
        patient_id: str,
        symptom_data: List[SymptomRecord],
        config: TimeSeriesTrainingConfig
    ) -> TrainingDataset:
        """
        Prepare dataset for time series model training
        
        Args:
            patient_id: Patient identifier
            symptom_data: Raw symptom data
            config: Training configuration
            
        Returns:
            Prepared training dataset
        """
        # Validate data quality
        quality_result = await self.data_quality_service.validate_symptom_data(symptom_data)
        
        if not quality_result.meets_quality_standards:
            raise DataQualityError(
                f"Symptom data does not meet quality standards: {quality_result.error_message}"
            )
        
        # Process features
        feature_set = await self.feature_engineering_pipeline.process_timeseries_features(
            symptom_data=symptom_data,
            target_symptoms=config.target_symptoms
        )
        
        # Split into train/validation/test sets
        train_data, val_data, test_data = self.train_test_splitter.split_time_series(
            feature_set=feature_set,
            train_ratio=config.train_ratio,
            val_ratio=config.val_ratio,
            test_ratio=config.test_ratio
        )
        
        return TrainingDataset(
            id=str(uuid.uuid4()),
            patient_id=patient_id,
            model_type=ModelType.TIME_SERIES,
            training_data=train_data,
            validation_data=val_data,
            test_data=test_data,
            feature_metadata=feature_set.metadata,
            created_at=datetime.now(),
            data_quality=quality_result
        )
```

## 5. Event-Driven Data Updates

### 5.1 Event Processor

```python
class DigitalTwinEventProcessor:
    """Processor for events that trigger digital twin updates"""
    
    def __init__(
        self,
        event_bus: EventBus,
        digital_twin_service: DigitalTwinService,
        symptom_repository: SymptomRepository,
        biometric_repository: BiometricRepository,
        medication_repository: MedicationRepository
    ):
        self.event_bus = event_bus
        self.digital_twin_service = digital_twin_service
        self.symptom_repository = symptom_repository
        self.biometric_repository = biometric_repository
        self.medication_repository = medication_repository
        
        # Register event handlers
        self.event_bus.subscribe(
            event_type=EventType.SYMPTOM_RECORDED,
            handler=self.handle_symptom_recorded
        )
        self.event_bus.subscribe(
            event_type=EventType.BIOMETRIC_SYNCED,
            handler=self.handle_biometric_synced
        )
        self.event_bus.subscribe(
            event_type=EventType.MEDICATION_PRESCRIBED,
            handler=self.handle_medication_prescribed
        )
        
    async def handle_symptom_recorded(self, event: SymptomRecordedEvent):
        """
        Handle symptom recorded event
        
        Args:
            event: Symptom recorded event
        """
        # Get recent symptoms for the patient
        recent_symptoms = await self.symptom_repository.get_recent(
            patient_id=event.patient_id,
            days=30
        )
        
        # Check if update is needed
        if self._should_update_symptom_model(recent_symptoms):
            # Update symptom forecasting model
            await self.digital_twin_service.update_symptom_model(
                patient_id=event.patient_id,
                symptom_data=recent_symptoms
            )
        
    async def handle_biometric_synced(self, event: BiometricSyncedEvent):
        """
        Handle biometric data synced event
        
        Args:
            event: Biometric synced event
        """
        # Implementation details
        
    async def handle_medication_prescribed(self, event: MedicationPrescribedEvent):
        """
        Handle medication prescribed event
        
        Args:
            event: Medication prescribed event
        """
        # Implementation details
        
    def _should_update_symptom_model(self, recent_symptoms: List[SymptomRecord]) -> bool:
        """
        Determine if the symptom model should be updated
        
        Args:
            recent_symptoms: Recent symptom records
            
        Returns:
            True if update is needed, False otherwise
        """
        # Implementation details
```

## 6. HIPAA Compliance

The Digital Twin Data Pipeline incorporates these HIPAA safeguards:

1. **Access Controls**: All data access is authenticated, authorized, and logged
2. **Data Minimization**: Only necessary data is processed for each model
3. **Encryption**: All data is encrypted at rest and in transit
4. **Audit Logging**: Comprehensive logging of all data operations
5. **De-identification**: PHI is removed from training datasets whenever possible

## 7. Monitoring and Alerting

```python
class DataPipelineMonitor:
    """Monitoring service for the data pipeline"""
    
    def __init__(
        self,
        metrics_service: MetricsService,
        alert_service: AlertService,
        logging_service: LoggingService
    ):
        self.metrics_service = metrics_service
        self.alert_service = alert_service
        self.logging_service = logging_service
        
    async def track_pipeline_execution(
        self,
        pipeline_id: str,
        step_name: str,
        status: StepStatus,
        execution_time: float,
        metadata: Dict[str, Any]
    ):
        """
        Track execution of a pipeline step
        
        Args:
            pipeline_id: Pipeline identifier
            step_name: Name of the pipeline step
            status: Execution status
            execution_time: Execution time in seconds
            metadata: Additional metadata
        """
        # Record metrics
        await self.metrics_service.record_metric(
            metric_name=f"pipeline.{step_name}.execution_time",
            value=execution_time,
            tags={"pipeline_id": pipeline_id, "status": status.value}
        )
        
        # Log execution
        await self.logging_service.log(
            level=LogLevel.INFO,
            message=f"Pipeline step {step_name} completed with status {status.value}",
            context={
                "pipeline_id": pipeline_id,
                "step_name": step_name,
                "status": status.value,
                "execution_time": execution_time,
                **metadata
            }
        )
        
        # Alert on failure
        if status == StepStatus.FAILED:
            await self.alert_service.send_alert(
                alert_type=AlertType.PIPELINE_FAILURE,
                severity=AlertSeverity.HIGH,
                message=f"Pipeline step {step_name} failed",
                context={
                    "pipeline_id": pipeline_id,
                    "step_name": step_name,
                    "execution_time": execution_time,
                    **metadata
                }
            )
