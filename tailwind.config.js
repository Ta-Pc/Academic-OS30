const tokens = require('./packages/ui/design-tokens.json');

module.exports = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx}",
    "./app/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./packages/ui/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
          xl: '2.5rem',
        },
      },
      colors: tokens.colors,
      fontFamily: {
        sans: tokens.typography.fontFamilySans,
      },
      borderRadius: tokens.radii,
    },
  },
  plugins: [],
};


