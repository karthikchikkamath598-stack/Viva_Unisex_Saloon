/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        viva: {
          black: '#0B0B0B',
          charcoal: '#151515',
          gold: '#D4A437',
          goldLight: '#F3C65F',
          goldDark: '#AA7C11',
          white: '#F5F5F5',
          gray: '#A0A0A0',
        }
      },
      fontFamily: {
        heading: ['"Playfair Display"', '"Cinzel"', 'serif'],
        body: ['"Poppins"', '"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #AA7C11 0%, #D4A437 50%, #F3C65F 100%)',
        'dark-gradient': 'linear-gradient(180deg, #151515 0%, #0B0B0B 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(212, 164, 55, 0.25)',
        'gold-glow-lg': '0 0 30px rgba(212, 164, 55, 0.5)',
      }
    },
  },
  plugins: [],
}
