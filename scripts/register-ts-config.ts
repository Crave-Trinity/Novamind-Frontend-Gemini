/**
 * TypeScript Configuration Registration for Vite
 * 
 * This script helps Vite properly load TypeScript configuration files
 * by registering the necessary hooks and loaders.
 */

import { register } from 'ts-node';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Register TypeScript with ts-node
register({
  project: path.join(projectRoot, 'tsconfig.json'),
  transpileOnly: true,
  compilerOptions: {
    module: 'ESNext',
    moduleResolution: 'Node',
    target: 'ES2020',
    esModuleInterop: true,
  },
});

// Export a function to load TypeScript configuration files
export function loadTsConfig(configPath: string): unknown {
  try {
    // Dynamically import the TypeScript configuration file
    return import(configPath).then(module => module.default);
  } catch (error) {
    console.error(`Error loading TypeScript configuration from ${configPath}:`, error);
    throw error;
  }
}

// Export a helper to register PostCSS configuration
export async function registerPostCssConfig(): Promise<unknown> {
  const configPath = path.join(projectRoot, 'postcss.config.ts');
  return loadTsConfig(configPath);
}

// Export a helper to register Tailwind configuration
export async function registerTailwindConfig(): Promise<unknown> {
  const configPath = path.join(projectRoot, 'tailwind.config.ts');
  return loadTsConfig(configPath);
}