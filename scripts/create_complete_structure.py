#!/usr/bin/env python3
# scripts/create_complete_structure.py
# Script to create a complete Clean Architecture structure for the NOVAMIND backend

import os
import sys
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
APP_DIR = BASE_DIR / "app"

# Layer directories
DOMAIN_DIR = APP_DIR / "domain"
APPLICATION_DIR = APP_DIR / "application"
INFRASTRUCTURE_DIR = APP_DIR / "infrastructure"
PRESENTATION_DIR = APP_DIR / "presentation"
CONFIG_DIR = APP_DIR / "config"
UTILS_DIR = APP_DIR / "utils"

# Domain layer structure
DOMAIN_STRUCTURE = {
    "entities": [
        "__init__.py",
        "patient.py",
        "appointment.py",
        "clinical_note.py",
        "medication.py",
        "user.py",
        "prescription.py",
        "billing.py",
        "insurance.py",
        "digital_twin/__init__.py",
        "digital_twin/digital_twin.py",
        "digital_twin/time_series_model.py",
        "digital_twin/twin_model.py",
        "digital_twin/symptom_trajectory.py",
        "digital_twin/treatment_response.py",
    ],
    "value_objects": [
        "__init__.py",
        "address.py",
        "contact_info.py",
        "psychiatric_assessment.py",
        "medication_dosage.py",
        "insurance_details.py",
        "biometric_reading.py",
        "appointment_slot.py",
    ],
    "repositories": [
        "__init__.py",
        "patient_repository.py",
        "appointment_repository.py",
        "clinical_note_repository.py",
        "medication_repository.py",
        "user_repository.py",
        "digital_twin_repository.py",
        "billing_repository.py",
    ],
    "services": [
        "__init__.py",
        "appointment_service.py",
        "medication_service.py",
        "billing_service.py",
        "clinical_note_service.py",
    ],
    "events": [
        "__init__.py",
        "domain_events.py",
        "event_handlers.py",
    ],
    "exceptions": [
        "__init__.py",
        "domain_exceptions.py",
    ],
    "factories": [
        "__init__.py",
        "patient_factory.py",
        "appointment_factory.py",
        "digital_twin_factory.py",
    ],
}

# Application layer structure
APPLICATION_STRUCTURE = {
    "use_cases": [
        "__init__.py",
        "patient/__init__.py",
        "patient/create_patient.py",
        "patient/update_patient.py",
        "patient/get_patient.py",
        "patient/search_patients.py",
        "patient/delete_patient.py",
        "appointment/__init__.py",
        "appointment/create_appointment.py",
        "appointment/update_appointment.py",
        "appointment/cancel_appointment.py",
        "appointment/get_appointment.py",
        "appointment/list_appointments.py",
        "digital_twin/__init__.py",
        "digital_twin/generate_digital_twin.py",
        "digital_twin/update_digital_twin.py",
        "digital_twin/get_digital_twin.py",
        "digital_twin/forecast_symptoms.py",
        "digital_twin/simulate_treatment.py",
        "medication/__init__.py",
        "medication/prescribe_medication.py",
        "medication/update_prescription.py",
        "medication/discontinue_medication.py",
        "medication/get_medication_history.py",
        "billing/__init__.py",
        "billing/create_invoice.py",
        "billing/process_payment.py",
        "billing/get_billing_history.py",
        "auth/__init__.py",
        "auth/register_user.py",
        "auth/login_user.py",
        "auth/reset_password.py",
        "auth/verify_token.py",
        "clinical_note/__init__.py",
        "clinical_note/create_note.py",
        "clinical_note/update_note.py",
        "clinical_note/get_note.py",
        "clinical_note/list_notes.py",
    ],
    "services": [
        "__init__.py",
        "patient_service.py",
        "appointment_service.py",
        "digital_twin_service.py",
        "medication_service.py",
        "billing_service.py",
        "notification_service.py",
        "auth_service.py",
        "clinical_note_service.py",
    ],
    "interfaces": [
        "__init__.py",
        "ai_model_service.py",
        "notification_service.py",
        "payment_gateway.py",
        "email_service.py",
        "sms_service.py",
        "storage_service.py",
        "wearable_data_service.py",
        "ehr_integration_service.py",
    ],
    "dtos": [
        "__init__.py",
        "patient_dto.py",
        "appointment_dto.py",
        "digital_twin_dto.py",
        "medication_dto.py",
        "billing_dto.py",
        "clinical_note_dto.py",
        "user_dto.py",
    ],
    "exceptions": [
        "__init__.py",
        "application_exceptions.py",
    ],
    "event_handlers": [
        "__init__.py",
        "appointment_event_handlers.py",
        "patient_event_handlers.py",
        "digital_twin_event_handlers.py",
    ],
}

