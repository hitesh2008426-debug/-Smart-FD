/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        surface: '#ffffff',
        border: '#e2e8f0',
        'border-strong': '#cbd5e1',
        text: {
          primary: '#0f172a',
          secondary: '#334155',
          muted: '#64748b',
        },
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        financial: {
          positive: '#047857',
          positiveBg: '#ecfdf5',
          positiveBorder: '#a7f3d0',
          warning: '#b45309',
          warningBg: '#fffbeb',
          warningBorder: '#fde68a',
          danger: '#b91c1c',
          dangerBg: '#fef2f2',
          dangerBorder: '#fecaca',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
