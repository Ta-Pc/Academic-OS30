import type { StorybookConfig } from '@storybook/react';

const config: StorybookConfig = {
  stories: [
    '../packages/ui/stories/**/*.stories.@(ts|tsx)'
  ],
  addons: [
    '@storybook/addon-essentials'
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  },
  staticDirs: ['../public'],
  docs: {
    autodocs: true
  },
  webpackFinal: async (config) => {
    const path = require('path');
    const root = path.resolve(__dirname, '..');
    const include = [
      path.resolve(root, 'packages/ui'),
      path.resolve(root, 'src/stories'),
      path.resolve(root, '.storybook'),
    ];
    // Ensure TS/TSX files in stories and preview are compiled
    config.module = config.module || { rules: [] };
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.tsx?$/,
      include,
      exclude: /node_modules/,
      use: [{
        loader: require.resolve('ts-loader'),
        options: {
          transpileOnly: true,
          compilerOptions: { noEmit: false, jsx: 'react-jsx' },
        },
      }],
    });
    config.resolve = config.resolve || {};
    config.resolve.extensions = (config.resolve.extensions || []).concat(['.ts', '.tsx']);
    config.resolve.alias = Object.assign({}, config.resolve.alias || {}, {
      '@': path.resolve(root, 'src'),
    });
    return config;
  }
};

export default config;


