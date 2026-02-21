/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vibe: {
          green: '#00FF41',
          gold: '#FFD700',
          dark: '#0A0A0A',
        }
      },
    },
  },
  plugins: [],
}
