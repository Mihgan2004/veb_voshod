import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        graphite: '#0B0D10',
        'graphite-light': '#11151B',
        gold: '#C6902E',
        crimson: '#FF4D4D',
      },
    },
  },
  plugins: [],
} satisfies Config;
