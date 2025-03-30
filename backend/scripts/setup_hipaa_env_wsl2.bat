@echo off
REM =============================================================================
REM HIPAA Security Environment Setup for WSL2 - Windows Launcher
REM 
REM This script launches the WSL2 environment setup for HIPAA security testing
REM from a Windows environment.
REM =============================================================================

echo.
echo ================================================================
echo  NOVAMIND HIPAA Security Environment Setup - Windows Launcher
echo  Setting up WSL2 environment for HIPAA security testing
echo ================================================================
echo.

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
cd /d "%SCRIPT_DIR%\.."
set "PROJECT_ROOT=%cd%"

REM Check if WSL is available
wsl --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: WSL is not available or not installed.
    echo Please install WSL2 before continuing.
    echo See: https://docs.microsoft.com/en-us/windows/wsl/install
    pause
    exit /b 1
)

REM Check for Ubuntu distribution
wsl -l -v | findstr "Ubuntu-22.04" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Warning: Ubuntu 22.04 not detected in WSL.
    echo It's recommended to use Ubuntu 22.04 for the HIPAA security environment.
    echo.
    echo Do you want to continue anyway? This might work if you have another Ubuntu distribution.
    choice /C YN /M "Continue? (Y/N)"
    if %ERRORLEVEL% EQU 2 (
        echo Setup canceled.
        pause
        exit /b 1
    )
)

REM Make scripts executable in WSL
echo Making scripts executable...
wsl -e chmod +x "%SCRIPT_DIR%/setup_hipaa_env_wsl2.sh"

REM Run the setup script in WSL
echo.
echo Starting WSL2 environment setup...
echo.

wsl -e bash -c "cd $(wslpath -u '%PROJECT_ROOT%') && './scripts/setup_hipaa_env_wsl2.sh'"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error: WSL2 environment setup failed with exit code %ERRORLEVEL%.
    echo Please check the output above for details.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ================================================================
echo  HIPAA Security Environment Setup Complete
echo ================================================================
echo.
echo You can now run security tests using:
echo   1. From Windows: scripts\run_hipaa_security.bat
echo   2. From PowerShell: .\scripts\Run-HIPAASecurityTests.ps1
echo   3. From WSL2: ./scripts/run_hipaa_security.sh
echo.

pause
exit /b 0