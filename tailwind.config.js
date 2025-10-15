import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'admin-primary': '#213F5B',    // Azul oscuro de SnackBox
        'admin-secondary': '#F7931E',  // Naranja de SnackBox
        'admin-accent': '#FFD700',     // Dorado de SnackBox
        'admin-light': '#F5F5F5',      // Gris claro para fondos
        'admin-dark': '#333333',       // Gris oscuro para texto
      },
      animation: {
        "slide-in": "slide-in 0.3s ease-out forwards",
      },
      keyframes: {
        "slide-in": {
          "0%": { transform: "translateY(-20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
  ],
}