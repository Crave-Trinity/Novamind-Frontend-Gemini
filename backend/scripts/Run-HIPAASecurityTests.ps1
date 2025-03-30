# =============================================================================
# Novamind HIPAA Security Testing - PowerShell Launcher
# 
# This script launches the HIPAA security tests in WSL2 (Ubuntu 22.04)
# and handles launching the appropriate environment if needed.
# =============================================================================

Write-Host ""
Write-Host "================================================================"
Write-Host " Novamind HIPAA Security Testing Suite"
Write-Host "================================================================"
Write-Host ""

# Check if WSL is installed
try {
    $wslStatus = wsl --status 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "WSL not installed"
    }
} catch {
    Write-Host "ERROR: WSL2 is not installed or not properly configured." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install WSL2 with Ubuntu 22.04 by running:"
    Write-Host "    .\scripts\setup_wsl2_environment.bat"
    Write-Host ""
    exit 1
}

# Check if Ubuntu-22.04 is installed
$ubuntuInstalled = wsl -l | Select-String "Ubuntu-22.04"
if (-not $ubuntuInstalled) {
    Write-Host "ERROR: Ubuntu-22.04 is not installed in WSL." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Ubuntu 22.04 by running:"
    Write-Host "    .\scripts\setup_wsl2_environment.bat"
    Write-Host ""
    exit 1
}

# Get all arguments to pass to the WSL script
$wslArgs = $args -join " "

Write-Host "Running HIPAA security tests using WSL2 (Ubuntu 22.04)..."
Write-Host ""

# Get the current script directory path
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

# Launch the tests using WSL2
$wslCommand = "cd $($projectRoot.Replace('\', '/')) && chmod +x ./scripts/*.sh && ./scripts/run_hipaa_security.sh $wslArgs"
$result = wsl -d Ubuntu-22.04 -e bash -c $wslCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host " Tests completed successfully" -ForegroundColor Green
    Write-Host "================================================================"
    Write-Host ""
    Write-Host "Reports are available in the security-reports directory."
    Write-Host "You can open them in your browser for detailed information."
    
    # Check if security-reports exists and has HTML files
    $htmlReports = Get-ChildItem -Path "$projectRoot\security-reports\*.html" -ErrorAction SilentlyContinue
    if ($htmlReports) {
        Write-Host ""
        Write-Host "You can view the latest report by running:"
        Write-Host "    explorer $projectRoot\security-reports\security-report.html"
        Write-Host ""
    }
    
    exit 0
} else {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Red
    Write-Host " Tests completed with errors" -ForegroundColor Red
    Write-Host "================================================================"
    Write-Host ""
    Write-Host "See the output above for details on what failed."
    Write-Host "Review the reports in the security-reports directory."
    Write-Host ""
    Write-Host "For assistance, consult the troubleshooting section in:"
    Write-Host "$scriptDir\README-WSL2-SECURITY.md"
    Write-Host ""
    exit 1
}