const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.config.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new CleanWebpackPlugin([path.resolve(__dirname, '../dist')], { root: path.resolve(__dirname, '../') }),
    //  you should know that the HtmlWebpackPlugin by default will generate its own index.html
    new HtmlWebpackPlugin({
      template: './index.html',
      title: 'y-spreadsheet',
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      // chunkFilename: devMode ? '[id].[hash].css' : '[id].css',
    }),
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist'),
  },
});
