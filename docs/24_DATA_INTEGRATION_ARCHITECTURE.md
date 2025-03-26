# DATA INTEGRATION ARCHITECTURE

## 1. Overview

The Data Integration Architecture component of the NOVAMIND platform provides a secure, flexible framework for connecting diverse mental health data sources while maintaining strict HIPAA compliance and supporting the luxury experience expected by our concierge patients. Unlike traditional healthcare data integration approaches that prioritize technical connectivity over privacy, our architecture incorporates privacy-preserving mechanisms at every layer, ensuring that patient data is protected throughout the integration lifecycle.

Our integration architecture enables the seamless flow of clinical data, patient-generated information, and external health metrics into a unified, secure repository that powers our advanced analytics capabilities. This document outlines the technical approach, implementation patterns, and security safeguards that make this possible without compromising data privacy or the premium experience expected by our patients.

## 2. Core Integration Principles

Our data integration architecture adheres to these foundational principles:

1. **Privacy by Design**: Privacy protections embedded in integration architecture, not added afterward

1. **Minimal Necessary Data**: Only integrating data elements with clear clinical or analytical value

1. **Standardized Interfaces**: Consistent integration patterns across all data sources

1. **Consent-Driven Architecture**: Patient consent management integrated at every connection point

1. **Data Lineage Tracking**: Complete visibility into data provenance and transformation

1. **Security by Default**: End-to-end encryption and strict access controls for all integrations

1. **Clean Separation**: Following Clean Architecture patterns for domain isolation

1. **Luxury Experience**: Integration designed to be invisible to patients while enhancing their care

## 3. Data Source Integration Components

Our architecture includes specialized integration components for various mental health data sources, each with tailored mechanisms for secure connectivity, data validation, and HIPAA-compliant handling.

### 3.1 Electronic Medical Record (EMR) Integration

Our EMR integration component securely connects with various electronic medical record systems while maintaining strict HIPAA compliance and patient privacy.

**Key Components:**

- Standards-based connectivity (HL7, FHIR)
- Role-based data access restrictions
- Patient consent verification before data exchange
- Configurable field-level privacy controls
- Complete audit logging for all data access events

**Implementation Notes:**

- Utilizes a gateway pattern to abstract EMR-specific details
- Incorporates health data standards for semantic interoperability
- Features connection adapters for major EMR systems
- Supports both pull and push integration models
- Maintains HIPAA-compliant business associate agreements

**Technical Implementation:**

```python
# Infrastructure Layer - EMR Integration
class EMRIntegrationService:
    """Service for secure integration with electronic medical record systems"""
    def __init__(
        self,
        emr_adapter_factory: EMRAdapterFactory,
        consent_service: ConsentService,
        rbac_service: RBACService,
        encryption_service: EncryptionService,
        audit_service: AuditService
    ):
        self.emr_adapter_factory = emr_adapter_factory
        self.consent_service = consent_service
        self.rbac_service = rbac_service
        self.encryption_service = encryption_service
        self.audit_service = audit_service
```python

### 3.2 Patient-Generated Health Data Integration

Our patient-generated health data (PGHD) integration framework securely incorporates patient-reported data from various sources, including questionnaires, journaling, and mobile applications.

**Key Components:**

- Standardized questionnaire data models
- Secure journaling content storage
- Mobile application data synchronization
- Passive data collection mechanisms
- Patient-controlled data sharing preferences

**Implementation Notes:**

- Features data validation for patient-generated inputs
- Incorporates secure file storage for media uploads
- Supports both structured and unstructured data
- Implements data quality assessment mechanisms
- Maintains comprehensive privacy controls

**Technical Implementation:**

```python
# Infrastructure Layer - Patient-Generated Health Data Integration
class PGHDIntegrationService:
    """Service for integrating patient-generated health data"""
    def __init__(
        self,
        data_repository: PGHDRepository,
        validation_service: ValidationService,
        encryption_service: EncryptionService,
        consent_service: ConsentService,
        audit_service: AuditService
    ):
        self.data_repository = data_repository
        self.validation_service = validation_service
        self.encryption_service = encryption_service
        self.consent_service = consent_service
        self.audit_service = audit_service
```python

### 3.3 Wearable Device Integration

Our wearable device integration component enables secure connectivity with personal health devices while maintaining patient privacy and providing contextualized health metrics.

**Key Components:**

- Multi-device connectivity framework
- Real-time and batch data synchronization
- Privacy-preserving data aggregation
- Consent-driven data sharing controls
- Contextual health metric analysis

**Implementation Notes:**

- Supports major fitness and health tracking platforms
- Implements OAuth 2.0 for secure authentication
- Features device-specific data transformation
- Includes data normalization across different sources
- Maintains clear data provenance tracking

**Technical Implementation:**

```python
# Infrastructure Layer - Wearable Device Integration
class WearableDeviceIntegrationService:
    """Service for integrating data from wearable health devices"""
    def __init__(
        self,
        device_adapter_factory: DeviceAdapterFactory,
        data_repository: WearableDataRepository,
        consent_service: ConsentService,
        encryption_service: EncryptionService,
        audit_service: AuditService
    ):
        self.device_adapter_factory = device_adapter_factory
        self.data_repository = data_repository
        self.consent_service = consent_service
        self.encryption_service = encryption_service
        self.audit_service = audit_service
```python

## 4. Integration Architecture Patterns

### 4.1 Domain-Driven Data Gateway Design

Our integration architecture employs a domain-driven gateway pattern that maintains clean domain boundaries while enabling efficient data flow.

**Key Components:**

- Domain-specific data gateways with clear boundaries
- Repository interfaces abstracting data access
- Rich domain models for integrated data
- Anti-corruption layers preventing domain pollution
- Infrastructure adapters for external systems

**Implementation Pattern:**

