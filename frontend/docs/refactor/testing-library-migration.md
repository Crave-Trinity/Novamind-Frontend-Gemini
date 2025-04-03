# Testing Library Migration: `react-hooks` to `react`

## Context

During debugging of persistent test suite hangs (Task Ref: [Insert Task Reference/ID if available]), it was identified that the project was using the deprecated `@testing-library/react-hooks` package, specifically its `renderHook` and `waitForNextUpdate` utilities. This library is no longer maintained, and its functionality has been merged into `@testing-library/react`.

Using the deprecated library, especially alongside the modern `@testing-library/react` used elsewhere, can lead to subtle conflicts, particularly concerning the management of asynchronous operations, state updates, and timers within tests. This inconsistency was a likely contributor to the observed test hangs.

## Changes Implemented

1.  **Dependency Removal:** The `@testing-library/react-hooks` dependency should be removed from `package.json` if it exists.
2.  **Import Updates:** All test files previously importing `renderHook` or `act` from `@testing-library/react-hooks` were updated to import them from `@testing-library/react`.
3.  **Replaced `waitForNextUpdate`:** All usages of the deprecated `waitForNextUpdate` function were replaced with the `waitFor` utility from `@testing-library/react`. This typically involves wrapping assertions that depend on asynchronous updates within `await waitFor(() => { /* assertions */ });`.
4.  **Test Logic Adaptation:** Tests using `renderHook` were adjusted to correctly access the hook's state and actions based on the structure returned by `renderHook` from `@testing-library/react` and the specific hook's implementation (e.g., accessing state via `result.current.getCurrentState()` if applicable).
5.  **Global Timer Management:** The global test setup (`src/test/setup.ts`) was enhanced to use `vi.useFakeTimers()` before each test and `vi.useRealTimers()` after each test, ensuring consistent timer control. `vi.runAllTimers()` was added within specific `async` tests where necessary to flush pending timers after asynchronous actions.

## Affected Files (Example)

*   `frontend/src/application/controllers/NeuralActivityController.test.ts` (Primary example where changes were applied)
*   *(Potentially others if the deprecated library was used elsewhere - search confirmed this was the main instance)*

## Rationale

*   **Standardization:** Aligns the project with the current standard React Testing Library practices.
*   **Maintenance:** Uses actively maintained library features.
*   **Stability:** Reduces the likelihood of conflicts and unexpected behavior related to asynchronous testing utilities.
*   **Debugging:** Simplifies debugging by using a single, consistent set of testing tools.

## Next Steps

*   Ensure `@testing-library/react-hooks` is removed from `package.json` and run `npm install` or `yarn install`.
*   Continue monitoring the test suite for hangs, addressing any remaining issues related to local mock configurations or unmanaged asynchronous operations within specific tests.