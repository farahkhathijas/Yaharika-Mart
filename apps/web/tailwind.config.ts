import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─── Forest Green — Primary ─────────────────────────────────────────
        primary: {
          DEFAULT: '#0F5132',
          50: '#E8F3ED',
          100: '#C7E4D5',
          200: '#9ECFB3',
          300: '#5F9C7C',
          400: '#2E7A55',
          500: '#0F5132',
          600: '#0D4529',
          700: '#0B3D26',
          800: '#082E1C',
          900: '#072919',
          foreground: '#FFFFFF',
        },
        // ─── Ivory / Warm Beige — Secondary ────────────────────────────────
        secondary: {
          DEFAULT: '#F5EFE0',
          50: '#FFFDF8',
          100: '#FFFDF8',
          200: '#F9F4E9',
          300: '#F0E6CF',
          400: '#EADDC0',
          500: '#E8D9B5',
          foreground: '#1C2B22',
        },
        // ─── Accent Colors ──────────────────────────────────────────────────
        'accent-gold': { DEFAULT: '#C9A227', light: '#F0C84A', dark: '#A07D15' },
        'accent-amber': { DEFAULT: '#E8A33D', light: '#F5C170', dark: '#C07520' },
        'accent-coral': { DEFAULT: '#E76F51', light: '#F49377', dark: '#C04A2D' },
        // ─── Backgrounds ───────────────────────────────────────────────────
        background: {
          DEFAULT: '#FAF7F0',
          sand: '#F3ECDD',
          dark: '#0E1712',
        },
        foreground: {
          DEFAULT: '#1C2B22',
          muted: '#4A5D50',
        },
        // ─── Semantic ──────────────────────────────────────────────────────
        success: { DEFAULT: '#1E8E5A', light: '#E8F8F0' },
        warning: { DEFAULT: '#E8A33D', light: '#FDF3E3' },
        danger: { DEFAULT: '#D64545', light: '#FDECEC' },
        info: { DEFAULT: '#0F5132', light: '#E8F3ED' },
        // ─── Card / Surface ─────────────────────────────────────────────────
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#16241C',
          foreground: '#1C2B22',
        },
        border: { DEFAULT: '#C7E4D5', muted: '#E8F3ED' },
        input: '#E8F3ED',
        ring: '#0F5132',
        muted: { DEFAULT: '#F3ECDD', foreground: '#4A5D50' },
        accent: { DEFAULT: '#E8F3ED', foreground: '#0F5132' },
        popover: { DEFAULT: '#FFFFFF', foreground: '#1C2B22' },
        destructive: { DEFAULT: '#D64545', foreground: '#FFFFFF' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-sm': ['1.875rem', { lineHeight: '1.25' }],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 2px 20px rgba(15, 81, 50, 0.08)',
        'card-hover': '0 8px 40px rgba(15, 81, 50, 0.14)',
        glass: '0 4px 30px rgba(15, 81, 50, 0.06)',
        glow: '0 0 20px rgba(15, 81, 50, 0.25)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #FAF7F0 0%, #F5EFE0 50%, #E8F3ED 100%)',
        'gradient-primary': 'linear-gradient(135deg, #0F5132 0%, #0B3D26 100%)',
        'gradient-gold': 'linear-gradient(135deg, #C9A227 0%, #A07D15 100%)',
        'gradient-card': 'linear-gradient(145deg, #FFFFFF 0%, #F9F7F2 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 3s ease-in-out infinite',
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(15, 81, 50, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(15, 81, 50, 0)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [animate],
};

export default config;
