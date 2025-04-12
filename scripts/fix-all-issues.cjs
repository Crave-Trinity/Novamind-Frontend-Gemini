/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=================================================');
console.log('Psychiatric Digital Twin Platform - Issue Fixer');
console.log('=================================================');
console.log('Running comprehensive fixes for TypeScript errors, linting issues, and test failures');
console.log('');

// Execute a script and log its output
function runScript(scriptPath) {
  console.log(`Running script: ${scriptPath}`);
  console.log('------------------------------------------------');
  
  try {
    const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });
    console.log(output);
    return true;
  } catch (error) {
    console.error(`Error running script ${scriptPath}:`);
    console.error(error.message);
    return false;
  }
}

// Step 1: Run the TypeScript error fixer
console.log('\n📝 STEP 1: Fixing TypeScript Errors');
const tsFixerSuccess = runScript(path.join(__dirname, 'fix-typescript-errors.cjs'));

// Step 2: Run the test failures fixer
console.log('\n🧪 STEP 2: Fixing Test Failures');
const testFixerSuccess = runScript(path.join(__dirname, 'fix-test-failures.cjs'));

// Step 3: Fix ThemeProvider tests
console.log('\n🎨 STEP 3: Fixing ThemeProvider Tests');
const themeFixerSuccess = runScript(path.join(__dirname, 'fix-theme-provider-tests.cjs'));

// Step 4: Fix AuthService tests
console.log('\n🔐 STEP 4: Fixing AuthService Tests');
const authFixerSuccess = runScript(path.join(__dirname, 'fix-auth-service-tests.cjs'));

// Step 5: Fix any types
console.log('\n🔍 STEP 5: Fixing Any Types');
const anyFixerSuccess = runScript(path.join(__dirname, 'fix-any-types.cjs'));

// Step 6: Fix parsing errors
console.log('\n🧩 STEP 6: Fixing Parsing Errors');
const parsingFixerSuccess = runScript(path.join(__dirname, 'fix-parsing-errors.cjs'));

// Step 7: Fix all ESLint issues
console.log('\n🧹 STEP 7: Fixing ESLint Issues');
const eslintFixerSuccess = runScript(path.join(__dirname, 'fix-all-eslint-issues.cjs'));

// Summary
console.log('\n=================================================');
console.log('Fix Completion Summary');
console.log('=================================================');
console.log(`TypeScript Error Fixer: ${tsFixerSuccess ? '✅ Success' : '❌ Failed'}`);
console.log(`Test Failures Fixer: ${testFixerSuccess ? '✅ Success' : '❌ Failed'}`);
console.log(`ThemeProvider Test Fixer: ${themeFixerSuccess ? '✅ Success' : '❌ Failed'}`);
console.log(`AuthService Test Fixer: ${authFixerSuccess ? '✅ Success' : '❌ Failed'}`);
console.log(`Any Types Fixer: ${anyFixerSuccess ? '✅ Success' : '❌ Failed'}`);
console.log(`Parsing Errors Fixer: ${parsingFixerSuccess ? '✅ Success' : '❌ Failed'}`);
console.log(`ESLint Issues Fixer: ${eslintFixerSuccess ? '✅ Success' : '❌ Failed'}`);

// Instructions for running tests
console.log('\n=================================================');
console.log('Next Steps');
console.log('=================================================');
console.log('To run the MLApiClientEnhanced tests and verify the fixes:');
console.log('npx vitest src/infrastructure/api/MLApiClientEnhanced.test.ts --environment jsdom');
console.log('\nTo run the ThemeProvider tests:');
console.log('npx vitest src/presentation/providers/ThemeProvider.test.ts');
console.log('\nTo run the AuthService tests:');
console.log('npx vitest src/infrastructure/auth/AuthService.enhanced.test.ts');
console.log('\nFor running all tests:');
console.log('npm test');
console.log('=================================================');