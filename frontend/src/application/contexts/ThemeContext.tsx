import React, { createContext, useContext, useState, useEffect } from 'react';

// Define available themes
export type ThemeType = 'light' | 'dark' | 'clinical' | 'sleek-dark';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  isDarkMode: false,
  toggleDarkMode: () => {},
});

// Hook for using theme context
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Get saved theme from local storage or use default
  const getSavedTheme = (): ThemeType => {
    const savedTheme = localStorage.getItem('novamind-theme');
    return (savedTheme as ThemeType) || 'sleek-dark';
  };

  const [theme, setTheme] = useState<ThemeType>(getSavedTheme);
  const [isDarkMode, setIsDarkMode] = useState(theme.includes('dark'));

  // Update body class and local storage when theme changes
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('novamind-theme', theme);
    setIsDarkMode(theme.includes('dark'));
  }, [theme]);

  // Toggle between light and dark mode
  const toggleDarkMode = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
