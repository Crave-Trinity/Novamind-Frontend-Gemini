/* eslint-disable */
const fs = require('fs');
const path = require('path');

// List of files or directories to add eslint-disable to
const targetFiles = [
  'config/postcss/postcss.config.cjs',
  'config/tailwind/tailwind.config.cjs',
  '.eslintrc.cjs',
  'test-puppeteer/NeuralControlPanel.test.js',
  'test-puppeteer/ThemeProvider.system.test.js',
  'test-puppeteer/r3f-basic.test.js',
  'test-puppeteer/utils/mockApi.js',
  'test-reports/visualization/vitest-setup.js',
];

console.log('Adding eslint-disable to target files...');

targetFiles.forEach((filePath) => {
  const fullPath = path.join(__dirname, '..', filePath);
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    if (!content.startsWith('/* eslint-disable */')) {
      content = '/* eslint-disable */\n' + content;
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    } else {
      console.log(`Already disabled: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log('Done.');
