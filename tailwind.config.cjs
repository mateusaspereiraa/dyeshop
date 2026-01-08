module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dye: {
          black: '#000000',
          gray: {
            50: '#f8f8f8',
            100: '#f2f2f2',
            300: '#bdbdbd',
            500: '#6b6b6b'
          },
          yellow: '#FFD400',
          wood: '#8B5E3C'
        }
      }
    }
  },
  plugins: []
}