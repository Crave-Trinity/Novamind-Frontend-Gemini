/* eslint-disable */
/**
 * Possible theme modes for the application
 */
export type ThemeMode = 'light' | 'dark' | 'system' | 'clinical' | 'retro';

/**
 * Simplified theme type for component usage (just light/dark)
 */
export type SimpleTheme = 'light' | 'dark';

/**
 * Validates if a string is a valid theme mode
 */
export const isValidTheme = (theme: string | null): theme is ThemeMode => {
  if (!theme) return false;

  const validThemes: ThemeMode[] = ['light', 'dark', 'system', 'clinical', 'retro'];
  return validThemes.includes(theme as ThemeMode);
};
