# Frontend Testing Notes

## React Three Fiber (R3F) Testing Challenges (April 3, 2025)

### Problem Summary

Tests involving R3F components, particularly those using hooks (`useThree`, `useFrame`) or custom elements via `extend` (e.g., `shaderMaterial`), are consistently failing or causing the test runner (Vitest) to hang.

**Key Errors Encountered:**

1.  **`Error: R3F: Hooks can only be used within the Canvas component!`**: This indicates that components using R3F hooks are being rendered outside the necessary R3F context provided by `<Canvas>`. Attempts to mock the `<Canvas>` and its context provider in `src/test/setup.ts` and wrap test components using `renderWithProviders` (from `src/test/test-utils.tsx`) have not fully resolved this.
2.  **`TypeError: useStore(...) is not a function`**: This error occurs within the R3F `useThree` hook implementation. It suggests that the mocked context value provided in `setup.ts` does not correctly mimic the Zustand store instance (with methods like `getState`, `setState`, `subscribe`) that `useThree` expects.
3.  **JSX Casing/Recognition Warnings**: Persistent warnings like `<sphereGeometry /> is using incorrect casing...` or `<neuralActivityShaderMaterial> is unrecognized...` occur despite trying both PascalCase and lowercase conventions for extended elements in JSX. This points to an issue with how the `extend` mechanism and TypeScript's JSX typing interact within the mocked test environment.

### Affected Files

*   `frontend/src/test/setup.ts`: Contains the primary mocks for R3F and Drei.
*   `frontend/src/test/test-utils.tsx`: The `renderWithProviders` helper needs to correctly establish the R3F context.
*   `frontend/src/presentation/molecules/NeuralActivityVisualizer.test.tsx`: Consistently fails or hangs.
*   Other visualizer tests (e.g., `BrainModelViewer`, `BiometricAlertVisualizer`) are also likely affected.

### Potential Causes & Next Steps

1.  **Incomplete/Incorrect R3F Context Mock:** The mock in `setup.ts` needs to more accurately replicate the Zustand store instance and the context provided by `<Canvas>`.
2.  **`extend` Mechanism in Tests:** The way `extend` registers custom components might not be functioning correctly within the Vitest/JSDOM environment, leading to JSX recognition issues.
3.  **Drei Component Dependencies:** Internal hooks used by Drei components (`Text`, `Line`, etc.) might be triggering the context errors. Mocking these specific Drei components more aggressively within `setup.ts` could be a workaround.
4.  **Test Renderer Interaction:** There might be subtle incompatibilities between `@testing-library/react`, R3F, and the JSDOM environment for complex WebGL components.

**Immediate Focus:** Resolve the `TypeError: useStore(...) is not a function` by refining the `useThree` mock and the context provided in `setup.ts` to accurately reflect the expected Zustand store interface. Simultaneously, investigate why the JSX casing for extended elements remains problematic.