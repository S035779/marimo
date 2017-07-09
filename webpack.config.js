const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: ['./src/main.js', './src/main.css'],
  output: { path: __dirname + '/public', filename: 'bundle.js' },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: [
            'css-loader',
            'postcss-loader'
          ]
        })
      }
    ]
  },
  plugins: [ 
    new ExtractTextPlugin('bundle.css')
  ],
  devtool: 'source-map',
  devServer: {
    contentBase: __dirname + '/public',
    host: "0.0.0.0",
    port: 8080,
    disableHostCheck: true,
    inline: true,
    historyApiFallback: true,
    proxy: {
      '*': 'http://0.0.0.0:8081'
    }
  }
};
