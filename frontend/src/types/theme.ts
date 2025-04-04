import { ThemeMode } from '../application/contexts/ThemeContext';

/**
 * Checks if the provided theme is a valid ThemeMode
 * Used for type-safe handling of theme values
 */
export function isValidTheme(theme: string | null): theme is ThemeMode {
  const validThemes: ThemeMode[] = ['light', 'dark', 'system', 'clinical', 'sleek-dark', 'retro', 'wes'];
  return theme !== null && validThemes.includes(theme as ThemeMode);
}
