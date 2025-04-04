/**
 * Tailwind CSS Configuration for Novamind Digital Twin
 *
 * NOTE: This file uses CommonJS syntax as an exception to our TypeScript & ESM rule.
 * This exception is necessary because Tailwind officially recommends CommonJS configuration.
 * See frontend/docs/module-system-guidelines.md for details.
 */

// Defining the luxury enterprise color palette
const neuralPalette = {
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#A5C4FD',
    300: '#7EA6F9',
    400: '#5788F5',
    500: '#0066F0', // Primary brand color
    600: '#0057D2',
    700: '#0042A3',
    800: '#003380',
    900: '#00224D',
  },
  neural: {
    50: '#F7F7FB',
    100: '#EEEEF9',
    200: '#D8D7EF',
    300: '#BCBBE2',
    400: '#9A98D0',
    500: '#8582C3',
    600: '#6B68B1',
    700: '#5D599E',
    800: '#454281',
    900: '#332F66',
  },
  semantic: {
    success: '#16A34A',
    warning: '#F59E0B',
    danger: '#DC2626',
    info: '#0891B2',
  },
  luxury: {
    gold: '#D4AF37',
    silver: '#C0C0C0',
    platinum: '#E5E4E2',
    obsidian: '#0D0221',
  },
  gray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },
};

module.exports = {
  content: [
    './src/**/*.{ts,tsx}',
    './index.html',
  ],
  darkMode: 'class', // Use class-based dark mode for more control
  theme: {
    extend: {
      colors: {
        // Main color scheme
        primary: neuralPalette.primary,
        neural: neuralPalette.neural,
        gray: neuralPalette.gray,
        
        // Semantic colors
        success: neuralPalette.semantic.success,
        warning: neuralPalette.semantic.warning,
        danger: neuralPalette.semantic.danger,
        info: neuralPalette.semantic.info,
        
        // Luxury accents
        luxury: neuralPalette.luxury,
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      boxShadow: {
        // Neuromorphic shadows for a modern look
        neuro: '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff',
        'neuro-inset': 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
        'neuro-dark': '5px 5px 10px #151a25, -5px -5px 10px #2c3549',
        'luxury': '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
        'clinical': '0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'neural-pulse': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      borderRadius: {
        'clinical': '0.5rem',
        'neuro': '1rem',
      },
      typography: {
        DEFAULT: {
          css: {
            color: neuralPalette.gray[800],
            a: {
              color: neuralPalette.primary[600],
              '&:hover': {
                color: neuralPalette.primary[500],
              },
            },
            h1: {
              fontWeight: 700,
              color: neuralPalette.gray[900],
            },
            h2: {
              fontWeight: 600,
              color: neuralPalette.gray[900],
            },
            h3: {
              fontWeight: 600,
              color: neuralPalette.gray[900],
            },
            h4: {
              fontWeight: 600,
              color: neuralPalette.gray[900],
            }
          },
        },
      },
    },
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
  // Add this line to ensure compatibility with Tailwind v3
  corePlugins: {
    preflight: true,
  },
};