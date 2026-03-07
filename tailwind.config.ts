import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        graphite: {
          DEFAULT: '#0B0D10',
          light: '#11151B',
          mid: '#161A22',
          surface: '#1A1F2A',
        },
        gold: {
          DEFAULT: '#C6902E',
          muted: '#A07B2E',
          soft: '#D4A853',
        },
        crimson: '#FF4D4D',
        bone: '#E8E4DD',
        ash: '#9CA3AF',
      },
      letterSpacing: {
        tactical: '0.18em',
        wide2: '0.28em',
      },
      borderColor: {
        subtle: 'rgba(255,255,255,0.07)',
      },
    },
  },
  plugins: [],
} satisfies Config;
