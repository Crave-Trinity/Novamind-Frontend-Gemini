# API Client Architecture Guidelines

## Overview

The API client architecture follows a clean, modular design that separates concerns and ensures type safety throughout the application.

## Core Principles

1. **Single Source of Truth**
   - One API client instance
   - Centralized configuration
   - Unified error handling
   - Consistent response types

2. **Type Safety**
   - Request/response type definitions
   - Runtime type validation
   - Error type handling
   - Generic type constraints

3. **Testing Support**
   - Clean mock system
   - Predictable behavior
   - Easy configuration
   - Detailed logging

## Implementation

### 1. Base Client

```typescript
// src/infrastructure/api/BaseApiClient.ts

export abstract class BaseApiClient {
  protected abstract baseUrl: string;
  protected abstract headers: Record<string, string>;

  protected async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: unknown
  ): Promise<T> {
    // Implementation
  }

  protected handleError(error: unknown): never {
    // Error handling
  }
}
```

### 2. Real API Client

```typescript
// src/infrastructure/api/ApiClient.ts

export class ApiClient extends BaseApiClient {
  // Implementation of real API client
}
```

### 3. Mock API Client

```typescript
// src/infrastructure/api/MockApiClient.ts

export class MockApiClient extends BaseApiClient {
  // Implementation of mock API client
}
```

### 4. Type Definitions

```typescript
// src/domain/types/api/requests.ts
// src/domain/types/api/responses.ts

export interface ApiRequest<T> {
  // Type definitions for requests
}

export interface ApiResponse<T> {
  // Type definitions for responses
}
```

## Usage Examples

### 1. Making API Calls

```typescript
const brainModel = await apiClient.getBrainModel(patientId);
```

### 2. Error Handling

```typescript
try {
  const result = await apiClient.someMethod();
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API-specific error
  }
}
```

### 3. Testing

```typescript
// In tests
vi.mock('@infrastructure/api/ApiClient', () => ({
  apiClient: mockApiClient
}));
```

## Error Handling

1. **Error Types**
   - NetworkError
   - ValidationError
   - AuthenticationError
   - AuthorizationError
   - NotFoundError
   - ServerError

2. **Error Format**
   ```typescript
   interface ApiError {
     code: string;
     message: string;
     details?: Record<string, unknown>;
   }
   ```

## Configuration

1. **Environment Variables**
   ```env
   API_BASE_URL=https://api.novamind.ai
   API_VERSION=v1
   API_TIMEOUT=30000
   ```

2. **Headers**
   ```typescript
   const headers = {
     'Content-Type': 'application/json',
     'Accept': 'application/json',
     'X-API-Version': 'v1'
   };
   ```

## Testing Strategy

1. **Mock Responses**
   - Define static mock data
   - Create dynamic mock generators
   - Support error scenarios

2. **Test Utilities**
   - Mock request interceptors
   - Response generators
   - Error simulators

3. **Integration Tests**
   - API client integration tests
   - End-to-end request flow tests
   - Error handling tests

## Migration Guide

1. **Preparation**
   - Create new API client structure
   - Set up type definitions
   - Prepare mock system

2. **Implementation**
   - Migrate existing endpoints
   - Update type definitions
   - Add error handling

3. **Testing**
   - Write unit tests
   - Add integration tests
   - Update existing tests

4. **Deployment**
   - Gradual rollout
   - Monitor errors
   - Collect metrics 