const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const outputPath = path.resolve(__dirname, 'dist');

module.exports = {
  mode: 'development',
  entry: {
    app: './src/index.js',
    ethos: './src/ethos.js',
  },
  module: {
    rules: [
      {
        test: /\.yaml$/,
        use: [
          { loader: 'json-loader' },
          { loader: 'yaml-loader' }
        ]
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
        ]
      },
      {
        test: /\.csv$/,
        loader: 'csv-loader',
        options: {
          dynamicTyping: true,
          header: true,
          transformHeader: h => h.trim(),
          skipEmptyLines: true
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin([
      outputPath
    ]),
    new CopyWebpackPlugin([
      {
        // Copy the Swagger OAuth2 redirect file to the project root;
        // that file handles the OAuth2 redirect after authenticating the end-user.
        from: 'node_modules/swagger-ui/dist/oauth2-redirect.html',
        to: './'
      }
    ]),
    new HtmlWebpackPlugin({
      template: 'index.html'
    })
  ],
  output: {
    filename: '[name].bundle.js',
    path: outputPath,
  }
};
