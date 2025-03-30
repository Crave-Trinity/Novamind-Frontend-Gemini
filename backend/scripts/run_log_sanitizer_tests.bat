@echo off
REM Batch script to run log sanitizer tests with coverage reporting

echo Running LogSanitizer test suite with coverage analysis...
echo ========================================================

REM Create directory for htmlcov if it doesn't exist
if not exist htmlcov mkdir htmlcov

REM Run the tests with coverage
python test_log_sanitizer_runner.py --coverage

REM Check if the tests passed
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Tests completed successfully!
    echo.
    echo Coverage reports are available at:
    echo - HTML: htmlcov/index.html
    echo.
    echo To view the HTML report, open the file in your browser
) else (
    echo.
    echo ❌ Some tests failed. Fix the issues before checking coverage.
)

echo.
echo HIPAA Compliance Note:
echo - Minimum required coverage for HIPAA compliance: 80%%
echo - Target for security modules: 100%%
echo.
echo See docs/LOG_SANITIZER_TESTING_GUIDE.md for more information.