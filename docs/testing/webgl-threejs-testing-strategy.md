# WebGL / Three.js / R3F Testing Strategy Analysis & Refactoring Plan

## Current State & Challenges (As of 2025-04-05)

The current test setup for WebGL, Three.js, and React Three Fiber (R3F) components faces significant challenges, leading to numerous skipped or failing tests.

**1. Environment Limitations (JSDOM):**
   - The default test environment (`jsdom`) lacks a native WebGL implementation and GPU access. Direct instantiation of `WebGLRenderer` or calls to `canvas.getContext('webgl')` fail without mocking.
   - Simulating the asynchronous nature of GPU operations and the R3F render loop is difficult.

**2. Mocking Strategy:**
   - **`mock-webgl.ts`:** Provides essential patches for `canvas.getContext` and `requestAnimationFrame` to prevent basic errors in JSDOM. It also includes rudimentary mock classes for some Three.js objects (e.g., `CoreWebGLRenderer`, `MockWebGLGeometry`).
   - **`vi.mock('three', ...)`:** Attempts to mock the entire `three` module, either globally (`setup.ts`) or locally (within specific test files), have proven unreliable and difficult to maintain.
     - **Incompleteness:** Mocks often lacked necessary properties or methods (e.g., `camera.position`, `mesh.dispose`), causing errors when components tried to use them.
     - **Scope/Timing:** Global mocks didn't consistently apply to all test files, while local mocks sometimes conflicted or didn't execute before the module was imported by the code under test.
   - **R3F Mocking:** No explicit mocking strategy for R3F hooks (`useThree`, `useFrame`) was consistently applied, leading to failures or skips in tests for components relying on R3F's context and render loop.

**3. Test Failures & Skips:**
   - **`TypeError`s:** Errors like `Cannot set properties of undefined (setting 'z')` or `Cannot read properties of undefined (reading 'dispose')` occurred frequently in WebGL/Three.js tests (`BrainRegionVisualizer.test.ts`), indicating the mocks were incomplete or not being applied correctly.
   - **Hangs/Timeouts:** Tests involving complex hooks (`useBrainVisualization`, `BiometricStreamController`) often timed out, likely due to unresolvable asynchronous operations or interactions with timers/mocks within the test environment.
   - **Exclusions:** A significant number of visualization-related components (atoms, molecules, organisms, pages) are explicitly excluded in `vitest.config.ts` due to these underlying mocking and R3F testing difficulties.

## Refactoring Plan for Improved Testability

To enable robust testing of the critical visualization slice, the following refactoring steps are recommended:

**1. Abandon Global `three` Mocking:**
   - **Action:** Remove all instances of `vi.mock('three', ...)` from `setup.ts` and any test files.
   - **Rationale:** This approach is too complex and brittle for a library like Three.js.

**2. Refine `mock-webgl.ts`:**
   - **Action:** Keep the `patchCanvasGetContext` and `patchAnimationFrame` functions (called from `setup.ts`). Remove the exported mock *classes* (`CoreWebGLRenderer`, etc.).
   - **Rationale:** Focus this utility solely on patching the JSDOM environment to prevent basic errors, not on providing Three.js object mocks.

**3. Dependency Injection for Core Three.js Objects:**
   - **Action:** Refactor components/classes (like `BrainRegionVisualizer` or potentially R3F components) that directly instantiate `WebGLRenderer`, `Scene`, `PerspectiveCamera`. Modify them to accept these core objects via props or constructor arguments.
   - **Rationale:** Allows tests to pass in simple, controlled mock objects (e.g., `{ render: vi.fn(), dispose: vi.fn() }`) instead of relying on complex library mocks.

**4. Isolate Three.js Logic:**
   - **Action:** Extract complex Three.js logic (geometry generation, material updates, calculations) into pure utility functions or non-React classes. Encapsulate R3F/Three.js side effects within custom hooks.
   - **Rationale:** Enables unit testing of core logic without needing a full rendering environment or complex component setup.

**5. Targeted R3F Hook Mocking:**
   - **Action:** When testing R3F components, mock the necessary R3F hooks (`useThree`, `useFrame`) directly within the test file using `vi.mock('@react-three/fiber', ...)`. Provide mock return values for camera, scene, gl, etc.
   - **Rationale:** Isolates the component from the R3F internals, allowing focus on the component's own logic and rendering based on mocked R3F state.

**6. Component Prop-Based Testing:**
   - **Action:** Focus component tests (`*.test.tsx`) on verifying rendering based on props and testing interactions via callbacks, relying on the mocked hooks/dependencies.
   - **Rationale:** Avoids brittle assertions on internal Three.js state or specific `dark:` classes.

**7. Address Skipped/Excluded Tests:**
   - **Action:** Systematically revisit skipped tests and those excluded in `vitest.config.ts`. Apply the strategies above (dependency injection, hook mocking) to attempt fixes. Prioritize tests for core visualization components and hooks. Accept that some complex async/timing issues might require leaving tests skipped temporarily. Implement placeholder tests (`initializeApp`, `index`, `domain/utils`).
   - **Rationale:** Incrementally increase test coverage for the visualization slice.

**8. Limitations & Complementary Testing:**
   - **Action:** Acknowledge that JSDOM testing for WebGL/R3F has inherent limitations. It cannot verify actual visual output or GPU-specific behavior.
   - **Recommendation:** Supplement unit/integration tests with:
     - **Visual Regression Testing:** (e.g., using Storybook + Chromatic or similar tools) to catch visual changes.
     - **Manual Testing:** Thoroughly test visualization features in a real browser.
     - **Browser-Based Test Runners:** Consider tools like Playwright or Cypress (potentially with Vitest integration) for end-to-end tests that run in a real browser environment if high-fidelity automated testing of the visualization is critical.

By implementing this strategy, we can move away from the unreliable full library mocking towards more targeted, maintainable tests focused on specific units of logic and component behavior, ultimately improving the stability and production readiness of the visualization slice.