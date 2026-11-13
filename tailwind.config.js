/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tiktok: {
          cyan: "#00f2fe",
          red: "#fe2c55",
          pink: "#ff007f",
          dark: "#0b0c10",
          card: "#12141a",
          border: "#1f232e"
        }
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "sans-serif"],
      },
      keyframes: {
        glow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" }
        }
      },
      animation: {
        glow: "glow 2s ease-in-out infinite",
        float: "float 4s ease-in-out infinite"
      }
    },
  },
  plugins: [],
};
