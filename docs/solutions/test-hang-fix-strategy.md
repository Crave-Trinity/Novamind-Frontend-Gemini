# Novamind Test Hang Root Cause Analysis & Fix Strategy

## Root Cause Analysis

After careful code examination, I've isolated the exact causes of test hangs in the Novamind frontend test suite:

### 1. Invalid Hook Usage Pattern

The primary issue occurs in files like `useClinicalContext.test.ts`, `useVisualSettings.test.ts` and similar hook test files:

```typescript
// In useClinicalContext.test.ts
const result = useClinicalContext(testData); // Invalid - Hook called outside React component
```

**Problem**: React hooks can only be called inside a React function component or a custom hook. Calling them directly in a test module violates the [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html), causing React to enter an infinite loop or hang as it attempts to reconcile hook state.

### 2. Missing Service Implementation

The `useClinicalContext` hook uses several methods from `clinicalService`:
- `fetchSymptomMappings()`
- `fetchDiagnosisMappings()`
- `fetchTreatmentMappings()`
- `fetchRiskAssessment(patientId)`
- `fetchTreatmentPredictions(patientId)`

However, in `frontend/src/application/services/clinicalService.ts`, only `submitBiometricAlert()` is implemented. When the hook calls the missing methods, it encounters undefined functions, resulting in runtime errors that aren't properly caught or handled.

### 3. React Query Implementation Issues

React Query requires a proper `QueryClientProvider` context, which is missing in direct hook calls. Additionally:
- The query keys might be conflicting between test runs
- There's no error boundary for failed queries
- Query timeouts or staleness settings might be inappropriate for tests

### 4. Timeouts and Asynchronous Issues

In `MockApiClient.ts` there's an artificial delay:

```typescript
await new Promise((resolve) => setTimeout(resolve, 800));
```

When test modules call multiple APIs with these delays, they accumulate, eventually hitting the Vitest timeout limit.

### 5. Incomplete Three.js/R3F Mocking

Despite extensive mocking in `setup.ts`, the mock for `useThree` doesn't properly simulate the Zustand store expected by R3F:

```typescript
// Current implementation
useThree: vi.fn(() => mockStore.getState()),
```

This doesn't properly account for React Three Fiber's internal state system and store subscription model.

## Fix Strategy

We'll implement a two-phase solution: First, a targeted fix for the most immediate issues to unblock tests, followed by a comprehensive refactoring to improve the test architecture.

### Phase 1: Emergency Unblocking

#### 1. Correct Hook Testing Pattern

Modify the hook tests to use `renderHook` from `@testing-library/react-hooks`:

```typescript
// Before:
const result = useClinicalContext(testData);

// After:
import { renderHook } from '@testing-library/react-hooks';
import { createThemeWrapper } from '@test/test-utils';

const wrapper = createThemeWrapper('clinical');
const { result } = renderHook(() => useClinicalContext(testData), { wrapper });
```

#### 2. Implement Mock Service Functions

Create a proper mock for the `clinicalService` with all required methods:

```typescript
// In src/test/mocks/clinical-service.mock.ts
export const mockClinicalService = {
  fetchSymptomMappings: vi.fn().mockResolvedValue({ success: true, data: [] }),
  fetchDiagnosisMappings: vi.fn().mockResolvedValue({ success: true, data: [] }),
  fetchTreatmentMappings: vi.fn().mockResolvedValue({ success: true, data: [] }),
  fetchRiskAssessment: vi.fn().mockResolvedValue({ success: true, data: null }),
  fetchTreatmentPredictions: vi.fn().mockResolvedValue({ success: true, data: [] }),
  submitBiometricAlert: vi.fn().mockResolvedValue({ success: true, data: undefined }),
};

// Then mock the module in setup.ts
vi.mock('@application/services/clinicalService', () => ({
  clinicalService: mockClinicalService,
}));
```

#### 3. Fix React Query Provider Usage

Update `test-utils.tsx` to provide a consistent QueryClient with appropriate test settings:

```typescript
export function renderHookWithProviders<TResult, TProps>(
  callback: (props: TProps) => TResult,
  { wrapper: ExternalWrapper, ...options }: RenderHookOptions<TProps> = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Suppress errors during tests
    },
  });

  const Wrapper: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {ExternalWrapper ? <ExternalWrapper>{children}</ExternalWrapper> : children}
    </QueryClientProvider>
  );

  return renderHook(callback, { wrapper: Wrapper, ...options });
}
```

#### 4. Remove Artificial Timeouts

Replace delays in test mocks with immediate resolutions:

```typescript
// Before
await new Promise((resolve) => setTimeout(resolve, 800));

// After
await Promise.resolve();
```

#### 5. Enhance R3F Context Mocking

Implement a proper Zustand store for R3F mocking:

```typescript
// In setup.ts:
const r3fStore = create((set, get) => ({
  ...mockThreeState,
  set: (fn) => set(typeof fn === 'function' ? fn(get()) : fn),
  get,
}));

// Then update the mock:
vi.mock("@react-three/fiber", async (importOriginal) => {
  // ...existing mock code...
  return {
    ...actual,
    Canvas: vi.fn(({ children }) => {
      // Simple mocked Canvas that provides the store
      return React.createElement(React.Fragment, null, children);
    }),
    useThree: vi.fn(() => r3fStore.getState()),
    useFrame: vi.fn((_callback) => null),
  };
});
```

### Phase 2: Comprehensive Testing Architecture Refactoring

After the immediate fixes, we should implement a more robust testing architecture:

1. **Standardized Test Helpers**: Create specialized test helpers for different component types:
   - `renderHookWithAllProviders` for hooks 
   - `renderComponentWithThreeContext` for 3D visualization components

2. **Isolation Improvements**: Move mocks from global setup to per-test imports to reduce test interdependence

3. **Custom Three.js Test Renderer**: Implement a specialized test renderer for Three.js components that properly simulates the WebGL context

4. **Test Timeouts Management**: Add explicit timeouts to tests to prevent indefinite hangs

5. **Error Boundaries for Tests**: Implement error boundaries that prevent cascading test failures

## Implementation Roadmap

1. Start with the `useClinicalContext.test.ts` fix as it demonstrates the primary issue
2. Apply similar fixes to all hook tests
3. Address API tests with proper request mocking
4. Implement specialized visualization testing utilities 
5. Document the patterns in a TEST-ARCHITECTURE.md reference

This methodical approach will systematically address all test hang issues while maintaining clean architecture principles and testing best practices.