/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        blue:{
          50: '#DFDFF0',
          75: '#DFDFF2',
          100:'#F0F2FA',
          200:'#4FB7DD',
          300:'#4FB7DD',
        },
        violet:{
          300:'#5724FF',
        },
        yellow:{
          100:'#8E983F',
          300:'#EDFF66',
        }
      },
      fontFamily:{
        zentry: ['zentry','sans-serif'],
        general:['general','sans-serif'],
        'circular-web':['circular-web','sans-serif'],
        'robert-medium':['robert-medium','sans-serif'],
        'robert-regular':['robert-regular','sans-serif'],
      }
    },
  },
  plugins: [],
};
