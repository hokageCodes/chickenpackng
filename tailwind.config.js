/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Fraunces', 'serif'],
        body: ['Montserrat', 'sans-serif'],
      },
      colors: {
        black: {
          base: 'rgb(25, 25, 25)',
          alpha: {
            100: 'rgba(25, 25, 25, 0.3)',
            200: 'rgba(25, 25, 25, 0.6)',
            300: 'rgba(25, 25, 25, 0.75)',
          },
        },
        white: {
          base: '#FFFFFF',
          alpha: {
            100: 'rgba(255, 255, 255, 0.3)',
            200: 'rgba(255, 255, 255, 0.6)',
            300: 'rgba(255, 255, 255, 0.75)',
          },
        },
        grey: {
          100: '#FCFCFD',
          200: '#F2F4F7',
          300: '#E4E7EC',
          400: '#D0D5DD',
          500: '#98A2B3',
          600: '#667085',
          700: '#191919',
        },
        primary: {
          100: '#cbb6b5',
          200: '#A88683',
          300: '#733D39',
          400: '#500D07',
          500: '#380905',
          600: '#280704',
          alpha: {
            100: 'rgba(203, 182, 181, 0.3)',
            200: 'rgba(168, 134, 131, 0.3)',
            300: 'rgba(115, 61, 57, 0.3)',
            400: 'rgba(80, 13, 7, 0.5)',
            500: 'rgba(56, 9, 5, 0.3)',
            600: 'rgba(40, 7, 4, 0.3)',
          },
        },
        error: {
          100: '#FDE1E1',
          200: '#FCA5A5',
          300: '#BB251A',
          400: '#912018',
        },
        success: {
          100: '#D6F3E9',
          200: '#42D38B',
          300: '#039855',
          400: '#045130',
        },
        info: {
          100: '#DCEDFC',
          200: '#84CAFF',
          300: '#1465B4',
          400: '#0F4E8C',
        },
        warning: {
          100: '#FCF0DB',
          200: '#FFD481',
          300: '#DC6803',
          400: '#7F3004',
        },
      },
    },
  },
  plugins: [],
}
