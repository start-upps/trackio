// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#333333",
        input: "#333333",
        ring: "#666666",
        background: "#000000",
        foreground: "#ffffff",
        muted: {
          DEFAULT: "#1a1a1a",
          foreground: "#a3a3a3",
        },
        primary: {
          DEFAULT: "#ffffff",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#1a1a1a",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ff0000",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#333333",
          foreground: "#ffffff",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      gridTemplateColumns: {
        '53': 'repeat(53, minmax(0, 1fr))',
      },
      spacing: {
        '0.5': '0.125rem', // For finer control of the grid gap
        '3': '0.75rem',    // For the contribution squares
      },
      animation: {
        'scale-in': 'scaleIn 0.2s ease-in-out',
        'fade-in': 'fadeIn 0.2s ease-in-out',
      },
      keyframes: {
        scaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;