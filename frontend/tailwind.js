module.exports = {
  future: {
    purgeLayersByDefault: true,
    removeDeprecatedGapUtilities: true,
  },
  purge: {
    enabled: true,
    content: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'],
  },
  theme: {
    fontFamily: {
      mono: ['JetBrainsMono', 'serif'],
    },
    extend: {},
  },
  variants: {},
  plugins: [],
};
