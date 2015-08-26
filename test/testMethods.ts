///<reference path="testReference.ts" />

module TestMethods {

  export function generateSVG(width = 400, height = 400): d3.Selection<void> {
    let parent = TestMethods.getSVGParent();
    return parent.append("svg").attr("width", width).attr("height", height).attr("class", "svg");
  }

  export function getSVGParent(): d3.Selection<void> {
    let mocha = d3.select("#mocha-report");
    if (mocha.node() != null) {
      let suites = mocha.selectAll(".suite");
      let lastSuite = d3.select(suites[0][suites[0].length - 1]);
      return lastSuite.selectAll("ul");
    } else {
      return d3.select("body");
    }
  }

  export function verifySpaceRequest(sr: Plottable.SpaceRequest, expectedMinWidth: number, expectedMinHeight: number, message: string) {
    assert.strictEqual(sr.minWidth, expectedMinWidth, message + " (space request: minWidth)");
    assert.strictEqual(sr.minHeight, expectedMinHeight, message + " (space request: minHeight)");
  }

  export function fixComponentSize(c: Plottable.Component, fixedWidth?: number, fixedHeight?: number) {
    c.requestedSpace = function(w, h) {
      return {
        minWidth: fixedWidth == null ? 0 : fixedWidth,
        minHeight: fixedHeight == null ? 0 : fixedHeight
      };
    };
    (<any> c).fixedWidth = () => fixedWidth == null ? false : true;
    (<any> c).fixedHeight = () => fixedHeight == null ? false : true;
    return c;
  }

  export function makeFixedSizeComponent(fixedWidth?: number, fixedHeight?: number) {
    return fixComponentSize(new Plottable.Component(), fixedWidth, fixedHeight);
  }

  export function getTranslate(element: d3.Selection<void>) {
    return d3.transform(element.attr("transform")).translate;
  }

  export function assertBBoxEquivalence(bbox: SVGRect, widthAndHeightPair: number[], message: string) {
    let width = widthAndHeightPair[0];
    let height = widthAndHeightPair[1];
    assert.strictEqual(bbox.width, width, "width: " + message);
    assert.strictEqual(bbox.height, height, "height: " + message);
  }

  export function assertBBoxInclusion(outerEl: d3.Selection<void>, innerEl: d3.Selection<void>) {
    let outerBox = (<Element> outerEl.node()).getBoundingClientRect();
    let innerBox = (<Element> innerEl.node()).getBoundingClientRect();
    assert.operator(Math.floor(outerBox.left), "<=", Math.ceil(innerBox.left) + window.Pixel_CloseTo_Requirement,
      "bounding rect left included");
    assert.operator(Math.floor(outerBox.top), "<=", Math.ceil(innerBox.top) + window.Pixel_CloseTo_Requirement,
      "bounding rect top included");
    assert.operator(Math.ceil(outerBox.right) + window.Pixel_CloseTo_Requirement, ">=", Math.floor(innerBox.right),
      "bounding rect right included");
    assert.operator(Math.ceil(outerBox.bottom) + window.Pixel_CloseTo_Requirement, ">=", Math.floor(innerBox.bottom),
      "bounding rect bottom included");
  }

  export function assertBBoxNonIntersection(firstEl: d3.Selection<void>, secondEl: d3.Selection<void>) {
    let firstBox = (<Element> firstEl.node()).getBoundingClientRect();
    let secondBox = (<Element> secondEl.node()).getBoundingClientRect();

    let intersectionBox = {
      left: Math.max(firstBox.left, secondBox.left),
      right: Math.min(firstBox.right, secondBox.right),
      bottom: Math.min(firstBox.bottom, secondBox.bottom),
      top: Math.max(firstBox.top, secondBox.top)
    };

    // +1 for inaccuracy in IE
    assert.isTrue(intersectionBox.left + 1 >= intersectionBox.right || intersectionBox.bottom + 1 >= intersectionBox.top,
      "bounding rects are not intersecting");
  }

  export function assertPointsClose(actual: Plottable.Point, expected: Plottable.Point, epsilon: number, message: String) {
    assert.closeTo(actual.x, expected.x, epsilon, message + " (x)");
    assert.closeTo(actual.y, expected.y, epsilon, message + " (y)");
  };

  export function assertWidthHeight(el: d3.Selection<void>, widthExpected: number, heightExpected: number, message: string) {
    let width = el.attr("width");
    let height = el.attr("height");
    assert.strictEqual(width, String(widthExpected), "width: " + message);
    assert.strictEqual(height, String(heightExpected), "height: " + message);
  }

