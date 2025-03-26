# NOVAMIND: Digital Twin API

## 1. API Design Principles

The Digital Twin API follows these core principles:

1. **Clean Architecture**: Presentation layer is separate from business logic
2. **HIPAA Compliance**: Authentication, authorization, and audit logging for all endpoints
3. **RESTful Design**: Resource-oriented endpoints with appropriate HTTP methods
4. **Versioning**: Explicit versioning to support backwards compatibility
5. **Documentation**: OpenAPI/Swagger documentation for all endpoints

## 2. API Endpoints

### 2.1 Digital Twin Core

#### Get Digital Twin

```python
@router.get(
    "/patients/{patient_id}/digital-twin",
    response_model=DigitalTwinResponse,
    status_code=status.HTTP_200_OK,
    description="Get a patient's digital twin model"
)
async def get_digital_twin(
    patient_id: str,
    current_user: User = Depends(get_current_user),
    digital_twin_service: DigitalTwinService = Depends(),
    rbac_service: RBACService = Depends(),
    audit_service: AuditService = Depends()
):
    """
    Retrieve a patient's digital twin model
    
    HIPAA Compliance:
    - Validates user has permission to access patient data
    - Logs access for audit purposes
    """
    # Verify permission to access patient data
    if not rbac_service.can_access_patient_data(current_user, patient_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this patient's data"
        )
    
    # Log access attempt
    await audit_service.log_event(
        event_type=AuditEventType.DATA_ACCESS,
        action="digital_twin_access",
        user_id=current_user.id,
        resource_id=patient_id,
        resource_type="patient"
    )
    
    # Get digital twin
    digital_twin = await digital_twin_service.get_by_patient_id(patient_id)
    
    if not digital_twin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Digital twin not found for patient"
        )
    
    # Map to response model
    return DigitalTwinResponse(
        id=digital_twin.id,
        patient_id=digital_twin.patient_id,
        created_at=digital_twin.created_at,
        updated_at=digital_twin.updated_at,
        version=digital_twin.version,
        confidence_score=digital_twin.confidence_score,
        models=[
            DigitalTwinModelResponse(
                id=model.id,
                model_type=model.model_type.value,
                version=model.version,
                created_at=model.created_at,
                confidence_score=model.confidence_score,
                description=model.get_model_description()
            )
            for model in digital_twin.models
        ],
        last_calibration=digital_twin.last_calibration
    )
```

#### Create Digital Twin

```python
@router.post(
    "/patients/{patient_id}/digital-twin",
    response_model=DigitalTwinResponse,
    status_code=status.HTTP_201_CREATED,
    description="Create a digital twin for a patient"
)
async def create_digital_twin(
    patient_id: str,
    request: CreateDigitalTwinRequest,
    current_user: User = Depends(get_current_user),
    digital_twin_factory: DigitalTwinFactory = Depends(),
    digital_twin_repository: DigitalTwinRepository = Depends(),
    rbac_service: RBACService = Depends(),
    audit_service: AuditService = Depends()
):
    """
    Create a new digital twin for a patient
    
    HIPAA Compliance:
    - Validates user has clinical permission to create a digital twin
    - Logs creation for audit purposes
    """
    # Verify permission
    if not rbac_service.has_role(current_user, [Role.PSYCHIATRIST, Role.CLINICAL_ADMIN]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clinicians can create digital twins"
        )
    
    # Check if digital twin already exists
    existing_twin = await digital_twin_repository.get_by_patient_id(patient_id)
    if existing_twin:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Digital twin already exists for patient"
        )
    
    # Create digital twin
    digital_twin = await digital_twin_factory.create_digital_twin(
        patient_id=patient_id,
        time_series_model_id=request.time_series_model_id,
        biometric_model_id=request.biometric_model_id,
        medication_model_id=request.medication_model_id
    )
    
    # Save to repository
    await digital_twin_repository.save(digital_twin)
    
    # Log creation for audit
    await audit_service.log_event(
        event_type=AuditEventType.CREATION,
        action="digital_twin_creation",
        user_id=current_user.id,
        resource_id=digital_twin.id,
        resource_type="digital_twin",
        additional_data={"patient_id": patient_id}
    )
    
    # Map to response model
    return DigitalTwinResponse(
        id=digital_twin.id,
        patient_id=digital_twin.patient_id,
        created_at=digital_twin.created_at,
        updated_at=digital_twin.updated_at,
        version=digital_twin.version,
        confidence_score=digital_twin.confidence_score,
        models=[
            DigitalTwinModelResponse(
                id=model.id,
                model_type=model.model_type.value,
                version=model.version,
                created_at=model.created_at,
                confidence_score=model.confidence_score,
                description=model.get_model_description()
            )
            for model in digital_twin.models
        ],
        last_calibration=digital_twin.last_calibration
    )
```

