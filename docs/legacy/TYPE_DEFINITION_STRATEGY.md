# Type Definition Strategy

## 1. Overview

This document establishes the strategy for defining and managing TypeScript types within the Novamind Frontend application, ensuring consistency, maintainability, and adherence to Clean Architecture principles.

## 2. Single Source of Truth (SSoT)

Maintaining a Single Source of Truth (SSoT) for domain types is critical to prevent inconsistencies, reduce bugs, and simplify development and testing.

**Canonical Sources:**

*   **Core Domain Types:** All core business entities and value objects related to the domain (e.g., patient data, clinical concepts, brain models) **MUST** be defined within the `src/domain/types/` or `src/domain/models/` directories.
*   **Brain Model Types:** Specifically, the authoritative definitions for `BrainModel`, `BrainRegion`, `NeuralConnection`, `BrainScan`, and related structures reside in:
    *   **`src/domain/types/brain/models.ts`**
*   **Shared Types:** General-purpose types used across multiple layers (e.g., `Result`, `Vector3`, utility types) should reside in `src/domain/types/shared/`.

**Deprecated Sources:**

*   Any type definitions duplicating core domain concepts found outside the designated `src/domain/types/` or `src/domain/models/` paths (e.g., potential legacy definitions in `core-models` or elsewhere) are considered **deprecated** and **MUST NOT** be used for new development. They should be refactored or removed to align with the SSoT.

## 3. Validation Alignment

*   All runtime validation logic (e.g., in `src/domain/utils/` or `src/application/services/`) **MUST** validate against the canonical type definitions imported from the SSoT (`src/domain/types/` or `src/domain/models/`).
*   Validation functions should accurately reflect all required and optional properties, including their specific types (e.g., string literals for enums).

## 4. Test Mock Alignment

*   All mock objects used in unit, integration, or runtime tests **MUST** accurately reflect the structure and types defined in the SSoT.
*   Tests should import types directly from the SSoT to ensure alignment. Mocks should not contain properties absent from the canonical type definition or omit required properties.

## 5. Enforcement

*   **Code Reviews:** Reviewers must verify that new code adheres to the SSoT for type definitions and imports.
*   **Linting/Static Analysis:** Configure ESLint rules (where possible) to discourage imports from deprecated locations.
*   **TypeScript Compiler (`tsc --noEmit`):** Regularly run the TypeScript compiler to catch type mismatches early. This should be part of the standard development and CI workflow.

By strictly adhering to this strategy, we ensure type safety, reduce ambiguity, and build a more robust and maintainable codebase.