/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          mono: ['"Fira Code"', 'monospace'],
        },
        colors: {
          cyber: {
            primary: '#00ff41', // Mantém o verde terminal (matrix)
            secondary: '#008F11', 
            dark: '#050505', // Fundo ainda mais escuro
            accent: '#ff003c', // <--- NOVO VERMELHO HACKER (era roxo)
          }
        },
        animation: {
          'blink': 'blink 1s step-start infinite',
        },
        keyframes: {
          blink: {
            '50%': { opacity: '0' },
          }
        }
      },
    },
    plugins: [],
  }