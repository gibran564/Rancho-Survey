/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        rancho: {
          bg: '#0f0f0f',
          card: '#1a1a1a',
          card2: '#222222',
          green: '#2d7a2d',
          'green-light': '#3da03d',
          'green-glow': 'rgba(45,122,45,0.3)',
          brown: '#8B5A2B',
          'brown-light': '#a06830',
          border: '#333333',
        }
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', 'cursive'],
        barlow: ['Barlow', 'sans-serif'],
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      }
    }
  },
  plugins: []
}
