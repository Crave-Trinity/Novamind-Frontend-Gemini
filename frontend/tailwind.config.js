/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette for sleek, premium dark theme
        primary: {
          50: '#E6F0FD',
          100: '#CCE0FC',
          200: '#99C2F9',
          300: '#66A3F6',
          400: '#3385F3',
          500: '#0066F0',
          600: '#0052C0',
          700: '#003D90',
          800: '#002960',
          900: '#001430',
        },
        // Secondary accent colors
        secondary: {
          50: '#F3F9FF',
          100: '#E6F4FF',
          200: '#CDE9FF',
          300: '#B4DDFF',
          400: '#9BD2FF',
          500: '#82C7FF',
          600: '#689FCC',
          700: '#4E7799',
          800: '#345066',
          900: '#1A2833',
        },
        // Error/alert states
        danger: {
          50: '#FEE8E7',
          100: '#FDD1CF',
          200: '#FBA3A0',
          300: '#F87571',
          400: '#F64842',
          500: '#F41A13',
          600: '#C3140F',
          700: '#920F0B',
          800: '#620A08',
          900: '#310504',
        },
        // Clinical neutral tones
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
        },
        // Premium dark theme background
        background: {
          DEFAULT: '#121212',
          lighter: '#181818',
          card: '#1E1E1E',
          elevated: '#242424',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      // 3D visualization effects
      boxShadow: {
        'neuron': '0 0 15px rgba(130, 199, 255, 0.5)',
        'active-region': '0 0 25px rgba(244, 26, 19, 0.6)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      // Custom animations for brain visualization
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(130, 199, 255, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(130, 199, 255, 0.7)' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
