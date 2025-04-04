/**
 * Mock implementation for Tailwind CSS in tests
 * Provides utilities to simulate dark mode and CSS class functionality in a test environment
 */

// For backward compatibility with existing imports
export const cssMock = {
  darkMode: false,
  enableDarkMode: (): void => { cssMock.darkMode = true; applyClassBasedDarkMode(); },
  disableDarkMode: (): void => { cssMock.darkMode = false; applyClassBasedDarkMode(); },
  toggleDarkMode: (): void => {
    cssMock.darkMode = !cssMock.darkMode;
    applyClassBasedDarkMode();
  }
};

/**
 * Apply dark mode classes to the document element based on the cssMock state
 * Used for compatibility with existing tests
 */
export const applyClassBasedDarkMode = (): void => {
  if (!document || !document.documentElement) {
    return;
  }

  if (cssMock.darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Global state for the mock
export interface TailwindMockState {
  /** Whether dark mode is currently active */
  darkMode: boolean;
  /** Element class lists for assertions */
  classList: Map<HTMLElement, Set<string>>;
}

const mockState: TailwindMockState = {
  darkMode: false,
  classList: new Map(),
};

/**
 * Enable dark mode in the test environment
 */
export const enableDarkMode = (): void => {
  mockState.darkMode = true;
  applyDarkModeToDocument();
};

/**
 * Disable dark mode in the test environment
 */
export const disableDarkMode = (): void => {
  mockState.darkMode = false;
  applyDarkModeToDocument();
};

/**
 * Toggle dark mode in the test environment
 */
export const toggleDarkMode = (): void => {
  mockState.darkMode = !mockState.darkMode;
  applyDarkModeToDocument();
};

/**
 * Get the current mock state
 */
export const getMockState = (): TailwindMockState => mockState;

/**
 * Reset the mock state
 */
export const resetMockState = (): void => {
  mockState.darkMode = false;
  mockState.classList.clear();
  applyDarkModeToDocument();
};

/**
 * Apply dark mode to the document element
 */
const applyDarkModeToDocument = (): void => {
  if (!document || !document.documentElement) {
    return;
  }

  if (mockState.darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

/**
 * Mock implementation for classList that tracks changes for assertions
 * @param element The element to create a mock classList for
 * @returns A mock classList with add, remove, and contains methods
 */
export const createMockClassList = (element: HTMLElement): DOMTokenList => {
  // Initialize the classList for this element
  if (!mockState.classList.has(element)) {
    mockState.classList.set(element, new Set<string>());
  }

  const elementClasses = mockState.classList.get(element) as Set<string>;

  return {
    add: (...tokens: string[]): void => {
      tokens.forEach((token) => elementClasses.add(token));
    },
    remove: (...tokens: string[]): void => {
      tokens.forEach((token) => elementClasses.delete(token));
    },
    contains: (token: string): boolean => elementClasses.has(token),
    toggle: (token: string, force?: boolean): boolean => {
      if (force !== undefined) {
        if (force) {
          elementClasses.add(token);
          return true;
        } else {
          elementClasses.delete(token);
          return false;
        }
      }

      if (elementClasses.has(token)) {
        elementClasses.delete(token);
        return false;
      } else {
        elementClasses.add(token);
        return true;
      }
    },
    // Implement other DOMTokenList methods as needed
    replace: (oldToken: string, newToken: string): boolean => {
      if (!elementClasses.has(oldToken)) return false;
      elementClasses.delete(oldToken);
      elementClasses.add(newToken);
      return true;
    },
    supports: (): boolean => true,
    value: Array.from(elementClasses).join(' '),
    length: elementClasses.size,
    item: (index: number): string | null => {
      return Array.from(elementClasses)[index] || null;
    },
    toString: (): string => Array.from(elementClasses).join(' '),
    [Symbol.iterator]: function* (): Generator<string> {
      for (const className of elementClasses) {
        yield className;
      }
    },
  } as unknown as DOMTokenList;
};

/**
 * Setup the document mock for testing
 * This should be called in the test setup file
 */
export const setupTailwindMock = (): void => {
  // Apply initial dark mode state to the document
  applyDarkModeToDocument();

  // Install mock for element.classList
  if (typeof window !== 'undefined') {
    Object.defineProperty(HTMLElement.prototype, 'classList', {
      get() {
        return createMockClassList(this);
      },
    });
  }
};

// Export the mock state for testing
export default mockState;