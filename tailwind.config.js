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
          950: '#000000',
          900: '#111111',
          850: '#222222',
          800: '#333333',
          700: '#555555',
          600: '#777777',
          500: '#999999',
          400: '#bbbbbb',
          300: '#dddddd',
          200: '#eeeeee',
          100: '#f5f5f5',
          50: '#ffffff',
        },
        ink: {
          DEFAULT: '#111111',
          dark: '#000000',
          medium: '#333333',
          muted: '#777777',
          light: '#999999',
        },
        surface: {
          DEFAULT: '#ffffff',
          dim: '#f5f5f5',
          panel: '#ffffff',
          border: '#dddddd',
        }
      },
      fontFamily: {
        sans: ['"Timeless Sans"', '"Timeless"', 'sans-serif'],
        serif: ['"Timeless Sans"', '"Timeless"', 'sans-serif'],
        mono: ['"Timeless Sans"', '"Timeless"', 'sans-serif'],
      },
      fontWeight: {
        medium: '500',
        semibold: '600',
      },
      fontSize: {
        'xs': ['12px', '16px'],
        'sm': ['13px', '18px'],
        'base': ['15px', '22px'],
        'lg': ['18px', '26px'],
        'xl': ['22px', '28px'],
        '2xl': ['28px', '34px'],
        '3xl': ['36px', '42px'],
        '4xl': ['48px', '54px'],
        '5xl': ['64px', '70px'],
      },
      boxShadow: {
        'mechanical': '0 3px 0 #111111, 0 5px 10px rgba(0, 0, 0, 0.08)',
        'mechanical-hover': '0 4px 0 #111111, 0 7px 14px rgba(0, 0, 0, 0.12)',
        'mechanical-active': '0 1px 0 #111111, 0 2px 4px rgba(0, 0, 0, 0.08)',
        'instrument': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'hairline': '0 0 0 1px #dddddd',
      }
    },
  },
  plugins: [],
};
