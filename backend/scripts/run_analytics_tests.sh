#!/bin/bash
# Run analytics and rate limiter tests with coverage reporting
# This script runs tests for the new analytics endpoints, Redis cache, and rate limiting components

# Set working directory to project root
cd "$(dirname "$0")/.."

# Ensure virtual environment is activated if using one
# source venv/bin/activate

# Set PYTHONPATH to include the current directory
export PYTHONPATH=.

# Install required packages if needed
echo "Installing required packages..."
pip install -q -r requirements.txt
pip install -q -r requirements-analytics.txt
pip install -q pytest pytest-cov pytest-asyncio

# Run tests with coverage
echo "Running analytics component tests with coverage..."
python -m pytest \
    tests/unit/infrastructure/cache/test_redis_cache.py \
    tests/unit/infrastructure/security/test_rate_limiter.py \
    tests/unit/presentation/middleware/test_rate_limiting_middleware.py \
    tests/unit/presentation/api/routes/test_analytics_endpoints.py \
    --cov=app/infrastructure/cache \
    --cov=app/infrastructure/security \
    --cov=app/presentation/middleware \
    --cov=app/presentation/api/routes \
    --cov-report=term \
    --cov-report=html:reports/analytics-coverage \
    -v

# Check if tests failed
if [ $? -ne 0 ]; then
    echo "Tests failed! Please fix the issues and run again."
    exit 1
fi

echo "Test coverage report generated in reports/analytics-coverage/"
echo "You can open reports/analytics-coverage/index.html in a browser to view detailed coverage"

# Print summary of covered files and their coverage percentage
echo "Coverage summary:"
python -c "
import os
import json

if os.path.exists('reports/analytics-coverage/coverage.json'):
    with open('reports/analytics-coverage/coverage.json', 'r') as f:
        data = json.load(f)
        
        # Print coverage per file
        print(f\"{'File':<60} {'Coverage %':<10} {'Missing Lines':<20}\")
        print(f\"{'-'*60} {'-'*10} {'-'*20}\")

        for file_path, file_data in data['files'].items():
            # Skip if coverage is 100%
            if file_data['summary']['missing_lines'] == 0:
                continue
                
            rel_path = file_path.replace(os.getcwd() + '/', '')
            coverage = file_data['summary']['percent_covered']
            missing = len(file_data['missing_lines'])
            
            print(f\"{rel_path:<60} {coverage:<10.2f} {missing:<20}\")
"

echo "Done!"