# NOVAMIND: Digital Twin Domain Model

## 1. Introduction to the Digital Twin Domain

This document details the domain model for the NOVAMIND Digital Twin system, following Clean Architecture principles and SOLID design. The domain layer contains no external dependencies, framework references, or infrastructure concerns - it represents pure business logic and psychiatric concepts.

## 2. Core Domain Entities

### 2.1 DigitalTwin

```python
@dataclass(frozen=True)
class DigitalTwin:
    """
    Core entity representing a patient's digital twin model.
    Immutable by design to ensure state transitions are tracked.
    """
    id: str
    patient_id: str
    created_at: datetime
    updated_at: datetime
    version: int
    confidence_score: float
    models: List[DigitalTwinModel]
    clinical_insights: List[ClinicalInsight]
    last_calibration: datetime
    
    def add_clinical_insight(self, insight: ClinicalInsight) -> 'DigitalTwin':
        """
        Adds a clinical insight to the digital twin, returning a new instance.
        
        Args:
            insight: The clinical insight to add
            
        Returns:
            A new DigitalTwin instance with the updated insights
        """
        return DigitalTwin(
            id=self.id,
            patient_id=self.patient_id,
            created_at=self.created_at,
            updated_at=datetime.now(),
            version=self.version + 1,
            confidence_score=self.confidence_score,
            models=self.models.copy(),
            clinical_insights=[*self.clinical_insights, insight],
            last_calibration=self.last_calibration
        )
    
    def recalibrate(
        self, 
        models: List[DigitalTwinModel], 
        confidence_score: float
    ) -> 'DigitalTwin':
        """
        Recalibrates the digital twin with updated models.
        
        Args:
            models: Updated model list
            confidence_score: New overall confidence score
            
        Returns:
            A new DigitalTwin instance with updated models and calibration
        """
        return DigitalTwin(
            id=self.id,
            patient_id=self.patient_id,
            created_at=self.created_at,
            updated_at=datetime.now(),
            version=self.version + 1,
            confidence_score=confidence_score,
            models=models,
            clinical_insights=self.clinical_insights.copy(),
            last_calibration=datetime.now()
        )
```

### 2.2 DigitalTwinModel (Abstract Base)

```python
@dataclass(frozen=True)
class DigitalTwinModel(ABC):
    """
    Abstract base class for all digital twin models.
    Each specialized model provides different functionality.
    """
    id: str
    model_type: ModelType
    version: str
    created_at: datetime
    confidence_score: float
    last_training_date: datetime
    
    @abstractmethod
    def get_model_description(self) -> str:
        """Returns a human-readable description of the model"""
        pass
```

### 2.3 TimeSeriesModel

```python
@dataclass(frozen=True)
class TimeSeriesModel(DigitalTwinModel):
    """
    Specialized model for time series forecasting of psychiatric symptoms.
    """
    forecast_horizon: int  # in days
    symptom_types: List[SymptomType]
    forecast_accuracy: Dict[SymptomType, float]
    
    def get_model_description(self) -> str:
        """Returns a human-readable description of the model"""
        symptom_list = ", ".join([s.value for s in self.symptom_types])
        return f"Time series forecasting model for {symptom_list} with {self.forecast_horizon}-day horizon"
```

### 2.4 BiometricCorrelationModel

```python
@dataclass(frozen=True)
class BiometricCorrelationModel(DigitalTwinModel):
    """
    Specialized model for correlating biometric data with mental states.
    """
    biometric_types: List[BiometricType]
    symptom_types: List[SymptomType]
    correlation_strengths: Dict[Tuple[BiometricType, SymptomType], float]
    lag_days: Dict[Tuple[BiometricType, SymptomType], int]
    
    def get_model_description(self) -> str:
        """Returns a human-readable description of the model"""
        biometric_list = ", ".join([b.value for b in self.biometric_types])
        return f"Biometric correlation model analyzing {biometric_list} in relation to mental states"
    
    def get_strongest_correlations(self, threshold: float = 0.5) -> List[BiometricCorrelation]:
        """
        Returns the strongest biometric-symptom correlations above the threshold.
        
        Args:
            threshold: Minimum correlation strength to include
            
        Returns:
            List of strong correlations ordered by strength (descending)
        """
        correlations = []
        
        for (biometric, symptom), strength in self.correlation_strengths.items():
            if strength >= threshold:
                correlations.append(
                    BiometricCorrelation(
                        biometric_type=biometric,
                        symptom_type=symptom,
                        correlation_strength=strength,
                        lag_days=self.lag_days.get((biometric, symptom), 0)
                    )
                )
        
        return sorted(
            correlations, 
            key=lambda c: c.correlation_strength, 
            reverse=True
        )
```

