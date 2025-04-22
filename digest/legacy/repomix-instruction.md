# Novamind Digital Twin - AI Analysis Instructions

## Project Context
This is a cutting-edge psychiatry and mental health digital twin platform that leverages AI/ML analytics to revolutionize clinical practice. The codebase follows clean architecture principles with strict layering:

- Domain (core business logic)
- Application (use cases, state)
- Infrastructure (external services)
- Presentation (UI using Atomic Design)

## Technical Stack
- TypeScript (strict mode)
- React
- Three.js for 3D visualizations
- TailwindCSS for styling
- React Query for data fetching

## Analysis Focus Areas
1. Code quality and adherence to architecture patterns
2. TypeScript type safety
3. Performance optimizations in React components
4. HIPAA compliance measures
5. 3D visualization best practices

## Coding Guidelines
- PURE TypeScript only (no JavaScript)
- Strict layering and dependency flow
- Atomic design pattern for UI components
- Error handling with explicit types
- Performant React with proper memoization

## Data Security Requirements
- Data masking for PHI
- Role-based access control
- Secure API communications
- Audit logging for all sensitive operations

When analyzing this codebase, please identify:
1. Areas where architecture patterns could be improved
2. Potential performance bottlenecks
3. HIPAA compliance risks
4. Opportunities for better TypeScript typing
5. Possible enhancements to the 3D brain visualization components 