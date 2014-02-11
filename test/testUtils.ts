///<reference path="testReference.ts" />

function generateSVG(width=400, height=400) {
  var parent: D3.Selection;
  var mocha = d3.select("#mocha-report");
  if (mocha.node() != null) {
    var suites = mocha.selectAll(".suite");
    var lastSuite = d3.select(suites[0][suites[0].length - 1]);
    parent = lastSuite.selectAll("ul");
  } else {
    parent = d3.select("body");
  }
  var svg = parent.append("svg").attr("width", width).attr("height", height);
  return svg;
}
