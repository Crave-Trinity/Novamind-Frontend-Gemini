/**
 * PostCSS Configuration for Novamind Digital Twin
 * 
 * NOTE: This file uses CommonJS syntax as an exception to our TypeScript & ESM rule.
 * This exception is necessary because the PostCSS ecosystem expects CommonJS configuration.
 * See frontend/docs/module-system-guidelines.md for details.
 */

module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss': {},
    'postcss-nesting': {},
    'autoprefixer': {}
  }
};