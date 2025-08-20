import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // XR Theme Colors
        neon: {
          blue: '#00f0ff',
          purple: '#8000ff',
          pink: '#ff0080',
          green: '#00ff80',
          yellow: '#ffff00',
        },
        glass: {
          50: 'rgba(255, 255, 255, 0.02)',
          100: 'rgba(255, 255, 255, 0.05)',
          200: 'rgba(255, 255, 255, 0.08)',
          300: 'rgba(255, 255, 255, 0.12)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite alternate',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'fadeIn': 'fadeIn 0.6s ease-out',
        'slideUp': 'slideUp 0.8s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%': { 
            textShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
          },
          '100%': {
            textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
          },
        },
        glow: {
          '0%': { 
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
          },
          '100%': {
            boxShadow: '0 0 40px rgba(0, 240, 255, 0.7), 0 0 60px rgba(0, 240, 255, 0.3)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;