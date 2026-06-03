import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: { dark:'#2d2926', light:'#fafaf8', warm:'#c4a882', sage:'#6b8f71', blue:'#5b8bab', red:'#c4655a' },
        surface: { light:'#ffffff', dark:'#171717' },
        bg: { light:'#fafaf8', dark:'#0f0f0f' },
        border: { light:'#e8e6e0', dark:'#2a2a2a' },
        ink: { 1:'#1a1815', 2:'#6b6560', 'dk1':'#f0ede8', 'dk2':'#8a8580' },
      },
      fontFamily: {
        display: ['"Playfair Display"','Georgia','serif'],
        sans: ['"DM Sans"','system-ui','sans-serif'],
      },
      borderRadius: { btn:'12px', card:'16px', panel:'24px', pill:'999px' },
      boxShadow: {
        soft:'0 2px 8px rgba(0,0,0,0.08)',
        card:'0 8px 32px rgba(0,0,0,0.10)',
        hover:'0 16px 48px rgba(0,0,0,0.14)',
      },
    },
  },
  plugins: [],
}
export default config
