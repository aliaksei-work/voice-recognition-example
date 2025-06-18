module.exports = {
  root: true,
  extends: ['@react-native'],
  rules: {
    // Disable the problematic rule if it's not available
    '@react-native/no-deep-imports': 'off',
  },
};
