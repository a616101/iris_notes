/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1E40AF',
          yellow: '#FBBF24',
          'yellow-light': '#FDE68A',
          red: '#E11D48',
          cream: '#FFFBEB',
        },
      },
      fontFamily: {
        sans: ['Noto Sans TC', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};

