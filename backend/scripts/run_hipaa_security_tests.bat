@echo off
REM =============================================================================
REM Novamind HIPAA Security Testing - Windows Launcher
REM 
REM This script launches the HIPAA security tests in WSL2 (Ubuntu 22.04)
REM and handles launching the appropriate environment if needed.
REM =============================================================================

setlocal enabledelayedexpansion

echo.
echo ================================================================
echo  Novamind HIPAA Security Testing Suite
echo ================================================================
echo.

REM Check if WSL is installed
wsl --status >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: WSL2 is not installed or not properly configured.
    echo.
    echo Please install WSL2 with Ubuntu 22.04 by running:
    echo    scripts\setup_wsl2_environment.bat
    echo.
    goto :error
)

REM Check if Ubuntu-22.04 is installed
wsl -l | findstr "Ubuntu-22.04" >nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Ubuntu-22.04 is not installed in WSL.
    echo.
    echo Please install Ubuntu 22.04 by running:
    echo    scripts\setup_wsl2_environment.bat
    echo.
    goto :error
)

REM Parse command line arguments for passing to WSL script
set WSL_ARGS=
for %%a in (%*) do (
    set WSL_ARGS=!WSL_ARGS! %%a
)

echo Running HIPAA security tests using WSL2 (Ubuntu 22.04)...
echo.

REM Get the current script directory path
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

REM Launch the tests using WSL2
wsl -d Ubuntu-22.04 -e bash -c "cd '%SCRIPT_DIR%/..' && chmod +x ./scripts/*.sh && ./scripts/run_hipaa_security.sh%WSL_ARGS%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================================
    echo  Tests completed successfully
    echo ================================================================
    echo.
    echo Reports are available in the security-reports directory.
    echo You can open them in your browser for detailed information.
    
    REM Check if security-reports exists and has HTML files
    if exist "%SCRIPT_DIR%\..\security-reports\*.html" (
        echo.
        echo You can view the latest report by running:
        echo explorer "%SCRIPT_DIR%\..\security-reports\security-report.html"
        echo.
    )
    
) else (
    echo.
    echo ================================================================
    echo  Tests completed with errors
    echo ================================================================
    echo.
    echo See the output above for details on what failed.
    echo Review the reports in the security-reports directory.
    echo.
    echo For assistance, consult the troubleshooting section in:
    echo %SCRIPT_DIR%\README-WSL2-SECURITY.md
    echo.
    goto :error
)

goto :end

:error
exit /b 1

:end
exit /b 0