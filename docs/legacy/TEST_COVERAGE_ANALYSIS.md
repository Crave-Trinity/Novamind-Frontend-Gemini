# Test Coverage Analysis and Improvement Plan

## Current Test Coverage Status

The Novamind Frontend has several types of tests:
- Unit tests (`.test.tsx` and `.test.ts` files)
- Component tests (`.spec.tsx` files)
- Puppeteer end-to-end tests (in `test-puppeteer` directory)

### Test Files Structure

- **Unit Tests**: Located alongside source files with `.test.ts` or `.test.tsx` extensions
- **Component Tests**: Specialized tests in `src/test` with `.spec.tsx` extensions
- **E2E Tests**: Located in `test-puppeteer` directory using Puppeteer
- **Test Utils**: Support files in `src/test` providing test infrastructure

### Test Setup Files

- `src/test/setup.ts` - Basic setup for unit tests
- `src/test/setup.component.ts` - Component test setup
- `src/test/setup.enhanced.ts` - Enhanced setup with additional mocks
- `src/test/setup.integration.ts` - Integration test setup
- `src/test/setup.unified.ts` - Unified setup for comprehensive tests

## Coverage Gap Analysis

Based on the file structure and existing tests, we've identified several areas with insufficient test coverage:

### 1. API and Data Services

The `src/infrastructure/api` and associated service layers have limited test coverage. Critical components requiring additional tests include:

- API client implementation
- Domain-specific API clients
- Service layer implementations
- Authentication and token management
- Error handling and retry logic

### 2. React Hooks

Custom hooks in `src/application/hooks` need comprehensive testing, particularly:

- Data fetching hooks
- State management hooks
- Authentication hooks
- Context integration hooks

### 3. Brain Visualization Components

The 3D visualization components have limited coverage, particularly:

- WebGL renderers
- Brain region interaction
- Neural activity visualization
- Interactive controls

### 4. Complex UI Components

Several complex UI components lack thorough testing:

- Dashboard layouts
- Interactive forms
- Data visualization components
- Modal workflows

### 5. State Management

Application state management needs better coverage:

- Context providers
- State transitions
- Side effect handling
- Persistence logic

## Recommended Test Improvements

To achieve 80% test coverage, we recommend implementing the following test improvements:

### 1. API Client Testing (High Priority)

```typescript
// Example test pattern for API clients
describe('ApiClient', () => {
  let apiClient: ApiClient;
  let mockAxios: jest.Mocked<typeof axios>;
  
  beforeEach(() => {
    mockAxios = axios as jest.Mocked<typeof axios>;
    apiClient = new ApiClient();
  });
  
  test('successful GET request returns expected data', async () => {
    const mockData = { id: '123', name: 'Test' };
    mockAxios.get.mockResolvedValueOnce({ data: mockData });
    
    const result = await apiClient.get<typeof mockData>('/test');
    expect(result).toEqual(mockData);
    expect(mockAxios.get).toHaveBeenCalledWith('/test', expect.any(Object));
  });
  
  test('handles error responses correctly', async () => {
    const mockError = new Error('Network Error');
    mockAxios.get.mockRejectedValueOnce(mockError);
    
    await expect(apiClient.get('/test')).rejects.toThrow('Network Error');
  });
  
  // Add tests for auth token handling, retries, etc.
});
```

### 2. Custom Hook Testing (High Priority)

```typescript
// Example test pattern for custom hooks
import { renderHook, act } from '@testing-library/react-hooks';
import { useBrainModel } from '../hooks/useBrainModel';
import { ApiClient } from '../api/ApiClient';

jest.mock('../api/ApiClient');

describe('useBrainModel', () => {
  const mockBrainModel = { id: '123', regions: [] };
  const mockApiClient = ApiClient as jest.MockedClass<typeof ApiClient>;
  
  beforeEach(() => {
    mockApiClient.prototype.getBrainModel.mockResolvedValue(mockBrainModel);
  });
  
  test('fetches brain model on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useBrainModel('123'));
    
    expect(result.current.loading).toBe(true);
    await waitForNextUpdate();
    
    expect(result.current.loading).toBe(false);
    expect(result.current.brainModel).toEqual(mockBrainModel);
    expect(mockApiClient.prototype.getBrainModel).toHaveBeenCalledWith('123');
  });
  
  test('handles error state', async () => {
    mockApiClient.prototype.getBrainModel.mockRejectedValueOnce(new Error('Failed to fetch'));
    
    const { result, waitForNextUpdate } = renderHook(() => useBrainModel('123'));
    await waitForNextUpdate();
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(result.current.brainModel).toBeNull();
  });
});
```

### 3. Component Testing (Medium Priority)