  export function assertLineAttrs(
    line: d3.Selection<void>,
    expectedAttrs: { x1: number, y1: number, x2: number, y2: number },
    message: string) {
    let floatingPointError = 0.000000001;
    assert.closeTo(TestMethods.numAttr(line, "x1"), expectedAttrs.x1, floatingPointError, message + " (x1)");
    assert.closeTo(TestMethods.numAttr(line, "y1"), expectedAttrs.y1, floatingPointError, message + " (y1)");
    assert.closeTo(TestMethods.numAttr(line, "x2"), expectedAttrs.x2, floatingPointError, message + " (x2)");
    assert.closeTo(TestMethods.numAttr(line, "y2"), expectedAttrs.y2, floatingPointError, message + " (y2)");
  }

  export function assertEntitiesEqual(
      actual: Plottable.Entity<Plottable.Component>,
      expected: Plottable.Entity<Plottable.Component>,
      msg: string) {
    assert.deepEqual(actual.datum, expected.datum, msg + " (datum)");
    assertPointsClose(actual.position, expected.position, 0.01, msg);
    assert.strictEqual(actual.selection.size(), expected.selection.size(), msg + " (selection length)");
    actual.selection[0].forEach((element: Element, index: number) => {
      assert.strictEqual(element, expected.selection[0][index], msg + " (selection contents)");
    });
    assert.strictEqual(actual.component, expected.component, msg + " (component)");
  }

  export function assertPlotEntitiesEqual(
      actual: Plottable.Plots.PlotEntity,
      expected: Plottable.Plots.PlotEntity,
      msg: string) {
    assertEntitiesEqual(actual, expected, msg);
    assert.strictEqual(actual.dataset, expected.dataset, msg + " (dataset)");
    assert.strictEqual(actual.index, expected.index, msg + " (index)");
  }

  export function makeLinearSeries(n: number): { x: number; y: number }[] {
    function makePoint(x: number) {
      return { x: x, y: x };
    }
    return d3.range(n).map(makePoint);
  }

  export function makeQuadraticSeries(n: number): { x: number; y: number }[] {
    function makeQuadraticPoint(x: number) {
      return { x: x, y: x * x };
    }
    return d3.range(n).map(makeQuadraticPoint);
  }

  // for IE, whose paths look like "M 0 500 L" instead of "M0,500L"
  export function normalizePath(pathString: string) {
    return pathString.replace(/ *([A-Z]) */g, "$1").replace(/ /g, ",");
  }

  export function numAttr(s: d3.Selection<void>, a: string) {
    return parseFloat(s.attr(a));
  }

  export function triggerFakeUIEvent(type: string, target: d3.Selection<void>) {
    let e = <UIEvent> document.createEvent("UIEvents");
    e.initUIEvent(type, true, true, window, 1);
    target.node().dispatchEvent(e);
  }

  export function triggerFakeMouseEvent(type: string, target: d3.Selection<void>, relativeX: number, relativeY: number, button = 0) {
    let clientRect = (<Element> target.node()).getBoundingClientRect();
    let xPos = clientRect.left + relativeX;
    let yPos = clientRect.top + relativeY;
    let e = <MouseEvent> document.createEvent("MouseEvents");
    e.initMouseEvent(type, true, true, window, 1,
      xPos, yPos,
      xPos, yPos,
      false, false, false, false,
      button, null);
    target.node().dispatchEvent(e);
  }

  export function triggerFakeDragSequence(target: d3.Selection<void>, start: Plottable.Point, end: Plottable.Point, numSteps = 2) {
    triggerFakeMouseEvent("mousedown", target, start.x, start.y);
    for (let i = 1; i < numSteps; i++) {
      triggerFakeMouseEvent(
        "mousemove",
        target,
        start.x + (end.x - start.x) * i / numSteps,
        start.y + (end.y - start.y) * i / numSteps
      );
    }
    triggerFakeMouseEvent("mousemove", target, end.x, end.y);
    triggerFakeMouseEvent("mouseup", target, end.x, end.y);
  }

  export function isIE() {
    let userAgent = window.navigator.userAgent;
    return userAgent.indexOf("MSIE ") > -1 || userAgent.indexOf("Trident/") > -1;
  }