# Infrastructure layer structure
INFRASTRUCTURE_STRUCTURE = {
    "persistence": [
        "__init__.py",
        "sqlalchemy/__init__.py",
        "sqlalchemy/config/__init__.py",
        "sqlalchemy/config/database.py",
        "sqlalchemy/models/__init__.py",
        "sqlalchemy/models/patient.py",
        "sqlalchemy/models/appointment.py",
        "sqlalchemy/models/clinical_note.py",
        "sqlalchemy/models/medication.py",
        "sqlalchemy/models/user.py",
        "sqlalchemy/models/digital_twin.py",
        "sqlalchemy/models/billing.py",
        "sqlalchemy/models/insurance.py",
        "sqlalchemy/repositories/__init__.py",
        "sqlalchemy/repositories/patient_repository.py",
        "sqlalchemy/repositories/appointment_repository.py",
        "sqlalchemy/repositories/clinical_note_repository.py",
        "sqlalchemy/repositories/medication_repository.py",
        "sqlalchemy/repositories/user_repository.py",
        "sqlalchemy/repositories/digital_twin_repository.py",
        "sqlalchemy/repositories/billing_repository.py",
        "sqlalchemy/migrations/__init__.py",
    ],
    "security": [
        "__init__.py",
        "jwt/__init__.py",
        "jwt/token_handler.py",
        "password/__init__.py",
        "password/password_handler.py",
        "rbac/__init__.py",
        "rbac/role_manager.py",
        "encryption/__init__.py",
        "encryption/data_encryptor.py",
        "audit/__init__.py",
        "audit/audit_logger.py",
    ],
    "external": [
        "__init__.py",
        "aws/__init__.py",
        "aws/s3_client.py",
        "aws/cognito_client.py",
        "aws/ses_client.py",
        "openai/__init__.py",
        "openai/gpt_client.py",
        "twilio/__init__.py",
        "twilio/sms_client.py",
        "wearable/__init__.py",
        "wearable/fitbit_client.py",
        "wearable/apple_health_client.py",
    ],
    "messaging": [
        "__init__.py",
        "email/__init__.py",
        "email/email_service.py",
        "email/templates/__init__.py",
        "email/templates/appointment_reminder.py",
        "sms/__init__.py",
        "sms/sms_service.py",
    ],
    "logging": [
        "__init__.py",
        "logger.py",
        "formatters.py",
        "handlers.py",
    ],
    "di": [
        "__init__.py",
        "container.py",
        "providers.py",
    ],
    "ai": [
        "__init__.py",
        "models/__init__.py",
        "models/symptom_forecasting.py",
        "models/treatment_simulation.py",
        "models/biometric_correlation.py",
        "pipelines/__init__.py",
        "pipelines/data_preprocessing.py",
        "pipelines/model_training.py",
    ],
    "background": [
        "__init__.py",
        "tasks.py",
        "scheduler.py",
    ],
}