```typescript
// Example test pattern for complex components
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrainVisualizationContainer } from '../components/BrainVisualizationContainer';
import { BrainModelProvider } from '../contexts/BrainModelContext';

jest.mock('../hooks/useBrainModel', () => ({
  useBrainModel: () => ({
    brainModel: { id: '123', regions: [/* mock regions */] },
    loading: false,
    error: null
  })
}));

describe('BrainVisualizationContainer', () => {
  test('renders brain model visualization', () => {
    render(
      <BrainModelProvider>
        <BrainVisualizationContainer modelId="123" />
      </BrainModelProvider>
    );
    
    expect(screen.getByTestId('brain-container')).toBeInTheDocument();
    // Test specific visualization elements are present
  });
  
  test('handles region selection', async () => {
    const onRegionSelect = jest.fn();
    
    render(
      <BrainModelProvider>
        <BrainVisualizationContainer 
          modelId="123" 
          onRegionSelect={onRegionSelect} 
        />
      </BrainModelProvider>
    );
    
    fireEvent.click(screen.getByTestId('region-frontal-lobe'));
    
    await waitFor(() => {
      expect(onRegionSelect).toHaveBeenCalledWith(expect.objectContaining({
        id: expect.any(String),
        name: expect.stringContaining('Frontal')
      }));
    });
  });
});
```

### 4. State Management Testing (Medium Priority)

```typescript
// Example test pattern for context providers
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const TestConsumer = () => {
  const { user, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="user-email">{user?.email || 'No user'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  test('provides authentication state', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
  });
  
  test('handles login flow', async () => {
    // Mock API response
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { email: 'test@example.com' }, token: 'fake-token' })
    } as Response);
    
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    
    act(() => {
      screen.getByText('Login').click();
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });
});
```

### 5. Integration Testing (Lower Priority)

Use Jest + Testing Library to test integration between multiple components and services:

```typescript
// Example integration test
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrainAnalyzerPage } from '../pages/BrainAnalyzerPage';
import { AppProvider } from '../providers/AppProvider';
import * as apiModule from '../api/brainApiClient';

jest.mock('../api/brainApiClient');

describe('BrainAnalyzerPage Integration', () => {
  const mockAnalyzeFunction = apiModule.analyzeBrainModel as jest.Mock;
  
  beforeEach(() => {
    mockAnalyzeFunction.mockResolvedValue({
      result: 'Analysis complete',
      regions: [/* mock analysis results */]
    });
  });
  
  test('full analysis workflow', async () => {
    render(
      <AppProvider>
        <BrainAnalyzerPage />
      </AppProvider>
    );
    
    // Select model from dropdown
    fireEvent.change(screen.getByLabelText(/select model/i), {
      target: { value: 'model-123' }
    });
    
    // Configure analysis parameters
    fireEvent.click(screen.getByLabelText(/include connectivity/i));
    
    // Run analysis
    fireEvent.click(screen.getByText(/run analysis/i));
    
    // Verify loading state
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
    
    // Verify results display
    await waitFor(() => {
      expect(screen.getByText(/analysis complete/i)).toBeInTheDocument();
      expect(mockAnalyzeFunction).toHaveBeenCalledWith(
        'model-123',
        expect.objectContaining({ includeConnectivity: true })
      );
    });
  });
});
```

## Implementation Strategy

To achieve 80% test coverage, we recommend the following implementation strategy:

1. **Set up testing infrastructure**:
   - Configure Vitest with coverage reporting
   - Add Istanbul coverage configuration
   - Set up test watch mode for active development

2. **Prioritize critical paths**:
   - API client and service layer
   - Authentication flow
   - Core visualization components
   - Main user workflows

3. **Implement test patterns**:
   - Create reusable test utilities and mocks
   - Standardize testing patterns for each component type
   - Document testing conventions

4. **Continuous monitoring**:
   - Set up coverage reporting in CI pipeline
   - Enforce minimum coverage thresholds
   - Track coverage trends over time

5. **Integrate with E2E tests**:
   - Complement unit test coverage with E2E tests
   - Focus E2E tests on critical user journeys
   - Avoid duplicating coverage between test types

## Coverage Targets by Module

| Module                      | Current Est. % | Target % | Priority |
|-----------------------------|----------------|----------|----------|
| infrastructure/api          | 30%            | 90%      | High     |
| application/hooks           | 40%            | 90%      | High     |
| presentation/containers     | 45%            | 85%      | Medium   |
| presentation/molecules      | 50%            | 80%      | Medium   |
| presentation/atoms          | 60%            | 80%      | Low      |
| domain/services             | 35%            | 85%      | High     |
| infrastructure/storage      | 40%            | 80%      | Medium   |
| application/contexts        | 40%            | 85%      | High     |
| lib/utils                   | 50%            | 90%      | Medium   |

## Conclusion

By implementing the recommended testing strategy and focusing on the identified coverage gaps, we can achieve the goal of 80% test coverage. This will significantly improve the reliability and maintainability of the codebase while providing confidence for future development and refactoring.

The highest priority should be given to the API client layer testing, as this is the critical interface between the frontend and backend, followed by testing the custom hooks that encapsulate key business logic and user interface components that users directly interact with.