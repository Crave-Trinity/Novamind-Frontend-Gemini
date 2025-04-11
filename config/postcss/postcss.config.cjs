/* eslint-disable */

/**
 * PostCSS Configuration for Novamind Digital Twin
 *
 * CommonJS configuration for PostCSS with Tailwind CSS v3.4.
 * Uses .cjs extension to explicitly mark as CommonJS module per project guidelines.
 */

module.exports = {
  plugins: {
    'postcss-import': {}, // Add postcss-import first
    'tailwindcss/nesting': {},
    tailwindcss: { config: './config/tailwind/tailwind.config.cjs' },
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production'
      ? {
          cssnano: {
            preset: ['default', { discardComments: { removeAll: true } }],
          },
        }
      : {}),
  },
};
