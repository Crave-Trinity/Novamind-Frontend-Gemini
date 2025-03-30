# Novamind WSL2 Migration Guide for HIPAA Security Testing

## Overview

This guide helps you migrate your Novamind development environment to a consistent WSL2 (Ubuntu 22.04) setup for HIPAA security testing. This standardization ensures consistent, reliable security testing across all development environments.

## Why Migrate?

Our HIPAA security tests have been yielding inconsistent results across different environments. Standardizing on WSL2 with Ubuntu 22.04 provides:

1. **Consistent Security Testing**: Same environment means same test results.
2. **Enhanced Security Tools**: Many security testing tools run better on Linux.
3. **Closer Alignment**: WSL2 Ubuntu environment is closer to production servers.
4. **Cross-Platform Compatibility**: Same scripts work for Windows, macOS, and Linux.

## Prerequisites

- Windows 10 (build 18917 or higher) or Windows 11
- Admin privileges on your machine
- 8GB+ RAM (16GB+ recommended)
- 50GB+ available storage
- Windows Subsystem for Linux (WSL2) installed 
- Ubuntu 22.04 distribution installed in WSL2

## Migration Steps

### Step 1: Install WSL2 and Ubuntu 22.04 (if not already installed)

If you don't already have WSL2 with Ubuntu 22.04 installed:

1. Open PowerShell as Administrator and run:
   ```powershell
   wsl --install -d Ubuntu-22.04
   ```

2. Restart your computer if prompted.

3. Set up your Ubuntu user account when prompted.

### Step 2: Run the Automated Setup Script

We've created an automated setup script that handles the entire migration process:

1. Open Command Prompt or PowerShell and navigate to the Novamind project directory:
   ```cmd
   cd \path\to\Novamind-Backend
   ```

2. Run the setup script:
   ```cmd
   scripts\setup_wsl2_environment.bat
   ```

3. Follow any on-screen prompts.

The script will:
- Verify WSL2 with Ubuntu 22.04 is properly installed
- Set up the required Python environment in WSL2
- Install all necessary dependencies
- Configure proper permissions for Windows/WSL2 interoperability

### Step 3: Verify Your Environment

To verify your environment is properly set up:

1. Run the HIPAA security tests from Windows:
   ```cmd
   scripts\run_hipaa_security_tests.bat
   ```

2. Or run directly from WSL2:
   ```bash
   wsl -d Ubuntu-22.04 -e bash -c "cd ~/dev/Novamind-Backend && ./scripts/run_hipaa_security.sh"
   ```

## Working with the New Environment

### Running Security Tests

You can run the security tests from either Windows or WSL2:

**From Windows Command Prompt:**
```cmd
scripts\run_hipaa_security_tests.bat
```

**From PowerShell:**
```powershell
.\scripts\Run-HIPAASecurityTests.ps1
```

**From WSL2 Terminal:**
```bash
./scripts/run_hipaa_security.sh
```

All of these commands support the same options:
- `--verbose`: Enable detailed output
- `--skip-static`: Skip static code analysis
- `--skip-dependency`: Skip dependency vulnerability checks
- `--skip-phi`: Skip PHI pattern detection
- `--report-dir=DIR`: Specify report output directory

### Accessing Reports

Security test reports are saved to the `security-reports/` directory in multiple formats:
- HTML for human readability
- JSON for machine processing
- Markdown for documentation

### Development Workflow

When switching between Windows and WSL2, remember:

1. Files are shared between environments - changes made in one are visible in the other.
2. Use the appropriate line endings (LF for Linux files, CRLF for Windows files).
3. Path references differ:
   - Windows: `C:\path\to\file`
   - WSL2: `/mnt/c/path/to/file` or `~/dev/Novamind-Backend/...`

## Troubleshooting

### Error: "WSL is not installed or not properly configured"

Ensure WSL2 is properly installed:
```powershell
wsl --status
```

If not installed, run:
```powershell
wsl --install -d Ubuntu-22.04
```

### Error: Permission Issues in WSL2

If you encounter permission issues running scripts in WSL2:
```bash
chmod +x ./scripts/*.sh
chmod +x ./scripts/*.py
```

### Error: Python Dependency Issues

If you encounter Python package errors:
```bash
# From WSL2
source ./venv/bin/activate
pip install -r requirements.txt -r requirements-security.txt -r requirements-dev.txt
```

### Error: UNC Path Errors in Windows Batch Files

If you see errors about UNC paths not being supported when running batch files, use the fixed batch scripts provided in this update.

## Need Further Assistance?

If you encounter issues not covered by this guide, please contact the DevOps team for assistance.