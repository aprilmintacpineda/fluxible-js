const path = require('path');

module.exports = {
  mode: 'development',
  entry: path.join(__dirname, 'playground/entry'),
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].[hash].js'
  },
  module: {
    rules: [
      {
        test: /\.js/,
        loader: 'webpack-loader-clean-pragma',
        options: {
          pragmas: [
            {
              start: '/** @fluxible-config-no-useJSON */',
              end: '/** @end-fluxible-config-no-useJSON */'
            },
            {
              start: '/** @fluxible-config-persist */',
              end: '/** @end-fluxible-config-persist */'
            },
            {
              start: '/** @fluxible-no-synth-events */',
              end: '/** @end-fluxible-no-synth-events */'
            },
            {
              start: '/** @fluxible-config-sync */',
              end: '/** @end-fluxible-config-sync */'
            }
          ]
        }
      }
    ]
  }
};
