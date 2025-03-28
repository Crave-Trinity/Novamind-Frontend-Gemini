#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================================${NC}"
echo -e "${BLUE}Running HIPAA Security JWT Authentication Tests${NC}"
echo -e "${BLUE}==================================================================${NC}"

# Set up any necessary environment variables
export PYTHONPATH=$(pwd)
export HIPAA_TEST_ENV=test

# Run just the JWT service and auth middleware tests
# Using python3 directly in WSL
python3 -m pytest tests/security/test_jwt_service.py tests/security/test_auth_middleware.py -v

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed successfully!${NC}"
else
    echo -e "\n${RED}Some tests failed. Please review the output above.${NC}"
fi

exit $exit_code