/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sf: {
          bg:       '#2E3440',   // Nord dark
          surface:  '#3B4252',   // Nord darker
          elevated: '#434C5E',   // Nord medium
          border:   '#4C566A',   // Nord light
          muted:    '#81A1C1',   // Nord frost
          text:     '#ECEFF4',   // Nord snow storm
          subtext:  '#D8DEE9',   // Nord snow
          primary:  '#88C0D0',   // Nord cyan
          'primary-dark': '#5E81AC',
          accent:   '#B48EAD',   // Nord purple
          success:  '#A3BE8C',   // Nord green
          warning:  '#EBCB8B',   // Nord yellow
          danger:   '#BF616A',   // Nord red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh': 'linear-gradient(135deg, #2E3440 0%, #3B4252 50%, #2E3440 100%)',
      }
    },
  },
  plugins: [],
}
