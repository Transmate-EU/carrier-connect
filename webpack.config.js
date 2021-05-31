const path = require("path");
const webpack = require("webpack");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const nodeExternals = require("webpack-node-externals");

const isProduction = process.env.NODE_ENV === "production";
if (isProduction) {
  console.log("let's build for production!");
} else {
  console.log("let's build for test!");
}

const files = {
  index: "./index.js",
  rest: "./functions/rest.js",
  graphql: "./functions/graphql.js"
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
    path: path.resolve(__dirname, "dist"),
    filename: `[name]${isProduction ? "" : "-local"}.js`
  },
  mode: isProduction ? "production" : "development", //= node env
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    esmodules: true
                  }
                }
              ]
            ]
          }
        }
      },

      {
        test: /\.graphql?$/,
        use: [
          {
            loader: "webpack-graphql-loader"
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".json", ".graphql", ".gql"]
  },
  node: {
    __dirname: true
  },
  externals: isProduction
    ? { saslprep: "require('saslprep')" }
    : [nodeExternals()],
  target: "node"
};

const installedModules = [];

if (isProduction) {
  console.log("prepare file for production env!");
  installedModules.forEach(
    // eslint-disable-next-line no-return-assign
    nodeModule =>
      (module.exports.externals[nodeModule] = `commonjs ${nodeModule}`)
  ); // don't bundle externals; leave as require('module')
}
