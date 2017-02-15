var path = require("path");
var webpack = require("webpack");
var WriteFilePlugin = require("write-file-webpack-plugin");
var packageJson = require("./package.json");

var LICENSE_HEADER =
`Plottable ${packageJson.version} (https://github.com/palantir/plottable)
Copyright 2014-2017 Palantir Technologies
Licensed under MIT (https://github.com/palantir/plottable/blob/master/LICENSE)`;

module.exports = [
  /**
   * Builds test.js from sources in /build/test. Requirements:
   *
   * Loads for side-effect - loading the file immediately invokes many global functions
   * such as describe and it().
   *
   * Look to test/tests.html for the context of how it's used.
   */
  {
    devtool: "source-map",
    devServer: {
      compress: true,
      port: 9999,
      inline: false
    },
    entry: "./build/test/index.js",
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
      new webpack.ContextReplacementPlugin(/TestSelector/, ".", true, /Tests.js$/),
      new webpack.DefinePlugin({
        "__VERSION__": JSON.stringify(packageJson.version)
      })
    ]
  },

  /**
   * Builds plottable.js from sources in /build/src. Requirements:
   *
   * Be ready for consumption by bower, a script tag, or requireJS.
   * should specify d3 as an external dependency.
   *
   * Example bower usage:
   *
   * User runs `bower install plottable --save` in their directory.
   * Their bower_components gets plottable and d3. They then add the two
   * files in the right order through script tags, or plug it into requireJS,
   * and reference Plottable globally.
   *
   * Example script tag usage:
   *
   * User adds two script tags to their html page:
   *
   *   <script src="//cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.js"></script>
   *   <script src="//rawgithub.com/palantir/plottable/develop/plottable.js"></script>
   *
   * And then references Plottable globally.
   *
   * Example RequireJS usage:
   *
   * User configures their requireJS to point to Plottable, e.g.
   *
   * require.config( {
   *   paths: {
   *     d3: "https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.min",
   *     plottable: "https://cdnjs.cloudflare.com/ajax/libs/plottable.js/2.8.0/plottable"
   *   },
   *   shim: {
   *     "plottable": {
   *       deps: [ "d3" ]
   *     }
   *   }
   * } );
   *
   * User calls define(["plottable"], function (Plottable) { ... })
   *
   * So there's two ideas:
   * (a) Getting the plottable.js file. This is either from bower or from a web url.
   * (b) Referencing the Plottable object/code. This is either globally or by declaring
   *     a dependency on a module named "plottable" (both in AMD and CommonJS).
   */
  {
    entry: "./build/src/index.js",
    output: {
      filename: "plottable.js",
      // adds the UMD header to allow export to AMD, commonJS, or global
      libraryTarget: "umd",
      // the name of the AMD/commonJS/global
      library: "Plottable"
    },
    externals: {
      // don't bundle d3 but instead it request it externally
      "d3/build/d3.node": "d3"
    },
    plugins: [
      new webpack.BannerPlugin({
        banner: LICENSE_HEADER,
        entryOnly: true
      }),
      new webpack.DefinePlugin({
        "__VERSION__": JSON.stringify(packageJson.version)
      }),
      new WriteFilePlugin()
    ]
  }
];