### 2.2 Symptom Forecasting API

#### Generate Symptom Forecast

```python
@router.get(
    "/patients/{patient_id}/symptom-forecast",
    response_model=SymptomForecastResponse,
    status_code=status.HTTP_200_OK,
    description="Generate symptom forecast for patient"
)
async def generate_symptom_forecast(
    patient_id: str,
    symptom_type: SymptomType,
    forecast_days: int = 14,
    current_user: User = Depends(get_current_user),
    time_series_service: TimeSeriesForecastingService = Depends(),
    rbac_service: RBACService = Depends(),
    audit_service: AuditService = Depends()
):
    """
    Generate a forecast of symptom progression
    
    HIPAA Compliance:
    - Validates user has permission to access patient data
    - Logs prediction generation for audit purposes
    """
    # Verify permission to access patient data
    if not rbac_service.can_access_patient_data(current_user, patient_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this patient's data"
        )
    
    # Log access attempt
    await audit_service.log_event(
        event_type=AuditEventType.MODEL_INFERENCE,
        action="symptom_forecast_generation",
        user_id=current_user.id,
        resource_id=patient_id,
        resource_type="patient",
        additional_data={
            "symptom_type": symptom_type.value,
            "forecast_days": forecast_days
        }
    )
    
    # Generate forecast
    try:
        trajectory = await time_series_service.generate_symptom_forecast(
            patient_id=patient_id,
            symptom_type=symptom_type,
            forecast_days=forecast_days
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating forecast: {str(e)}"
        )
    
    # Return formatted response
    return SymptomForecastResponse(
        patient_id=patient_id,
        symptom_type=symptom_type.value,
        forecast_days=forecast_days,
        forecast_points=[
            ForecastPointResponse(
                date=point.date,
                value=point.value,
                confidence_lower=point.confidence_lower,
                confidence_upper=point.confidence_upper
            )
            for point in trajectory.prediction_points
        ],
        confidence_score=trajectory.confidence_score,
        model_version=trajectory.model_version,
        generated_at=trajectory.created_at
    )
```

### 2.3 Biometric Correlation API

#### Get Biometric Correlations

```python
@router.get(
    "/patients/{patient_id}/biometric-correlations",
    response_model=BiometricCorrelationResponse,
    status_code=status.HTTP_200_OK,
    description="Get biometric correlations for patient"
)
async def get_biometric_correlations(
    patient_id: str,
    minimum_correlation: float = 0.5,
    current_user: User = Depends(get_current_user),
    biometric_service: BiometricCorrelationService = Depends(),
    digital_twin_service: DigitalTwinService = Depends(),
    rbac_service: RBACService = Depends(),
    audit_service: AuditService = Depends()
):
    """
    Get correlations between biometrics and mental health
    
    HIPAA Compliance:
    - Validates user has permission to access patient data
    - Logs correlation access for audit purposes
    """
    # Verify permission to access patient data
    if not rbac_service.can_access_patient_data(current_user, patient_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this patient's data"
        )
    
    # Log access attempt
    await audit_service.log_event(
        event_type=AuditEventType.DATA_ACCESS,
        action="biometric_correlation_access",
        user_id=current_user.id,
        resource_id=patient_id,
        resource_type="patient"
    )
    
    # Get digital twin
    digital_twin = await digital_twin_service.get_by_patient_id(patient_id)
    
    if not digital_twin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Digital twin not found for patient"
        )
    
    # Find biometric model
    biometric_model = None
    for model in digital_twin.models:
        if model.model_type == ModelType.BIOMETRIC_CORRELATION:
            biometric_model = model
            break
    
    if not biometric_model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Biometric correlation model not found for patient"
        )
    
    # Get correlations above threshold
    correlations = biometric_model.get_strongest_correlations(threshold=minimum_correlation)
    
    # Return formatted response
    return BiometricCorrelationResponse(
        patient_id=patient_id,
        model_version=biometric_model.version,
        correlations=[
            BiometricCorrelationItemResponse(
                biometric_type=correlation.biometric_type.value,
                symptom_type=correlation.symptom_type.value,
                correlation_strength=correlation.correlation_strength,
                lag_days=correlation.lag_days
            )
            for correlation in correlations
        ],
        generated_at=biometric_model.created_at
    )
```

### 2.4 Medication Recommendation API

#### Get Medication Recommendations

