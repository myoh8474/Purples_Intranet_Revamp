/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './pages/**/*.{html,js}',
    './src/**/*.{html,js,css}',
  ],
  theme: {
    extend: {
      colors: {
        /* 퍼플 브랜드 팔레트 */
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        /* 사이드바 배경 */
        sidebar: '#1e1145',
      },
      fontFamily: {
        sans: [
          'Pretendard Variable', 'Pretendard',
          '-apple-system', 'BlinkMacSystemFont',
          'Segoe UI', 'sans-serif',
        ],
      },
      fontSize: {
        '2xs': '0.6875rem', /* 11px */
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
        'glow-purple': '0 0 16px rgba(139,92,246,0.25)',
        'btn': '0 1px 2px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        'DEFAULT': '6px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-dot': 'pulseDot 2s infinite',
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
        pulseDot: {
          '0%, 100%': { boxShadow: '0 0 0 2px rgba(139,92,246,1)' },
          '50%': { boxShadow: '0 0 0 6px rgba(139,92,246,0.2)' },
        },
      },
    },
  },
  /* 기존 CSS 클래스와 충돌하지 않도록 설정 */
  important: false,
  corePlugins: {
    preflight: false, /* 기존 base.css 리셋 사용, Tailwind 리셋 비활성화 */
  },
  plugins: [],
};
