/**
 * ResizeObserver Mock
 * 
 * Provides a mock implementation of the ResizeObserver API for tests.
 * This is necessary because JSDOM doesn't implement ResizeObserver.
 */

// Mock implementation of ResizeObserver
class MockResizeObserver {
  private callback: ResizeObserverCallback;
  private elements: Set<Element> = new Set();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(element: Element): void {
    this.elements.add(element);
    
    // Simulate an immediate resize event
    this.simulateResize([element]);
  }

  unobserve(element: Element): void {
    this.elements.delete(element);
  }

  disconnect(): void {
    this.elements.clear();
  }

  // Helper method to simulate resize events
  simulateResize(elements: Element[]): void {
    const entries = elements.map(element => ({
      target: element,
      contentRect: element.getBoundingClientRect(),
      borderBoxSize: [{
        blockSize: 100,
        inlineSize: 100
      }],
      contentBoxSize: [{
        blockSize: 80,
        inlineSize: 80
      }],
      devicePixelContentBoxSize: [{
        blockSize: 80,
        inlineSize: 80
      }]
    }));

    this.callback(entries as ResizeObserverEntry[], this);
  }
}

// Install the mock
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: MockResizeObserver
  });

  Object.defineProperty(global, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: MockResizeObserver
  });
}

export default MockResizeObserver;