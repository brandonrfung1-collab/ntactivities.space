import type { Config } from 'tailwindcss';

/**
 * ntactivity.space design tokens.
 *
 * Palette is "leafy New England suburb": deep forest greens, warm paper-cream
 * neutrals, and a muted maple/rust accent for seasonal moments. All colors are
 * exposed as HSL CSS variables (see src/app/globals.css) so shadcn/ui
 * primitives and dark mode work without duplicating values.
 */
const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1280px' },
    },
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
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        /** Raw brand ramps, for illustration/decorative use. */
        forest: {
          50: '#f1f6f2',
          100: '#dcebe0',
          200: '#bad8c3',
          300: '#8ebd9d',
          400: '#5f9c74',
          500: '#3f7d56',
          600: '#2f5d3a',
          700: '#274b31',
          800: '#213c29',
          900: '#1c3223',
        },
        maple: {
          50: '#fdf5ef',
          100: '#fae6d6',
          200: '#f3c9ab',
          300: '#eaa478',
          400: '#df7a47',
          500: '#d15e2a',
          600: '#c05621',
          700: '#9c421c',
          800: '#7d361c',
          900: '#652e1a',
        },
        cream: {
          50: '#fefdfa',
          100: '#faf7f0',
          200: '#f3ece0',
          300: '#e7dcc9',
          400: '#d6c6aa',
          500: '#c2ad8b',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(33, 60, 41, 0.04), 0 8px 24px -12px rgba(33, 60, 41, 0.18)',
        lifted: '0 2px 4px rgba(33, 60, 41, 0.06), 0 16px 40px -16px rgba(33, 60, 41, 0.28)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'hero-pan': {
          from: { transform: 'scale(1.06) translate(0, 0)' },
          to: { transform: 'scale(1.14) translate(-1%, -1.5%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        'hero-pan': 'hero-pan 22s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
