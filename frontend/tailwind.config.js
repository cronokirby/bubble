module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: ["./src/**/*"],
  theme: {
    fontFamily: {
      mono: ["JetBrainsMono", "monospace"],
      sans: [
        "TheFiraFiraSans",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Helvetica",
        "Apple Color Emoji",
        "Arial",
        "sans-serif",
        "Segoe UI Emoji",
        "Segoe UI Symbol",
      ],
    },
    extend: {},
  },
  variants: {},
  plugins: [],
};
