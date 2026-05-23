/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          primary: "rgb(var(--color-brand-primary) / <alpha-value>)",
          dark: "rgb(var(--color-brand-dark) / <alpha-value>)",
          accent: "rgb(var(--color-brand-accent) / <alpha-value>)",
          secondary: "rgb(var(--color-brand-secondary) / <alpha-value>)",
        },
        app: {
          background: "rgb(var(--color-app-background) / <alpha-value>)",
          sidebar: "rgb(var(--color-app-sidebar) / <alpha-value>)",
          surface: "rgb(var(--color-app-surface) / <alpha-value>)",
          surfaceSoft: "rgb(var(--color-app-surface-soft) / <alpha-value>)",
          muted: "rgb(var(--color-app-muted) / <alpha-value>)",
          border: "rgb(var(--color-app-border) / <alpha-value>)",
        },
        text: {
          main: "rgb(var(--color-text-main) / <alpha-value>)",
          muted: "rgb(var(--color-text-muted) / <alpha-value>)",
          soft: "rgb(var(--color-text-soft) / <alpha-value>)",
        },
        status: {
          success: "rgb(var(--color-status-success) / <alpha-value>)",
          successDark: "rgb(var(--color-status-success-dark) / <alpha-value>)",
          successBg: "rgb(var(--color-status-success-bg) / <alpha-value>)",
          warning: "rgb(var(--color-status-warning) / <alpha-value>)",
          warningDark: "rgb(var(--color-status-warning-dark) / <alpha-value>)",
          warningBg: "rgb(var(--color-status-warning-bg) / <alpha-value>)",
          danger: "rgb(var(--color-status-danger) / <alpha-value>)",
          dangerDark: "rgb(var(--color-status-danger-dark) / <alpha-value>)",
          dangerBg: "rgb(var(--color-status-danger-bg) / <alpha-value>)",
          infoBg: "rgb(var(--color-status-info-bg) / <alpha-value>)",
          infoDark: "rgb(var(--color-status-info-dark) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