  export function triggerFakeWheelEvent(type: string, target: d3.Selection<void>, relativeX: number, relativeY: number, deltaY: number) {
    let clientRect = (<Element> target.node()).getBoundingClientRect();
    let xPos = clientRect.left + relativeX;
    let yPos = clientRect.top + relativeY;
    let event: WheelEvent;
    if (isIE()) {
      event = document.createEvent("WheelEvent");
      event.initWheelEvent("wheel", true, true, window, 1, xPos, yPos, xPos, yPos, 0, null, null, 0, deltaY, 0, 0);
    } else {
      // HACKHACK anycasting constructor to allow for the dictionary argument
      // https://github.com/Microsoft/TypeScript/issues/2416
      event = new (<any> WheelEvent)("wheel", { bubbles: true, clientX: xPos, clientY: yPos, deltaY: deltaY });
    }

    target.node().dispatchEvent(event);
  }

  export function triggerFakeTouchEvent(type: string, target: d3.Selection<void>, touchPoints: Plottable.Point[], ids: number[] = [] ) {
    let targetNode = <Element> target.node();
    let clientRect = targetNode.getBoundingClientRect();
    let e = <TouchEvent> document.createEvent( "UIEvent" );
    e.initUIEvent( type, true, true, window, 1 );
    let fakeTouchList: any = [];

    touchPoints.forEach(( touchPoint, i ) => {
      let xPos = clientRect.left + touchPoint.x;
      let yPos = clientRect.top + touchPoint.y;
      let identifier = ids[i] == null ? 0 : ids[i];
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
    fakeTouchList.item = ( index: number ) => fakeTouchList[index];
    e.touches = <TouchList> fakeTouchList;
    e.targetTouches = <TouchList> fakeTouchList;
    e.changedTouches = <TouchList> fakeTouchList;

    e.altKey = false;
    e.metaKey = false;
    e.ctrlKey = false;
    e.shiftKey = false;
    target.node().dispatchEvent(e);
  }

  export function triggerFakeKeyboardEvent(type: string, target: d3.Selection<void>, keyCode: number, options?: {[key: string]: any}) {
    let event = <KeyboardEvent> document.createEvent("Events");
    event.initEvent(type, true, true);
    event.keyCode = keyCode;
    if (options != null ) {
      Object.keys(options).forEach((key) => (<any> event)[key] = options[key] );
    }
    target.node().dispatchEvent(event);
  }

  export function assertAreaPathCloseTo(actualPath: string, expectedPath: string, precision: number, msg: string) {
    let actualAreaPathStrings = actualPath.split("Z");
    let expectedAreaPathStrings = expectedPath.split("Z");

    actualAreaPathStrings.pop();
    expectedAreaPathStrings.pop();

    let actualAreaPathPoints = actualAreaPathStrings.map((path) => path.split(/[A-Z]/).map((point) => point.split(",")));
    actualAreaPathPoints.forEach((areaPathPoint) => areaPathPoint.shift());
    let expectedAreaPathPoints = expectedAreaPathStrings.map((path) => path.split(/[A-Z]/).map((point) => point.split(",")));
    expectedAreaPathPoints.forEach((areaPathPoint) => areaPathPoint.shift());

    assert.lengthOf(actualAreaPathPoints, expectedAreaPathPoints.length, "number of broken area paths should be equal");
    actualAreaPathPoints.forEach((actualAreaPoints, i) => {
      let expectedAreaPoints = expectedAreaPathPoints[i];
      assert.lengthOf(actualAreaPoints, expectedAreaPoints.length, "number of points in path should be equal");
      actualAreaPoints.forEach((actualAreaPoint, j) => {
        let expectedAreaPoint = expectedAreaPoints[j];
        assert.closeTo(+actualAreaPoint[0], +expectedAreaPoint[0], 0.1, msg);
        assert.closeTo(+actualAreaPoint[1], +expectedAreaPoint[1], 0.1, msg);
      });
    });
  }

  export function verifyClipPath(c: Plottable.Component) {
    let clipPathId = (<any>c)._boxContainer[0][0].firstChild.id;
    let expectedPrefix = /MSIE [5-9]/.test(navigator.userAgent) ? "" : document.location.href;
    expectedPrefix = expectedPrefix.replace(/#.*/g, "");
    let expectedClipPathURL = "url(" + expectedPrefix + "#" + clipPathId + ")";
    // IE 9 has clipPath like 'url("#clipPath")', must accomodate
    let normalizeClipPath = (s: string) => s.replace(/"/g, "");
    assert.isTrue(normalizeClipPath((<any> c)._element.attr("clip-path")) === expectedClipPathURL,
                  "the element has clip-path url attached");
  }
}
