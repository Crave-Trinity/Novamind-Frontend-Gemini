/**
 * Tailwind CSS Configuration for Novamind Digital Twin
 * 
 * CommonJS configuration for Tailwind CSS v3.4.
 * Uses .cjs extension to explicitly mark as CommonJS module per project guidelines.
 */

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["var(--font-display)"],
      },
      colors: {
        // Primary brand colors
        primary: {
          50: "oklch(0.97 0.025 250)",
          100: "oklch(0.95 0.05 250)",
          200: "oklch(0.9 0.075 250)",
          300: "oklch(0.85 0.10 250)",
          400: "oklch(0.75 0.125 250)",
          500: "oklch(0.65 0.15 250)",
          600: "oklch(0.6 0.175 250)",
          700: "oklch(0.52 0.15 250)",
          800: "oklch(0.45 0.125 250)",
          900: "oklch(0.4 0.10 250)",
          950: "oklch(0.35 0.075 250)",
        },
        
        // Neural visualization colors
        neural: {
          50: "oklch(0.97 0.025 290)",
          100: "oklch(0.95 0.05 290)",
          200: "oklch(0.9 0.075 290)",
          300: "oklch(0.85 0.10 290)",
          400: "oklch(0.75 0.125 290)",
          500: "oklch(0.65 0.15 290)",
          600: "oklch(0.6 0.175 290)",
          700: "oklch(0.52 0.15 290)",
          800: "oklch(0.45 0.125 290)",
          900: "oklch(0.4 0.10 290)",
          950: "oklch(0.35 0.075 290)",
        },
        
        // Clinical status colors
        danger: "oklch(0.65 0.18 25)",
        warning: "oklch(0.8 0.12 85)",
        success: "oklch(0.65 0.15 155)",
        info: "oklch(0.65 0.15 250)",
        
        // Luxury accent colors
        luxury: {
          gold: "oklch(0.85 0.1 85)",
          silver: "oklch(0.85 0.03 250)",
          platinum: "oklch(0.9 0.02 250)",
          obsidian: "oklch(0.15 0.01 250)",
        },
      },
      
      borderRadius: {
        'xs': '0.125rem',
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'clinical': '0.5rem',
        'neuro': '1rem',
      },
      
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'clinical': '0 2px 8px -2px rgb(0 0 0 / 0.08)',
        'neuro': '0 4px 20px -2px rgb(0 0 0 / 0.1), 0 0px 5px -3px rgb(var(--color-neural-500) / 0.2)',
        'luxury': '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 5px 10px -5px rgb(var(--color-luxury-gold) / 0.2)',
      },
      
      blur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '48px',
      },
      
      animation: {
        'neural-pulse': 'neuralPulse 3s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95)',
        'neural-glow': 'neuralGlow 6s infinite alternate ease-in-out',
      },
      
      keyframes: {
        neuralPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
        },
        neuralGlow: {
          '0%': { filter: 'brightness(1) blur(0)' },
          '50%': { filter: 'brightness(1.2) blur(1px)' },
          '100%': { filter: 'brightness(1) blur(0)' },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}