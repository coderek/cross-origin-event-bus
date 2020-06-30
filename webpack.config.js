const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/eventbus.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'eventbus.js',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'lib'),
  },
};
