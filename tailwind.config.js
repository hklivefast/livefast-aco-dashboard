/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        y2k: ["'Orbitron'", "sans-serif"],
        body: ["'Outfit'", "'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "'SF Mono'", "monospace"],
      },
      colors: {
        lf: {
          dark: "#0a0a0a",
          darkAlt: "#0f0f0f",
          light: "#f5f5f0",
          lightAlt: "#eeeee8",
        },
      },
    },
  },
  plugins: [],
};
