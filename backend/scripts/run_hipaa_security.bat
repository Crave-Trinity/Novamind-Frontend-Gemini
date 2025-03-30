@echo off
REM =============================================================================
REM HIPAA Security Test Suite - Windows Wrapper
REM 
REM This script provides a Windows batch wrapper to run the HIPAA security test
REM suite from WSL2 environment.
REM =============================================================================

echo.
echo ================================================================
echo  NOVAMIND HIPAA Security Testing - Windows Launcher
echo  Running security tests through WSL2
echo ================================================================
echo.

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
cd /d "%SCRIPT_DIR%\.."
set "PROJECT_ROOT=%cd%"

REM Process command line args
set "ARGS="

:parse_args
if "%~1"=="" goto end_parse_args
if "%~1"=="--verbose" (
    set "ARGS=%ARGS% --verbose"
    shift
    goto parse_args
)
if "%~1"=="--skip-static" (
    set "ARGS=%ARGS% --skip-static"
    shift
    goto parse_args
)
if "%~1"=="--skip-dependency" (
    set "ARGS=%ARGS% --skip-dependency"
    shift
    goto parse_args
)
if "%~1"=="--skip-phi" (
    set "ARGS=%ARGS% --skip-phi"
    shift
    goto parse_args
)
set "ARG=%~1"
if "%ARG:~0,13%"=="--report-dir=" (
    set "ARGS=%ARGS% %ARG%"
    shift
    goto parse_args
)
echo Unknown option: %1
shift
goto parse_args

:end_parse_args

REM Set default report directory if not specified
if not defined ARGS (
    set "ARGS=--report-dir=security-reports"
) else (
    if not "%ARGS:--report-dir=%"=="%ARGS%" (
        REM Report dir is specified in args
    ) else (
        set "ARGS=%ARGS% --report-dir=security-reports"
    )
)

echo Starting security tests...
echo.

REM Make scripts executable in WSL
wsl -e chmod +x "%SCRIPT_DIR%/run_hipaa_security_suite.py"
wsl -e chmod +x "%SCRIPT_DIR%/run_hipaa_security.sh"

REM Run the WSL script and capture the exit code
wsl -e bash -c "cd $(wslpath -u '%PROJECT_ROOT%') && './scripts/run_hipaa_security.sh' %ARGS%"
set EXIT_CODE=%ERRORLEVEL%

REM Display completion message
if %EXIT_CODE% equ 0 (
    echo.
    echo Security tests completed successfully!
) else (
    echo.
    echo Security tests completed with issues. Please review the reports for details.
)

echo.
echo Reports saved to: %PROJECT_ROOT%\security-reports
echo.

pause
exit /b %EXIT_CODE%