const path = require('path');
const fs = require('fs-extra');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const pjson = require('./package.json');
var outputPath = path.resolve(__dirname, '../project/noodl_modules/' + pjson.name);

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  devtool: 'source-map',
  output: {
    filename: 'index.js',
    path: outputPath,
    clean: true,
  },
  externals: {},
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json", ".css"]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'assets/**/*',
          to: '[name][ext]'
        },
      ]
    }),

    // Copy the generated module files to the tests project if it exists
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
          if (fs.existsSync(path.resolve(__dirname, '../tests'))) {
            fs.copySync(outputPath, path.resolve(__dirname, '../tests/noodl_modules/' + pjson.name));
          }
        })
      }
    }
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ]
  }
};
