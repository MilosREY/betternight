import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#09131A",
        sky: "#2F6BFF",
        mint: "#0E9F84",
        cloud: "#EFF6F5",
        line: "rgba(9, 19, 26, 0.08)",
        mist: "#64707A"
      },
      fontFamily: {
        sans: ['"Avenir Next"', '"Segoe UI"', '"Helvetica Neue"', "sans-serif"],
        display: ['"Avenir Next"', '"Trebuchet MS"', '"Segoe UI"', "sans-serif"]
      },
      boxShadow: {
        soft: "0 20px 60px rgba(16, 41, 56, 0.08)",
        float: "0 14px 40px rgba(47, 107, 255, 0.12)"
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(14,159,132,0.14), transparent 36%), radial-gradient(circle at top right, rgba(47,107,255,0.16), transparent 30%)"
      }
    }
  },
  plugins: []
};

export default config;
