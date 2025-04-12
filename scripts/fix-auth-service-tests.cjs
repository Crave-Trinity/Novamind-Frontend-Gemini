/* eslint-disable */
const fs = require('fs');
const path = require('path');

/**
 * AuthService Test Fixer
 * 
 * This script specifically targets fixing the issues with the AuthService tests:
 * - dispatchEventSpy not being called
 * - Promise references not matching
 * - Error in logout test with API call failure
 */

// Configuration
const CONFIG = {
  // Path to the AuthService implementation
  authServicePath: 'src/infrastructure/auth/AuthService.enhanced.ts',
  // Path to the test file
  testFilePath: 'src/infrastructure/auth/AuthService.enhanced.test.ts',
};

// Fix function for AuthService
function fixAuthService() {
  console.log('Fixing AuthService implementation...');
  
  const filePath = path.join(process.cwd(), CONFIG.authServicePath);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix 1: Ensure event dispatch in login/logout methods
    if (!content.includes('dispatchEvent(new Event') || content.match(/\/\/\s*this\.dispatchEvent/)) {
      console.log('Ensuring dispatchEvent is properly called in login/logout methods');
      
      // Fix login method
      if (content.includes('login') && !content.match(/dispatchEvent\(new Event\(['"]login/)) {
        content = content.replace(
          /async login\([^)]*\)\s*{[^}]*}/s,
          (match) => {
            // Only add if not already present
            if (!match.includes('dispatchEvent(new Event')) {
              return match.replace(
                /return\s+[^;]*;/,
                (returnStatement) => {
                  const insertBefore = returnStatement.trim();
                  const indentation = returnStatement.match(/^\s*/)[0];
                  return `${indentation}// Dispatch login event\n${indentation}this.dispatchEvent(new Event('login'));\n${indentation}${insertBefore}`;
                }
              );
            }
            return match;
          }
        );
        modified = true;
      }
      
      // Fix logout method
      if (content.includes('logout') && !content.match(/dispatchEvent\(new Event\(['"]logout/)) {
        content = content.replace(
          /async logout\([^)]*\)\s*{[^}]*}/s,
          (match) => {
            // Only add if not already present
            if (!match.includes('dispatchEvent(new Event')) {
              return match.replace(
                /return\s+[^;]*;/,
                (returnStatement) => {
                  const insertBefore = returnStatement.trim();
                  const indentation = returnStatement.match(/^\s*/)[0];
                  return `${indentation}// Dispatch logout event\n${indentation}this.dispatchEvent(new Event('logout'));\n${indentation}${insertBefore}`;
                }
              );
            }
            return match;
          }
        );
        modified = true;
      }
    }
    
    // Fix 2: Fix Promise handling in error cases
    if (content.includes('logout') && content.includes('try') && content.includes('catch')) {
      console.log('Improving error handling in logout method');
      
      content = content.replace(
        /async logout\([^)]*\)\s*{[^}]*}/s,
        (match) => {
          // Add proper Promise rejection handling in catch block
          if (match.includes('catch') && !match.includes('return Promise.reject')) {
            return match.replace(
              /catch\s*\(error\)\s*{[^}]*}/s,
              (catchBlock) => {
                // Add Promise.reject if not present
                if (!catchBlock.includes('return Promise.reject')) {
                  const indentation = catchBlock.match(/^\s*/)[0];
                  const improvedCatch = `catch (error) {
${indentation}  console.error('Logout failed:', error);
${indentation}  // Ensure we still dispatch event even on error
${indentation}  this.dispatchEvent(new Event('logout'));
${indentation}  return Promise.reject(error);
${indentation}}`;
                  return improvedCatch;
                }
                return catchBlock;
              }
            );
          }
          return match;
        }
      );
      modified = true;
    }
    
    // Write the file back if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
      return true;
    } else {
      console.log('No changes needed in AuthService implementation');
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing AuthService:`, error);
    return false;
  }
}

// Update test expectations if needed
function fixAuthServiceTests() {
  console.log('Fixing AuthService tests...');
  
  const filePath = path.join(process.cwd(), CONFIG.testFilePath);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`Test file not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix 1: Add proper event spy checks
    if (content.includes('dispatchEventSpy') && !content.includes('expect(dispatchEventSpy).toHaveBeenCalled')) {
      console.log('Adding proper spy verification in login/logout tests');
      
      const lines = content.split('\n');
      
      // Process test functions
      for (let i = 0; i < lines.length; i++) {
        // Find login or logout test
        if ((lines[i].includes('login') || lines[i].includes('logout')) && 
            (lines[i].includes('it(') || lines[i].includes('test('))) {
          
          // Look for the end of the test function to add our expectations
          let openBraces = 0;
          let testEndLine = i;
          
          for (let j = i; j < lines.length; j++) {
            if (lines[j].includes('{')) openBraces++;
            if (lines[j].includes('}')) openBraces--;
            
            // Found the end of the test function
            if (openBraces === 0 && j > i) {
              testEndLine = j;
              break;
            }
          }
          
          // If we found the end and there's no spy check, add it
          if (testEndLine > i && !content.slice(i, testEndLine).includes('expect(dispatchEventSpy)')) {
            // Get indentation
            const indentation = lines[testEndLine].match(/^(\s*)/)[0];
            
            // Insert before the end of the test
            const eventType = lines[i].includes('login') ? 'login' : 'logout';
            lines.splice(testEndLine, 0, `${indentation}  // Verify event was dispatched\n${indentation}  expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));`);
            
            modified = true;
            console.log(`Added dispatchEventSpy verification for ${eventType} test`);
            
            // Skip ahead since we modified the array
            i = testEndLine;
          }
        }
      }
      
      if (modified) {
        content = lines.join('\n');
      }
    }
    
    // Fix 2: Fix Promise reference comparison in tests
    if (content.includes('.logout') && content.includes('expect(result)')) {
      console.log('Fixing Promise reference comparison in logout test');
      
      // Replace direct Promise reference comparison with proper async/await pattern
      content = content.replace(
        /const result = authService\.logout\(\);[^;]*expect\(result\)/g,
        'await expect(authService.logout())'
      );
      
      modified = true;
    }
    
    // Fix 3: Fix API call failure test
    if (content.includes('logout should handle API call failure') && !content.includes('rejects.toThrow')) {
      console.log('Fixing logout API call failure test');
      
      content = content.replace(
        /it\(['"]logout should handle API call failure['"][^{]*{[^}]*}/s,
        (match) => {
          // Update the assertion to use rejects.toThrow
          if (!match.includes('rejects.toThrow')) {
            return match.replace(
              /expect\([^)]*\)\.toThrow/s,
              'expect(authService.logout()).rejects.toThrow'
            );
          }
          return match;
        }
      );
      
      modified = true;
    }
    
    // Write the file back if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated tests in file: ${filePath}`);
      return true;
    } else {
      console.log('No changes needed in AuthService tests');
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing AuthService tests:`, error);
    return false;
  }
}

// Main function
function main() {
  console.log('AuthService Test Fixer');
  console.log('----------------------');
  
  const serviceFixed = fixAuthService();
  const testsFixed = fixAuthServiceTests();
  
  if (serviceFixed || testsFixed) {
    console.log('\nFixes applied successfully!');
    console.log('Run AuthService tests to verify the fixes worked:');
    console.log('npx vitest src/infrastructure/auth/AuthService.enhanced.test.ts');
  } else {
    console.log('\nNo changes were made to AuthService.');
    console.log('Ensure test failures are related to other issues.');
  }
}

// Run the script
main();