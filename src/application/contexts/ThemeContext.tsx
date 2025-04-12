/* eslint-disable */
/**
 * Neural Theme Context
 * 
 * Provides quantum-level theme management for the psychiatric digital twin platform
 * with neural accessibility optimization and clinical visualization modes
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Theme types with clinical precision
export type ThemeMode = 'light' | 'dark' | 'clinical' | 'system';

export type ThemeColor = 'blue' | 'green' | 'purple' | 'neutral' | 'clinical';

// Neural color scheme mapping
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
    accent: string;
  };
  neural: {
    active: string;
    inactive: string;
    reference: string;
    marker: string;
    alert: string;
  };
  clinical: {
    normal: string;
    mild: string;
    moderate: string;
    severe: string;
    critical: string;
  };
  visualization: {
    background: string;
    grid: string;
    axis: string;
    baseline: string;
    highlight: string;
  };
}

// Theme context type with neural precision
interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  colorScheme: ThemeColor;
  setColorScheme: (color: ThemeColor) => void;
  isDark: boolean;
  colors: ThemeColors;
  fontSize: number;
  setFontSize: (size: number) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => void;
}

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Neural color palettes optimized for clinical visualization
const COLOR_PALETTES: Record<ThemeColor, { light: ThemeColors; dark: ThemeColors }> = {
  blue: {
    light: {
      primary: '#0062cc',
      secondary: '#5195e5',
      accent: '#1a73e8',
      background: '#f8f9fa',
      surface: '#ffffff',
      text: {
        primary: '#202124',
        secondary: '#5f6368',
        muted: '#80868b',
        accent: '#1a73e8',
      },
      neural: {
        active: '#fa541c',
        inactive: '#91caff',
        reference: '#237804',
        marker: '#722ed1',
        alert: '#cf1322',
      },
      clinical: {
        normal: '#52c41a',
        mild: '#faad14',
        moderate: '#fa8c16',
        severe: '#f5222d',
        critical: '#a8071a',
      },
      visualization: {
        background: '#f0f2f5',
        grid: '#e6e8eb',
        axis: '#aeaeae',
        baseline: '#d9d9d9',
        highlight: '#1890ff',
      },
    },
    dark: {
      primary: '#4c8dff',
      secondary: '#70a0ff',
      accent: '#90b4ff',
      background: '#121212',
      surface: '#1e1e1e',
      text: {
        primary: '#e8eaed',
        secondary: '#bdc1c6',
        muted: '#9aa0a6',
        accent: '#8ab4f8',
      },
      neural: {
        active: '#ff7a45',
        inactive: '#177ddc',
        reference: '#73d13d',
        marker: '#b37feb',
        alert: '#f5222d',
      },
      clinical: {
        normal: '#49aa19',
        mild: '#d89614',
        moderate: '#d87a16',
        severe: '#d32029',
        critical: '#a8071a',
      },
      visualization: {
        background: '#141414',
        grid: '#303030',
        axis: '#525252',
        baseline: '#434343',
        highlight: '#177ddc',
      },
    },
  },
  green: {
    light: {
      primary: '#10b981',
      secondary: '#34d399',
      accent: '#059669',
      background: '#f8f9fa',
      surface: '#ffffff',
      text: {
        primary: '#202124',
        secondary: '#5f6368',
        muted: '#80868b',
        accent: '#059669',
      },
      neural: {
        active: '#fa541c',
        inactive: '#91caff',
        reference: '#237804',
        marker: '#722ed1',
        alert: '#cf1322',
      },
      clinical: {
        normal: '#52c41a',
        mild: '#faad14',
        moderate: '#fa8c16',
        severe: '#f5222d',
        critical: '#a8071a',
      },
      visualization: {
        background: '#f0f2f5',
        grid: '#e6e8eb',
        axis: '#aeaeae',
        baseline: '#d9d9d9',
        highlight: '#10b981',
      },
    },
    dark: {
      primary: '#4ade80',
      secondary: '#86efac',
      accent: '#22c55e',
      background: '#121212',
      surface: '#1e1e1e',
      text: {
        primary: '#e8eaed',
        secondary: '#bdc1c6',
        muted: '#9aa0a6',
        accent: '#4ade80',
      },
      neural: {
        active: '#ff7a45',
        inactive: '#177ddc',
        reference: '#73d13d',
        marker: '#b37feb',
        alert: '#f5222d',
      },
      clinical: {
        normal: '#49aa19',
        mild: '#d89614',
        moderate: '#d87a16',
        severe: '#d32029',
        critical: '#a8071a',
      },
      visualization: {
        background: '#141414',
        grid: '#303030',
        axis: '#525252',
        baseline: '#434343',
        highlight: '#22c55e',
      },
    },
  },
  purple: {
    light: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      accent: '#7c3aed',
      background: '#f8f9fa',
      surface: '#ffffff',
      text: {
        primary: '#202124',
        secondary: '#5f6368',
        muted: '#80868b',
        accent: '#7c3aed',
      },
      neural: {
        active: '#fa541c',
        inactive: '#91caff',
        reference: '#237804',
        marker: '#722ed1',
        alert: '#cf1322',
      },
      clinical: {
        normal: '#52c41a',
        mild: '#faad14',
        moderate: '#fa8c16',
        severe: '#f5222d',
        critical: '#a8071a',
      },
      visualization: {
        background: '#f0f2f5',
        grid: '#e6e8eb',
        axis: '#aeaeae',
        baseline: '#d9d9d9',
        highlight: '#8b5cf6',
      },
    },
    dark: {
      primary: '#a78bfa',
      secondary: '#c4b5fd',
      accent: '#8b5cf6',
      background: '#121212',
      surface: '#1e1e1e',
      text: {
        primary: '#e8eaed',
        secondary: '#bdc1c6',
        muted: '#9aa0a6',
        accent: '#a78bfa',
      },
      neural: {
        active: '#ff7a45',
        inactive: '#177ddc',
        reference: '#73d13d',
        marker: '#b37feb',
        alert: '#f5222d',
      },
      clinical: {
        normal: '#49aa19',
        mild: '#d89614',
        moderate: '#d87a16',
        severe: '#d32029',
        critical: '#a8071a',
      },
      visualization: {
        background: '#141414',
        grid: '#303030',
        axis: '#525252',
        baseline: '#434343',
        highlight: '#8b5cf6',
      },
    },
  },
  neutral: {
    light: {
      primary: '#6b7280',
      secondary: '#9ca3af',
      accent: '#4b5563',
      background: '#f8f9fa',
      surface: '#ffffff',
      text: {
        primary: '#202124',
        secondary: '#5f6368',
        muted: '#80868b',
        accent: '#4b5563',
      },
      neural: {
        active: '#fa541c',
        inactive: '#91caff',
        reference: '#237804',
        marker: '#722ed1',
        alert: '#cf1322',
      },
      clinical: {
        normal: '#52c41a',
        mild: '#faad14',
        moderate: '#fa8c16',
        severe: '#f5222d',
        critical: '#a8071a',
      },
      visualization: {
        background: '#f0f2f5',
        grid: '#e6e8eb',
        axis: '#aeaeae',
        baseline: '#d9d9d9',
        highlight: '#6b7280',
      },
    },
    dark: {
      primary: '#9ca3af',
      secondary: '#d1d5db',
      accent: '#6b7280',
      background: '#121212',
      surface: '#1e1e1e',
      text: {
        primary: '#e8eaed',
        secondary: '#bdc1c6',
        muted: '#9aa0a6',
        accent: '#9ca3af',
      },
      neural: {
        active: '#ff7a45',
        inactive: '#177ddc',
        reference: '#73d13d',
        marker: '#b37feb',
        alert: '#f5222d',
      },
      clinical: {
        normal: '#49aa19',
        mild: '#d89614',
        moderate: '#d87a16',
        severe: '#d32029',
        critical: '#a8071a',
      },
      visualization: {
        background: '#141414',
        grid: '#303030',
        axis: '#525252',
        baseline: '#434343',
        highlight: '#6b7280',
      },
    },
  },
  clinical: {
    light: {
      primary: '#096dd9',
      secondary: '#40a9ff',
      accent: '#1890ff',
      background: '#f0f2f5',
      surface: '#ffffff',
      text: {
        primary: '#000000d9',
        secondary: '#00000073',
        muted: '#00000040',
        accent: '#1890ff',
      },
      neural: {
        active: '#FF5E5B',
        inactive: '#373737',
        reference: '#52c41a',
        marker: '#722ed1',
        alert: '#f5222d',
      },
      clinical: {
        normal: '#52c41a',
        mild: '#faad14',
        moderate: '#fa8c16',
        severe: '#f5222d',
        critical: '#a8071a',
      },
      visualization: {
        background: '#f5f5f5',
        grid: '#e8e8e8',
        axis: '#d9d9d9',
        baseline: '#d9d9d9',
        highlight: '#1890ff',
      },
    },
    dark: {
      primary: '#177ddc',
      secondary: '#165996',
      accent: '#1890ff',
      background: '#141414',
      surface: '#1f1f1f',
      text: {
        primary: '#ffffffd9',
        secondary: '#ffffff73',
        muted: '#ffffff40',
        accent: '#177ddc',
      },
      neural: {
        active: '#FF5E5B',
        inactive: '#909090',
        reference: '#73d13d',
        marker: '#b37feb',
        alert: '#f5222d',
      },
      clinical: {
        normal: '#49aa19',
        mild: '#d89614',
        moderate: '#d87a16',
        severe: '#d32029',
        critical: '#a8071a',
      },
      visualization: {
        background: '#000000',
        grid: '#1f1f1f',
        axis: '#434343',
        baseline: '#303030',
        highlight: '#177ddc',
      },
    },
  },
};

// Provider props
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  defaultColor?: ThemeColor;
}

// Theme provider component with neural precision
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  defaultColor = 'clinical',
}) => {
  // State for theme preferences
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);
  const [colorScheme, setColorScheme] = useState<ThemeColor>(defaultColor);
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  
  // Derived state
  const isDark = 
    theme === 'dark' || 
    (theme === 'system' && 
      typeof window !== 'undefined' && 
      window.matchMedia?.('(prefers-color-scheme: dark)').matches);

  // Get current color palette
  const colors = isDark 
    ? COLOR_PALETTES[colorScheme].dark 
    : COLOR_PALETTES[colorScheme].light;

  // Apply theme to document
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    // Dark/light mode
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
    
    // Color scheme
    document.documentElement.dataset.colorScheme = colorScheme;
    
    // High contrast
    document.documentElement.classList.toggle('high-contrast', highContrast);
    
    // Set theme colors on root element
    if (isDark) {
      document.documentElement.style.setProperty('--color-background', colors.background);
      document.documentElement.style.setProperty('--color-surface', colors.surface);
      document.documentElement.style.setProperty('--color-primary', colors.primary);
      document.documentElement.style.setProperty('--color-text', colors.text.primary);
    } else {
      document.documentElement.style.setProperty('--color-background', colors.background);
      document.documentElement.style.setProperty('--color-surface', colors.surface);
      document.documentElement.style.setProperty('--color-primary', colors.primary);
      document.documentElement.style.setProperty('--color-text', colors.text.primary);
    }
    
    // Set font size
    document.documentElement.style.fontSize = `${fontSize}px`;
    
    // Set reduced motion preference
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
  }, [isDark, colorScheme, colors, highContrast, fontSize, reducedMotion]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Force re-render when system preference changes
    const handleChange = () => {
      setThemeState('system'); // This forces a re-render while keeping the value the same
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Listen for system reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set reduced motion based on system preference
    const handleChange = () => {
      setReducedMotion(mediaQuery.matches);
    };
    
    // Initialize
    handleChange();
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Set theme with persistence
  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    
    // Save to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('novamind-theme', newTheme);
    }
  };

  // Context value
  const value: ThemeContextType = {
    theme,
    setTheme,
    colorScheme,
    setColorScheme,
    isDark,
    colors,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Hook for using the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export default ThemeContext;