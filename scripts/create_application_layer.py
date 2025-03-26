#!/usr/bin/env python3
# scripts/create_application_layer.py
# Script to create the application layer structure for the NOVAMIND backend

import os
import sys
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
APP_DIR = BASE_DIR / "app"
APPLICATION_DIR = APP_DIR / "application"

# Application layer subdirectories
SUBDIRS = [
    "use_cases",
    "use_cases/patient",
    "use_cases/appointment",
    "use_cases/digital_twin",
    "use_cases/medication",
    "use_cases/billing",
    "use_cases/auth",
    "services",
    "interfaces",
    "dtos",  # Data Transfer Objects
    "exceptions",
]

# Placeholder files for use cases
USE_CASE_FILES = {
    "use_cases/patient": [
        "create_patient.py",
        "update_patient.py",
        "get_patient.py",
        "search_patients.py",
        "delete_patient.py",
    ],
    "use_cases/appointment": [
        "create_appointment.py",
        "update_appointment.py",
        "cancel_appointment.py",
        "get_appointment.py",
        "list_appointments.py",
    ],
    "use_cases/digital_twin": [
        "generate_digital_twin.py",
        "update_digital_twin.py",
        "get_digital_twin.py",
        "forecast_symptoms.py",
        "simulate_treatment.py",
    ],
    "use_cases/medication": [
        "prescribe_medication.py",
        "update_prescription.py",
        "discontinue_medication.py",
        "get_medication_history.py",
    ],
    "use_cases/billing": [
        "create_invoice.py",
        "process_payment.py",
        "get_billing_history.py",
    ],
    "use_cases/auth": [
        "register_user.py",
        "login_user.py",
        "reset_password.py",
        "verify_token.py",
    ],
}

# Placeholder files for services
SERVICE_FILES = [
    "patient_service.py",
    "appointment_service.py",
    "digital_twin_service.py",
    "medication_service.py",
    "billing_service.py",
    "notification_service.py",
    "auth_service.py",
]

# Placeholder files for interfaces
INTERFACE_FILES = [
    "ai_model_service.py",
    "notification_service.py",
    "payment_gateway.py",
    "email_service.py",
    "sms_service.py",
    "storage_service.py",
]

# Placeholder files for DTOs
DTO_FILES = [
    "patient_dto.py",
    "appointment_dto.py",
    "digital_twin_dto.py",
    "medication_dto.py",
    "billing_dto.py",
]

# Placeholder files for exceptions
EXCEPTION_FILES = [
    "application_exceptions.py",
]

def create_directory(dir_path):
    """Create directory if it doesn't exist"""
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
        print(f"Created directory: {dir_path}")

def create_init_file(dir_path):
    """Create __init__.py file in the directory"""
    init_file = os.path.join(dir_path, "__init__.py")
    if not os.path.exists(init_file):
        with open(init_file, "w") as f:
            f.write(f"# {os.path.relpath(init_file, BASE_DIR)}\n")
            f.write("# Make this directory a Python package\n")
        print(f"Created file: {init_file}")

