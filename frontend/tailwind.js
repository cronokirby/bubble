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
      sans: [
        'FiraSans',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Helvetica',
        'Apple Color Emoji',
        'Arial',
        'sans-serif',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
      ],
    },
    extend: {},
  },
  variants: {},
  plugins: [],
};
