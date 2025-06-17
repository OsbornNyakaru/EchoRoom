/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        aurora: {
          '0%, 100%': { 'background-position': '0% 50%, 0% 0%, 0% 0%, 0% 0%' },
          '25%': { 'background-position': '100% 50%, 100% 100%, 0% 0%, 100% 100%' },
          '50%': { 'background-position': '100% 0%, 50% 50%, 100% 100%, 50% 50%' },
          '75%': { 'background-position': '0% 100%, 0% 100%, 50% 50%, 0% 0%' },
        },
        gradientShift: {
          '0%, 100%': { 'background-position': '0% 50%, 0% 50%' },
          '50%': { 'background-position': '100% 50%, 100% 50%' },
        },
        float: {
          '0%': { transform: 'translateY(100vh) translateX(0px) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-100px) translateX(100px) rotate(360deg)', opacity: '0' },
        },
        ripple: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 180, 162, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 180, 162, 0.6)' },
        },
      },
      animation: {
        aurora: 'aurora 25s ease infinite',
        gradientShift: 'gradientShift 20s ease infinite',
        float: 'float 15s infinite linear',
        ripple: 'ripple 2s infinite',
        breathe: 'breathe 4s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};