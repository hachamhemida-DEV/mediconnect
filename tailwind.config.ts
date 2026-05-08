import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['var(--font-arabic)', 'Tajawal', 'Noto Sans Arabic', 'sans-serif'],
        latin: ['var(--font-latin)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand palette derived from mockups
        brand: {
          50:  '#ecfdf7',
          100: '#d1faeb',
          200: '#a6f3d8',
          300: '#6de6bf',
          400: '#34d1a0',
          500: '#15b886', // primary teal-green
          600: '#089369',
          700: '#087557',
          800: '#095c47',
          900: '#0a4b3c',
        },
        sky: {
          500: '#2a9ed4',
          600: '#0f7fb5',
        },
        // Feature accent colors from mockups
        accent: {
          coral:   '#ff7a6c',
          orange:  '#f59e0b',
          yellow:  '#facc15',
          violet:  '#7c6ef2',
          purple:  '#a855f7',
          pink:    '#ec4899',
          red:     '#ef4444',
        },
        ink: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
          50:  '#f8fafc',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2a9ed4 0%, #15b886 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, #eff6ff 0%, #ecfdf5 100%)',
        'hero-mesh': 'radial-gradient(at 15% 20%, rgba(42,158,212,0.08) 0%, transparent 50%), radial-gradient(at 85% 80%, rgba(21,184,134,0.10) 0%, transparent 50%)',
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.04), 0 8px 24px -8px rgba(15, 23, 42, 0.08)',
        'card-lg': '0 4px 12px rgba(15, 23, 42, 0.06), 0 24px 48px -16px rgba(15, 23, 42, 0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out both',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