```python
@router.get(
    "/patients/{patient_id}/medication-recommendations",
    response_model=MedicationRecommendationResponse,
    status_code=status.HTTP_200_OK,
    description="Get medication recommendations for patient"
)
async def get_medication_recommendations(
    patient_id: str,
    condition_type: ConditionType,
    min_efficacy: float = 0.6,
    max_side_effect_risk: float = 0.3,
    current_user: User = Depends(get_current_user),
    precision_medication_service: PrecisionMedicationService = Depends(),
    rbac_service: RBACService = Depends(),
    audit_service: AuditService = Depends()
):
    """
    Get personalized medication recommendations
    
    HIPAA Compliance:
    - Validates user has clinical role to access recommendations
    - Logs recommendation access for audit purposes
    """
    # Verify clinical role
    if not rbac_service.has_role(current_user, [Role.PSYCHIATRIST, Role.NURSE_PRACTITIONER]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clinical staff can access medication recommendations"
        )
    
    # Log access attempt
    await audit_service.log_event(
        event_type=AuditEventType.CLINICAL_DECISION_SUPPORT,
        action="medication_recommendation_access",
        user_id=current_user.id,
        resource_id=patient_id,
        resource_type="patient",
        additional_data={"condition_type": condition_type.value}
    )
    
    # Get medication model
    try:
        medication_model = await precision_medication_service.get_medication_model(
            patient_id=patient_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medication model not found: {str(e)}"
        )
    
    # Get optimal medications
    recommendations = medication_model.get_optimal_medications(
        min_efficacy=min_efficacy,
        max_side_effect_risk=max_side_effect_risk
    )
    
    # Filter for target condition
    filtered_recommendations = [
        r for r in recommendations
        if r.medication_class in precision_medication_service.get_medication_classes_for_condition(condition_type)
    ]
    
    # Return formatted response
    return MedicationRecommendationResponse(
        patient_id=patient_id,
        condition_type=condition_type.value,
        model_version=medication_model.version,
        generated_at=medication_model.created_at,
        recommendations=[
            MedicationRecommendationItemResponse(
                medication_class=rec.medication_class.value,
                predicted_efficacy=rec.predicted_efficacy,
                side_effect_risks=[
                    SideEffectRiskResponse(
                        effect_type=risk.effect_type.value,
                        risk_level=risk.risk_level
                    )
                    for risk in rec.side_effect_risks
                ],
                net_benefit=rec.net_benefit
            )
            for rec in filtered_recommendations
        ]
    )
```

### 2.5 Clinical Insights API

#### Get Clinical Insights

```python
@router.get(
    "/patients/{patient_id}/clinical-insights",
    response_model=ClinicalInsightsResponse,
    status_code=status.HTTP_200_OK,
    description="Get clinical insights from digital twin"
)
async def get_clinical_insights(
    patient_id: str,
    insight_types: List[InsightType] = Query(None),
    days: int = 30,
    current_user: User = Depends(get_current_user),
    digital_twin_service: DigitalTwinService = Depends(),
    rbac_service: RBACService = Depends(),
    audit_service: AuditService = Depends()
):
    """
    Get clinical insights derived from digital twin
    
    HIPAA Compliance:
    - Validates user has permission to access patient data
    - Logs insight access for audit purposes
    """
    # Verify permission to access patient data
    if not rbac_service.can_access_patient_data(current_user, patient_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this patient's data"
        )
    
    # Log access attempt
    await audit_service.log_event(
        event_type=AuditEventType.DATA_ACCESS,
        action="clinical_insight_access",
        user_id=current_user.id,
        resource_id=patient_id,
        resource_type="patient",
        additional_data={
            "insight_types": [it.value for it in insight_types] if insight_types else "all",
            "days": days
        }
    )
    
    # Get digital twin
    digital_twin = await digital_twin_service.get_by_patient_id(patient_id)
    
    if not digital_twin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Digital twin not found for patient"
        )
    
    # Generate insights
    insights = await digital_twin_service.generate_clinical_insights(
        digital_twin=digital_twin,
        insight_types=insight_types
    )
    
    # Return formatted response
    return ClinicalInsightsResponse(
        patient_id=patient_id,
        insights=[
            ClinicalInsightResponse(
                id=insight.id,
                insight_type=insight.insight_type.value,
                description=insight.description,
                confidence=insight.confidence,
                generated_at=insight.generated_at,
                supporting_evidence=[
                    EvidencePointResponse(
                        data_type=evidence.data_type.value,
                        timestamp=evidence.timestamp,
                        value=str(evidence.value),
                        reference_range=(
                            [evidence.reference_range[0], evidence.reference_range[1]]
                            if evidence.reference_range else None
                        ),
                        deviation_severity=evidence.deviation_severity
                    )
                    for evidence in insight.supporting_evidence
                ]
            )
            for insight in insights
        ],
        generated_at=datetime.now()
    )
```

