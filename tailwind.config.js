// eslint-disable-next-line no-undef
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',  
  ],
  theme: {
    extend: {
      boxShadow: {
        '2xl-white': '0 25px 50px 0 rgba(255, 255, 255, 0.25)',
      },
      fontFamily: {
        'player': ['Montserrat', 'ui-sans-serif', 'system-ui']
      }
    },
  },
  plugins: [],
}
