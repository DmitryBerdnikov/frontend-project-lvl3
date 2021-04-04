import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

module.exports = {
  target: process.env.NODE_ENV === 'development' ? 'web' : 'browserslist', // Почему-то не работает перезагрузка, если есть опция browserslist. Например, в package.json. Пришлось ставить значение 'web'
  mode: process.env.NODE_ENV || 'development',
  entry: path.resolve(__dirname, 'src/scripts/index.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(scss)$/,
        use: [
          'style-loader', // inject CSS to page
          'css-loader', // translates CSS into CommonJS modules
          'postcss-loader',
          'sass-loader', // compiles Sass to CSS
        ],
      },
    ],
  },
  devServer: {
    contentBase: 'build',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/template.html'),
    }),
  ],
};
