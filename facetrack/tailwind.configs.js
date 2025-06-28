
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
//import type { Config } from "tailwindcss"
//import animate from "tailwindcss-animate";
// const config = {
//   darkMode: ["class"],
//   content: [
//     "./pages/**/*.{ts,tsx}",
//     "./components/**/*.{ts,tsx}",
//     "./app/**/*.{ts,tsx}",
//     "./src/**/*.{ts,tsx}",
//     "*.{js,ts,jsx,tsx,mdx}",
//   ],
//   prefix: "",
//   theme: {
//     container: {
//       center: true,
//       padding: "2rem",
//       screens: {
//         "2xl": "1400px",
//       },
//     },
//     extend: {
//       colors: {
//         border: "hsl(var(--border))",
//         input: "hsl(var(--input))",
//         ring: "hsl(var(--ring))",
//         background: "hsl(var(--background))",
//         foreground: "hsl(var(--foreground))",
//         primary: {
//           DEFAULT: "#2563eb", // Blue-600
//           foreground: "#ffffff",
//           50: "#eff6ff",
//           100: "#dbeafe",
//           200: "#bfdbfe",
//           300: "#93c5fd",
//           400: "#60a5fa",
//           500: "#3b82f6",
//           600: "#2563eb",
//           700: "#1d4ed8",
//           800: "#1e40af",
//           900: "#1e3a8a",
//         },
//         secondary: {
//           DEFAULT: "#f1f5f9",
//           foreground: "#0f172a",
//         },
//         destructive: {
//           DEFAULT: "#ef4444",
//           foreground: "#ffffff",
//         },
//         muted: {
//           DEFAULT: "#f8fafc",
//           foreground: "#64748b",
//         },
//         accent: {
//           DEFAULT: "#f1f5f9",
//           foreground: "#0f172a",
//         },
//         popover: {
//           DEFAULT: "#ffffff",
//           foreground: "#0f172a",
//         },
//         card: {
//           DEFAULT: "#ffffff",
//           foreground: "#0f172a",
//         },
//       },
//       borderRadius: {
//         lg: "var(--radius)",
//         md: "calc(var(--radius) - 2px)",
//         sm: "calc(var(--radius) - 4px)",
//       },
//       keyframes: {
//         "accordion-down": {
//           from: { height: "0" },
//           to: { height: "var(--radix-accordion-content-height)" },
//         },
//         "accordion-up": {
//           from: { height: "var(--radix-accordion-content-height)" },
//           to: { height: "0" },
//         },
//         "fade-in": {
//           "0%": { opacity: "0", transform: "translateY(10px)" },
//           "100%": { opacity: "1", transform: "translateY(0)" },
//         },
//         "pulse-ring": {
//           "0%": { transform: "scale(1)", opacity: "1" },
//           "100%": { transform: "scale(1.5)", opacity: "0" },
//         },
//       },
//       animation: {
//         "accordion-down": "accordion-down 0.2s ease-out",
//         "accordion-up": "accordion-up 0.2s ease-out",
//         "fade-in": "fade-in 0.5s ease-out",
//         "pulse-ring": "pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite",
//       },
//     },
//   },
//   p
// } 

// export default config



// /** @type {import('tailwindcss').Config} */
// import { join } from "path";


// module.exports = {
//   content: [
//     join(__dirname, "./pages/**/*.{js,ts,jsx,tsx}"),
//     join(__dirname, "./src/**/*.{js,ts,jsx,tsx}"),
//   ],
//   theme: {
//     extend: {
//       colors: {
//         background: "var(--background)",
//         foreground: "var(--foreground)",
//         primary: {
//           300: "#5539CC",
//           500: "#4D4FCC",
//           20: "#F1EEFF",
//           10: "#FBFAFE",
//           400: "#2625A8",
//         },
//         grey: {
//           600: "#3C3C3C",
//           500: "#E0E0E0",
//           400: "#777F89",
//           300: "#A8A4A4",
//           100: "#f3f4f6",
//           96: "#969696",
//           200: "#DFFFF2",
//           800: "#D9D9D9",
//           50: "#979797",
//           800: "#89898B",
//           900: "#E2E8EF",
//           700: "#C7C5D6",
//           750: "#65DCAC",
//           650: "#F8FAFC",

//           border: "#EBEBEC",
//           light: "#EAEAEA",
//         },
//         "app-bg": "var(--app-background)",
//         border: "#C2BEBE",

//         dark: {
//           10: "#0F172A",
//         },
//         light: {
//           10: "#FFFFFF",
//           0: "#F1F1F1",
//         },
//         error: {
//           500: "#F75555",
//           300: "#D42E28",
//         },
//         inactive: "#BDC1D6",
//         success: "#0DB270",
//         surface: "#464554",
//       },
//       fontFamily: {
//         roboto: ["var(--font-roboto)", "sans-serif"],
//       },
//     },
//   },
//   plugins: [],
// };