```text
┌─────────────────────┐     ┌────────────────────┐     ┌─────────────────────┐
│                     │     │                    │     │                     │
│   Domain Layer      │     │  Integration Layer │     │  External Systems   │
│  (Core Entities)    │     │    (Gateways)      │     │   (Data Sources)    │
│                     │     │                    │     │                     │
└─────────┬───────────┘     └─────────┬──────────┘     └──────────┬──────────┘
          │                           │                           │
          ▼                           ▼                           ▼
┌─────────────────────┐     ┌────────────────────┐     ┌─────────────────────┐
│                     │     │                    │     │                     │
│  Domain Services    │◄────┤  Data Gateways     │◄────┤  System Adapters    │
│                     │     │                    │     │                     │
└─────────┬───────────┘     └─────────┬──────────┘     └──────────┬──────────┘
          │                           │                           │
          ▼                           ▼                           ▼
┌─────────────────────┐     ┌────────────────────┐     ┌─────────────────────┐
│                     │     │                    │     │                     │
│  Repository         │◄────┤  Anti-Corruption   │◄────┤  Authentication &   │
│  Interfaces         │     │  Layer             │     │  Authorization      │
│                     │     │                    │     │                     │
└─────────────────────┘     └────────────────────┘     └─────────────────────┘
```python

### 4.2 Event-Driven Integration Approach

Our event-driven integration architecture enables loose coupling between systems while maintaining data consistency and synchronization.

**Key Components:**

- Domain event publication for integration triggers
- Event consumers for data synchronization
- Message-based integration patterns
- Idempotent processing for reliability
- Eventual consistency management

**Implementation Notes:**

- Utilizes asynchronous processing for performance
- Maintains event ordering guarantees when needed
- Implements dead-letter queues for error handling
- Features event sourcing for data lineage
- Includes compensating transactions for rollbacks

### 4.3 Secure Adapter Pattern Implementation

Our secure adapter pattern implementation enables standardized connectivity with diverse data sources while maintaining consistent security controls.

**Key Components:**

- Standardized adapter interfaces by data source type
- Security-focused adapter implementation
- Adapter factories for dynamic instantiation
- Monitoring and metrics collection
- Request/response validation middleware

**Technical Implementation:**

```python
# Infrastructure Layer - Adapter Pattern
class WearableAdapter(ABC):
    """Abstract base class for wearable device adapters"""
    @abstractmethod
    async def connect(self, credentials: Dict[str, str]) -> ConnectionResult:
        """Establish connection to wearable data source"""
        pass

    @abstractmethod
    async def fetch_device_data(
        self,
        device_id: str,
        data_types: List[WearableDataType],
        start_date: datetime,
        end_date: datetime
    ) -> List[RawWearableData]:
        """Fetch raw data from wearable device"""
        pass

    @abstractmethod
    async def revoke_access(self, device_id: str) -> bool:
        """Revoke access to wearable device"""
        pass

class WearableAdapterFactory:
    """Factory for creating wearable device adapters"""
    def __init__(
        self,
        secure_config_provider: SecureConfigProvider,
        metrics_service: MetricsService
    ):
        self.secure_config_provider = secure_config_provider
        self.metrics_service = metrics_service
        self._adapters = {
            WearableDeviceType.FITBIT: FitbitAdapter,
            WearableDeviceType.APPLE_HEALTH: AppleHealthAdapter,
            WearableDeviceType.GARMIN: GarminAdapter,
            WearableDeviceType.OURA: OuraAdapter,
            WearableDeviceType.WHOOP: WhoopAdapter
        }

    def create_adapter(self, device_type: WearableDeviceType) -> WearableAdapter:
        """Create appropriate wearable adapter for device type"""
        if device_type not in self._adapters:
            raise UnsupportedDeviceTypeError(f"Unsupported device type: {device_type}")

        adapter_class = self._adapters[device_type]

        # Get secure configuration for this device type
        config = self.secure_config_provider.get_config(f"wearable.{device_type.value}")

        # Create adapter with monitoring wrapper
        adapter = adapter_class(config)
        monitored_adapter = self._create_monitored_adapter(adapter, device_type)

        return monitored_adapter

    def _create_monitored_adapter(
        self,
        adapter: WearableAdapter,
        device_type: WearableDeviceType
    ) -> WearableAdapter:
        """
        Create a monitored wrapper around adapter for metrics and logging
        This implements the Decorator pattern for cross-cutting concerns
        """
        return MonitoredWearableAdapter(
            adapter=adapter,
            device_type=device_type,
            metrics_service=self.metrics_service
        )

class MonitoredWearableAdapter(WearableAdapter):
    """
    Decorator for WearableAdapter that adds monitoring
    Implements the Decorator pattern for adding cross-cutting concerns
    """
    def __init__(
        self,
        adapter: WearableAdapter,
        device_type: WearableDeviceType,
        metrics_service: MetricsService
    ):
        self._adapter = adapter
        self.device_type = device_type
        self.metrics_service = metrics_service

    async def connect(self, credentials: Dict[str, str]) -> ConnectionResult:
        """Monitored connection to wearable data source"""
        start_time = time.time()
        try:
            result = await self._adapter.connect(credentials)
            self.metrics_service.record_metric(
                name="wearable_connection_success",
                value=1 if result.success else 0,
                tags={"device_type": self.device_type.value}
            )
            return result
        except Exception as e:
            self.metrics_service.record_metric(
                name="wearable_connection_error",
                value=1,
                tags={"device_type": self.device_type.value, "error_type": type(e).__name__}
            )
            raise
        finally:
            execution_time = time.time() - start_time
            self.metrics_service.record_metric(
                name="wearable_connection_time",
                value=execution_time,
                tags={"device_type": self.device_type.value}
            )

    async def fetch_device_data(
        self,
        device_id: str,
        data_types: List[WearableDataType],
        start_date: datetime,
        end_date: datetime
    ) -> List[RawWearableData]:
        """Monitored data fetching from wearable device"""
        start_time = time.time()
        try:
            results = await self._adapter.fetch_device_data(
                device_id=device_id,
                data_types=data_types,
                start_date=start_date,
                end_date=end_date
            )
            self.metrics_service.record_metric(
                name="wearable_data_fetch_success",
                value=len(results),
                tags={"device_type": self.device_type.value}
            )
            return results
        except Exception as e:
            self.metrics_service.record_metric(
                name="wearable_data_fetch_error",
                value=1,
                tags={"device_type": self.device_type.value, "error_type": type(e).__name__}
            )
            raise
        finally:
            execution_time = time.time() - start_time
            self.metrics_service.record_metric(
                name="wearable_data_fetch_time",
                value=execution_time,
                tags={"device_type": self.device_type.value}
            )

    async def revoke_access(self, device_id: str) -> bool:
        """Monitored access revocation from wearable device"""
        start_time = time.time()
        try:
            result = await self._adapter.revoke_access(device_id)
            self.metrics_service.record_metric(
                name="wearable_revoke_access_success",
                value=1 if result else 0,
                tags={"device_type": self.device_type.value}
            )
            return result
        except Exception as e:
            self.metrics_service.record_metric(
                name="wearable_revoke_access_error",
                value=1,
                tags={"device_type": self.device_type.value, "error_type": type(e).__name__}
            )
            raise
        finally:
            execution_time = time.time() - start_time
            self.metrics_service.record_metric(
                name="wearable_revoke_access_time",
                value=execution_time,
                tags={"device_type": self.device_type.value}
            )
```python

