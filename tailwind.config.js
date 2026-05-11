/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          primary: "#1F2937",
          dark: "#111827",
          accent: "#10B981",
          secondary: "#4F46E5",
          info: "#06B6D4",
        },
        app: {
          background: "#F9FAFB",
          surface: "#FFFFFF",
          muted: "#F3F4F6",
          border: "#E5E7EB",
        },
        text: {
          main: "#111827",
          muted: "#6B7280",
          soft: "#374151",
        },
        status: {
          success: "#22C55E",
          successDark: "#166534",
          successBg: "#DCFCE7",
          warning: "#F97316",
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