# Presentation layer structure
PRESENTATION_STRUCTURE = {
    "api": [
        "__init__.py",
        "v1/__init__.py",
        "v1/endpoints/__init__.py",
        "v1/endpoints/patients.py",
        "v1/endpoints/appointments.py",
        "v1/endpoints/digital_twins.py",
        "v1/endpoints/medications.py",
        "v1/endpoints/clinical_notes.py",
        "v1/endpoints/auth.py",
        "v1/endpoints/billing.py",
        "v1/middleware/__init__.py",
        "v1/middleware/logging_middleware.py",
        "v1/middleware/auth_middleware.py",
        "v1/middleware/error_handling_middleware.py",
        "v1/schemas/__init__.py",
        "v1/schemas/patient.py",
        "v1/schemas/appointment.py",
        "v1/schemas/digital_twin.py",
        "v1/schemas/medication.py",
        "v1/schemas/clinical_note.py",
        "v1/schemas/user.py",
        "v1/schemas/billing.py",
        "v1/schemas/common.py",
    ],
    "web": [
        "__init__.py",
        "static/__init__.py",
        "static/css/__init__.py",
        "static/css/main.css",
        "static/js/__init__.py",
        "static/js/main.js",
        "static/images/__init__.py",
        "templates/__init__.py",
        "templates/base.html",
        "templates/login.html",
        "templates/dashboard.html",
    ],
}

# Config and utils structure
CONFIG_STRUCTURE = [
    "__init__.py",
    "settings.py",
    "environment.py",
    "logging_config.py",
    "cors_config.py",
]

UTILS_STRUCTURE = [
    "__init__.py",
    "date_utils.py",
    "string_utils.py",
    "validation_utils.py",
    "security_utils.py",
    "hipaa_compliance.py",
]

def create_directory(dir_path):
    """Create directory if it doesn't exist"""
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
        print(f"Created directory: {dir_path}")

def create_file(file_path, content=""):
    """Create a file with optional content"""
    if not os.path.exists(file_path):
        # Create parent directory if it doesn't exist
        parent_dir = os.path.dirname(file_path)
        if not os.path.exists(parent_dir):
            os.makedirs(parent_dir)
            print(f"Created directory: {parent_dir}")
        
        # Create the file
        with open(file_path, "w") as f:
            if not content:
                rel_path = os.path.relpath(file_path, BASE_DIR)
                content = f"# {rel_path}\n# Placeholder file for Clean Architecture structure\n"
            f.write(content)
        print(f"Created file: {file_path}")

def create_layer_structure(base_dir, structure):
    """Create directory structure for a layer"""
    for subdir, files in structure.items():
        dir_path = os.path.join(base_dir, subdir)
        create_directory(dir_path)
        
        for file in files:
            file_path = os.path.join(dir_path, file)
            create_file(file_path)

def create_flat_structure(base_dir, files):
    """Create a flat directory structure"""
    create_directory(base_dir)
    
    for file in files:
        file_path = os.path.join(base_dir, file)
        create_file(file_path)

def create_init_files(dir_path):
    """Create __init__.py files recursively in all subdirectories"""
    for root, dirs, files in os.walk(dir_path):
        init_file = os.path.join(root, "__init__.py")
        if not os.path.exists(init_file):
            create_file(init_file)

def main():
    """Main function to create the complete structure"""
    print(f"Creating complete Clean Architecture structure for NOVAMIND backend in {BASE_DIR}")
    
    # Create app directory and __init__.py
    create_directory(APP_DIR)
    create_file(os.path.join(APP_DIR, "__init__.py"))
    
    # Create layer structures
    create_layer_structure(DOMAIN_DIR, DOMAIN_STRUCTURE)
    create_layer_structure(APPLICATION_DIR, APPLICATION_STRUCTURE)
    create_layer_structure(INFRASTRUCTURE_DIR, INFRASTRUCTURE_STRUCTURE)
    create_layer_structure(PRESENTATION_DIR, PRESENTATION_STRUCTURE)
    
    # Create config and utils
    create_flat_structure(CONFIG_DIR, CONFIG_STRUCTURE)
    create_flat_structure(UTILS_DIR, UTILS_STRUCTURE)
    
    # Create __init__.py files in all directories
    create_init_files(APP_DIR)
    
    print("Complete Clean Architecture structure created successfully!")
    print("NOVAMIND backend skeleton is now ready for implementation.")

if __name__ == "__main__":
    main()