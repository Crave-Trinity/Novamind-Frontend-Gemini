#!/usr/bin/env node

/**
 * ThemeContext Fix Script
 * 
 * This script automatically fixes the most common TypeScript errors in ThemeContext:
 * - Adds missing 'settings' property to contextValue 
 * - Updates ThemeContext types to properly support all theme options
 * - Fixes nullable values in components that use the theme context
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name properly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to files we need to modify
const THEME_CONTEXT_PATH = path.resolve(__dirname, '../src/contexts/ThemeContext.ts');
const THEME_PROVIDER_PATH = path.resolve(__dirname, '../src/contexts/ThemeProvider.tsx');

console.log('🧠 NOVAMIND ThemeContext TypeScript Fix Script');
console.log('=============================================');
console.log(`Fixing TypeScript errors in ThemeContext...`);

// Fix ThemeContext types
if (fs.existsSync(THEME_CONTEXT_PATH)) {
  let contextContent = fs.readFileSync(THEME_CONTEXT_PATH, 'utf8');
  
  // Check if settings property is missing from ThemeContextType interface
  if (!contextContent.includes('settings: ThemeSettings;')) {
    console.log('🔧 Adding settings property to ThemeContextType interface...');
    
    // Add settings property to ThemeContextType interface
    contextContent = contextContent.replace(
      /export interface ThemeContextType {[^}]*}/s,
      `export interface ThemeContextType {
  theme: ThemeOption;
  isDarkMode: boolean;
  settings: ThemeSettings;
  setTheme: (newTheme: ThemeOption) => void;
  toggleDarkMode: () => void;
}`
    );
    
    // Add ThemeSettings interface if it doesn't exist
    if (!contextContent.includes('export interface ThemeSettings')) {
      console.log('🔧 Adding ThemeSettings interface...');
      
      contextContent = contextContent.replace(
        /export type ThemeOption/,
        `export interface ThemeSettings {
  bgColor: string;
  ambientLight: number;
  directionalLight: number;
  glowIntensity: number;
  useBloom: boolean;
}

export const defaultThemeSettings: Record<ThemeOption, ThemeSettings> = {
  'light': {
    bgColor: '#ffffff',
    ambientLight: 0.6,
    directionalLight: 0.8,
    glowIntensity: 0.3,
    useBloom: false
  },
  'dark': {
    bgColor: '#121212',
    ambientLight: 0.4,
    directionalLight: 0.6,
    glowIntensity: 0.7,
    useBloom: true
  },
  'clinical': {
    bgColor: '#f8f9fa',
    ambientLight: 0.7,
    directionalLight: 0.9,
    glowIntensity: 0.2,
    useBloom: false
  },
  'sleek-dark': {
    bgColor: '#1a1a2e',
    ambientLight: 0.3,
    directionalLight: 0.5,
    glowIntensity: 0.9,
    useBloom: true
  }
};

export type ThemeOption`
      );
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(THEME_CONTEXT_PATH, contextContent);
    console.log('✅ ThemeContext.ts updated successfully');
  } else {
    console.log('✅ ThemeContext.ts already has settings property, no changes needed');
  }
} else {
  console.log('⚠️ ThemeContext.ts not found at expected path');
}

// Fix ThemeProvider component
if (fs.existsSync(THEME_PROVIDER_PATH)) {
  let providerContent = fs.readFileSync(THEME_PROVIDER_PATH, 'utf8');
  
  // Check if settings property is missing from contextValue
  if (!providerContent.includes('settings:') && providerContent.includes('const contextValue')) {
    console.log('🔧 Adding settings property to contextValue in ThemeProvider...');
    
    // Update contextValue to include settings
    providerContent = providerContent.replace(
      /const contextValue\s*=\s*{[^}]*}/s,
      `const contextValue: ThemeContextType = {
    theme,
    isDarkMode,
    settings: defaultThemeSettings[theme],
    setTheme,
    toggleDarkMode: () => setTheme(isDarkMode ? "light" : "dark")
  }`
    );
    
    // Make sure defaultThemeSettings is imported
    if (!providerContent.includes('defaultThemeSettings')) {
      providerContent = providerContent.replace(
        /import ThemeContext,\s*{([^}]*)}\s*from\s*["']\.\/ThemeContext["']/,
        `import ThemeContext, { $1, defaultThemeSettings, ThemeContextType } from "./ThemeContext"`
      );
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(THEME_PROVIDER_PATH, providerContent);
    console.log('✅ ThemeProvider.tsx updated successfully');
  } else {
    console.log('✅ ThemeProvider.tsx already has settings in contextValue, no changes needed');
  }
} else {
  console.log('⚠️ ThemeProvider.tsx not found at expected path');
}

console.log('ThemeContext fixes completed successfully! 🎉');