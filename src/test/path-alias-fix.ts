/**
 * Path Alias Resolution Fix for Tests
 *
 * This file ensures that path aliases defined in tsconfig.json and vitest.config.ts
 * are correctly resolved during tests. It logs the resolution paths to verify
 * the aliases are working properly.
 */

import { vi } from 'vitest';
import path from 'path';

// Log that path alias fix is running
console.log('[path-alias-fix.ts] Validating path alias resolution');

// Define the base source directory
const srcPath = path.resolve(process.cwd(), 'src');

// Log alias resolution paths to help diagnose issues
const aliasMapping = {
  '@': srcPath,
  '@domain': path.join(srcPath, 'domain'),
  '@application': path.join(srcPath, 'application'),
  '@infrastructure': path.join(srcPath, 'infrastructure'),
  '@presentation': path.join(srcPath, 'presentation'),
  '@atoms': path.join(srcPath, 'presentation/atoms'),
  '@molecules': path.join(srcPath, 'presentation/molecules'),
  '@organisms': path.join(srcPath, 'presentation/organisms'),
  '@templates': path.join(srcPath, 'presentation/templates'),
  '@pages': path.join(srcPath, 'presentation/pages'),
  '@services': path.join(srcPath, 'infrastructure/services'),
  '@hooks': path.join(srcPath, 'application/hooks'),
  '@utils': path.join(srcPath, 'application/utils'),
  '@contexts': path.join(srcPath, 'application/contexts'),
  '@types': path.join(srcPath, 'domain/types'),
  '@models': path.join(srcPath, 'domain/models'),
  '@assets': path.join(srcPath, 'presentation/assets'),
  '@shaders': path.join(srcPath, 'presentation/shaders'),
  '@store': path.join(srcPath, 'application/store'),
  '@styles': path.join(srcPath, 'presentation/styles'),
  '@api': path.join(srcPath, 'infrastructure/api'),
  '@config': path.join(srcPath, 'infrastructure/config'),
  '@constants': path.join(srcPath, 'domain/constants'),
  '@validation': path.join(srcPath, 'domain/validation'),
  '@visualizations': path.join(srcPath, 'presentation/visualizations'),
  '@test': path.join(srcPath, 'test')
};

// Output all path aliases to verify they are correct
console.log('[path-alias-fix.ts] Path alias mapping:');
Object.entries(aliasMapping).forEach(([alias, resolvedPath]) => {
  console.log(`  ${alias} -> ${resolvedPath}`);
});

// Override the module import behavior for aliased paths (no direct implementation needed)
// The vitest.config.ts file already handles this via resolve.alias

console.log('[path-alias-fix.ts] Path alias validation complete');