### 4.4 Data Transformation and Normalization Services

Our data transformation and normalization services convert diverse data formats into consistent domain entities while preserving semantic meaning and context.

**Key Components:**

- Schema-based transformation pipelines
- Domain-specific normalizers
- Semantic mapping services
- Clinical terminology normalization
- Context preservation mechanisms

**Implementation Notes:**

- Utilizes declarative transformation rules
- Features data quality validation during transformation
- Preserves original raw data for auditability
- Includes terminology mapping for clinical codes
- Supports bidirectional transformations when required

### 4.5 Multi-Level Validation Framework

Our multi-level validation framework ensures data quality and integrity at each integration point, preventing invalid or corrupted data from entering the system.

**Key Components:**

- Schema-level validation for structural integrity
- Domain-level validation for business rules
- Semantic validation for context and meaning
- Cross-field validation for relational integrity
- Temporal validation for sequential integrity

**Implementation Notes:**

- Implements validation pipelines with clear error reporting
- Features progressive validation with early termination
- Includes contextual validation based on data source
- Supports validation rule versioning for evolving requirements
- Maintains validation logs for quality assurance

**Technical Implementation:**

```python
# Infrastructure Layer - Validation Framework
class ValidationRule(ABC):
    """Abstract base class for validation rules"""
    @abstractmethod
    async def validate(self, data: Any, context: Dict[str, Any] = None) -> ValidationResult:
        """Validate data against rule"""
        pass

class ValidationPipeline:
    """Pipeline for executing multiple validation rules in sequence"""
    def __init__(
        self,
        rules: List[ValidationRule],
        fail_fast: bool = True,
        logger: Logger = None
    ):
        self.rules = rules
        self.fail_fast = fail_fast
        self.logger = logger or logging.getLogger(__name__)

    async def validate(self, data: Any, context: Dict[str, Any] = None) -> ValidationResult:
        """
        Execute validation pipeline on data

        Args:
            data: Data to validate
            context: Additional context for validation

        Returns:
            ValidationResult containing success status, errors, and warnings
        """
        results = []
        context = context or {}

        for rule in self.rules:
            result = await rule.validate(data, context)
            results.append(result)

            # Log the validation result
            log_level = logging.WARNING if not result.success else logging.DEBUG
            self.logger.log(
                log_level,
                f"Validation rule {rule.__class__.__name__}: "
                f"{result.success}, errors={result.errors}, warnings={result.warnings}"
            )

            # Stop on first failure if fail_fast is True
            if not result.success and self.fail_fast:
                break

        # Aggregate all results
        success = all(r.success for r in results)
        errors = [e for r in results for e in r.errors]
        warnings = [w for r in results for w in r.warnings]

        return ValidationResult(
            success=success,
            errors=errors,
            warnings=warnings
        )

class SchemaValidationRule(ValidationRule):
    """Validation rule for schema validation"""
    def __init__(self, schema: Dict[str, Any]):
        self.schema = schema
        self.validator = jsonschema.Draft7Validator(schema)

    async def validate(self, data: Any, context: Dict[str, Any] = None) -> ValidationResult:
        """Validate data against JSON schema"""
        errors = list(self.validator.iter_errors(data))

        if errors:
            return ValidationResult(
                success=False,
                errors=[f"Schema validation error: {e.message}" for e in errors],
                warnings=[]
            )

        return ValidationResult(success=True, errors=[], warnings=[])

class DomainValidationRule(ValidationRule):
    """Base class for domain-specific validation rules"""
    def __init__(self, entity_type: str, field_name: str = None):
        self.entity_type = entity_type
        self.field_name = field_name

    async def validate(self, data: Any, context: Dict[str, Any] = None) -> ValidationResult:
        """
        Validate data against domain rules

        To be implemented by specific domain validation subclasses
        """
        raise NotImplementedError("Domain validation rule must be implemented by subclasses")

class ValidationService:
    """Service for managing and executing validation pipelines"""
    def __init__(
        self,
        validation_registry: Dict[str, ValidationPipeline],
        logger: Logger = None
    ):
        self.validation_registry = validation_registry
        self.logger = logger or logging.getLogger(__name__)

    async def validate_data(
        self,
        data: Any,
        validation_type: str,
        context: Dict[str, Any] = None
    ) -> ValidationResult:
        """
        Validate data using registered validation pipeline

        Args:
            data: Data to validate
            validation_type: Type of validation to perform
            context: Additional context for validation

        Returns:
            ValidationResult containing success status, errors, and warnings
        """
        if validation_type not in self.validation_registry:
            raise ValidationError(f"Validation type '{validation_type}' not found")

        pipeline = self.validation_registry[validation_type]
        result = await pipeline.validate(data, context)

        # Log the validation result
        log_level = logging.WARNING if not result.success else logging.DEBUG
        self.logger.log(
            log_level,
            f"Validation for type '{validation_type}': "
            f"{result.success}, errors={len(result.errors)}, warnings={len(result.warnings)}"
        )

        return result

    async def search_events(
        self,
        filters: AuditEventFilters,
        pagination: Pagination
    ) -> List[AuditEvent]:
        """
        Search audit events based on filters

        Args:
            filters: Filters to apply to search
            pagination: Pagination parameters

        Returns:
            List of matching audit events
        """
        # Validate caller has permission to search audit events
        # (Authorization should be handled at the API layer)

        # Execute search
        events = await self.audit_repository.search_events(filters, pagination)

        return events

class AuditEventEnricher:
    """Service for enriching audit events with additional context"""
    def __init__(
        self,
        user_service: Optional[UserService] = None,
        resource_registry: Optional[ResourceRegistry] = None
    ):
        self.user_service = user_service
        self.resource_registry = resource_registry

    async def enrich_event(self, event: AuditEvent) -> AuditEvent:
        """
        Enrich an audit event with additional context

        Args:
            event: Base audit event to enrich

        Returns:
            Enriched audit event
        """
        enriched_event = copy.deepcopy(event)

        # Enrich with user information if available
        if self.user_service and event.user_id:
            try:
                user = await self.user_service.get_user_summary(event.user_id)
                enriched_event.additional_data["user_info"] = {
                    "username": user.username,
                    "role": user.role,
                    "department": user.department
                }
            except Exception:
                # Continue even if user enrichment fails
                pass

        # Enrich with resource information if available
        if self.resource_registry and event.resource_id and event.resource_type:
            try:
                resource_info = await self.resource_registry.get_resource_info(
                    resource_type=event.resource_type,
                    resource_id=event.resource_id
                )
                if resource_info:
                    enriched_event.additional_data["resource_info"] = resource_info
            except Exception:
                # Continue even if resource enrichment fails
                pass

        return enriched_event

## 5. HIPAA-Compliant Integration Mechanisms

### 5.1 De-identification and Tokenization Pipelines

Our de-identification and tokenization pipelines protect sensitive patient data during integration while maintaining analytical utility and clinical relevance.

**Key Components:**

- Field-level tokenization for identifiers
- Contextual de-identification based on data sensitivity
- Re-identification capabilities for authorized access
- Cryptographic token generation and management
- Separation of identifiable and clinical data

**Implementation Notes:**

- Implements HIPAA Safe Harbor and Expert Determination methods
- Features k-anonymity and differential privacy techniques
- Includes privacy impact assessment for integration flows
- Supports tokenization with varying security levels
- Maintains token-to-identifier mapping in secure storage

### 5.2 End-to-End Encryption Protocols

Our end-to-end encryption protocols ensure that sensitive patient data remains protected throughout the integration process, from source to destination.

**Key Components:**

- Transport layer security for data in transit
- Field-level encryption for sensitive data elements
- Key management and rotation services
- Encryption protocol version management
- Secure key exchange mechanisms

**Implementation Notes:**

- Utilizes AES-256 encryption for field-level protection
- Implements TLS 1.3 for all network communications
- Features envelope encryption for key management
- Includes perfect forward secrecy for transport security
- Supports hardware security modules for key protection

**Technical Implementation:**

```python
# Infrastructure Layer - Encryption Services
class EncryptionService:
    """Service for encrypting and decrypting sensitive data"""
    def __init__(
        self,
        key_provider: KeyProvider,
        encryption_config: EncryptionConfig,
        logger: Logger = None
    ):
        self.key_provider = key_provider
        self.encryption_config = encryption_config
        self.logger = logger or logging.getLogger(__name__)

    async def encrypt_field(
        self,
        field_value: str,
        field_type: FieldType,
        context: Dict[str, Any] = None
    ) -> EncryptedField:
        """
        Encrypt a field value based on field type and context

        Args:
            field_value: Plain text value to encrypt
            field_type: Type of field to encrypt
            context: Additional context for encryption

        Returns:
            EncryptedField containing encrypted value and metadata
        """
        if not field_value:
            return EncryptedField(
                encrypted_value="",
                encryption_type=EncryptionType.NONE,
                key_id=None,
                version=self.encryption_config.version,
                encryption_date=datetime.now(),
                metadata={}
            )

        # Get encryption strategy for field type
        encryption_strategy = self.encryption_config.get_strategy_for_field_type(field_type)

        # Get encryption key
        key = await self.key_provider.get_encryption_key(
            key_type=encryption_strategy.key_type,
            context=context
        )

        # Encrypt the value
        encrypted_value = await encryption_strategy.encrypt(field_value, key)

        # Create encrypted field
        result = EncryptedField(
            encrypted_value=encrypted_value,
            encryption_type=encryption_strategy.encryption_type,
            key_id=key.key_id,
            version=self.encryption_config.version,
            encryption_date=datetime.now(),
            metadata={
                "field_type": field_type.value,
                "algorithm": encryption_strategy.algorithm.value
            }
        )

        # Log encryption event
        self.logger.debug(
            f"Encrypted field of type {field_type.value} using key {key.key_id}"
        )

        return result

    async def decrypt_field(
        self,
        encrypted_field: EncryptedField,
        field_type: FieldType,
        context: Dict[str, Any] = None
    ) -> str:
        """Decrypt an encrypted field value"""
        if not encrypted_field.encrypted_value:
            return ""

        if encrypted_field.encryption_type == EncryptionType.NONE:
            return encrypted_field.encrypted_value

        # Get decryption key
        key = await self.key_provider.get_decryption_key(
            key_id=encrypted_field.key_id,
            key_type=KeyType.from_encryption_type(encrypted_field.encryption_type),
            context=context
        )

        # Get decryption strategy based on encryption type
        decryption_strategy = self.encryption_config.get_strategy_for_encryption_type(
            encrypted_field.encryption_type
        )

        # Decrypt the value
        try:
            decrypted_value = await decryption_strategy.decrypt(
                encrypted_field.encrypted_value,
                key
            )

            # Log decryption event
            self.logger.debug(
                f"Decrypted field of type {field_type.value} using key {key.key_id}"
            )

            return decrypted_value
        except DecryptionError as e:
            self.logger.error(
                f"Failed to decrypt field of type {field_type.value}: {str(e)}"
            )
            raise
