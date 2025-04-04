/**
 * MatchMedia Mock
 * 
 * Provides a mock implementation of the window.matchMedia API for tests.
 * This is necessary because JSDOM doesn't implement matchMedia.
 */

// Define our own simplified version that can be cast to MediaQueryList
interface SimplifiedMediaQueryList {
  matches: boolean;
  media: string;
  onchange: ((ev: Event) => void) | null;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
  dispatchEvent: (event: Event) => boolean;
  
  // Legacy methods
  addListener: (listener: EventListener) => void;
  removeListener: (listener: EventListener) => void;
}

// Store created media query lists for later access
const mediaQueryLists: Record<string, SimplifiedMediaQueryList> = {};

// Mock implementation of matchMedia
const mockMatchMedia = (query: string): MediaQueryList => {
  if (!mediaQueryLists[query]) {
    // Determine initial match state based on query
    let matches = false;
    if (query.includes('prefers-color-scheme: dark')) {
      matches = false; // Default to light mode
    } else if (query.includes('(min-width:')) {
      const minWidth = parseInt(query.match(/\d+/)?.[0] || '0', 10);
      matches = minWidth <= 1024; // Default viewport width of 1024px
    } else if (query.includes('(max-width:')) {
      const maxWidth = parseInt(query.match(/\d+/)?.[0] || '0', 10);
      matches = maxWidth >= 1024; // Default viewport width of 1024px
    }
    
    // Event listener storage
    const listeners: EventListener[] = [];
    const changeListeners: EventListener[] = [];
    
    // Create simplified media query list
    const mediaQueryList: SimplifiedMediaQueryList = {
      matches,
      media: query,
      onchange: null,
      
      addEventListener(type: string, listener: EventListener): void {
        if (type === 'change') {
          changeListeners.push(listener);
        }
      },
      
      removeEventListener(type: string, listener: EventListener): void {
        if (type === 'change') {
          const index = changeListeners.indexOf(listener);
          if (index !== -1) {
            changeListeners.splice(index, 1);
          }
        }
      },
      
      // Legacy API
      addListener(listener: EventListener): void {
        listeners.push(listener);
      },
      
      removeListener(listener: EventListener): void {
        const index = listeners.indexOf(listener);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      },
      
      dispatchEvent(event: Event): boolean {
        if (event.type === 'change') {
          // Call change listeners
          changeListeners.forEach(listener => {
            listener.call(this, event);
          });
          
          // Call legacy listeners
          listeners.forEach(listener => {
            listener.call(this, event);
          });
          
          // Call onchange
          if (this.onchange) {
            this.onchange.call(this, event);
          }
          
          return true;
        }
        return false;
      }
    };
    
    // Add ability to trigger change (for testing)
    const triggerChange = (newMatches: boolean): void => {
      mediaQueryList.matches = newMatches;
      
      const event = new Event('change');
      // Add matches property to event
      Object.defineProperty(event, 'matches', {
        get: () => newMatches
      });
      
      mediaQueryList.dispatchEvent(event);
    };
    
    // Add trigger method non-enumerable (won't be copied)
    Object.defineProperty(mediaQueryList, 'triggerChange', {
      value: triggerChange,
      enumerable: false
    });
    
    mediaQueryLists[query] = mediaQueryList;
  }
  
  // Cast to MediaQueryList
  return mediaQueryLists[query] as unknown as MediaQueryList;
};

// Install the mock
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: mockMatchMedia
  });
}

// Helper methods to change media query states
export const setDarkMode = (dark: boolean = true): void => {
  const darkModeQuery = '(prefers-color-scheme: dark)';
  if (mediaQueryLists[darkModeQuery]) {
    (mediaQueryLists[darkModeQuery] as any).triggerChange(dark);
  }
};

export const setViewportWidth = (width: number): void => {
  // Update all min-width queries
  Object.keys(mediaQueryLists)
    .filter(query => query.includes('min-width:'))
    .forEach(query => {
      const minWidth = parseInt(query.match(/\d+/)?.[0] || '0', 10);
      (mediaQueryLists[query] as any).triggerChange(width >= minWidth);
    });
  
  // Update all max-width queries
  Object.keys(mediaQueryLists)
    .filter(query => query.includes('max-width:'))
    .forEach(query => {
      const maxWidth = parseInt(query.match(/\d+/)?.[0] || '0', 10);
      (mediaQueryLists[query] as any).triggerChange(width <= maxWidth);
    });
};

export default mockMatchMedia;