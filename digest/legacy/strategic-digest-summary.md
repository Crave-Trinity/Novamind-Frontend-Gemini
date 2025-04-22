# Novamind Strategic Codebase Digests

This document summarizes the strategic codebase digests created using Repomix to make the codebase more accessible for AI analysis.

## Digest Overview

| Digest File | Size | Description | Token Count |
|-------------|------|-------------|------------|
| digest-overview.md | 12K | Project context, instructions and README | 2,478 |
| digest-config.md | 31K | Configuration files, package.json, etc. | 8,694 |
| digest-domain.md | 248K | Domain layer (core business logic) | 61,416 |
| digest-application.md | 244K | Application layer (use cases, state) | 57,820 |
| digest-infrastructure.md | 118K | Infrastructure layer (external services) | 28,050 |
| digest-presentation-atoms-molecules.md | 154K | UI components - atoms and molecules | 37,016 |
| digest-presentation-organisms-templates.md | 109K | UI components - organisms and templates | 25,640 |
| digest-pages-components.md | 65K | Pages and components | 15,590 |
| digest-tests-docs.md | 234K | Tests, documentation, and examples | 55,134 |
| digest-root-config.md | 28K | Root configuration files (.eslintrc, etc.) | 7,731 |
| digest-scripts.md | 63K | Build and utility scripts | 16,143 |
| digest-public.md | 14K | Public assets and demo files | 4,090 |
| digest-lib-shared.md | 7K | Shared utilities and library code | 1,632 |
| digest-puppeteer.md | 22K | Puppeteer-based end-to-end tests | 5,397 |

## How to Use These Digests

Each digest contains a focused portion of the codebase, making it easier to analyze specific parts of the system:

1. **Start with the overview digest** to understand the project context and requirements
2. **Explore the domain layer** to understand the core business logic and data models
3. **Review the application layer** to see how the business logic is used in application services
4. **Check the infrastructure layer** to understand external integrations
5. **Examine the presentation components** to see how the UI is implemented
6. **Look at tests and docs** for examples of how the code is used
7. **Review configuration files** to understand the project setup
8. **Analyze scripts** for build and development workflows
9. **Examine shared utilities** for common functionality

## Special Features

These digests were created with the following optimizations:

- Code compression to reduce token count
- Comment removal to focus on the essential code
- Strategic chunking to make files AI-processable
- Custom instructions included in the overview digest

Each digest contains a properly formatted representation of the code files, including:
- File paths
- Code content
- Directory structure information
- File summaries

## Coverage Analysis

These digests collectively provide comprehensive coverage of the Novamind codebase:

- **Core Architecture**: All layers (domain, application, infrastructure, presentation)
- **UI Components**: All atomic design levels (atoms, molecules, organisms, templates, pages)
- **Configuration**: All config files (TypeScript, ESLint, Tailwind, etc.)
- **Testing**: Unit tests, integration tests, and E2E tests (Puppeteer)
- **Tooling**: Scripts for build, test, and development workflows
- **Assets**: Public files and static resources

The only items intentionally excluded are:
- Binary files and images
- Generated build files
- Node modules and dependencies
- Temporary files and logs 