/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6', // blue-500
          hover: '#2563EB', // blue-600
          focus: '#1D4ED8', // blue-700
        },
        secondary: {
          DEFAULT: '#6B7280', // gray-500
          hover: '#4B5563', // gray-600
        },
        dark: {
          background: '#111827', // gray-900
          card: '#1F2937',      // gray-800
          border: '#374151',    // gray-700
          text: '#F9FAFB',      // gray-50
          'text-secondary': '#9CA3AF', // gray-400
        },
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        headings: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
      },
      boxShadow: {
        'card': '0 4px 16px rgba(15,23,42,0.04)',
        'card-hover': '0 8px 24px rgba(15,23,42,0.08)',
        'popover': '0 12px 32px rgba(15,23,42,0.10)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    }
  },
  plugins: [],
}

