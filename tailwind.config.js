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
          primary: "#0F2A4A",
          dark: "#0A1F36",
          accent: "#22A06B",
          secondary: "#1E3A5F",
          info: "#0EA5E9",
        },
        app: {
          background: "#F5F2EB",
          surface: "#FFFFFF",
          muted: "#EEE8DD",
          border: "#E4DDD0",
        },
        text: {
          main: "#0E2238",
          muted: "#6B7280",
          soft: "#314259",
        },
        status: {
          success: "#16A34A",
          successDark: "#166534",
          successBg: "#DCFCE7",
          warning: "#D97706",
          warningDark: "#92400E",
          warningBg: "#FEF3C7",
          danger: "#DC2626",
          dangerDark: "#991B1B",
          dangerBg: "#FEE2E2",
          infoBg: "#DBEAFE",
          infoDark: "#1E40AF",
        },
      },
    },
  },
  plugins: [],
};
