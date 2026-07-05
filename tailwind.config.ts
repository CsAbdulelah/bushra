import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        alinma: {
          navy: "#15233a",
          "navy-2": "#1d3460",
          "navy-3": "#2a4a78",
          warm: "#7d6e63",
          sand: "#f5ede8",
          cream: "#f9f7f5",
          bg: "#ede4d8",
          panel: "#f9f8f6",
          gold: "#c8a02a",
          green: "#3db557",
          red: "#e84545",
        },
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 6px rgba(0,0,0,0.05)",
        panel: "0 16px 56px rgba(0,0,0,0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
