/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        background: "url('../app/assets/images/background.png')",
      },
      colors: {
        primary: '#BEA3D7',
        secondary: '#955FD3',
        back: '#BEA3D7',
        text: '#4C4452',
        light: '#FCDDE3',
        dark: '#9083B3',
        darkpale: '#B1A8B9',
        accent: '#D39AC5',
        edit: '#637EBA',
        remove: '#BA7263'
      }
    },
  },
  plugins: [],
}