```python

### 5.3 Access Control Integration Points

Our access control integration points ensure that data access during integration processes adheres to the principle of least privilege and is appropriately authorized.

**Key Components:**

- Integration-specific access control policies
- Role-based access control for integration operations
- Purpose-based access limitations
- Attribute-based access control for sensitive data
- Access logging and auditability

**Implementation Notes:**

- Enforces separation of duties for integration tasks
- Features purpose limitation for data access
- Includes context-aware access policies
- Supports temporary access elevation with approval
- Maintains comprehensive access logs for compliance

**Technical Implementation:**

```python
# Domain Layer - Access Control Services
class IntegrationAccessControl:
    """Domain service for controlling access to integration operations"""
    def __init__(
        self,
        rbac_service: RBACService,
        purpose_registry: PurposeRegistry,
        audit_service: AuditService,
        logger: Logger = None
    ):
        self.rbac_service = rbac_service
        self.purpose_registry = purpose_registry
        self.audit_service = audit_service
        self.logger = logger or logging.getLogger(__name__)

    async def authorize_integration_operation(
        self,
        user_id: str,
        operation_type: IntegrationOperationType,
        integration_id: str,
        purpose: Optional[str] = None,
        patient_id: Optional[str] = None,
        additional_context: Dict[str, Any] = None
    ) -> AuthorizationResult:
        """
        Authorize an integration operation based on user role, purpose, and context

        Args:
            user_id: ID of user attempting the operation
            operation_type: Type of integration operation
            integration_id: ID of the integration
            purpose: Purpose for the operation
            patient_id: ID of patient related to operation (if applicable)
            additional_context: Additional authorization context

        Returns:
            AuthorizationResult containing authorization decision and reason
        """
        context = additional_context or {}
        context.update({
            "operation_type": operation_type.value,
            "integration_id": integration_id,
            "purpose": purpose,
            "patient_id": patient_id
        })

        # Check role-based access
        role_authorized = await self.rbac_service.is_authorized(
            user_id=user_id,
            operation=f"integration:{operation_type.value}",
            resource_id=integration_id,
            context=context
        )

        if not role_authorized:
            # Log unauthorized access attempt
            await self.audit_service.log_event(
                event_type=AuditEventType.AUTHORIZATION,
                action=f"integration_{operation_type.value}",
                user_id=user_id,
                resource_id=integration_id,
                resource_type="integration",
                additional_data={
                    "patient_id": patient_id,
                    "purpose": purpose,
                    "authorized": False,
                    "reason": "Insufficient role permissions"
                },
                success=False
            )

            return AuthorizationResult(
                authorized=False,
                reason="Insufficient role permissions for this integration operation"
            )

        # If purpose is provided, validate it
        if purpose:
            purpose_valid = await self.purpose_registry.validate_purpose(
                purpose_id=purpose,
                operation_type=operation_type,
                user_id=user_id,
                context=context
            )

            if not purpose_valid:
                # Log unauthorized purpose
                await self.audit_service.log_event(
                    event_type=AuditEventType.AUTHORIZATION,
                    action=f"integration_{operation_type.value}",
                    user_id=user_id,
                    resource_id=integration_id,
                    resource_type="integration",
                    additional_data={
                        "patient_id": patient_id,
                        "purpose": purpose,
                        "authorized": False,
                        "reason": "Invalid purpose"
                    },
                    success=False
                )

                return AuthorizationResult(
                    authorized=False,
                    reason=f"Invalid purpose '{purpose}' for this integration operation"
                )

        # Check patient-specific authorization if patient_id is provided
        if patient_id:
            patient_authorized = await self.rbac_service.is_authorized(
                user_id=user_id,
                operation="access:patient_data",
                resource_id=patient_id,
                context=context
            )

            if not patient_authorized:
                # Log unauthorized patient access
                await self.audit_service.log_event(
                    event_type=AuditEventType.AUTHORIZATION,
                    action=f"integration_{operation_type.value}",
                    user_id=user_id,
                    resource_id=integration_id,
                    resource_type="integration",
                    additional_data={
                        "patient_id": patient_id,
                        "purpose": purpose,
                        "authorized": False,
                        "reason": "Unauthorized patient access"
                    },
                    success=False
                )

                return AuthorizationResult(
                    authorized=False,
                    reason=f"Not authorized to access data for patient {patient_id}"
                )

        # Log successful authorization
        await self.audit_service.log_event(
            event_type=AuditEventType.AUTHORIZATION,
            action=f"integration_{operation_type.value}",
            user_id=user_id,
            resource_id=integration_id,
            resource_type="integration",
            additional_data={
                "patient_id": patient_id,
                "purpose": purpose,
                "authorized": True
            },
            success=True
        )

        return AuthorizationResult(
            authorized=True,
            reason="Operation authorized"
        )

