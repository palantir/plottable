///<reference path="testReference.ts" />

function generateSVG(width = 400, height = 400): D3.Selection {
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

function verifySpaceRequest(sr: Plottable.ISpaceRequest, w: number, h: number, ww: boolean, wh: boolean, id: string) {
  assert.equal(sr.width,  w, "width requested is as expected #"  + id);
  assert.equal(sr.height, h, "height requested is as expected #" + id);
  assert.equal(sr.wantsWidth , ww, "needs more width is as expected #"  + id);
  assert.equal(sr.wantsHeight, wh, "needs more height is as expected #" + id);
}

function fixComponentSize(c: Plottable.Abstract.Component, fixedWidth?: number, fixedHeight?: number) {
  c._requestedSpace = function(w, h) {
    return {
      width:  fixedWidth  == null ? 0 : Math.min(w, fixedWidth) ,
      height: fixedHeight == null ? 0 : Math.min(h, fixedHeight),
      wantsWidth : fixedWidth  == null ? false : w < fixedWidth ,
      wantsHeight: fixedHeight == null ? false : h < fixedHeight
    };
  };
  return c;
}

function makeFixedSizeComponent(fixedWidth?: number, fixedHeight?: number) {
  return fixComponentSize(new Plottable.Abstract.Component(), fixedWidth, fixedHeight);
}

function getTranslate(element: D3.Selection) {
  return d3.transform(element.attr("transform")).translate;
}

function assertBBoxEquivalence(bbox: SVGRect, widthAndHeightPair: number[], message: string) {
  var width = widthAndHeightPair[0];
  var height = widthAndHeightPair[1];
  assert.equal(bbox.width, width, "width: " + message);
  assert.equal(bbox.height, height, "height: " + message);
}

function assertBBoxInclusion(outerEl: D3.Selection, innerEl: D3.Selection) {
  var outerBox = outerEl.node().getBoundingClientRect();
  var innerBox = innerEl.node().getBoundingClientRect();
  assert.operator(Math.floor(outerBox.left), "<=", Math.ceil(innerBox.left) + window.Pixel_CloseTo_Requirement,
          "bounding rect left included");
  assert.operator(Math.floor(outerBox.top), "<=", Math.ceil(innerBox.top) + window.Pixel_CloseTo_Requirement,
          "bounding rect top included");
  assert.operator(Math.ceil(outerBox.right) + window.Pixel_CloseTo_Requirement, ">=", Math.floor(innerBox.right),
          "bounding rect right included");
  assert.operator(Math.ceil(outerBox.bottom) + window.Pixel_CloseTo_Requirement, ">=", Math.floor(innerBox.bottom),
          "bounding rect bottom included");
}

function assertXY(el: D3.Selection, xExpected: number, yExpected: number, message: string) {
  var x = el.attr("x");
  var y = el.attr("y");
  assert.equal(x, xExpected, "x: " + message);
  assert.equal(y, yExpected, "y: " + message);
}

function assertWidthHeight(el: D3.Selection, widthExpected: number, heightExpected: number, message: string) {
  var width = el.attr("width");
  var height = el.attr("height");
  assert.equal(width, widthExpected, "width: " + message);
  assert.equal(height, heightExpected, "height: " + message);
}


function makeLinearSeries(n: number): {x: number; y: number;}[] {
  function makePoint(x: number) {
    return {x: x, y: x};
  }
  return d3.range(n).map(makePoint);
}

function makeQuadraticSeries(n: number): {x: number; y: number;}[] {
  function makeQuadraticPoint(x: number) {
    return {x: x, y: x*x};
  }
  return d3.range(n).map(makeQuadraticPoint);
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