def create_placeholder_file(file_path, file_type, specific_type=None):
    """Create a placeholder file with appropriate content"""
    if not os.path.exists(file_path):
        with open(file_path, "w") as f:
            rel_path = os.path.relpath(file_path, BASE_DIR)
            f.write(f"# {rel_path}\n")
            f.write(f"# Placeholder for {file_type}\n\n")
            
            if file_type == "use case":
                class_name = "".join(word.capitalize() for word in os.path.basename(file_path).replace(".py", "").split("_"))
                f.write("from typing import Optional\n")
                f.write("from uuid import UUID\n\n")
                f.write(f"class {class_name}UseCase:\n")
                f.write(f"    \"\"\"Use case for {os.path.basename(file_path).replace('.py', '').replace('_', ' ')}\"\"\"\n\n")
                f.write("    def __init__(self):\n")
                f.write("        \"\"\"Initialize with required repositories\"\"\"\n")
                f.write("        pass\n\n")
                f.write("    async def execute(self):\n")
                f.write("        \"\"\"Execute the use case\"\"\"\n")
                f.write("        # Placeholder for implementation\n")
                f.write("        pass\n")
            
            elif file_type == "service":
                class_name = "".join(word.capitalize() for word in os.path.basename(file_path).replace(".py", "").replace("_service", ""))
                f.write("from typing import List, Optional\n")
                f.write("from uuid import UUID\n\n")
                f.write(f"class {class_name}Service:\n")
                f.write(f"    \"\"\"Service for managing {class_name.lower()} operations\"\"\"\n\n")
                f.write("    def __init__(self):\n")
                f.write("        \"\"\"Initialize with required repositories\"\"\"\n")
                f.write("        pass\n\n")
                f.write("    # Placeholder for service methods\n")
            
            elif file_type == "interface":
                class_name = "".join(word.capitalize() for word in os.path.basename(file_path).replace(".py", ""))
                f.write("from abc import ABC, abstractmethod\n")
                f.write("from typing import Dict, Any\n\n")
                f.write(f"class {class_name}(ABC):\n")
                f.write(f"    \"\"\"Interface for {class_name.lower()}\"\"\"\n\n")
                f.write("    @abstractmethod\n")
                f.write("    async def sample_method(self):\n")
                f.write("        \"\"\"Sample method description\"\"\"\n")
                f.write("        pass\n")
            
            elif file_type == "dto":
                class_name = "".join(word.capitalize() for word in os.path.basename(file_path).replace(".py", "").replace("_dto", ""))
                f.write("from pydantic import BaseModel\n")
                f.write("from typing import Optional\n")
                f.write("from uuid import UUID\n\n")
                f.write(f"class {class_name}DTO(BaseModel):\n")
                f.write(f"    \"\"\"Data Transfer Object for {class_name}\"\"\"\n")
                f.write("    # Placeholder for DTO fields\n")
                f.write("    id: Optional[UUID] = None\n")
            
            elif file_type == "exception":
                f.write("class ApplicationError(Exception):\n")
                f.write("    \"\"\"Base exception for application layer\"\"\"\n")
                f.write("    pass\n\n")
                f.write("class ValidationError(ApplicationError):\n")
                f.write("    \"\"\"Raised when validation fails\"\"\"\n")
                f.write("    pass\n\n")
                f.write("class ResourceNotFoundError(ApplicationError):\n")
                f.write("    \"\"\"Raised when a requested resource is not found\"\"\"\n")
                f.write("    pass\n\n")
                f.write("class AuthorizationError(ApplicationError):\n")
                f.write("    \"\"\"Raised when authorization fails\"\"\"\n")
                f.write("    pass\n")
                
        print(f"Created file: {file_path}")

def main():
    """Main function to create the application layer structure"""
    print(f"Creating application layer structure in {APPLICATION_DIR}")
    
    # Create base application directory
    create_directory(APPLICATION_DIR)
    create_init_file(APPLICATION_DIR)
    
    # Create subdirectories
    for subdir in SUBDIRS:
        dir_path = os.path.join(APPLICATION_DIR, subdir)
        create_directory(dir_path)
        create_init_file(dir_path)
    
    # Create use case files
    for subdir, files in USE_CASE_FILES.items():
        for file in files:
            file_path = os.path.join(APPLICATION_DIR, subdir, file)
            create_placeholder_file(file_path, "use case", subdir.split("/")[-1])
    
    # Create service files
    for file in SERVICE_FILES:
        file_path = os.path.join(APPLICATION_DIR, "services", file)
        create_placeholder_file(file_path, "service")
    
    # Create interface files
    for file in INTERFACE_FILES:
        file_path = os.path.join(APPLICATION_DIR, "interfaces", file)
        create_placeholder_file(file_path, "interface")
    
    # Create DTO files
    for file in DTO_FILES:
        file_path = os.path.join(APPLICATION_DIR, "dtos", file)
        create_placeholder_file(file_path, "dto")
    
    # Create exception files
    for file in EXCEPTION_FILES:
        file_path = os.path.join(APPLICATION_DIR, "exceptions", file)
        create_placeholder_file(file_path, "exception")
    
    print("Application layer structure created successfully!")

if __name__ == "__main__":
    main()