jj@DESKTOP-L9V85UA:/mnt/c/Users/JJ/Desktop/NOVAMIND-WEB$ tree -I ".git"
└── Novamind-Backend
    ├── Dockerfile
    ├── LICENSE
    ├── README.md
    ├── alembic
    │   ├── __init__.py
    │   ├── env.py
    │   ├── script.py.mako
    │   └── versions
    │       ├── 001_initial_schema.py
    │       └── __init__.py
    ├── alembic.ini
    ├── app
    │   ├── __init__.py
    │   ├── application
    │   │   ├── __init__.py
    │   │   ├── interfaces
    │   │   │   ├── __init__.py
    │   │   │   ├── ai_model_service.py
    │   │   │   └── notification_service.py
    │   │   ├── services
    │   │   │   ├── __init__.py
    │   │   │   ├── digital_twin_service.py
    │   │   │   └── patient_service.py
    │   │   └── use_cases
    │   │       ├── __init__.py
    │   │       ├── appointment
    │   │       │   └── create_appointment.py
    │   │       ├── digital_twin
    │   │       │   └── generate_digital_twin.py
    │   │       └── patient
    │   │           └── create_patient.py
    │   ├── core
    │   │   ├── __init__.py
    │   │   ├── config.py
    │   │   ├── constants.py
    │   │   └── utils
    │   │       ├── __init__.py
    │   │       ├── auth.py
    │   │       ├── data_transformation.py
    │   │       ├── encryption.py
    │   │       ├── logging.py
    │   │       ├── ninja_test.py
    │   │       └── validation.py
    │   ├── domain
    │   │   ├── __init__.py
    │   │   ├── entities
    │   │   │   ├── __init__.py
    │   │   │   ├── appointment.py
    │   │   │   ├── clinical_note.py
    │   │   │   ├── digital_twin
    │   │   │   │   ├── __init__.py
    │   │   │   │   ├── digital_twin.py
    │   │   │   │   ├── time_series_model.py
    │   │   │   │   └── twin_model.py
    │   │   │   ├── medication.py
    │   │   │   ├── patient.py
    │   │   │   ├── provider.py
    │   │   │   └── user.py
    │   │   ├── events
    │   │   │   ├── __init__.py
    │   │   │   ├── appointment_events.py
    │   │   │   ├── clinical_documentation_events.py
    │   │   │   ├── medication_events.py
    │   │   │   └── patient_events.py
    │   │   ├── exceptions
    │   │   │   └── __init__.py
    │   │   ├── exceptions.py
    │   │   ├── interfaces
    │   │   │   ├── ml_service_interface.py
    │   │   │   └── ml_services.py
    │   │   ├── repositories
    │   │   │   ├── __init__.py
    │   │   │   ├── appointment_repository.py
    │   │   │   ├── clinical_note_repository.py
    │   │   │   ├── digital_twin_repository.py
    │   │   │   ├── medication_repository.py
    │   │   │   ├── patient_repository.py
    │   │   │   └── provider_repository.py
    │   │   ├── services
    │   │   │   ├── __init__.py
    │   │   │   ├── ai_assistant_service.py
    │   │   │   ├── analytics_service.py
    │   │   │   ├── appointment_service.py
    │   │   │   ├── clinical_documentation_service.py
    │   │   │   ├── digital_twin_service.py
    │   │   │   ├── medication_service.py
    │   │   │   ├── patient_service.py
    │   │   │   └── provider_service.py
    │   │   └── value_objects
    │   │       ├── __init__.py
    │   │       ├── address.py
    │   │       ├── contact_info.py
    │   │       ├── diagnosis_code.py
    │   │       ├── medication_dosage.py
    │   │       ├── psychiatric_assessment.py
    │   │       └── therapeutic_plan.py
    │   ├── infrastructure
    │   │   ├── __init__.py
    │   │   ├── config
    │   │   │   ├── app_config.py
    │   │   │   └── ml_service_config.py
    │   │   ├── di
    │   │   │   ├── __init__.py
    │   │   │   └── container.py
    │   │   ├── external
    │   │   │   ├── __init__.py
    │   │   │   ├── aws
    │   │   │   │   ├── __init__.py
    │   │   │   │   └── s3_client.py
    │   │   │   └── openai
    │   │   │       ├── __init__.py
    │   │   │       └── gpt_client.py
    │   │   ├── external_services
    │   │   ├── logging
    │   │   │   ├── __init__.py
    │   │   │   └── logger.py
    │   │   ├── messaging
    │   │   │   ├── __init__.py
    │   │   │   ├── email
    │   │   │   │   ├── __init__.py
    │   │   │   │   └── email_service.py
    │   │   │   └── sms
    │   │   │       ├── __init__.py
    │   │   │       └── sms_service.py
    │   │   ├── ml
    │   │   │   ├── README.md
    │   │   │   ├── __init__.py
    │   │   │   ├── adapters.py
    │   │   │   ├── base
    │   │   │   │   ├── __init__.py
    │   │   │   │   ├── base_model.py
    │   │   │   │   └── model_metrics.py
    │   │   │   ├── biometric_correlation
    │   │   │   │   ├── __init__.py
    │   │   │   │   ├── lstm_model.py
    │   │   │   │   └── model_service.py
    │   │   │   ├── digital_twin_integration_service.py
    │   │   │   ├── pharmacogenomics
    │   │   │   │   ├── __init__.py
    │   │   │   │   ├── gene_medication_model.py
    │   │   │   │   ├── model_service.py
    │   │   │   │   └── treatment_model.py
    │   │   │   ├── symptom_forecasting
    │   │   │   │   ├── __init__.py
    │   │   │   │   ├── ensemble_model.py
    │   │   │   │   ├── model_service.py
    │   │   │   │   ├── service.py
    │   │   │   │   ├── transformer_model.py
    │   │   │   │   └── xgboost_model.py
    │   │   │   └── utils
    │   │   │       ├── __init__.py
    │   │   │       ├── preprocessing.py
    │   │   │       ├── serialization.py
    │   │   │       └── validation.py
    │   │   ├── ml_services
    │   │   │   ├── __init__.py
    │   │   │   ├── biometric_correlation
    │   │   │   │   ├── __init__.py
    │   │   │   │   └── service.py
    │   │   │   ├── digital_twin_integration
    │   │   │   │   └── service.py
    │   │   │   ├── pharmacogenomics
    │   │   │   │   └── service.py
    │   │   │   └── symptom_forecasting
    │   │   │       ├── __init__.py
    │   │   │       └── service.py
    │   │   ├── persistence
    │   │   │   ├── __init__.py
    │   │   │   └── sqlalchemy
    │   │   │       ├── __init__.py
    │   │   │       ├── config
    │   │   │       │   ├── __init__.py
    │   │   │       │   └── database.py
    │   │   │       ├── migrations
    │   │   │       │   └── __init__.py
    │   │   │       ├── models
    │   │   │       │   ├── __init__.py
    │   │   │       │   ├── appointment.py
    │   │   │       │   ├── clinical_note.py
    │   │   │       │   ├── digital_twin.py
    │   │   │       │   ├── medication.py
    │   │   │       │   ├── patient.py
    │   │   │       │   ├── provider.py
    │   │   │       │   └── user.py
    │   │   │       └── repositories
    │   │   │           ├── __init__.py
    │   │   │           ├── digital_twin_repository.py
    │   │   │           ├── patient_repository.py
    │   │   │           └── user_repository.py
    │   │   └── security
    │   │       ├── __init__.py
    │   │       ├── jwt
    │   │       │   ├── __init__.py
    │   │       │   └── token_handler.py
    │   │       ├── password
    │   │       │   ├── __init__.py
    │   │       │   └── password_handler.py
    │   │       └── rbac
    │   │           ├── __init__.py
    │   │           └── role_manager.py
    │   └── presentation
    │       ├── __init__.py
    │       ├── api
    │       │   ├── __init__.py
    │       │   ├── docs
    │       │   │   └── openapi.yaml
    │       │   └── v1
    │       │       ├── __init__.py
    │       │       ├── endpoints
    │       │       │   ├── __init__.py
    │       │       │   ├── appointments.py
    │       │       │   ├── auth.py
    │       │       │   ├── digital_twins.py
    │       │       │   └── patients.py
    │       │       ├── middleware
    │       │       │   ├── __init__.py
    │       │       │   └── logging_middleware.py
    │       │       └── schemas
    │       │           ├── __init__.py
    │       │           ├── digital_twin.py
    │       │           ├── patient.py
    │       │           └── user.py
    │       └── web
    │           ├── __init__.py
    │           ├── static
    │           │   ├── __init__.py
    │           │   ├── css
    │           │   │   └── __init__.py
    │           │   ├── images
    │           │   │   └── __init__.py
    │           │   └── js
    │           │       └── __init__.py
    │           └── templates
    │               ├── __init__.py
    │               ├── auth
    │               ├── base
    │               │   ├── layout.html
    │               │   └── navigation.html
    │               ├── dashboard
    │               ├── digital_twin
    │               │   └── overview.html
    │               └── reports
    ├── docker-compose.yml
    ├── docs
    │   ├── 01_CORE_ARCHITECTURE.md
    │   ├── 01_CURRENT_TREE.md
    │   ├── 02_DOMAIN_LAYER.md
    │   ├── 03_DATA_LAYER.md
    │   ├── 04_APPLICATION_LAYER.md
    │   ├── 05_PRESENTATION_LAYER.md
    │   ├── 06_DIGITAL_TWIN.md
    │   ├── 07_SECURITY_AND_COMPLIANCE.md
    │   ├── 08_ML_MICROSERVICES_API.md
    │   ├── 09_ML_MICROSERVICES_IMPLEMENTATION.md
    │   ├── 10_SECURITY_IMPLEMENTATION.md
    │   ├── 11_PATIENT_ANALYTICS.md
    │   ├── 12_TESTING_AND_DEPLOYMENT.md
    │   ├── 13_DOCUMENTATION_INDEX.md
    │   ├── 14_INFRASTRUCTURE_AND_DEPLOYMENT.md
    │   ├── 15_LOGGING_UTILITY.md
    │   ├── 16_ENCRYPTION_UTILITY.md
    │   ├── 17_VALIDATION_UTILITY.md
    │   ├── 18_AUTHENTICATION_UTILITY.md
    │   ├── 19_DATA_TRANSFORMATION_UTILITY_PART1.md
    │   ├── 19_DATA_TRANSFORMATION_UTILITY_PART2.md
    │   ├── 19_DATA_TRANSFORMATION_UTILITY_PART3.md
    │   ├── 20_DEPENDENCY_INJECTION_PYRAMID.md
    │   ├── 21_DEPENDENCY_INJECTION_GLOSSARY.md
    │   ├── 22_DEPENDENCY_TREE_CONSTRUCTION.md
    │   ├── 23_DEPENDENCY_INJECTION_IMPLEMENTATION_GUIDE.md
    │   ├── 24_TESTING_FRAMEWORK_AND_REQUIREMENTS.md
    │   ├── 25_DEVELOPMENT_ENVIRONMENT_SETUP.md
    │   ├── 26_DEPLOYMENT_AND_CICD_PIPELINE.md
    │   ├── 27_IMPLEMENTATION_CHECKLIST_AND_BEST_PRACTICES.md
    │   ├── 28_DOCUMENTATION_INDEX.md
    │   └── 29_DEPENDENCY_INJECTION_CONCLUSION.md
    ├── main.py
    ├── project_creation.log
    ├── pyproject.toml
    ├── requirements-dev.txt
    ├── requirements.txt
    ├── scripts
    └── tests
        ├── __init__.py
        ├── conftest.py
        ├── e2e
        │   ├── __init__.py
        │   └── test_patient_flow.py
        ├── fixtures
        │   ├── __init__.py
        │   └── patient_fixtures.py
        ├── infrastructure
        │   └── ml
        │       ├── test_digital_twin_integration.py
        │       └── test_symptom_forecasting_service.py
        ├── integration
        │   ├── __init__.py
        │   ├── api
        │   │   ├── __init__.py
        │   │   └── test_patient_api.py
        │   ├── persistence
        │   │   ├── __init__.py
        │   │   └── test_sqlalchemy_repositories.py
        │   └── security
        │       └── __init__.py
        └── unit
            ├── __init__.py
            ├── application
            │   ├── __init__.py
            │   └── use_cases
            │       ├── __init__.py
            │       ├── test_create_patient.py
            │       └── test_generate_digital_twin.py
            ├── core
            │   └── utils
            │       ├── test_encryption.py
            │       └── test_logging.py
            ├── domain
            │   ├── __init__.py
            │   ├── entities
            │   │   └── __init__.py
            │   ├── services
            │   │   └── __init__.py
            │   ├── test_digital_twin.py
            │   └── test_patient.py
            ├── infrastructure
            │   ├── __init__.py
            │   ├── persistence
            │   │   ├── __init__.py
            │   │   └── test_patient_repository.py
            │   └── security
            │       ├── __init__.py
            │       └── test_jwt_handler.py
            └── presentation
                ├── __init__.py
                └── api
                    ├── __init__.py
                    └── test_patient_endpoints.py