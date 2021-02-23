const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  target: 'node',
  entry: {
    server: './source/Server.ts',
    post: './source/Post.tsx'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  node: {
    fs: 'empty',
    net: 'empty'
  },
  output: {
    globalObject: 'self',
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.ttf$/,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
    new webpack.IgnorePlugin(/^pg-native$/),
    new ESLintPlugin(),
  ]
};
