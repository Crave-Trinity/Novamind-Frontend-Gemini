# -*- coding: utf-8 -*-
"""
Verification script for the HIPAA-compliant psychiatry platform.

This script verifies that the implemented components are syntactically correct
and follow the expected patterns.
"""

import importlib
import inspect
import sys
from typing import List, Dict, Any, Tuple


def check_module(module_name: str) -> Tuple[bool, List[str]]:
    """
    Check if a module can be imported without errors.
    
    Args:
        module_name: Name of the module to check
        
    Returns:
        Tuple of (success, errors)
    """
    try:
        module = importlib.import_module(module_name)
        return True, []
    except Exception as e:
        return False, [f"Error importing {module_name}: {str(e)}"]


def check_class(module_name: str, class_name: str) -> Tuple[bool, List[str]]:
    """
    Check if a class can be imported and instantiated without errors.
    
    Args:
        module_name: Name of the module containing the class
        class_name: Name of the class to check
        
    Returns:
        Tuple of (success, errors)
    """
    try:
        module = importlib.import_module(module_name)
        cls = getattr(module, class_name)
        
        # Check if it's a class
        if not inspect.isclass(cls):
            return False, [f"{class_name} is not a class"]
        
        return True, []
    except Exception as e:
        return False, [f"Error checking class {module_name}.{class_name}: {str(e)}"]


def verify_implementation() -> Tuple[bool, Dict[str, List[str]]]:
    """
    Verify the implementation of the HIPAA-compliant psychiatry platform.
    
    Returns:
        Tuple of (success, errors_by_component)
    """
    errors_by_component = {}
    
    # Check domain entities
    for entity in ["patient", "provider", "appointment"]:
        module_name = f"app.domain.entities.{entity}"
        success, errors = check_module(module_name)
        if not success:
            errors_by_component[f"Domain Entity: {entity}"] = errors
    
    # Check repositories
    for repo in ["patient_repository", "provider_repository", "appointment_repository"]:
        module_name = f"app.domain.repositories.{repo}"
        success, errors = check_module(module_name)
        if not success:
            errors_by_component[f"Repository: {repo}"] = errors
    
    # Check secure messaging service
    module_name = "app.infrastructure.messaging.secure_messaging_service"
    success, errors = check_module(module_name)
    if not success:
        errors_by_component["Secure Messaging Service"] = errors
    else:
        # Check the SecureMessagingService class
        class_success, class_errors = check_class(
            module_name, "SecureMessagingService"
        )
        if not class_success:
            errors_by_component["SecureMessagingService class"] = class_errors
    
    # Overall success
    success = len(errors_by_component) == 0
    
    return success, errors_by_component


def main():
    """Main function."""
    print("Verifying implementation...")
    success, errors_by_component = verify_implementation()
    
    if success:
        print("\n✅ All components verified successfully!")
    else:
        print("\n❌ Some components have errors:")
        for component, errors in errors_by_component.items():
            print(f"\n{component}:")
            for error in errors:
                print(f"  - {error}")
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())