### 2.5 PrecisionMedicationModel

```python
@dataclass(frozen=True)
class PrecisionMedicationModel(DigitalTwinModel):
    """
    Specialized model for personalized medication recommendations.
    """
    pharmacogenomic_markers: List[GeneticMarker]
    medication_classes: List[MedicationClass]
    efficacy_predictions: Dict[MedicationClass, float]
    side_effect_risks: Dict[Tuple[MedicationClass, SideEffectType], float]
    
    def get_model_description(self) -> str:
        """Returns a human-readable description of the model"""
        medication_list = ", ".join([m.value for m in self.medication_classes])
        marker_count = len(self.pharmacogenomic_markers)
        return f"Precision medication model for {medication_list} based on {marker_count} genetic markers"
    
    def get_optimal_medications(
        self, 
        min_efficacy: float = 0.6,
        max_side_effect_risk: float = 0.3
    ) -> List[MedicationRecommendation]:
        """
        Returns optimal medication recommendations based on efficacy and side effect thresholds.
        
        Args:
            min_efficacy: Minimum predicted efficacy score
            max_side_effect_risk: Maximum acceptable side effect risk
            
        Returns:
            List of medication recommendations ordered by net benefit (efficacy - risk)
        """
        recommendations = []
        
        for med_class, efficacy in self.efficacy_predictions.items():
            if efficacy < min_efficacy:
                continue
                
            # Calculate maximum side effect risk for this medication
            max_risk = 0.0
            risk_factors = []
            
            for (m_class, effect_type), risk in self.side_effect_risks.items():
                if m_class == med_class:
                    max_risk = max(max_risk, risk)
                    if risk > 0.1:  # Only include meaningful risks
                        risk_factors.append(
                            SideEffectRisk(
                                effect_type=effect_type,
                                risk_level=risk
                            )
                        )
            
            if max_risk <= max_side_effect_risk:
                recommendations.append(
                    MedicationRecommendation(
                        medication_class=med_class,
                        predicted_efficacy=efficacy,
                        side_effect_risks=risk_factors,
                        net_benefit=efficacy - max_risk
                    )
                )
        
        return sorted(
            recommendations,
            key=lambda r: r.net_benefit,
            reverse=True
        )
```

## 3. Core Value Objects

### 3.1 BiometricCorrelation

```python
@dataclass(frozen=True)
class BiometricCorrelation:
    """
    Value object representing a correlation between a biometric measure and a symptom.
    """
    biometric_type: BiometricType
    symptom_type: SymptomType
    correlation_strength: float  # -1.0 to 1.0
    lag_days: int  # How many days the biometric change precedes the symptom change
```

### 3.2 ClinicalInsight

```python
@dataclass(frozen=True)
class ClinicalInsight:
    """
    Value object representing a clinical insight derived from the digital twin.
    """
    id: str
    insight_type: InsightType
    description: str
    confidence: float
    generated_at: datetime
    supporting_evidence: List[EvidencePoint]
    relevant_model_ids: List[str]
```

### 3.3 EvidencePoint

```python
@dataclass(frozen=True)
class EvidencePoint:
    """
    Value object representing a piece of evidence supporting a clinical insight.
    """
    data_type: DataType
    timestamp: datetime
    value: Any
    reference_range: Optional[Tuple[float, float]] = None
    deviation_severity: Optional[float] = None
```

### 3.4 MedicationRecommendation

```python
@dataclass(frozen=True)
class MedicationRecommendation:
    """
    Value object representing a medication recommendation.
    """
    medication_class: MedicationClass
    predicted_efficacy: float
    side_effect_risks: List[SideEffectRisk]
    net_benefit: float
```

### 3.5 SideEffectRisk

```python
@dataclass(frozen=True)
class SideEffectRisk:
    """
    Value object representing the risk of a specific side effect.
    """
    effect_type: SideEffectType
    risk_level: float
```

