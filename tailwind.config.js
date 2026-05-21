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
          primary: "#0B1B3B",
          dark: "#07152E",
          accent: "#22A06B",
          secondary: "#1E3A5F",
        },
        app: {
          background: "#FEFDFB",
          sidebar: "#FAF8F4",
          surface: "#FFFFFF",
          surfaceSoft: "#FBF8F2",
          muted: "#F3F1EA",
          border: "#E8E2D8",
        },
        text: {
          main: "#111827",
          muted: "#6B7280",
          soft: "#374151",
        },
        status: {
          success: "#16A34A",
          successDark: "#166534",
          successBg: "#DCFCE7",
          warning: "#F59E0B",
          warningDark: "#92400E",
          warningBg: "#FEF3C7",
          danger: "#EF4444",
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
