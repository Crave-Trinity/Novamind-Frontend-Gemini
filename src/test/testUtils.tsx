function setupThreeJsMocks() {
  // Mock WebGL renderer and context
  window.HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, contextId: string) {
    if (contextId === 'webgl' || contextId === 'webgl2') {
      return {
        canvas: this,
        getExtension: () => true,
        createBuffer: () => ({}),
        bindBuffer: () => {},
        bufferData: () => {},
        enable: () => {},
        useProgram: () => {},
        createProgram: () => ({}),
        createShader: () => ({}),
        compileShader: () => {},
        attachShader: () => {},
        linkProgram: () => {},
        createVertexArray: () => ({}),
        bindVertexArray: () => {},
        enableVertexAttribArray: () => {},
        vertexAttribPointer: () => {},
        createTexture: () => ({}),
        bindTexture: () => {},
        texImage2D: () => {},
        texParameteri: () => {},
        drawArrays: () => {},
        drawElements: () => {},
        viewport: () => {},
        clearColor: () => {},
        clear: () => {},
        finish: () => {},
      };
    }
    return null;
  } as any;

  // Mock ResizeObserver
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Mock IntersectionObserver with required properties
  window.IntersectionObserver = class MockIntersectionObserver implements IntersectionObserver {
    root: Element | null = null;
    rootMargin: string = "0px";
    thresholds: ReadonlyArray<number> = [0];
    
    constructor(private readonly _callback: IntersectionObserverCallback) {}
    
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] { return []; }
  } as any;
}
