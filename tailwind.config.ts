/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {
      screens: {
        xs: '450px',
      },
      colors: {
        success: '#2FD35D',
        danger: '#f44336',
        grey: '#C4C4C4',
      },
      fontFamily: {
        bebas: "Bebas Neue",
      },
    },
  },
  plugins: [],
};