### 5.4 Audit Logging Integration Framework

Our audit logging integration framework ensures comprehensive visibility into all data access and manipulation operations, supporting compliance requirements and security monitoring.

**Key Components:**

- Detailed event logging for all data operations
- Actor-action-resource model for audit events
- Time-synchronized logging infrastructure
- Immutable audit trails with tamper detection
- Contextual metadata capture for each event

**Implementation Notes:**

- Utilizes structured logging with consistent schema
- Features centralized log aggregation and indexing
- Includes query interfaces for compliance reporting
- Supports real-time alerting on suspicious patterns
- Maintains log retention based on compliance requirements

### 5.5 Breach Prevention and Detection Mechanisms

Our breach prevention and detection mechanisms provide proactive security controls and real-time monitoring to protect sensitive patient data during integration processes.

**Key Components:**

- Anomaly detection for integration operations
- Behavioral analytics for access patterns
- Rate limiting and throttling mechanisms
- Automated intrusion detection and prevention
- Integration-specific security monitoring

**Implementation Notes:**

- Utilizes machine learning for anomaly detection
- Features baseline profiling for normal behavior
- Includes correlation of security events across systems
- Supports automated incident response workflows
- Maintains comprehensive security metrics

**Technical Implementation:**

```python
# Infrastructure Layer - Security Monitoring
class SecurityMonitoringService:
    """Service for security monitoring of integration operations"""
    def __init__(
        self,
        anomaly_detector: AnomalyDetector,
        security_repository: SecurityRepository,
        notification_service: NotificationService,
        audit_service: AuditService,
        logger: Logger = None
    ):
        self.anomaly_detector = anomaly_detector
        self.security_repository = security_repository
        self.notification_service = notification_service
        self.audit_service = audit_service
        self.logger = logger or logging.getLogger(__name__)

    async def analyze_integration_operation(
        self,
        operation_type: IntegrationOperationType,
        user_id: Optional[str],
        resource_id: str,
        resource_type: str,
        context: Dict[str, Any] = None
    ) -> SecurityAnalysisResult:
        """
        Analyze an integration operation for security anomalies

        Args:
            operation_type: Type of integration operation
            user_id: ID of user performing the operation (None for system operations)
            resource_id: ID of resource being accessed/modified
            resource_type: Type of resource being accessed/modified
            context: Additional context for the operation

        Returns:
            Security analysis result with threat assessment
        """
        # Get baseline behavior profile
        if user_id:
            baseline = await self.security_repository.get_user_baseline(
                user_id=user_id,
                operation_type=operation_type
            )
        else:
            baseline = await self.security_repository.get_system_baseline(
                operation_type=operation_type
            )

        # Create operation context for analysis
        operation_context = {
            "operation_type": operation_type.value,
            "user_id": user_id,
            "resource_id": resource_id,
            "resource_type": resource_type,
            "timestamp": datetime.now(timezone.utc),
            **(context or {})
        }

        # Detect anomalies
        anomalies = await self.anomaly_detector.detect_anomalies(
            operation_context=operation_context,
            baseline=baseline
        )

        # Calculate threat score
        threat_score = self._calculate_threat_score(anomalies)

        # Determine security action based on threat score
        security_action = self._determine_security_action(threat_score)

        # Log security event
        await self.audit_service.log_event(
            event_type=AuditEventType.SECURITY,
            action=f"analyze_{operation_type.value}",
            user_id=user_id,
            resource_id=resource_id,
            resource_type=resource_type,
            additional_data={
                "threat_score": threat_score,
                "anomalies": [a.to_dict() for a in anomalies],
                "security_action": security_action.value
            },
            success=True
        )

        # Take action if needed
        if security_action != SecurityAction.ALLOW:
            await self._handle_security_action(
                security_action=security_action,
                operation_type=operation_type,
                user_id=user_id,
                resource_id=resource_id,
                resource_type=resource_type,
                threat_score=threat_score,
                anomalies=anomalies
            )

        return SecurityAnalysisResult(
            threat_score=threat_score,
            anomalies=anomalies,
            security_action=security_action
        )

    async def _handle_security_action(
        self,
        security_action: SecurityAction,
        operation_type: IntegrationOperationType,
        user_id: Optional[str],
        resource_id: str,
        resource_type: str,
        threat_score: float,
        anomalies: List[Anomaly]
    ) -> None:
        """Handle security action based on threat assessment"""
        if security_action == SecurityAction.BLOCK:
            # Log blocking action
            self.logger.warning(
                f"SECURITY BLOCK: {operation_type.value} by {user_id or 'SYSTEM'} "
                f"on {resource_type}:{resource_id}, threat_score={threat_score}"
            )

            # Create security incident
            incident = await self.security_repository.create_security_incident(
                incident_type=IncidentType.BLOCKED_OPERATION,
                severity=self._map_threat_score_to_severity(threat_score),
                user_id=user_id,
                resource_id=resource_id,
                resource_type=resource_type,
                details={
                    "operation_type": operation_type.value,
                    "threat_score": threat_score,
                    "anomalies": [a.to_dict() for a in anomalies]
                }
            )

            # Notify security team
            await self.notification_service.send_security_notification(
                notification_type=NotificationType.SECURITY_INCIDENT,
                incident_id=incident.id,
                severity=incident.severity,
                summary=f"Blocked {operation_type.value} operation due to security concerns"
            )

        elif security_action == SecurityAction.CHALLENGE:
            # Log challenge action
            self.logger.info(
                f"SECURITY CHALLENGE: {operation_type.value} by {user_id or 'SYSTEM'} "
                f"on {resource_type}:{resource_id}, threat_score={threat_score}"
            )

            # Create challenge record
            await self.security_repository.create_security_challenge(
                challenge_type=ChallengeType.ANOMALOUS_BEHAVIOR,
                user_id=user_id,
                resource_id=resource_id,
                resource_type=resource_type,
                details={
                    "operation_type": operation_type.value,
                    "threat_score": threat_score,
                    "anomalies": [a.to_dict() for a in anomalies]
                }
            )

            # For user operations, send challenge notification
            if user_id:
                await self.notification_service.send_user_notification(
                    user_id=user_id,
                    notification_type=NotificationType.SECURITY_CHALLENGE,
                    message="Additional verification required due to unusual activity pattern"
                )

        elif security_action == SecurityAction.ALERT:
            # Log alert action
            self.logger.info(
                f"SECURITY ALERT: {operation_type.value} by {user_id or 'SYSTEM'} "
                f"on {resource_type}:{resource_id}, threat_score={threat_score}"
            )

            # Create security alert
            alert = await self.security_repository.create_security_alert(
                alert_type=AlertType.ANOMALOUS_BEHAVIOR,
                severity=self._map_threat_score_to_severity(threat_score),
                user_id=user_id,
                resource_id=resource_id,
                resource_type=resource_type,
                details={
                    "operation_type": operation_type.value,
                    "threat_score": threat_score,
                    "anomalies": [a.to_dict() for a in anomalies]
                }
            )

            # For high severity alerts, notify security team
            if alert.severity in [Severity.HIGH, Severity.CRITICAL]:
                await self.notification_service.send_security_notification(
                    notification_type=NotificationType.SECURITY_ALERT,
                    alert_id=alert.id,
                    severity=alert.severity,
                    summary=f"Suspicious {operation_type.value} operation detected"
                )
```python