### 3.6 SymptomTrajectory

```python
@dataclass(frozen=True)
class SymptomTrajectory:
    """
    Value object representing a predicted symptom trajectory.
    """
    id: str
    patient_id: str
    symptom_type: SymptomType
    prediction_points: List[PredictionPoint]
    model_version: str
    created_at: datetime
    confidence_score: float
```

### 3.7 PredictionPoint

```python
@dataclass(frozen=True)
class PredictionPoint:
    """
    Value object representing a single point in a prediction trajectory.
    """
    date: datetime
    value: float
    confidence_lower: float
    confidence_upper: float
```

## 4. Enumerations

### 4.1 Model Types

```python
class ModelType(str, Enum):
    """Types of models in the digital twin system"""
    TIME_SERIES = "time_series"
    BIOMETRIC_CORRELATION = "biometric_correlation" 
    PRECISION_MEDICATION = "precision_medication"
```

### 4.2 Symptom Types

```python
class SymptomType(str, Enum):
    """Types of psychiatric symptoms tracked in the system"""
    DEPRESSION = "depression"
    ANXIETY = "anxiety"
    SLEEP_DISTURBANCE = "sleep_disturbance"
    IRRITABILITY = "irritability"
    ANHEDONIA = "anhedonia"
    FATIGUE = "fatigue"
    CONCENTRATION = "concentration"
    SUICIDAL_IDEATION = "suicidal_ideation"
    MOOD_INSTABILITY = "mood_instability"
    PSYCHOSIS = "psychosis"
```

### 4.3 Biometric Types

```python
class BiometricType(str, Enum):
    """Types of biometric data tracked in the system"""
    HEART_RATE = "heart_rate"
    HEART_RATE_VARIABILITY = "heart_rate_variability"
    SLEEP_DURATION = "sleep_duration"
    SLEEP_LATENCY = "sleep_latency"
    SLEEP_EFFICIENCY = "sleep_efficiency"
    DEEP_SLEEP = "deep_sleep"
    REM_SLEEP = "rem_sleep"
    ACTIVITY_LEVEL = "activity_level"
    STEP_COUNT = "step_count"
    BODY_TEMPERATURE = "body_temperature"
```

### 4.4 Insight Types

```python
class InsightType(str, Enum):
    """Types of clinical insights generated by the system"""
    EARLY_WARNING = "early_warning"
    TREATMENT_RESPONSE = "treatment_response"
    BEHAVIORAL_PATTERN = "behavioral_pattern"
    MEDICATION_EFFECT = "medication_effect"
    BIOMETRIC_CORRELATION = "biometric_correlation"
    SLEEP_IMPACT = "sleep_impact"
    ACTIVITY_IMPACT = "activity_impact"
    RISK_ASSESSMENT = "risk_assessment"
```

## 5. Domain Services

### 5.1 DigitalTwinService

```python
class DigitalTwinService:
    """
    Domain service for digital twin operations.
    
    This service orchestrates complex operations involving multiple digital twin components.
    It contains no infrastructure dependencies, only pure domain logic.
    """
    
    def calculate_risk_score(
        self, 
        digital_twin: DigitalTwin, 
        risk_type: RiskType
    ) -> RiskAssessment:
        """
        Calculates a risk score for the specified risk type based on the digital twin.
        
        Args:
            digital_twin: The patient's digital twin
            risk_type: The type of risk to assess
            
        Returns:
            A risk assessment with score and contributing factors
        """
        # Implementation with pure domain logic
    
    def generate_clinical_insights(
        self, 
        digital_twin: DigitalTwin, 
        insight_types: Optional[List[InsightType]] = None
    ) -> List[ClinicalInsight]:
        """
        Generates clinical insights from the digital twin models.
        
        Args:
            digital_twin: The patient's digital twin
            insight_types: Optional filter for specific insight types
            
        Returns:
            List of generated clinical insights
        """
        # Implementation with pure domain logic
    
    def evaluate_treatment_response(
        self, 
        digital_twin: DigitalTwin,
        treatment: Treatment,
        evaluation_period: Tuple[datetime, datetime]
    ) -> TreatmentResponse:
        """
        Evaluates the response to a treatment based on the digital twin.
        
        Args:
            digital_twin: The patient's digital twin
            treatment: The treatment to evaluate
            evaluation_period: The time period for evaluation
            
        Returns:
            Assessment of the treatment response
        """
        # Implementation with pure domain logic
```

