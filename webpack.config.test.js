/**
 * Builds test.js from sources in /build/test. Requirements:
 *
 * Loads for side-effect - loading the file immediately invokes many global functions
 * such as describe and it().
 *
 * Look to test/tests.html for the context of how it's used.
 */
var path = require("path");
var webpack = require("webpack");

module.exports = {
  devtool: "source-map",
  entry: "./build/test/index.js",
  module: {
    exprContextRegExp: /^\.\//,
  },
  output: {
    filename: "test/tests.js"
  },
  externals: {
    "d3": "d3",
    "sinon": "sinon",
    "mocha": "mocha",
    "chai": "chai"
  },
  plugins: [
    // Resolve require.context calls containing TestSelector to recursively search the directory
    // for files matching the /Tests.js$/ regex. we use .js files because webpack runs on compiled
    // .js files.
    // see https://github.com/webpack/webpack/issues/2783 for info on how this works
    new webpack.ContextReplacementPlugin(/TestSelector/, ".", true, /Tests.js$/)
  ]
};
