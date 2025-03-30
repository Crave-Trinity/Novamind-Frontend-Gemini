# ==========================================================================
# NOVAMIND HIPAA Compliance Check PowerShell Script for Windows
# ==========================================================================
# This script runs the comprehensive HIPAA security test suite in Windows.
# 
# Usage:
#   .\scripts\Run-HIPAATests.ps1 [-HtmlReport] [-SkipScan] [-Verbose]
# 
# Parameters:
#   -HtmlReport    Generate an HTML report
#   -SkipScan      Skip vulnerability scanning (faster)
#   -Verbose       Show detailed output

param (
    [switch]$HtmlReport,
    [switch]$SkipScan,
    [switch]$Verbose
)

# Colors for console output
$Red = 'Red'
$Green = 'Green'
$Yellow = 'Yellow'
$Blue = 'Cyan'
$Reset = 'White'

# Print a section header
function Print-Header {
    param (
        [string]$Title
    )
    
    Write-Host "`n================================================================================" -ForegroundColor $Blue
    Write-Host "  $Title" -ForegroundColor $Blue
    Write-Host "================================================================================" -ForegroundColor $Blue
}

# Check if Python is installed
function Check-Python {
    try {
        $pythonVersion = python --version
        Write-Host "✓ Python detected: $pythonVersion" -ForegroundColor $Green
        return $true
    } catch {
        Write-Host "❌ Python not found. Please install Python 3.9+ to run the HIPAA tests." -ForegroundColor $Red
        return $false
    }
}

# Run the main security test suite
function Run-SecurityTests {
    Print-Header "Running HIPAA Security Test Suite"
    
    $command = "python scripts/run_security_tests.py"
    
    if ($HtmlReport) {
        $command += " --html-report"
    }
    
    if ($SkipScan) {
        $command += " --skip-scan"
    }
    
    if ($Verbose) {
        $command += " --verbose"
    }
    
    Invoke-Expression $command
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "`n✅ HIPAA Security Tests PASSED" -ForegroundColor $Green
    } else {
        Write-Host "`n❌ HIPAA Security Tests FAILED (exit code: $exitCode)" -ForegroundColor $Red
    }
    
    return $exitCode
}

# Run the security scanner
function Run-SecurityScanner {
    Print-Header "Running Security Vulnerability Scanner"
    
    $command = "python scripts/security_scanner.py"
    
    if ($Verbose) {
        $command += " --verbose"
    }
    
    Invoke-Expression $command
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "✅ Security scanner completed successfully" -ForegroundColor $Green
    } else {
        Write-Host "⚠️ Security scanner found potential issues" -ForegroundColor $Yellow
    }
    
    return $exitCode
}

# Run dependency check
function Check-Dependencies {
    Print-Header "Checking Dependencies for Vulnerabilities"
    
    # First, ensure safety is installed
    try {
        python -m pip show safety | Out-Null
    } catch {
        Write-Host "Installing safety package for dependency checking..." -ForegroundColor $Yellow
        python -m pip install safety
    }
    
    $command = "python -m safety check -r requirements.txt -r requirements-security.txt --full-report"
    
    Invoke-Expression $command
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "✅ No vulnerable dependencies found" -ForegroundColor $Green
    } else {
        Write-Host "⚠️ Vulnerable dependencies found. Please update them." -ForegroundColor $Yellow
    }
    
    return $exitCode
}

# Install required dependencies
function Install-Dependencies {
    Print-Header "Installing Security Testing Dependencies"
    
    $command = "python -m pip install -r requirements-security.txt"
    
    Invoke-Expression $command
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "✅ Security dependencies installed successfully" -ForegroundColor $Green
    } else {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor $Red
    }
    
    return $exitCode
}

# Create reports directory if it doesn't exist
function Create-ReportsDirectory {
    if (-not (Test-Path "reports")) {
        New-Item -ItemType Directory -Path "reports" | Out-Null
    }
    
    if (-not (Test-Path "reports/security")) {
        New-Item -ItemType Directory -Path "reports/security" | Out-Null
    }
}

# Main function
function Main {
    Print-Header "NOVAMIND HIPAA Compliance Check"
    Write-Host "Starting comprehensive HIPAA security tests at $(Get-Date)" -ForegroundColor $Reset
    Write-Host "This will validate the security of your NOVAMIND platform and ensure HIPAA compliance.`n" -ForegroundColor $Reset
    
    # Check if Python is installed
    if (-not (Check-Python)) {
        return 1
    }
    
    # Create reports directory
    Create-ReportsDirectory
    
    # Install dependencies
    if ((Install-Dependencies) -ne 0) {
        Write-Host "❌ Failed to install dependencies. Exiting." -ForegroundColor $Red
        return 1
    }
    
    # Run security tests
    $testResult = Run-SecurityTests
    
    # If not skipping scan, run security scanner
    if (-not $SkipScan) {
        $scanResult = Run-SecurityScanner
        $depResult = Check-Dependencies
    } else {
        $scanResult = 0
        $depResult = 0
    }
    
    # Show final message
    Print-Header "HIPAA Compliance Check: $((($testResult -eq 0 -and $scanResult -eq 0 -and $depResult -eq 0) ? 'PASSED' : 'FAILED'))"
    
    if ($testResult -eq 0 -and $scanResult -eq 0 -and $depResult -eq 0) {
        Write-Host "Your NOVAMIND platform has passed all HIPAA security tests." -ForegroundColor $Green
    } else {
        Write-Host "Your NOVAMIND platform has failed some HIPAA security tests." -ForegroundColor $Red
        Write-Host "Please review the output above and resolve the issues before deploying to production." -ForegroundColor $Red
    }
    
    Write-Host "Report files are available in the 'reports/security/' directory if you used the -HtmlReport option." -ForegroundColor $Reset
    
    return $testResult
}

# Run the main function
$exitCode = Main
exit $exitCode