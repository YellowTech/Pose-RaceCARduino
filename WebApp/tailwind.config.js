/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "node_modules/daisyui/dist/**/*.js",
    "node_modules/react-daisyui/dist/**/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  // daisyui: {
  //   themes: [
  //     {
  //       mytheme: {
  //         primary: "#ff0000",
  //         secondary: "#f6d860",
  //         accent: "#37cdbe",
  //         neutral: "#3d4451",
  //         "base-100": "#ffffff",
  //       },
  //     },
  //     "dark",
  //     "cupcake",
  //   ],
  // },
};
