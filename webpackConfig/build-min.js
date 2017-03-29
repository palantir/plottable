const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpackMerge = require("webpack-merge");

const buildConfig = require("./build");

/**
 * Builds plottable.min.js, which builds exactly the same as plottable.js but with an UglifyJS step
 * (and a different filename).
 */
module.exports = webpackMerge(buildConfig, {
  output: {
    filename: "plottable.min.js"
  },
  plugins: [
    new UglifyJSPlugin()
  ]
});
