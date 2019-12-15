const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CompressionPlugin = require('compression-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin')
 
const htmlPlugin = new HtmlWebPackPlugin({
  template: "./src/index.html",
  filename: "./index.html"
});

const circularDependencyPlugin = new CircularDependencyPlugin({
  // exclude detection of files based on a RegExp
  exclude: /a\.js|node_modules/,
  // include specific files based on a RegExp
  include: /src/,
  // add errors to webpack instead of warnings
  failOnError: true,
  // allow import cycles that include an asyncronous import,
  // e.g. via import(/* webpackMode: "weak" */ './file.js')
  allowAsyncCycles: false,
  // set the current working directory for displaying module paths
  cwd: process.cwd(),
});

const backendServer = 'http://localhost:5000'

module.exports = {
  entry: __dirname + '/src/index.tsx',
  output: {
    filename: 'static/js/ubart.js',
    publicPath: '/',
    path: path.resolve(__dirname, 'dist')
  },

  devtool: "source-map",

  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },

  module: {
    rules: [
      // loaders are loaded bottom up
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {loader: "ts-loader"},
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        },
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      },
      {
        test: /\.css$/,
        use: [
            "style-loader", 
            "css-loader"
        ],
      }
    ]
  },

  plugins: [
    htmlPlugin,
    new CompressionPlugin(),
    circularDependencyPlugin
  ],

  devServer: {
    disableHostCheck: true,
    liveReload: false,
    headers: {
        'Access-Control-Allow-Origin': '*'
    },  
    contentBase: __dirname + '/src',
    historyApiFallback: {
      rewrites: [
        { from: /^\/$/, to: '/index.html' },
        // { from: /./, to: '/index.html' }
      ],
    },
    proxy: {
      '/api': backendServer,
      '/services': backendServer
    }
  },

  externals: {
    "react": "React",
    "react-dom": "ReactDOM"
  }
};
