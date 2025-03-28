@echo off
REM =============================================================================
REM Novamind HIPAA Security Testing - WSL2 Environment Setup (Windows Launcher)
REM 
REM This script checks for WSL2 with Ubuntu 22.04 and launches the unified 
REM WSL2 setup script to configure the environment for HIPAA security testing.
REM =============================================================================

echo.
echo ================================================================
echo  Novamind HIPAA Security Testing - WSL2 Environment Setup
echo ================================================================
echo.

REM Check if WSL is installed
wsl --status > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo WSL is not installed or not properly configured.
    echo.
    echo Please install WSL2 with Ubuntu 22.04 by running:
    echo.
    echo    wsl --install -d Ubuntu-22.04
    echo.
    echo After installation completes, restart your computer and run this script again.
    goto :end
)

REM Check if Ubuntu-22.04 is installed
wsl -l | findstr "Ubuntu-22.04" > nul
if %ERRORLEVEL% NEQ 0 (
    echo Ubuntu-22.04 is not installed in WSL.
    echo.
    echo Please install Ubuntu 22.04 by running:
    echo.
    echo    wsl --install -d Ubuntu-22.04
    echo.
    echo After installation completes, restart your computer and run this script again.
    goto :end
)

echo WSL2 with Ubuntu 22.04 detected.
echo.
echo Setting up HIPAA security testing environment...
echo.

REM Get the current script directory path
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

REM Make the setup script executable and run it in WSL2
wsl -d Ubuntu-22.04 -e bash -c "cd '%SCRIPT_DIR%/..' && chmod +x ./scripts/unified_wsl2_setup.sh && ./scripts/unified_wsl2_setup.sh"

echo.
echo ================================================================
echo  Setup Complete!
echo ================================================================
echo.
echo You can now run the HIPAA security tests with:
echo    scripts\run_hipaa_security_tests.bat
echo.

:end
pause