## 6. Implementation Architecture

Our implementation architecture maintains strict domain separation while enabling efficient data integration flows, following Clean Architecture principles to ensure maintainability and flexibility.

### 6.1 Clean Architecture Approach to Integration

Our integration architecture adheres strictly to Clean Architecture principles, ensuring a clear separation of concerns while maintaining secure and efficient data flow throughout the system.

**Key Components:**

- **Domain Layer**: Core entities and business rules without external dependencies
- **Use Case Layer**: Application-specific business rules governing integration processes
- **Interface Adapters**: Adapters for various data sources and destinations
- **Frameworks & Drivers**: External tools and integrations isolated from core business logic

**Implementation Notes:**

- Domain entities remain pure and free from framework dependencies
- Use cases orchestrate integration flows while enforcing business rules
- Dependency rule ensures that inner layers never depend on outer layers
- All external dependencies (APIs, databases) are abstracted through interfaces
- Each layer can be tested in isolation with appropriate mocking

**Technical Implementation:**

```python
# Domain Layer - Pure Business Logic
class PatientDataIntegrationPolicy:
    """Domain entity representing integration policies for patient data"""
    def __init__(
        self,
        patient_id: str,
        data_categories: List[DataCategory],
        consent_requirements: ConsentRequirements,
        privacy_controls: PrivacyControls,
        retention_policy: RetentionPolicy
    ):
        self.patient_id = patient_id
        self.data_categories = data_categories
        self.consent_requirements = consent_requirements
        self.privacy_controls = privacy_controls
        self.retention_policy = retention_policy

    def allows_integration(self, data_category: DataCategory) -> bool:
        """Determine if integration is allowed for a data category"""
        return data_category in self.data_categories

    def requires_explicit_consent(self, data_category: DataCategory) -> bool:
        """Determine if explicit consent is required for a data category"""
        return data_category in self.consent_requirements.explicit_consent_categories

# Application Layer - Use Cases
class IntegratePatientDataUseCase:
    """Application use case orchestrating patient data integration"""
    def __init__(
        self,
        integration_policy: PatientDataIntegrationPolicy,
        consent_repository: ConsentRepository,
        data_repository: DataRepository,
        integration_adapter_factory: IntegrationAdapterFactory,
        encryption_service: EncryptionService,
        audit_service: AuditService
    ):
        self.integration_policy = integration_policy
        self.consent_repository = consent_repository
        self.data_repository = data_repository
        self.integration_adapter_factory = integration_adapter_factory
        self.encryption_service = encryption_service
        self.audit_service = audit_service

    async def execute(
        self,
        patient_id: str,
        source_type: str,
        data_category: DataCategory,
        integration_context: Dict[str, Any]
    ) -> IntegrationResult:
        """
        Execute patient data integration while enforcing policies

        Args:
            patient_id: ID of patient whose data is being integrated
            source_type: Type of external data source
            data_category: Category of data being integrated
            integration_context: Additional context for integration

        Returns:
            Result of integration operation
        """
        # Verify required consent
        for consent_type in self.integration_policy.consent_requirements.required_consent_types:
            has_consent = await self.consent_repository.has_consent(
                patient_id=patient_id,
                consent_type=consent_type
            )

            if not has_consent:
                return IntegrationResult(
                    success=False,
                    error=f"Missing required consent: {consent_type.value}",
                    integration_id=None
                )

        # Create appropriate adapter for the source type
        adapter = self.integration_adapter_factory.create_adapter(source_type)

        # Determine fields to retrieve for each category
        fields_by_category = {
            category: self.integration_policy.get_fields_for_category(category)
            for category in self.integration_policy.data_categories
        }

        # Fetch data from source
        raw_data = await adapter.fetch_patient_data(
            patient_id=patient_id,
            fields_by_category=fields_by_category,
            context=integration_context
        )

        # Process and transform the data
        processed_items = []
        for category, items in raw_data.items():
            for item in items:
                # Apply sensitivity-based protection
                protected_item = await self._apply_sensitivity_protection(
                    data_item=item,
                    category=category
                )

                # Apply retention policy
                retention_policy = self.integration_policy.get_retention_policy(category)
                protected_item.retention_policy = retention_policy

                processed_items.append(protected_item)

        # Store processed items
        integration_results = []
        for item in processed_items:
            result = await self.data_repository.store_data_item(item)
            integration_results.append(result)

        # Audit the integration
        await self.audit_service.log_event(
            event_type=AuditEventType.DATA_INTEGRATION,
            action=f"integrate_{source_type}_data",
            user_id=None,  # System operation
            resource_id=patient_id,
            resource_type="patient",
            additional_data={
                "source_type": source_type,
                "categories": [c.value for c in self.integration_policy.data_categories],
                "items_processed": len(processed_items),
                "items_integrated": sum(1 for r in integration_results if r.success)
            }
        )

        return IntegrationResult(
            success=True,
            error=None,
            integration_id=None
        )

    async def _apply_sensitivity_protection(
        self,
        data_item: DataItem,
        category: DataCategory
    ) -> DataItem:
        """Apply sensitivity-based protection to data item"""
        protected_item = copy.deepcopy(data_item)

        for field_name, field_value in data_item.fields.items():
            sensitivity = self.integration_policy.get_sensitivity_level(field_name)

            if sensitivity == SensitivityLevel.HIGH:
                # Encrypt high-sensitivity fields
                encrypted_value = await self.encryption_service.encrypt_field(
                    field_value=field_value,
                    field_type=FieldType.from_field_name(field_name)
                )
                protected_item.fields[field_name] = encrypted_value
                protected_item.encrypted_fields.append(field_name)

            elif sensitivity == SensitivityLevel.MODERATE:
                # Apply tokenization or other protection as needed
                protected_item.fields[field_name] = field_value

            # Low sensitivity fields remain as-is

        return protected_item

### 6.2 Integration Design Patterns

Our integration architecture leverages several proven design patterns to ensure clean separation of concerns while maintaining secure and efficient data flow.

**Key Design Patterns:**

- **Gateway Pattern**: Provides a unified interface to external systems
- **Adapter Pattern**: Converts diverse data formats into standardized domain entities
- **Repository Pattern**: Abstracts data persistence operations from business logic
- **Factory Pattern**: Creates complex integration components without exposing creation logic
- **Strategy Pattern**: Enables dynamic selection of integration algorithms
- **Observer Pattern**: Facilitates event-driven integration capabilities
- **Decorator Pattern**: Adds cross-cutting concerns like monitoring and security

**Implementation Notes:**

- Each pattern addresses specific integration challenges while maintaining Clean Architecture
- Patterns are combined to create composable, maintainable integration components
- Security and privacy concerns are integrated directly into pattern implementations
- All patterns ensure proper encapsulation of technical implementation details

**Technical Implementation:**

```python
# Infrastructure Layer - Gateway Pattern Implementation
class IntegrationGateway:
    """
    Gateway that provides unified interface to all external systems
    Implements the Gateway pattern for integration with diverse systems
    """
    def __init__(
        self,
        adapter_factory: IntegrationAdapterFactory,
        data_validator: DataValidator,
        security_service: SecurityService,
        metrics_service: MetricsService
    ):
        self.adapter_factory = adapter_factory
        self.data_validator = data_validator
        self.security_service = security_service
        self.metrics_service = metrics_service

    async def integrate_data(
        self,
        patient_id: str,
        source_id: str,
        data_category: DataCategory,
        privacy_controls: PrivacyControls,
        integration_context: Dict[str, Any]
    ) -> IntegrationResult:
        """
        Execute data integration through appropriate adapter

        Args:
            patient_id: ID of the patient
            source_id: External source identifier
            data_category: Category of data to integrate
            privacy_controls: Privacy controls to apply
            integration_context: Additional context for integration

        Returns:
            Result of integration operation
        """
        try:
            # Create appropriate adapter for the source and category
            adapter = self.adapter_factory.create_adapter(
                source_id=source_id,
                data_category=data_category
            )

            # Begin metrics collection
            with self.metrics_service.timer(
                name="integration_execution",
                tags={
                    "source_id": source_id,
                    "data_category": data_category.value
                }
            ):
                # Apply security checks
                await self.security_service.authorize_integration(
                    patient_id=patient_id,
                    source_id=source_id,
                    data_category=data_category,
                    context=integration_context
                )

                # Execute integration through adapter
                raw_data = await adapter.fetch_data(
                    patient_id=patient_id,
                    context=integration_context
                )

                # Validate data
                validation_result = await self.data_validator.validate(
                    data=raw_data,
                    validation_type=f"{data_category.value}_validation"
                )

                if not validation_result.success:
                    return IntegrationResult(
                        success=False,
                        error=f"Data validation failed: {validation_result.errors[0]}",
                        integration_id=None
                    )

                # Transform and store data with privacy controls applied
                integration_id = await adapter.store_data(
                    patient_id=patient_id,
                    data=raw_data,
                    privacy_controls=privacy_controls
                )

                return IntegrationResult(
                    success=True,
                    error=None,
                    integration_id=integration_id
                )

        except SecurityViolationError as e:
            # Handle security violations
            return IntegrationResult(
                success=False,
                error=f"Security violation: {str(e)}",
                integration_id=None
            )
        except IntegrationError as e:
            # Handle integration errors
            return IntegrationResult(
                success=False,
                error=f"Integration error: {str(e)}",
                integration_id=None
            )
        except Exception as e:
            # Handle unexpected errors
            return IntegrationResult(
                success=False,
                error=f"Unexpected error: {str(e)}",
                integration_id=None
            )

