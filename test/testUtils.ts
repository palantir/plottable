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

function verifySpaceRequest(sr: Plottable._SpaceRequest, w: number, h: number, ww: boolean, wh: boolean, message: string) {
  assert.equal(sr.width,  w, message + " (space request: width)");
  assert.equal(sr.height, h, message + " (space request: height)");
  assert.equal(sr.wantsWidth , ww, message + " (space request: wantsWidth)");
  assert.equal(sr.wantsHeight, wh, message + " (space request: wantsHeight)");
}

function fixComponentSize(c: Plottable.Component, fixedWidth?: number, fixedHeight?: number) {
  c.requestedSpace = function(w, h) {
    return {
      width:  fixedWidth  == null ? 0 : fixedWidth,
      height: fixedHeight == null ? 0 : fixedHeight,
      wantsWidth: fixedWidth  == null ? false : w < fixedWidth ,
      wantsHeight: fixedHeight == null ? false : h < fixedHeight
    };
  };
  (<any> c)._isFixedWidth  = fixedWidth  == null ? false : true;
  (<any> c)._isFixedHeight = fixedHeight == null ? false : true;
  return c;
}

function makeFixedSizeComponent(fixedWidth?: number, fixedHeight?: number) {
  return fixComponentSize(new Plottable.Component(), fixedWidth, fixedHeight);
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

function assertPointsClose(actual: Plottable.Point, expected: Plottable.Point, epsilon: number, message: String) {
  assert.closeTo(actual.x, expected.x, epsilon, message + " (x)");
  assert.closeTo(actual.y, expected.y, epsilon, message + " (y)");
};

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


function makeLinearSeries(n: number): {x: number; y: number}[] {
  function makePoint(x: number) {
    return {x: x, y: x};
  }
  return d3.range(n).map(makePoint);
}

function makeQuadraticSeries(n: number): {x: number; y: number}[] {
  function makeQuadraticPoint(x: number) {
    return {x: x, y: x * x};
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

function triggerFakeMouseEvent(type: string, target: D3.Selection, relativeX: number, relativeY: number, button = 0) {
  var clientRect = target.node().getBoundingClientRect();
  var xPos = clientRect.left + relativeX;
  var yPos = clientRect.top + relativeY;
  var e = <MouseEvent> document.createEvent("MouseEvents");
  e.initMouseEvent(type, true, true, window, 1,
                    xPos, yPos,
                    xPos, yPos,
                    false, false, false, false,
                    button, null);
  target.node().dispatchEvent(e);
}

function triggerFakeDragSequence(target: D3.Selection, start: Plottable.Point, end: Plottable.Point) {
  triggerFakeMouseEvent("mousedown", target, start.x , start.y);
  triggerFakeMouseEvent("mousemove", target, end.x, end.y);
  triggerFakeMouseEvent("mouseup", target, end.x, end.y);
}

function triggerFakeWheelEvent(type: string, target: D3.Selection, relativeX: number, relativeY: number, deltaY: number) {
  var clientRect = target.node().getBoundingClientRect();
  var xPos = clientRect.left + relativeX;
  var yPos = clientRect.top + relativeY;
  var event: WheelEvent;
  if (Plottable.Utils.Methods.isIE()) {
    event = document.createEvent("WheelEvent");
    event.initWheelEvent("wheel", true, true, window, 1, xPos, yPos, xPos, yPos, 0, null, null, 0, deltaY, 0, 0);
  } else {
    // HACKHACK anycasting constructor to allow for the dictionary argument
    // https://github.com/Microsoft/TypeScript/issues/2416
    event = new (<any> WheelEvent)("wheel", { bubbles: true, clientX: xPos, clientY: yPos, deltaY: deltaY });
  }

  target.node().dispatchEvent(event);
}

function triggerFakeTouchEvent(type: string, target: D3.Selection, touchPoints: Plottable.Point[], ids: number[] = []) {
  var targetNode = target.node();
  var clientRect = targetNode.getBoundingClientRect();
  var e = <TouchEvent> document.createEvent("UIEvent");
  e.initUIEvent(type, true, true, window, 1);
  var fakeTouchList: any = [];

  touchPoints.forEach((touchPoint, i) => {
    var xPos = clientRect.left + touchPoint.x;
    var yPos = clientRect.top + touchPoint.y;
    var identifier = ids[i] == null ? 0 : ids[i];
    fakeTouchList.push( {
      identifier: identifier,
      target: targetNode,
      screenX: xPos,
      screenY: yPos,
      clientX: xPos,
      clientY: yPos,
      pageX: xPos,
      pageY: yPos
    });
  });
  fakeTouchList.item = (index: number) => fakeTouchList[index];
  e.touches = <TouchList> fakeTouchList;
  e.targetTouches = <TouchList> fakeTouchList;
  e.changedTouches = <TouchList> fakeTouchList;

  e.altKey = false;
  e.metaKey = false;
  e.ctrlKey = false;
  e.shiftKey = false;
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
