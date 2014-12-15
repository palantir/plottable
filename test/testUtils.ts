///<reference path="testReference.ts" />

function generateSVG(width = 400, height = 400): D3.Selection {
  var parent: D3.Selection = getSVGParent();
  return parent.append("svg").attr("width", width).attr("height", height).attr("class", "svg");
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

function makeFakeEvent(x: number, y: number): D3.D3Event {
  return <D3.D3Event> <any> {
      dx: 0,
      dy: 0,
      clientX: x,
      clientY: y,
      translate: [x, y],
      scale: 1,
      sourceEvent: <any> null,
      x: x,
      y: y,
      keyCode: 0,
      altKey: false
    };
}

function fakeDragSequence(anyedInteraction: any, startX: number, startY: number, endX: number, endY: number) {
  var originalD3Mouse = d3.mouse;
  d3.mouse = function() {
    return [startX, startY];
  };
  anyedInteraction._dragstart();
  d3.mouse = originalD3Mouse;
  d3.event = makeFakeEvent(startX, startY);
  anyedInteraction._drag();
  d3.event = makeFakeEvent(endX, endY);
  anyedInteraction._drag();
  d3.mouse = function() {
    return [endX, endY];
  };
  anyedInteraction._dragend();
  d3.event = null;
  d3.mouse = originalD3Mouse;
}

function verifySpaceRequest(sr: Plottable._SpaceRequest, w: number, h: number, ww: boolean, wh: boolean, id: string) {
  assert.equal(sr.width,  w, "width requested is as expected #"  + id);
  assert.equal(sr.height, h, "height requested is as expected #" + id);
  assert.equal(sr.wantsWidth , ww, "needs more width is as expected #"  + id);
  assert.equal(sr.wantsHeight, wh, "needs more height is as expected #" + id);
}

function fixComponentSize(c: Plottable.Component.AbstractComponent, fixedWidth?: number, fixedHeight?: number) {
  c._requestedSpace = function(w, h) {
    return {
      width:  fixedWidth  == null ? 0 : fixedWidth,
      height: fixedHeight == null ? 0 : fixedHeight,
      wantsWidth : fixedWidth  == null ? false : w < fixedWidth ,
      wantsHeight: fixedHeight == null ? false : h < fixedHeight
    };
  };
  (<any> c)._fixedWidthFlag  = fixedWidth  == null ? false : true;
  (<any> c)._fixedHeightFlag = fixedHeight == null ? false : true;
  return c;
}

function makeFixedSizeComponent(fixedWidth?: number, fixedHeight?: number) {
  return fixComponentSize(new Plottable.Component.AbstractComponent(), fixedWidth, fixedHeight);
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

function assertBBoxNonIntersection(firstEl: D3.Selection, secondEl: D3.Selection) {
  var firstBox = firstEl.node().getBoundingClientRect();
  var secondBox = secondEl.node().getBoundingClientRect();

  var intersectionBox = {
    left: Math.max(firstBox.left, secondBox.left),
    right: Math.min(firstBox.right, secondBox.right),
    bottom: Math.min(firstBox.bottom, secondBox.bottom),
    top: Math.max(firstBox.top, secondBox.top)
  };

  // +1 for inaccuracy in IE
  assert.isTrue(intersectionBox.left + 1 >= intersectionBox.right || intersectionBox.bottom + 1 >= intersectionBox.top,
          "bounding rects are not intersecting");
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

// for IE, whose paths look like "M 0 500 L" instead of "M0,500L"
function normalizePath(pathString: string) {
  return pathString.replace(/ *([A-Z]) */g, "$1").replace(/ /g, ",");
}

function numAttr(s: D3.Selection, a: string) {
  return parseFloat(s.attr(a));
}

function triggerFakeUIEvent(type: string, target: D3.Selection) {
  var e = <UIEvent> document.createEvent("UIEvents");
  e.initUIEvent(type, true, true, window, 1);
  target.node().dispatchEvent(e);
}

function triggerFakeMouseEvent(type: string, target: D3.Selection, relativeX: number, relativeY: number) {
  var clientRect = target.node().getBoundingClientRect();
  var xPos = clientRect.left + relativeX;
  var yPos = clientRect.top + relativeY;
  var e = <MouseEvent> document.createEvent("MouseEvents");
  e.initMouseEvent(type, true, true, window, 1,
                    xPos, yPos,
                    xPos, yPos,
                    false, false, false, false,
                    1, null);
  target.node().dispatchEvent(e);
}

function assertAreaPathCloseTo(actualPath: string, expectedPath: string, precision: number, msg: string) {
  var actualAreaPathStrings = actualPath.split("Z");
  var expectedAreaPathStrings = expectedPath.split("Z");

  actualAreaPathStrings.pop();
  expectedAreaPathStrings.pop();

  var actualAreaPathPoints = actualAreaPathStrings.map((path) => path.split(/[A-Z]/).map((point) => point.split(",")));
  actualAreaPathPoints.forEach((areaPathPoint) => areaPathPoint.shift());
  var expectedAreaPathPoints = expectedAreaPathStrings.map((path) => path.split(/[A-Z]/).map((point) => point.split(",")));
  expectedAreaPathPoints.forEach((areaPathPoint) => areaPathPoint.shift());

  assert.lengthOf(actualAreaPathPoints, expectedAreaPathPoints.length, "number of broken area paths should be equal");
  actualAreaPathPoints.forEach((actualAreaPoints, i) => {
    var expectedAreaPoints = expectedAreaPathPoints[i];
    assert.lengthOf(actualAreaPoints, expectedAreaPoints.length, "number of points in path should be equal");
    actualAreaPoints.forEach((actualAreaPoint, j) => {
      var expectedAreaPoint = expectedAreaPoints[j];
      assert.closeTo(+actualAreaPoint[0], +expectedAreaPoint[0], 0.1, msg);
      assert.closeTo(+actualAreaPoint[1], +expectedAreaPoint[1], 0.1, msg);
    });
  });
}
