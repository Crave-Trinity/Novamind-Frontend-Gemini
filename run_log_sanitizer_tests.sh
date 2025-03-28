#!/bin/bash
# Script to run log sanitizer tests with coverage reporting

echo "Running LogSanitizer test suite with coverage analysis..."
echo "========================================================"

# Create directory for htmlcov if it doesn't exist
mkdir -p htmlcov

# Run the tests with coverage
python test_log_sanitizer_runner.py --coverage

# Check if the tests passed
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Tests completed successfully!"
    echo ""
    echo "Coverage reports are available at:"
    echo "- HTML: htmlcov/index.html"
    echo ""
    echo "To view the HTML report, open the file in your browser:"
    echo "xdg-open htmlcov/index.html  # On Linux"
    echo "open htmlcov/index.html      # On macOS"
else
    echo ""
    echo "❌ Some tests failed. Fix the issues before checking coverage."
fi

echo ""
echo "HIPAA Compliance Note:"
echo "- Minimum required coverage: 80%"
echo "- Target for security modules: 100%"
echo ""
echo "See docs/LOG_SANITIZER_TESTING_GUIDE.md for more information."