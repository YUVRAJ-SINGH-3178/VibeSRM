/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        display: ['var(--font-heading)', 'sans-serif'],
      },
      borderRadius: {
        '3xl': 'var(--radius-lg)',
        '2xl': 'var(--radius-md)',
        'xl': 'calc(var(--radius-md) - 4px)',
      },
      colors: {
        background: 'var(--bg-page)',
        card: 'var(--bg-card)',
        'card-hover': 'var(--bg-card-hover)',
        foreground: 'var(--text-primary)',
        'foreground-muted': 'var(--text-secondary)',
        border: 'var(--border-color)',
        vibe: {
          dark: '#050507',
          card: '#0F0F16',
          purple: 'var(--accent-primary)',
          cyan: 'var(--accent-secondary)',
          rose: '#F43F5E',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
