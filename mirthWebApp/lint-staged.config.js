module.exports = {
  '*.{js,jsx,ts,tsx}': [
    './node_modules/.bin/eslint --fix',
    './node_modules/.bin/eslint'
  ],
  '**/*.ts?(x)': () => 'npm run check-types',
  '*.{json,yaml}': ['prettier --write']
};
