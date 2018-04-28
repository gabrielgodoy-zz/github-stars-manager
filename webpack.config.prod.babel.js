import autoprefixer from 'autoprefixer';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const webpack = require('webpack');
let path = require('path');

module.exports = {
  entry: {
    background: [
      'babel-polyfill',
      './src/assets/js/background/background.js',
      './src/assets/js/background/hot-reload.js',
    ],
    content_script: [
      'babel-polyfill',
      './src/assets/js/content_scripts/main.js'],
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
      },
    ],
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.styl$/,
        loader: ExtractTextPlugin
          .extract(
            'style-loader', 'css-loader?modules!postcss-loader!stylus-loader'),
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.(eot|otf|woff|woff2|ttf|svg)$/,
        loader: 'url-loader?limit=30000&name=[name].[ext]',
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'file-loader?name=[path][name].[ext]',
      },
    ],
  },
  output: {
    filename: '[name].js',
    path: path.resolve('dist'),
    publicPath: path.resolve('/'),
  },
  postcss() {
    return [autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9'],
      remove: false,
    })];
  },
  plugins: [
    // Optimizes the order that the files are bundled
    new webpack.optimize.OccurenceOrderPlugin(),

    new ExtractTextPlugin('main.css'),
    // Eliminates duplicated packages when generating bundle
    new webpack.optimize.DedupePlugin(),
    // Uglify bundle
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
  ],
  resolve: {
    extensions: ['', '.js', '.styl'],
  },
};
