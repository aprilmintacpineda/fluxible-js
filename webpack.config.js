const path = require('path');

module.exports = [
  {
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
                start: '/** @fluxible-no-synth-events */',
                end: '/** @end-fluxible-no-synth-events */'
              },
              {
                start: '/** @fluxible-config-persist */',
                end: '/** @end-fluxible-config-persist */'
              },
              {
                start: '/** @fluxible-config-sync */',
                end: '/** @end-fluxible-config-sync */'
              },
              {
                start: '/** @fluxible-config-no-JSON */',
                end: '/** @end-fluxible-config-no-JSON */'
              }
            ]
          }
        }
      ]
    }
  },
  {
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
                start: '/** @fluxible-no-synth-events */',
                end: '/** @end-fluxible-no-synth-events */'
              },
              {
                start: '/** @fluxible-config-no-persist */',
                end: '/** @end-fluxible-config-no-persist */'
              },
              {
                start: '/** @fluxible-config-async */',
                end: '/** @end-fluxible-config-async */'
              },
              {
                start: '/** @fluxible-config-use-JSON */',
                end: '/** @end-fluxible-config-use-JSON */'
              }
            ]
          }
        }
      ]
    }
  }
];
