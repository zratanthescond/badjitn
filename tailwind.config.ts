/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          "50": "#F6F8FD",
          "500": "#624CF5",
          "600": "#4F39D8",
          "hover": "#705CF7",
        },
        elite: {
          charcoal: "#0A0A0C",
          zinc: "#18181B",
          cyan: "#20D5EC",
          violet: "#624CF5",
        },
        coral: {
          "500": "#15BF59",
        },
        grey: {
          "50": "#F6F6F6",
          "400": "#AFAFAF",
          "500": "#757575",
          "600": "#545454",
        },
        black: "#000000",
        white: "#FFFFFF",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
      },
      fontFamily: {
        poppins: ["var(--font-poppins)"],
        syne: ["var(--font-syne)"],
        outfit: ["var(--font-outfit)"],
        youtube: ["var(--font-youtube-sans)"],
      },
      backgroundImage: {
        "dotted-pattern": "url('/assets/images/dotted-pattern.png')",
        "hero-img": "url('/assets/images/hero.png')",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
        "elite-gradient": "linear-gradient(to right, #624CF5, #20D5EC)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1.25rem",
        "2xl": "1.75rem",
        "3xl": "2.5rem",
      },
      boxShadow: {
        "elite-soft": "0 20px 40px -15px rgba(0, 0, 0, 0.3)",
        "elite-glow": "0 0 20px -5px rgba(98, 76, 245, 0.5)",
      },
      transitionTimingFunction: {
        "elite-spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "audio-bar-1": {
          "0%, 100%": { height: "20%" },
          "50%": { height: "70%" },
        },
        "audio-bar-2": {
          "0%, 100%": { height: "40%" },
          "50%": { height: "90%" },
        },
        "audio-bar-3": {
          "0%, 100%": { height: "30%" },
          "50%": { height: "80%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "audio-bar-1": "audio-bar-1 0.6s ease-in-out infinite",
        "audio-bar-2": "audio-bar-2 0.7s ease-in-out infinite",
        "audio-bar-3": "audio-bar-3 0.8s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
