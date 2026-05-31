import forms from "@tailwindcss/forms";
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/actions/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#16a34a",
          light: "#86efac",
          dark: "#15803d",
          foreground: "#ffffff",
        },
        accent: {
          gold: "#d97706",
          urgentBg: "#fef3c7",
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontSize: {
        "display-mobile": ["3rem", { lineHeight: "1.15" }],
        "display-tablet": ["3.75rem", { lineHeight: "1.12" }],
        "display-desktop": ["4.5rem", { lineHeight: "1.1" }],
        "h1-mobile": ["1.5rem", { lineHeight: "1.375" }],
        "h1-tablet": ["1.875rem", { lineHeight: "1.375" }],
        "h1-desktop": ["2.25rem", { lineHeight: "1.375" }],
        "h2-mobile": ["1.25rem", { lineHeight: "1.375" }],
        "h2-desktop": ["1.5rem", { lineHeight: "1.375" }],
        "h3-mobile": ["1rem", { lineHeight: "1.5" }],
        "h3-desktop": ["1.125rem", { lineHeight: "1.5" }],
        "body-mobile": ["0.875rem", { lineHeight: "1.625" }],
        "body-desktop": ["1rem", { lineHeight: "1.625" }],
        "caption-mobile": ["0.75rem", { lineHeight: "1.5" }],
        "caption-desktop": ["0.875rem", { lineHeight: "1.5" }],
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "var(--font-tajawal)", "system-ui", "sans-serif"],
        cairo: ["var(--font-cairo)", "Cairo", "sans-serif"],
        palestine: ["Thmanyah Serif Display", "serif"],
        thmanyah: ["Thmanyah Serif Display", "serif"],
      },
    },
  },
  plugins: [
    animate,
    forms,
    plugin(({ addVariant }) => {
      addVariant("rtl", '[dir="rtl"] &');
      addVariant("ltr", '[dir="ltr"] &');
    }),
  ],
};

export default config;
