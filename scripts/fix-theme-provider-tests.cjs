/* eslint-disable */
const fs = require('fs');
const path = require('path');

/**
 * ThemeProvider Test Fixer
 * 
 * This script specifically targets fixing the issues with the ThemeProvider tests:
 * - Updates localStorage key from 'theme' to 'ui-theme'
 * - Ensures useTheme hook properly throws when used outside ThemeProvider
 */

// Configuration
const CONFIG = {
  // Path to the ThemeProvider component
  themeProviderPath: 'src/presentation/providers/ThemeProvider.tsx',
  // Path to the useTheme hook (if separate)
  useThemePath: 'src/presentation/hooks/useTheme.ts',
  // Path to the test file
  testFilePath: 'src/presentation/providers/ThemeProvider.test.tsx',
};

// Fix function for ThemeProvider
function fixThemeProvider() {
  console.log('Fixing ThemeProvider component...');
  
  const filePath = path.join(process.cwd(), CONFIG.themeProviderPath);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check for localStorage key issues
    if (content.includes("localStorage.getItem('theme')") || content.includes("localStorage.setItem('theme'")) {
      console.log('Updating localStorage key from "theme" to "ui-theme"');
      
      content = content.replace(/localStorage\.getItem\('theme'\)/g, "localStorage.getItem('ui-theme')");
      content = content.replace(/localStorage\.setItem\('theme'/g, "localStorage.setItem('ui-theme'");
      
      modified = true;
    }
    
    // Write the file back if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
      return true;
    } else {
      console.log('No localStorage key changes needed in ThemeProvider');
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ThemeProvider:`, error);
    return false;
  }
}

// Fix function for useTheme hook
function fixUseThemeHook() {
  console.log('Checking useTheme hook for proper error handling...');
  
  // First try to find useTheme in the ThemeProvider file
  let filePath = path.join(process.cwd(), CONFIG.themeProviderPath);
  let separate = false;
  
  // Check if there's a separate useTheme file
  const useThemePath = path.join(process.cwd(), CONFIG.useThemePath);
  if (fs.existsSync(useThemePath)) {
    filePath = useThemePath;
    separate = true;
    console.log(`Found separate useTheme hook file: ${useThemePath}`);
  }
  
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check if useTheme correctly validates context
    if (content.includes('useTheme') && !content.includes('throw new Error')) {
      console.log('Adding proper error handling to useTheme hook when used outside ThemeProvider');
      
      // Look for the useTheme function
      const lines = content.split('\n');
      let useThemeStartLine = -1;
      let useThemeEndLine = -1;
      let braceCount = 0;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('function useTheme') || lines[i].includes('export const useTheme') || lines[i].includes('const useTheme')) {
          useThemeStartLine = i;
          
          // Find the function body opening
          for (let j = i; j < lines.length; j++) {
            if (lines[j].includes('{')) {
              braceCount++;
              
              // Add a check after opening brace
              if (braceCount === 1 && !lines[j+1]?.includes('if (!context)')) {
                const indentation = lines[j].match(/^(\s*)/)[0] + '  ';
                const contextVar = content.includes('useContext(ThemeContext)') ? 'context' : 'themeContext';
                
                // Insert the context validation
                lines.splice(j + 1, 0, `${indentation}if (!${contextVar}) {`);
                lines.splice(j + 2, 0, `${indentation}  throw new Error('useTheme must be used within a ThemeProvider');`);
                lines.splice(j + 3, 0, `${indentation}}`);
                modified = true;
                console.log('Added context validation to useTheme hook');
                break;
              }
            }
          }
          break;
        }
      }
      
      if (modified) {
        fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
        console.log(`Updated useTheme in file: ${filePath}`);
        return true;
      } else {
        console.log('Could not locate where to add context validation in useTheme hook');
      }
    } else {
      console.log('useTheme hook already has proper error handling');
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing useTheme hook:`, error);
    return false;
  }
}

// Update test expectations if needed
function fixThemeProviderTests() {
  console.log('Checking ThemeProvider tests...');
  
  const filePath = path.join(process.cwd(), CONFIG.testFilePath);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`Test file not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Update localStorage keys in tests
    if (content.includes("localStorage.getItem('theme')") || content.includes("localStorage.setItem('theme'") || 
        content.includes("expect(localStorage.getItem('theme')")) {
      console.log('Updating localStorage key references in tests from "theme" to "ui-theme"');
      
      content = content.replace(/localStorage\.getItem\('theme'\)/g, "localStorage.getItem('ui-theme')");
      content = content.replace(/localStorage\.setItem\('theme'/g, "localStorage.setItem('ui-theme'");
      content = content.replace(/expect\(localStorage\.getItem\('theme'\)/g, "expect(localStorage.getItem('ui-theme')");
      
      modified = true;
    }
    
    // Ensure there's a test for useTheme outside ThemeProvider
    if (!content.includes('useTheme is used outside ThemeProvider') && !content.includes('throws error when useTheme is used outside')) {
      console.log('Adding test case for useTheme when used outside ThemeProvider');
      
      // Find a good place to add the test
      const lines = content.split('\n');
      let lastTestIndex = -1;
      
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes('it(') || lines[i].includes('test(')) {
          lastTestIndex = i;
          break;
        }
      }
      
      if (lastTestIndex > 0) {
        // Get indentation from the last test
        const indentation = lines[lastTestIndex].match(/^(\s*)/)[0];
        const newTest = [
          '',
          `${indentation}it('throws error when useTheme is used outside ThemeProvider', () => {`,
          `${indentation}  // Arrange & Act`,
          `${indentation}  const TestComponent = () => {`,
          `${indentation}    useTheme();`,
          `${indentation}    return <div>Test</div>;`,
          `${indentation}  };`,
          '',
          `${indentation}  // Assert`,
          `${indentation}  expect(() => {`,
          `${indentation}    render(<TestComponent />);`,
          `${indentation}  }).toThrow('useTheme must be used within a ThemeProvider');`,
          `${indentation}});`
        ];
        
        // Add the new test after the last test
        lines.splice(lastTestIndex + 1, 0, ...newTest);
        modified = true;
        console.log('Added test for useTheme when used outside ThemeProvider');
      }
      
      if (modified) {
        fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
        console.log(`Updated tests in file: ${filePath}`);
        return true;
      }
    } else {
      console.log('Test for useTheme outside ThemeProvider already exists');
    }
    
    return modified;
  } catch (error) {
    console.error(`Error processing ThemeProvider tests:`, error);
    return false;
  }
}

// Main function
function main() {
  console.log('ThemeProvider Test Fixer');
  console.log('------------------------');
  
  const providerFixed = fixThemeProvider();
  const hookFixed = fixUseThemeHook();
  const testsFixed = fixThemeProviderTests();
  
  if (providerFixed || hookFixed || testsFixed) {
    console.log('\nFixes applied successfully!');
    console.log('Run ThemeProvider tests to verify the fixes worked:');
    console.log('npx vitest src/presentation/providers/ThemeProvider.test.tsx');
  } else {
    console.log('\nNo changes were made to ThemeProvider.');
    console.log('Ensure test failures are related to other issues.');
  }
}

// Run the script
main();