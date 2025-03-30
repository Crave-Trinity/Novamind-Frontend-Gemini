/**
 * Theme types and interfaces
 */

/**
 * Available theme options
 */
export type ThemeOption = 'light' | 'dark' | 'clinical' | 'sleek-dark' | 'retro' | 'wes';

/**
 * Theme settings interface
 */
export interface ThemeSettings {
  bgColor: string;
  glowIntensity: number;
  useBloom: boolean;
  activeRegionColor: string;
  inactiveRegionColor: string;
  excitationColor: string;
  inhibitionColor: string;
  connectionOpacity: number;
  regionOpacity: number;
}

/**
 * Type guard for theme options
 * @param theme Theme string to validate
 * @returns If the theme is a valid ThemeOption
 */
export function isValidTheme(theme: string): theme is ThemeOption {
  return ['light', 'dark', 'clinical', 'sleek-dark', 'retro', 'wes'].includes(theme as ThemeOption);
}

/**
 * Visual settings for themes
 */
export const visualSettings: Record<ThemeOption, {
  bgColor: string;
  ambientLight: number;
  directionalLight: number;
  glowIntensity: number;
  useBloom: boolean;
}> = {
  'light': {
    bgColor: '#ffffff',
    ambientLight: 0.5,
    directionalLight: 1.0,
    glowIntensity: 0.5,
    useBloom: false,
  },
  'dark': {
    bgColor: '#121212',
    ambientLight: 0.3,
    directionalLight: 0.8,
    glowIntensity: 0.8,
    useBloom: true,
  },
  'clinical': {
    bgColor: '#f8f9fa',
    ambientLight: 0.6,
    directionalLight: 1.2,
    glowIntensity: 0.4,
    useBloom: false,
  },
  'sleek-dark': {
    bgColor: '#0a1128',
    ambientLight: 0.2,
    directionalLight: 0.7,
    glowIntensity: 1.0,
    useBloom: true,
  },
  'retro': {
    bgColor: '#0a1128',
    ambientLight: 0.4,
    directionalLight: 0.9,
    glowIntensity: 0.5,
    useBloom: false,
  },
  'wes': {
    bgColor: '#F8E9D6',
    ambientLight: 0.5,
    directionalLight: 1.0,
    glowIntensity: 0.3,
    useBloom: false,
  }
};