# Infrastructure Layer - Adapter Pattern Implementation
class IntegrationAdapterFactory:
    """
    Factory that creates appropriate adapters for data integration
    Implements the Factory pattern for adapter creation
    """
    def __init__(
        self,
        configuration_provider: ConfigurationProvider,
        credential_provider: CredentialProvider
    ):
        self.configuration_provider = configuration_provider
        self.credential_provider = credential_provider
        self._adapter_registry = {}

    def register_adapter(
        self,
        source_type: str,
        data_category: DataCategory,
        adapter_class: Type[IntegrationAdapter]
    ) -> None:
        """Register an adapter class for a source type and data category"""
        key = (source_type, data_category)
        self._adapter_registry[key] = adapter_class

    async def create_adapter(
        self,
        source_id: str,
        data_category: DataCategory
    ) -> IntegrationAdapter:
        """
        Create appropriate adapter for the source and category

        Args:
            source_id: External source identifier
            data_category: Category of data to integrate

        Returns:
            Configured integration adapter
        """
        # Get source configuration
        source_config = await self.configuration_provider.get_source_config(source_id)
        source_type = source_config.source_type

        # Find appropriate adapter
        key = (source_type, data_category)
        if key not in self._adapter_registry:
            raise UnsupportedIntegrationError(
                f"No adapter registered for source type {source_type} and category {data_category.value}"
            )

        adapter_class = self._adapter_registry[key]

        # Get credentials for source
        credentials = await self.credential_provider.get_credentials(source_id)

        # Create and return adapter instance
        return adapter_class(
            source_config=source_config,
            credentials=credentials
        )
