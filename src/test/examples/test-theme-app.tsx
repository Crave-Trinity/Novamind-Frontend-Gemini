import React from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css'; // Import styles using alias
import ThemeProvider from '@application/contexts/ThemeProvider'; // Use default import
// Removed unused auditLogService import
import type { ThemeMode } from '@contexts/ThemeContext';
import { ThemeContext } from '@contexts/ThemeContext'; // Use @contexts alias
import { useContext } from 'react';

/**
 * Interface for the theme context type
 */
interface ThemeContextType {
  mode: ThemeMode;
  isDarkMode: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

/**
 * Hook for accessing theme context
 */
const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

/**
 * Simple theme controller component to test theme functionality
 */
const ThemeController: React.FC = () => {
  const { mode, isDarkMode, setTheme, toggleTheme } = useTheme();

  const themes: ThemeMode[] = ['light', 'dark', 'system', 'clinical', 'sleek-dark', 'retro', 'wes'];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div
        className={`p-8 rounded-lg shadow-lg transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
      >
        <h1 className="text-3xl font-bold mb-6">Theme System Test</h1>

        <div className="mb-6 p-4 rounded border">
          <h2 className="text-xl font-semibold mb-2">Current Theme State</h2>
          <p>
            <strong>Active Theme:</strong> {mode}
          </p>
          <p>
            <strong>Dark Mode:</strong> {isDarkMode ? 'Enabled' : 'Disabled'}
          </p>
          <p>
            <strong>System Preference:</strong>{' '}
            {window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light'}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Toggle Light/Dark</h2>
          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-md transition-colors ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium`}
          >
            Toggle Theme ({isDarkMode ? 'Light' : 'Dark'})
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Select Theme</h2>
          <div className="flex flex-wrap gap-2">
            {themes.map((theme) => (
              <button
                key={theme}
                onClick={() => setTheme(theme)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  mode === theme
                    ? isDarkMode
                      ? 'bg-green-600'
                      : 'bg-green-500'
                    : isDarkMode
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : 'bg-gray-300 hover:bg-gray-400'
                } ${isDarkMode ? 'text-white' : mode === theme ? 'text-white' : 'text-gray-800'} font-medium`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 p-4 rounded border">
          <h2 className="text-xl font-semibold mb-2">Theme Implementation Details</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Uses{' '}
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">React Context API</code>{' '}
              for global state
            </li>
            <li>
              Stores preference in{' '}
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">localStorage</code>
            </li>
            <li>
              Detects system preferences with{' '}
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">matchMedia</code>
            </li>
            <li>
              Applies theme using{' '}
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">CSS classes</code> on
              document root
            </li>
            <li>Logs theme changes for audit compliance</li>
          </ul>
        </div>

        <div className="p-4 rounded border">
          <h2 className="text-xl font-semibold mb-2">Element Styling Examples</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-primary-100 dark:bg-primary-900 rounded">Primary Background</div>
            <div className="p-4 bg-secondary-100 dark:bg-secondary-900 rounded">
              Secondary Background
            </div>
            <div className="p-4 bg-success-100 dark:bg-success-900 rounded">Success Background</div>
            <div className="p-4 bg-error-100 dark:bg-error-900 rounded">Error Background</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Main App wrapper with theme provider
 */
const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="system">
      <ThemeController />
    </ThemeProvider>
  );
};

// Mount the application
const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
