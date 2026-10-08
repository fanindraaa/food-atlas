/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/map/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neutral: {
          950: '#0a0d14',
          900: '#111827',
          850: '#1f2937',
          800: '#374151',
          700: '#4b5563',
          600: '#6b7280',
          500: '#9ca3af',
          400: '#d1d5db',
          300: '#e5e7eb',
          200: '#f3f4f6',
          100: '#f8f9fa',
          50: '#ffffff',
        },
        accent: {
          DEFAULT: '#0066ff',
          hover: '#0052cc',
          light: '#3385ff',
          soft: 'rgba(0, 102, 255, 0.08)',
          glow: 'rgba(0, 102, 255, 0.25)',
        },
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.82)',
          solid: '#ffffff',
          elevated: 'rgba(255, 255, 255, 0.92)',
          subtle: 'rgba(248, 249, 250, 0.85)',
          border: 'rgba(0, 0, 0, 0.06)',
        }
      },
      fontFamily: {
        sans: ['"Timeless Sans"', '"Timeless"', 'system-ui', 'sans-serif'],
        serif: ['"Timeless Serif"', '"Timeless Sans"', 'Georgia', 'serif'],
        mono: ['"Timeless Sans"', '"Timeless"', 'monospace'],
      },
      fontWeight: {
        medium: '500',
        semibold: '600',
      },
      fontSize: {
        'xs': ['12px', '16px'],
        'sm': ['13px', '18px'],
        'base': ['15px', '22px'],
        'md': ['17px', '24px'],
        'lg': ['20px', '26px'],
        'xl': ['24px', '30px'],
        '2xl': ['32px', '38px'],
        '3xl': ['42px', '48px'],
        '4xl': ['56px', '62px'],
      },
      borderRadius: {
        'xs': '8px',
        'sm': '12px',
        'md': '16px',
        'lg': '22px',
        'xl': '28px',
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(0, 0, 0, 0.03)',
        'soft': '0 8px 30px rgba(0, 0, 0, 0.07)',
        'elevated': '0 20px 48px rgba(0, 0, 0, 0.09)',
        'accent': '0 4px 18px rgba(0, 102, 255, 0.3)',
      }
    },
  },
  plugins: [],
};

