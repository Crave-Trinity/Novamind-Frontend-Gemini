/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette for sleek, premium dark theme - Clinical precision color system
        primary: {
          50: '#E6F0FD',
          100: '#CCE0FC',
          200: '#99C2F9',
          300: '#66A3F6',
          400: '#3385F3',
          500: '#0066F0', // Primary brand color
          600: '#0052C0',
          700: '#003D90',
          800: '#002960',
          900: '#001430',
          950: '#000A19', // Ultra dark for extreme contrast scenarios
        },
        // Secondary accent colors - Neural activity visualization
        secondary: {
          50: '#F3F9FF',
          100: '#E6F4FF',
          200: '#CDE9FF',
          300: '#B4DDFF',
          400: '#9BD2FF',
          500: '#82C7FF', // Main accent color
          600: '#689FCC',
          700: '#4E7799',
          800: '#345066',
          900: '#1A2833',
          950: '#0D1419', // Ultra dark for extreme contrast scenarios
        },
        // Error/alert states - Clinical alert system
        danger: {
          50: '#FEE8E7',
          100: '#FDD1CF',
          200: '#FBA3A0',
          300: '#F87571',
          400: '#F64842',
          500: '#F41A13', // Critical alert color
          600: '#C3140F',
          700: '#920F0B',
          800: '#620A08',
          900: '#310504',
          950: '#190302', // Ultra dark for extreme contrast scenarios
        },
        // Warning system for moderate alerts
        warning: {
          50: '#FFFAEB',
          100: '#FFF5D6',
          200: '#FFEBAD',
          300: '#FFE085',
          400: '#FFD65C',
          500: '#FFCC33', // Warning alert color
          600: '#CCA329',
          700: '#997A1F',
          800: '#665214',
          900: '#33290A',
          950: '#191405', // Ultra dark for extreme contrast scenarios
        },
        // Success states for positive outcomes
        success: {
          50: '#E8F7ED',
          100: '#D1F0DA',
          200: '#A3E1B5',
          300: '#75D291',
          400: '#47C46C',
          500: '#19B548', // Success indicator color
          600: '#149039',
          700: '#0F6C2B',
          800: '#0A481D',
          900: '#05240E',
          950: '#021207', // Ultra dark for extreme contrast scenarios
        },
        // Clinical neutral tones - Enhanced for WCAG AAA compliance
        neutral: {
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
          500: '#ADB5BD',
          600: '#868E96',
          700: '#495057',
          800: '#343A40',
          900: '#212529',
          950: '#0D0F10', // Ultra dark for extreme contrast scenarios
        },
        // Premium dark theme background - Neural dark system
        background: {
          DEFAULT: '#0C0C0E', // Slightly darker for better contrast
          lighter: '#151517',
          card: '#1C1C1E',
          elevated: '#242428',
          input: '#2A2A2D',
          popup: '#333338',
        },
        // Brain region color mappings for visualizations
        brain: {
          frontal: '#3385F3',
          parietal: '#47C46C',
          temporal: '#FFCC33',
          occipital: '#F64842',
          cerebellum: '#82C7FF',
          brainstem: '#CED4DA',
          limbic: '#997A1F',
          default: '#868E96',
        },
        // Neural activation levels for brain visualization
        activation: {
          none: '#868E96',
          low: '#99C2F9',
          medium: '#3385F3',
          high: '#0052C0',
          critical: '#F41A13',
        }
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'monospace'],
        clinical: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }], // 10px - for very small indicator text
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
        '5xl': ['3rem', { lineHeight: '1' }],           // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
      },
      // 3D visualization effects - Enhanced with clinical precision
      boxShadow: {
        'neuron': '0 0 15px rgba(130, 199, 255, 0.5)',
        'active-neuron': '0 0 20px rgba(0, 102, 240, 0.7)',
        'critical-neuron': '0 0 25px rgba(244, 26, 19, 0.6)',
        'synapse': '0 0 8px rgba(71, 196, 108, 0.4)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'neurofeedback': '0 0 30px rgba(130, 199, 255, 0.8)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'tooltip': '0 2px 5px rgba(0, 0, 0, 0.15)',
      },
      // Custom animations for brain visualization - Neural-responsive interactions
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-rapid': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-critical': 'glow-critical 1s ease-in-out infinite alternate',
        'synaptic-pulse': 'synaptic-pulse 3s ease-in-out infinite',
        'neural-spin': 'spin 10s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in-bottom': 'slideInBottom 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'data-stream': 'dataStream 5s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(130, 199, 255, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(130, 199, 255, 0.7)' },
        },
        'glow-critical': {
          '0%': { boxShadow: '0 0 5px rgba(244, 26, 19, 0.4)' },
          '100%': { boxShadow: '0 0 25px rgba(244, 26, 19, 0.8)' },
        },
        'synaptic-pulse': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.97)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInBottom: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        dataStream: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      // Precision spacing for neuropsychiatric UI
      spacing: {
        '4.5': '1.125rem', // 18px
        '13': '3.25rem',   // 52px
        '18': '4.5rem',    // 72px
        '22': '5.5rem',    // 88px
        '128': '32rem',    // 512px
        '144': '36rem',    // 576px
      },
      // Z-index system for layered neural visualizations
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      // Border radius system for neurofeedback componentry
      borderRadius: {
        '4xl': '2rem',    // 32px
        '5xl': '2.5rem',  // 40px
        '6xl': '3rem',    // 48px
      },
      // Backdrop blur effects for neural layering
      backdropBlur: {
        xs: '2px',
      },
      // Aspect ratios for visualization containers
      aspectRatio: {
        'brain': '4/3',
        'brain-side': '3/4',
        'eeg': '16/9',
      },
      // Custom stroke widths for neural connectivity lines
      strokeWidth: {
        '3': '3',
        '5': '5',
        '6': '6',
      },
      // Screen height and width percentages for neuroimaging
      height: {
        'screen-90': '90vh',
        'screen-80': '80vh',
        'screen-70': '70vh',
      },
      width: {
        'screen-90': '90vw',
        'screen-80': '80vw',
        'screen-70': '70vw',
      },
    },
  },
  // Extended variants for neural interface state management
  variants: {
    extend: {
      backgroundColor: ['active', 'group-focus', 'focus-visible', 'disabled'],
      borderColor: ['active', 'group-focus', 'focus-visible', 'disabled'],
      opacity: ['disabled', 'group-hover', 'group-focus'],
      scale: ['group-hover', 'group-focus', 'active'],
      textColor: ['active', 'group-focus', 'focus-visible', 'disabled'],
      textOpacity: ['active', 'group-focus', 'focus-visible', 'disabled'],
      ringColor: ['hover', 'active', 'focus-visible'],
      ringWidth: ['hover', 'active', 'focus-visible'],
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class', // Only generate styles for forms with class-based approach
    }),
    require('@tailwindcss/typography'), // For markdown/rich text content
    require('@tailwindcss/aspect-ratio'), // For maintaining aspect ratios in visualization components
    require('@tailwindcss/container-queries'), // For container-based responsive design
  ],
  // Support for dark mode - NOVAMIND's primary interface mode
  darkMode: 'class',
  // Performance optimization - reduce bundle size
  future: {
    hoverOnlyWhenSupported: true, // Only apply hover styles on devices that support hover
    respectDefaultRingColorOpacity: true,
    disableColorOpacityUtilitiesByDefault: true, // Use opacity utilities explicitly
    purgeLayersByDefault: true,
  },
  // Core plugin optimization - reduce unused CSS
  corePlugins: {
    // Disable rarely-used plugins for performance
    placeholderOpacity: false,
    ringOpacity: false,
    textOpacity: false,
    backdropOpacity: false,
  },
}
