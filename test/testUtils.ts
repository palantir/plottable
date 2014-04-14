///<reference path="testReference.ts" />

function generateSVG(width=400, height=400): D3.Selection {
  var parent: D3.Selection = getSVGParent();
  return parent.append("svg").attr("width", width).attr("height", height);
}

function getSVGParent(): D3.Selection {
  var mocha = d3.select("#mocha-report");
  if (mocha.node() != null) {
    var suites = mocha.selectAll(".suite");
    var lastSuite = d3.select(suites[0][suites[0].length - 1]);
    return lastSuite.selectAll("ul");
  } else {
    return d3.select("body");
  }
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

function assertBBoxInclusion(outerEl, innerEl) {
  var outerBox = outerEl.node().getBoundingClientRect();
  var innerBox = innerEl.node().getBoundingClientRect();
  assert.operator(outerBox.left,   "<=", innerBox.left + 0.5,   "bounding rect left included"  );
  assert.operator(outerBox.top,    "<=", innerBox.top + 0.5,    "bounding rect top included"   );
  assert.operator(outerBox.right  + 0.5, ">=", innerBox.right,  "bounding rect right included" );
  assert.operator(outerBox.bottom + 0.5, ">=", innerBox.bottom, "bounding rect bottom included");
}

function assertXY(el: D3.Selection, xExpected, yExpected, message) {
  var x = el.attr("x");
  var y = el.attr("y");
  assert.equal(x, xExpected, "x: " + message);
  assert.equal(y, yExpected, "y: " + message);
}

function assertWidthHeight(el: D3.Selection, widthExpected, heightExpected, message) {
  var width = el.attr("width");
  var height = el.attr("height");
  assert.equal(width, widthExpected, "width: " + message);
  assert.equal(height, heightExpected, "height: " + message);
}

function makeLinearSeries(n: number): Plottable.IDataset {
  function makePoint(x: number) {
    return {x: x, y: x};
  }
  var data = d3.range(n).map(makePoint);
  return {data: data, metadata: {cssClass: "linear-series"}};
}

function makeQuadraticSeries(n: number): Plottable.IDataset {
  function makeQuadraticPoint(x: number) {
    return {x: x, y: x*x};
  }
  var data = d3.range(n).map(makeQuadraticPoint);
  return {data: data, metadata: {cssClass: "quadratic-series"}};
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
