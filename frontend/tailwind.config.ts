import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Elleva DZ brand tokens — derived from the logo
        rose: {
          50: "#FFF3F7",
          100: "#FFE2EC",
          200: "#FFC1D8",
          300: "#FF8FB8",
          400: "#F94F90",
          500: "#E0156A", // primary bright magenta (matches "Elleva" wordmark)
          600: "#C20F5A",
          700: "#9C0E4A",
        },
        wine: {
          50: "#FBF1F6",
          100: "#F0D6E6",
          300: "#B14E84",
          500: "#7A1352", // deep plum/wine (matches the "dz" cursive)
          600: "#5E0E3F",
          700: "#440A2D",
          900: "#260619",
        },
        sand: {
          50: "#FDFBF8",
          100: "#FAF6F0",
          200: "#F1E9DE",
        },
        ink: {
          DEFAULT: "#1E1620",
          soft: "#4A3F47",
        },
        gold: {
          400: "#D4AF6A",
          500: "#C19A4B",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
      backgroundImage: {
        "rise-gradient": "linear-gradient(135deg, #E0156A 0%, #B5165F 45%, #7A1352 100%)",
        "rise-gradient-soft": "linear-gradient(135deg, #FFE2EC 0%, #F8DCEC 50%, #EBD6E8 100%)",
      },
      boxShadow: {
        bloom: "0 20px 60px -20px rgba(122, 19, 82, 0.35)",
        card: "0 8px 30px -12px rgba(30, 22, 32, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        rise: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "draw-stroke": {
          "0%": { strokeDashoffset: "1" },
          "100%": { strokeDashoffset: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        rise: "rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;

