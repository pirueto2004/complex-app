const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: ['babel-polyfill', './frontend-js/main.js'],
  output: {
    filename: 'main-bundled.js',
    path: path.resolve(__dirname, 'public')
    // sourceMapFilename: "main-bundled.js.map"
  },
  mode: "production",
  devtool: "source-map",
  devServer: {
    contentBase: './public',
    open: true
 },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  target: 'node',
  node: {global: false, buffer: true},
}

