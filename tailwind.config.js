/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        terminal: {
          bg: "#0d130b",
          panel: "#1a2617",
          border: "#2d4a28",
          phosphor: "#39ff14",
          phosphorDim: "#1f9c0d",
          rust: "#b7410e",
          rustLight: "#d4691a",
          paper: "#d4c4a8",
          paperDark: "#a89878",
          alert: "#ff3b30",
          amber: "#d4a017",
          ink: "#1a1410",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "'Courier New'", "monospace"],
        display: ["'Special Elite'", "'Courier Prime'", "serif"],
        body: ["'VT323'", "'Courier New'", "monospace"],
      },
      boxShadow: {
        phosphor: "0 0 8px rgba(57, 255, 20, 0.5), inset 0 0 4px rgba(57, 255, 20, 0.1)",
        "phosphor-lg": "0 0 16px rgba(57, 255, 20, 0.6), inset 0 0 8px rgba(57, 255, 20, 0.15)",
        rust: "0 0 8px rgba(183, 65, 14, 0.5)",
        panel: "inset 0 0 30px rgba(0, 0, 0, 0.5), 0 4px 20px rgba(0, 0, 0, 0.6)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        flicker: "flicker 0.15s infinite",
        scanline: "scanline 8s linear infinite",
        blink: "blink 1s step-end infinite",
        glitch: "glitch 2s infinite",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.97" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-1px, 1px)" },
          "40%": { transform: "translate(-1px, -1px)" },
          "60%": { transform: "translate(1px, 1px)" },
          "80%": { transform: "translate(1px, -1px)" },
        },
      },
      gridTemplateColumns: {
        13: "repeat(13, minmax(0, 1fr))",
      },
    },
  },
  plugins: [],
};
