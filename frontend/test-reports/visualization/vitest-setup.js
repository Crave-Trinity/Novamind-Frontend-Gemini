
    // Auto-inject WebGL mocks for all tests
    import { setupWebGLMocks } from '@test/webgl';
    
    // Configure global beforeEach/afterEach hooks
    beforeEach(() => {
      setupWebGLMocks({ monitorMemory: true, debugMode: true });
    });
    
    // Register with global Vitest hooks
    if (typeof globalThis.beforeEach === 'function') {
      globalThis.beforeEach(() => {
        setupWebGLMocks({ monitorMemory: true, debugMode: true });
      });
    }
    