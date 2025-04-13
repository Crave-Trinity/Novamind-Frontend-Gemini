/**
 * Fix Failing Tests - TypeScript ESM Solution
 * 
 * This script provides direct fixes for failing tests in the Novamind Frontend.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🧠 NOVAMIND TEST FIX UTILITY 🧠');
console.log('Applying TypeScript ESM fixes to failing tests...');

// Fix the test setup file to properly support jest-dom matchers
const fixTestSetup = (): boolean => {
  const setupFilePath = path.join(projectRoot, 'src/test/setup.clean.ts');
  console.log(`Fixing test setup file: ${setupFilePath}`);
  
  try {
    if (!fs.existsSync(setupFilePath)) {
      console.error(`Setup file not found: ${setupFilePath}`);
      return false;
    }
    
    let content = fs.readFileSync(setupFilePath, 'utf8');
    
    // Replace require approach with proper ESM import
    const updatedContent = content.replace(
      "expect.extend(require('@testing-library/jest-dom').matchers);",
      "import * as matchers from '@testing-library/jest-dom/matchers';\nexpect.extend(matchers);"
    );
    
    if (content !== updatedContent) {
      fs.writeFileSync(setupFilePath, updatedContent);
      console.log('✅ Updated test setup file with proper ESM imports');
      return true;
    } else {
      console.log('✓ Test setup file already has proper imports');
      return false;
    }
  } catch (error) {
    console.error(`Error fixing test setup file: ${error}`);
    return false;
  }
};

// Fix ThemeProvider window.matchMedia handling
const fixThemeProvider = (): boolean => {
  const filePath = path.join(projectRoot, 'src/presentation/providers/ThemeProvider.tsx');
  console.log(`Fixing ThemeProvider: ${filePath}`);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`ThemeProvider file not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Make window.matchMedia more robust for tests
    let updatedContent = content.replace(
      /const \[systemTheme, setSystemTheme\] = useState<'dark' \| 'light'>\([^)]*\);/s,
      `const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(() => {
    // Safely check for window and matchMedia availability (for SSR and testing)
    if (typeof window === 'undefined') return 'light';
    if (!window.matchMedia) return 'light';
    
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark' 
        : 'light';
    } catch (err) {
      console.error('Error detecting system theme:', err);
      return 'light';
    }
  });`
    );
    
    // Make localStorage more robust
    updatedContent = updatedContent.replace(
      /const \[theme, setTheme\] = useState<Theme>\([^)]*\);/s,
      `const [theme, setTheme] = useState<Theme>(() => {
    // Safely handle localStorage access in SSR/testing environments
    if (typeof window === 'undefined') return defaultTheme;
    
    try {
      const storedTheme = localStorage.getItem(storageKey);
      return (storedTheme as Theme) || defaultTheme;
    } catch (err) {
      console.error('Error accessing localStorage:', err);
      return defaultTheme;
    }
  });`
    );
    
    // Add safety checks for localStorage.setItem
    updatedContent = updatedContent.replace(
      /useEffect\(\(\) => \{\s*\/\/ Always save theme selection to localStorage,[^}]*localStorage\.setItem\(storageKey, theme\);[^}]*\}, \[theme, storageKey\]\);/s,
      `useEffect(() => {
    // Save theme selection to localStorage, with error handling
    if (typeof window === 'undefined') return;
    
    try {
      // Always save theme selection to localStorage, regardless of whether it's 'system', 'light', or 'dark'
      localStorage.setItem(storageKey, theme);
    } catch (err) {
      console.error('Error saving theme to localStorage:', err);
    }
  }, [theme, storageKey]);`
    );
    
    // Make media query event listeners more robust
    updatedContent = updatedContent.replace(
      /useEffect\(\(\) => \{\s*const mediaQuery = window\.matchMedia[^}]*\}, \[\]\);/s,
      `useEffect(() => {
    // Safely handle cases where window or matchMedia might not be available (SSR/testing)
    if (typeof window === 'undefined' || !window.matchMedia) return;
    
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
      };
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => {
          mediaQuery.removeEventListener('change', handleChange);
        };
      } 
      // Older browsers (legacy support)
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
        return () => {
          mediaQuery.removeListener(handleChange);
        };
      }
    } catch (err) {
      console.error('Error setting up media query listener:', err);
    }
  }, []);`
    );
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log('✅ Updated ThemeProvider with robust window and localStorage handling');
      return true;
    } else {
      console.log('✓ ThemeProvider already has robust handling');
      return false;
    }
  } catch (error) {
    console.error(`Error fixing ThemeProvider: ${error}`);
    return false;
  }
};

// Main function
const main = async (): Promise<void> => {
  const results: boolean[] = [];
  
  // Apply fixes
  results.push(fixTestSetup());
  results.push(fixThemeProvider());
  
  // Summary
  const successCount = results.filter(Boolean).length;
  console.log(`\n🔍 SUMMARY: ${successCount}/${results.length} fix operations completed successfully.`);
  
  if (successCount === results.length) {
    console.log('\n✨ All fixes have been applied! Run the tests to verify the fixes.');
    console.log('   Run: npm test');
  } else {
    console.log('\n⚠️ Some fixes could not be applied. Check the logs above for details.');
  }
};

// Run the script
main().catch(error => {
  console.error(`❌ Unexpected error: ${error}`);
  process.exit(1);
});