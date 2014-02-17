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

function getTranslate(element: D3.Selection) {
  return d3.transform(element.attr("transform")).translate;
}

function assertBBoxEquivalence(bbox, widthAndHeightPair, message) {
  var width = widthAndHeightPair[0];
  var height = widthAndHeightPair[1];
  assert.equal(bbox.width, width, "width: " + message);
  assert.equal(bbox.height, height, "height: " + message);
}

function makeLinearSeries(n: number): IDataset {
  function makePoint(x: number) {
    return {x: x, y: x};
  }
  var data = d3.range(n).map(makePoint);
  return {data: data, seriesName: "linear-series"};
}

function makeQuadraticSeries(n: number): IDataset {
  function makeQuadraticPoint(x: number) {
    return {x: x, y: x*x};
  }
  var data = d3.range(n).map(makeQuadraticPoint);
  return {data: data, seriesName: "quadratic-series"};
}

class MultiTestVerifier {
  public passed = true;
  private temp: boolean;

  public start() {
    this.temp = this.passed;
    this.passed = false;
  }

  public end() {
    this.passed = this.temp;
  }
}
