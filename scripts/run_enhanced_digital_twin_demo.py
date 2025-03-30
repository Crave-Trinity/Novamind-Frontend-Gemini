#!/usr/bin/env python
"""
Enhanced Digital Twin Demo Runner Script

This script runs the Enhanced Digital Twin demonstration,
showcasing the integration of the Trinity Stack AI components
(MentalLLaMA-33B, XGBoost, PAT) with the advanced knowledge
representation system.

Usage:
    python run_enhanced_digital_twin_demo.py [--verbose]

Options:
    --verbose    Increase output verbosity
"""
import asyncio
import argparse
import logging
import sys
from app.demo.enhanced_digital_twin_demo import EnhancedDigitalTwinDemo

def setup_logging(verbose: bool = False):
    """Configure logging for the demo."""
    log_level = logging.DEBUG if verbose else logging.INFO
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Configure the root logger
    logging.basicConfig(
        level=log_level,
        format=log_format,
        stream=sys.stdout
    )
    
    # Create a file handler for persistent logs
    file_handler = logging.FileHandler("enhanced_digital_twin_demo.log")
    file_handler.setLevel(log_level)
    file_handler.setFormatter(logging.Formatter(log_format))
    
    # Add the file handler to the root logger
    logging.getLogger().addHandler(file_handler)
    
    # Log HIPAA-compliant message (no PHI)
    logging.info("Enhanced Digital Twin Demo Logger initialized")

def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Run the Enhanced Digital Twin Demo")
    parser.add_argument("--verbose", action="store_true", help="Increase output verbosity")
    return parser.parse_args()

async def main():
    """Main entry point for the demo."""
    args = parse_arguments()
    setup_logging(args.verbose)
    
    # Print welcome message
    print("\n" + "="*80)
    print("NOVAMIND ENHANCED DIGITAL TWIN DEMONSTRATION".center(80))
    print("Trinity Stack Integration: MentalLLaMA-33B | XGBoost | PAT".center(80))
    print("="*80 + "\n")
    
    try:
        # Create the demo instance
        print("Initializing Enhanced Digital Twin components...")
        demo = EnhancedDigitalTwinDemo()
        
        # Run the demo
        print("\nStarting demonstration sequence...\n")
        await demo.run_demo()
        
        # Print completion message
        print("\n" + "="*80)
        print("DEMONSTRATION COMPLETED SUCCESSFULLY".center(80))
        print("="*80 + "\n")
    
    except Exception as e:
        logging.error(f"Error during demo execution: {e}", exc_info=True)
        print(f"\nError during demo execution: {e}")
        print("Check the log file for details.")
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)