## 3. Request & Response Models

### 3.1 Digital Twin

```python
class DigitalTwinModelResponse(BaseModel):
    """Response model for a digital twin model component"""
    id: str
    model_type: str
    version: str
    created_at: datetime
    confidence_score: float
    description: str

class DigitalTwinResponse(BaseModel):
    """Response model for a digital twin"""
    id: str
    patient_id: str
    created_at: datetime
    updated_at: datetime
    version: int
    confidence_score: float
    models: List[DigitalTwinModelResponse]
    last_calibration: datetime

class CreateDigitalTwinRequest(BaseModel):
    """Request model for creating a digital twin"""
    time_series_model_id: Optional[str] = None
    biometric_model_id: Optional[str] = None
    medication_model_id: Optional[str] = None
```

### 3.2 Symptom Forecasting

```python
class ForecastPointResponse(BaseModel):
    """Response model for a forecast point"""
    date: datetime
    value: float
    confidence_lower: float
    confidence_upper: float

class SymptomForecastResponse(BaseModel):
    """Response model for symptom forecast"""
    patient_id: str
    symptom_type: str
    forecast_days: int
    forecast_points: List[ForecastPointResponse]
    confidence_score: float
    model_version: str
    generated_at: datetime
```

### 3.3 Biometric Correlations

```python
class BiometricCorrelationItemResponse(BaseModel):
    """Response model for a biometric correlation"""
    biometric_type: str
    symptom_type: str
    correlation_strength: float
    lag_days: int

class BiometricCorrelationResponse(BaseModel):
    """Response model for biometric correlations"""
    patient_id: str
    model_version: str
    correlations: List[BiometricCorrelationItemResponse]
    generated_at: datetime
```

### 3.4 Medication Recommendations

```python
class SideEffectRiskResponse(BaseModel):
    """Response model for side effect risk"""
    effect_type: str
    risk_level: float

class MedicationRecommendationItemResponse(BaseModel):
    """Response model for a medication recommendation"""
    medication_class: str
    predicted_efficacy: float
    side_effect_risks: List[SideEffectRiskResponse]
    net_benefit: float

class MedicationRecommendationResponse(BaseModel):
    """Response model for medication recommendations"""
    patient_id: str
    condition_type: str
    model_version: str
    recommendations: List[MedicationRecommendationItemResponse]
    generated_at: datetime
```

### 3.5 Clinical Insights

```python
class EvidencePointResponse(BaseModel):
    """Response model for an evidence point"""
    data_type: str
    timestamp: datetime
    value: str
    reference_range: Optional[List[float]] = None
    deviation_severity: Optional[float] = None

class ClinicalInsightResponse(BaseModel):
    """Response model for a clinical insight"""
    id: str
    insight_type: str
    description: str
    confidence: float
    generated_at: datetime
    supporting_evidence: List[EvidencePointResponse]

class ClinicalInsightsResponse(BaseModel):
    """Response model for clinical insights"""
    patient_id: str
    insights: List[ClinicalInsightResponse]
    generated_at: datetime
```

## 4. API Documentation

The Digital Twin API is documented using OpenAPI/Swagger:

```python
app = FastAPI(
    title="NOVAMIND Digital Twin API",
    description="API for interacting with psychiatric digital twins",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Include security scheme
app.add_middleware(
    AuthenticationMiddleware,
    backend=JWTAuthBackend(
        secret_key=settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
)

# Add routers
app.include_router(
    digital_twin_router,
    prefix="/api/v1",
    tags=["Digital Twin"]
)
```

## 5. API Security

### 5.1 Authentication

```python
class JWTAuthBackend(AuthenticationBackend):
    """JWT authentication backend"""
    
    def __init__(self, secret_key: str, algorithm: str):
        self.secret_key = secret_key
        self.algorithm = algorithm
        
    async def authenticate(self, request: Request) -> Optional[User]:
        """
        Authenticate a request using JWT token
        
        Args:
            request: HTTP request
            
        Returns:
            Authenticated user if valid token, None otherwise
        """
        # Extract token from Authorization header
        authorization = request.headers.get("Authorization")
        if not authorization:
            return None
            
        try:
            scheme, token = authorization.split()
            if scheme.lower() != "bearer":
                return None
        except ValueError:
            return None
            
        # Validate token
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm]
            )
            
            # Extract user data from payload
            user_id = payload.get("sub")
            if not user_id:
                return None
                
            # Create user object
            return User(
                id=user_id,
                username=payload.get("username", ""),
                roles=[Role(r) for r in payload.get("roles", [])],
                permissions=payload.get("permissions", [])
            )
        except JWTError:
            return None
```

