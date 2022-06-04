const defaultTheme = require("tailwindcss/defaultTheme")

module.exports = {
  mode: "jit",
  content: [
    "./app/**/*.tsx",
    "./app/**/*.jsx",
    "./app/**/*.js",
    "./app/**/*.ts",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Work Sans", ...defaultTheme.fontFamily.sans],
      },
      backgroundImage: {
        "wave-dark": "url('/images/wave-dark.svg')",
        "wave-light": "url('/images/wave-light.svg')",
        "layered-waves-dark": "url('/images/layered-waves-dark.svg')",
        "layered-waves-light": "url('/images/layered-waves-light.svg')",
      },
      margin: {
        neg3: "-3rem",
      },
    },
  },
  variants: {},
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/aspect-ratio"),
    require("daisyui"),
  ],
  daisyui: {
    darkTheme: "dark",
    themes: [
      {
        cupcake: {
          ...require("daisyui/src/colors/themes")["[data-theme=cupcake]"],
          primary: "rgb(0, 100, 206)",
          "primary-focus": "rgb(0, 75, 188)",
          "primary-content": "rgb(245, 255, 245)",
        },
      },
      {
        dark: {
          ...require("daisyui/src/colors/themes")["[data-theme=dark]"],
          primary: "rgb(0, 42, 103)",
          "primary-focus": "rgb(0, 23, 58)",
          "accent-content": "rgb(0,0,0)",
        },
      },
    ],
  },
}
