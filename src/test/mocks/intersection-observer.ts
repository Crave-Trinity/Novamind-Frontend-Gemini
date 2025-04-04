/**
 * IntersectionObserver Mock
 * 
 * Provides a mock implementation of the IntersectionObserver API for tests.
 * This is necessary because JSDOM doesn't implement IntersectionObserver.
 */

// Mock implementation of IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | null;
  readonly rootMargin: string;
  readonly thresholds: readonly number[];
  
  private callback: IntersectionObserverCallback;
  private elements: Set<Element> = new Set();

  constructor(
    callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {}
  ) {
    this.callback = callback;
    // Cast to Element or null since we don't support Document as root in mock
    this.root = (options.root as Element | null) || null;
    this.rootMargin = options.rootMargin || '0px';
    this.thresholds = Array.isArray(options.threshold) 
      ? options.threshold 
      : [options.threshold || 0];
  }

  observe(element: Element): void {
    this.elements.add(element);
    
    // Simulate an immediate intersection
    this.simulateIntersection([element], true);
  }

  unobserve(element: Element): void {
    this.elements.delete(element);
  }

  disconnect(): void {
    this.elements.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  // Helper method to simulate intersection events
  simulateIntersection(elements: Element[], isIntersecting: boolean): void {
    const entries = elements.map(element => ({
      isIntersecting,
      target: element,
      intersectionRatio: isIntersecting ? 1.0 : 0.0,
      boundingClientRect: element.getBoundingClientRect(),
      intersectionRect: isIntersecting 
        ? element.getBoundingClientRect() 
        : new DOMRectReadOnly(0, 0, 0, 0),
      rootBounds: this.root?.getBoundingClientRect() || null,
      time: Date.now()
    }));

    this.callback(entries, this);
  }
}

// Install the mock
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver
  });

  Object.defineProperty(global, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver
  });
}

export default MockIntersectionObserver;