### 5.2 Authorization

```python
class RBACMiddleware(BaseHTTPMiddleware):
    """RBAC middleware for endpoint authorization"""
    
    def __init__(
        self,
        app: ASGIApp,
        rbac_service: RBACService
    ):
        super().__init__(app)
        self.rbac_service = rbac_service
        
    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint
    ) -> Response:
        """
        Dispatch request through RBAC middleware
        
        Args:
            request: HTTP request
            call_next: Next middleware or endpoint
            
        Returns:
            HTTP response
        """
        # Skip RBAC for non-protected routes
        path = request.url.path
        if path.startswith("/api/docs") or path.startswith("/api/redoc") or path == "/api/health":
            return await call_next(request)
            
        # Get authenticated user
        user = request.scope.get("user")
        if not user:
            return JSONResponse(
                status_code=401,
                content={"detail": "Authentication required"}
            )
            
        # Check if user has permission for endpoint
        if not await self.rbac_service.can_access_endpoint(
            user=user,
            path=path,
            method=request.method
        ):
            return JSONResponse(
                status_code=403,
                content={"detail": "Not authorized to access this endpoint"}
            )
            
        # Allow request to proceed
        return await call_next(request)
```

## 6. Audit Logging

```python
class APIAuditMiddleware(BaseHTTPMiddleware):
    """Middleware for API audit logging"""
    
    def __init__(
        self,
        app: ASGIApp,
        audit_service: AuditService
    ):
        super().__init__(app)
        self.audit_service = audit_service
        
    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint
    ) -> Response:
        """
        Dispatch request through audit middleware
        
        Args:
            request: HTTP request
            call_next: Next middleware or endpoint
            
        Returns:
            HTTP response
        """
        # Get request details
        path = request.url.path
        method = request.method
        user_id = request.scope.get("user", None)
        if user_id:
            user_id = user_id.id
            
        # Skip audit for non-API routes
        if not path.startswith("/api/v1"):
            return await call_next(request)
            
        # Create audit context
        context = {
            "path": path,
            "method": method,
            "ip_address": request.client.host if request.client else None,
            "user_agent": request.headers.get("User-Agent", ""),
            "query_params": str(request.query_params)
        }
        
        # Record API access
        await self.audit_service.log_event(
            event_type=AuditEventType.API_ACCESS,
            user_id=user_id,
            action=f"{method} {path}",
            resource_id=None,
            resource_type="api",
            additional_data=context
        )
        
        # Process request
        start_time = time.time()
        response = await call_next(request)
        duration = time.time() - start_time
        
        # Record response details
        context["status_code"] = response.status_code
        context["duration_ms"] = int(duration * 1000)
        
        # Record API response
        await self.audit_service.log_event(
            event_type=AuditEventType.API_RESPONSE,
            user_id=user_id,
            action=f"{method} {path}",
            resource_id=None,
            resource_type="api",
            additional_data=context
        )
        
        return response
```

## 7. HIPAA Compliance

The Digital Twin API ensures HIPAA compliance through:

1. **Authentication & Authorization**: JWT-based authentication and role-based access control
2. **Audit Logging**: Comprehensive logging of all API access and operations
3. **Data Protection**: No PHI in responses beyond minimum necessary
4. **Secure Transmission**: HTTPS for all API traffic
5. **Input Validation**: Pydantic schemas ensure valid data format

## 8. Error Handling

```python
class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Middleware for API error handling"""
    
    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint
    ) -> Response:
        """
        Dispatch request with error handling
        
        Args:
            request: HTTP request
            call_next: Next middleware or endpoint
            
        Returns:
            HTTP response
        """
        try:
            # Process request normally
            return await call_next(request)
        except HTTPException as e:
            # FastAPI HTTP exceptions pass through
            raise e
        except ValidationError as e:
            # Pydantic validation errors
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content={"detail": str(e)}
            )
        except Exception as e:
            # Log unexpected errors
            logger.error(
                f"Unexpected error processing request",
                exc_info=e,
                extra={
                    "path": request.url.path,
                    "method": request.method,
                    "user_id": getattr(request.scope.get("user"), "id", None)
                }
            )
            
            # Return sanitized error response
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "An unexpected error occurred"}
            )
```
