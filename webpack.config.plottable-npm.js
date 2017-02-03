/**
 * Builds plottable-npm.js from sources in /build/src. Requirements:
 *
 * Be ready for consumption by npm. Should specify d3 and svg-typewriter as an external dependency.
 *
 * Example:
 *
 * User runs `npm install plottable --save`. Their node_modules get plottable, d3, and svg-typewriter.
 * They then import Plottable:
 *
 *   var Plottable = require("plottable");
 *
 * and start using it.
 *
 * How are modules resolved? Either:
 *
 * (a) they're in a node environment, in which case plottable-npm.js has further require()-s to
 * d3/svg-typewriter which get resolved, or
 * (b) they've already run a bundler (e.g. webpack) that walked through the dependency tree hooked
 * everything up.
 */
var path = require("path");

module.exports = {
  entry: "./build/src/index.js",
  output: {
    filename: "plottable-npm.js",
    // adds the UMD header (not sure it's needed for npm but just adding for backwards compat)
    libraryTarget: "umd",
    // the name of the AMD/commonJS/global
    library: "Plottable"
  },
  externals: {
    // don't bundle d3 but instead it request it externally
    "d3": "d3",
    "svg-typewriter": "svg-typewriter"
  }
};
