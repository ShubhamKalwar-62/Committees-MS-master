/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        dark: '#1e293b',
        accent: '#22c55e',
        surface: '#f8fafc'
      }
    }
  },
  plugins: []
};
