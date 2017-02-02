var path = require("path");

module.exports = {
  entry: "./demo/app.js",
  output: {
    path: path.join(__dirname, "demo"),
    filename: "bundle.js"
  }
};
