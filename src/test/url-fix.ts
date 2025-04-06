/**
 * URL Fix for Test Environment
 *
 * This module provides simple URL-related fixes for the test environment.
 * These are necessary because JSDOM (the browser-like environment used in tests)
 * may have incomplete or missing implementations of certain browser APIs.
 */

/**
 * Apply URL fixes to the test environment
 * Ensures that URL operations work correctly in tests
 */
export function applyURLFix(): void {
  // Only apply if in test environment
  if (typeof window !== 'undefined') {
    // Ensure URLSearchParams is available and functioning
    if (!window.URLSearchParams) {
      // Simple mock if URLSearchParams is missing
      (window as any).URLSearchParams = class MockURLSearchParams {
        private params: Map<string, string>;

        constructor(init?: string | Record<string, string> | URLSearchParams) {
          this.params = new Map();

          if (!init) return;

          if (typeof init === 'string') {
            // Parse query string
            init.split('&').forEach((pair) => {
              const [key, value] = pair.split('=');
              if (key) this.params.set(key, value || '');
            });
          } else if (init && typeof init === 'object') {
            // Handle object-like inputs
            Object.entries(init).forEach(([key, value]) => {
              if (typeof value === 'string') {
                this.params.set(key, value);
              }
            });
          }
        }

        // Basic implementation
        get(name: string): string | null {
          return this.params.has(name) ? this.params.get(name) || null : null;
        }

        has(name: string): boolean {
          return this.params.has(name);
        }

        set(name: string, value: string): void {
          this.params.set(name, value);
        }

        toString(): string {
          const pairs: string[] = [];
          this.params.forEach((value, key) => {
            pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
          });
          return pairs.join('&');
        }
      };
    }

    console.log('URL fix applied successfully!');
  }
}

// Auto-apply the fix
applyURLFix();
