const buildConfig = require("./webpackConfig/build.js");
const testConfig = require("./webpackConfig/test.js");

/**
 * Build plottable.js and tests/test by default (e.g. for webpack-dev-server). Both of these
 * files included in <script> tags for tests.
 * TODO we include Plottable twice this way right now; improve testing/devserver setup to only need one.
 */
module.exports = [
  testConfig,
  buildConfig
];
