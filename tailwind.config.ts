import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        sxsw: {
          pink: "#FF2D87",
          black: "#0B0B0F",
          ink: "#1A1A22",
          stone: "#E7E5DF",
          cream: "#F6F4EE",
          lime: "#C9F03B",
          plum: "#5B2A86"
        }
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Inter", "sans-serif"],
        display: ["Georgia", "ui-serif", "serif"]
      }
    }
  },
  plugins: []
};
export default config;
