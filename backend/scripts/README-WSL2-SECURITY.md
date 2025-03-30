# Novamind HIPAA Security Testing in WSL2

## Overview

This directory contains scripts for setting up and running HIPAA security tests in a standardized WSL2 (Ubuntu 22.04) environment. These tests evaluate our codebase for security vulnerabilities, dependency issues, and potential PHI exposure patterns.

## Quick Start

### First-Time Setup

If you haven't set up your WSL2 environment for HIPAA security testing:

1. From Windows Command Prompt or PowerShell:
   ```cmd
   scripts\setup_wsl2_environment.bat
   ```

2. This script will:
   - Check for WSL2 with Ubuntu 22.04
   - Install necessary dependencies
   - Set up proper permissions
   - Create required directories

### Running Security Tests

To run the complete suite of HIPAA security tests:

#### From Windows:
```cmd
scripts\run_hipaa_security_tests.bat
```

#### From PowerShell:
```powershell
.\scripts\Run-HIPAASecurityTests.ps1
```

#### Directly from WSL2:
```bash
./scripts/run_hipaa_security.sh
```

## Available Test Options

All test scripts support the following options:

| Option | Description |
|--------|-------------|
| `--verbose` | Enable detailed output |
| `--skip-static` | Skip static code analysis |
| `--skip-dependency` | Skip dependency vulnerability check |
| `--skip-phi` | Skip PHI pattern detection |
| `--report-dir=DIR` | Specify report output directory |

Example:
```bash
./scripts/run_hipaa_security.sh --verbose --skip-dependency
```

## Understanding Test Results

The tests produce reports in multiple formats in the `security-reports/` directory:

### Static Analysis Reports

Static analysis uses Bandit to scan Python code for security issues including:
- Hardcoded secrets
- SQL injection vulnerabilities
- Unsafe deserialization
- Command injection

### Dependency Vulnerability Reports

Dependency checks use pip-audit to identify known security vulnerabilities in:
- Direct dependencies
- Transitive dependencies

### PHI Pattern Detection Reports

PHI pattern detection identifies potential Protected Health Information patterns in:
- Source code
- Test fixtures
- Documentation
- Configuration files

## Report Formats

Reports are generated in multiple formats:
- **HTML**: Human-readable formatted reports
- **JSON**: Machine-readable data for CI/CD integration
- **Markdown**: Documentation-friendly format

## Script Descriptions

| Script | Description |
|--------|-------------|
| `unified_wsl2_setup.sh` | Main WSL2 environment setup script |
| `setup_wsl2_environment.bat` | Windows wrapper for WSL2 setup |
| `run_hipaa_security.sh` | Main script for running tests in WSL2 |
| `run_hipaa_security_tests.bat` | Windows wrapper for running tests |
| `run_hipaa_security_suite.py` | Python implementation of the tests |

## Environment Requirements

- Windows 10 (build 18917 or higher) or Windows 11
- WSL2 with Ubuntu 22.04
- Python 3.8+
- 8GB+ RAM (16GB+ recommended for full tests)

## Troubleshooting

### Permission Issues

If you encounter permission issues with scripts:

```bash
chmod +x ./scripts/*.sh
chmod +x ./scripts/*.py
```

### Python Environment Issues

If you encounter Python dependency issues:

```bash
# From WSL2
source ./venv/bin/activate
pip install -r requirements.txt -r requirements-security.txt
```

### WSL Not Found

If you get "WSL not found" errors:

```cmd
wsl --install -d Ubuntu-22.04
```

### Path Issues

If you see path-related errors, ensure you're running scripts from the project root directory.

## Related Documentation

- [WSL2 Environment Setup Summary](../docs/WSL2_ENVIRONMENT_SETUP_SUMMARY.md)
- [WSL2 Migration Guide](./wsl2_migration_guide.md)
- [HIPAA Security Remediation](../docs/HIPAA-SECURITY-REMEDIATION.md)
- [WSL2 Migration Summary](../docs/WSL2_MIGRATION_SUMMARY.md)

## Security Policy

All security issues found during testing should be addressed according to the remediation strategy in the HIPAA Security Remediation document. Critical security issues should be addressed immediately.