## 6. Domain Events

```python
@dataclass(frozen=True)
class DigitalTwinCreated(DomainEvent):
    """Event raised when a new digital twin is created"""
    digital_twin_id: str
    patient_id: str
    
@dataclass(frozen=True)
class DigitalTwinUpdated(DomainEvent):
    """Event raised when a digital twin is updated"""
    digital_twin_id: str
    patient_id: str
    previous_version: int
    new_version: int
    
@dataclass(frozen=True)
class ClinicalInsightGenerated(DomainEvent):
    """Event raised when a new clinical insight is generated"""
    insight_id: str
    digital_twin_id: str
    patient_id: str
    insight_type: InsightType
    severity_level: SeverityLevel
    
@dataclass(frozen=True)
class HighRiskDetected(DomainEvent):
    """Event raised when a high risk situation is detected"""
    digital_twin_id: str
    patient_id: str
    risk_type: RiskType
    risk_score: float
    contributing_factors: List[str]
    detection_time: datetime
```

## 7. Repository Interfaces

```python
class DigitalTwinRepository(ABC):
    """
    Repository interface for digital twin persistence.
    
    The implementation details are in the infrastructure layer.
    """
    
    @abstractmethod
    async def save(self, digital_twin: DigitalTwin) -> None:
        """Save a digital twin"""
        pass
    
    @abstractmethod
    async def get_by_id(self, digital_twin_id: str) -> Optional[DigitalTwin]:
        """Get a digital twin by ID"""
        pass
    
    @abstractmethod
    async def get_by_patient_id(self, patient_id: str) -> Optional[DigitalTwin]:
        """Get a digital twin by patient ID"""
        pass
    
    @abstractmethod
    async def get_version_history(
        self, 
        digital_twin_id: str, 
        limit: int = 10
    ) -> List[DigitalTwin]:
        """Get version history of a digital twin"""
        pass
```

## 8. Factory Interfaces

```python
class DigitalTwinFactory(ABC):
    """
    Factory interface for creating digital twins.
    
    The implementation details are in the infrastructure layer.
    """
    
    @abstractmethod
    async def create_digital_twin(
        self,
        patient_id: str,
        time_series_model_id: Optional[str] = None,
        biometric_model_id: Optional[str] = None,
        medication_model_id: Optional[str] = None
    ) -> DigitalTwin:
        """
        Create a new digital twin for a patient.
        
        Args:
            patient_id: ID of the patient
            time_series_model_id: Optional ID of a pre-trained time series model
            biometric_model_id: Optional ID of a pre-trained biometric model
            medication_model_id: Optional ID of a pre-trained medication model
            
        Returns:
            A newly created digital twin
        """
        pass
```

## 9. Domain Layer Compliance

The Digital Twin domain model adheres to the NOVAMIND architectural standards:

1. **Clean Domain Layer**: No dependencies on frameworks, databases, or external services
2. **Immutable Domain Entities**: All entities use immutable data structures to ensure integrity
3. **Domain-Driven Design**: Models map directly to psychiatric concepts and workflows
4. **SOLID Principles**: Single responsibility, interface segregation, etc.
5. **Layered Architecture**: Clear separation between domain, application, and infrastructure

## 10. HIPAA Compliance

The Domain Model supports HIPAA compliance through:

1. **Audit Trail**: Immutable entities and version tracking provide comprehensive history
2. **Minimum Necessary**: Precise data models ensure only relevant data is included
3. **Data Integrity**: Value objects with validation ensure data correctness
4. **Access Control**: Repository interfaces support implementation of access controls

## 11. References

1. Evans, E. (2003). Domain-Driven Design: Tackling Complexity in the Heart of Software
2. Martin, R. C. (2017). Clean Architecture: A Craftsman's Guide to Software Structure and Design
3. National Institute of Mental Health. (2023). Computational Psychiatry: New Perspectives on Mental Illness
4. European Federation of Psychiatric Trainees. (2024). Position Paper on Digital Twins in Psychiatry
