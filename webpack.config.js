/* eslint-disable no-return-assign */
const path = require("path");
const webpack = require("webpack");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const isProduction = process.env.NODE_ENV === "production";
if (isProduction) {
  console.log("let's build for production!");
} else {
  console.log("let's build for test!");
}

const files = {
  main: "./functions/main.js"
};

const plugins = [
  new webpack.DefinePlugin({
    VERSION: process.env.npm_package_version
  }),
  new webpack.ContextReplacementPlugin(/.*/),
  new webpack.IgnorePlugin(/^pg-native$/),
  new webpack.IgnorePlugin(/^mongodb-client-encryption$/),
  new webpack.IgnorePlugin(/^hiredis$/)

  // new webpack.EnvironmentPlugin(productionEnv)
];

if (process.env.BUNDLE_ANALYSE) {
  plugins.push(new BundleAnalyzerPlugin());
}
module.exports = {
  optimization: { minimize: isProduction },
  entry: files,
  plugins,
  output: {
    libraryTarget: "commonjs",
    path: path.resolve(__dirname, "dist"),
    filename: `[name]${isProduction ? "" : "-local"}.js`
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/
      },
      { 
        test: /\.graphql?$/,
        use: [
          {
            loader: 'webpack-graphql-loader'
          }
        ]
        
      }
    ]
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".json", ".graphql"]
  },
  node: {
    __dirname: true
  },
  externals: { saslprep: "require('saslprep')" },
  target: "node"
};

const installedModules = [
  "apollo-server",
  "uuid"
];

if (isProduction) {
  console.log("prepare file for production env!");
  installedModules.forEach(
    nodeModule =>
      (module.exports.externals[nodeModule] = `commonjs ${nodeModule}`)
  ); // don't bundle externals; leave as require('module')
}
