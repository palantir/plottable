///<reference path="../testReference.ts" />

describe("SelectionBoxLayer", () => {
  describe("Basic Usage", () => {
    const SVG_WIDTH = 500;
    const SVG_HEIGHT = 500;
    const SELECTION_BOX_CLASSNAME = ".selection-box";
    let svg: d3.Selection<void>;
    let sbl: Plottable.Components.SelectionBoxLayer;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      sbl = new Plottable.Components.SelectionBoxLayer();
    });

    it("can set the boxVisible property", () => {
      assert.strictEqual(sbl.boxVisible(), false, "The box is not visible by default");

      sbl.renderTo(svg);
      assert.strictEqual(sbl.boxVisible(), false, "The box is not visible by default after rendering to svg");

      assert.strictEqual(sbl.boxVisible(true), sbl, "Setting the boxVisible attribute returns the selection box layer");
      assert.strictEqual(sbl.boxVisible(), true, "Setting the boxVisible to true attribute works");
      sbl.boxVisible(false);
      assert.strictEqual(sbl.boxVisible(), false, "Setting the boxVisible attribute to false works");

      sbl.destroy();
      svg.remove();
    });

    it("renders the box in accordance to boxVisible property", () => {
      sbl.renderTo(svg);

      let selectionBox = svg.select(SELECTION_BOX_CLASSNAME);
      assert.isTrue(selectionBox.empty(), "initilizes without box in DOM");

      sbl.boxVisible(true);
      selectionBox = svg.select(SELECTION_BOX_CLASSNAME);
      assert.isFalse(selectionBox.empty(), "box is inserted in DOM when showing");

      sbl.boxVisible(false);
      selectionBox = svg.select(SELECTION_BOX_CLASSNAME);
      assert.isTrue(selectionBox.empty(), "box is removed from DOM when not showing");

      sbl.destroy();
      svg.remove();
    });

    it("generates the correct clipPath", () => {
      sbl.renderTo(svg);

      TestMethods.verifyClipPath(sbl);
      const clipRect = (<any> sbl)._boxContainer.select(".clip-rect");
      assert.strictEqual(TestMethods.numAttr(clipRect, "width"), SVG_WIDTH, "the clipRect has an appropriate width");
      assert.strictEqual(TestMethods.numAttr(clipRect, "height"), SVG_HEIGHT, "the clipRect has an appropriate height");
      svg.remove();
    });

    it("updates the clipPath reference when rendered", () => {
      // HACKHACK: History and history API not supported on IE9 (http://caniuse.com/#feat=history)
      if (window.history == null ||  window.history.replaceState == null) {
        svg.remove();
        return;
      }

      sbl.renderTo(svg);

      const originalState = window.history.state;
      const originalTitle = document.title;
      const originalLocation = document.location.href;
      window.history.replaceState(null, null, "clipPathTest");
      sbl.render();

      const clipPathId = (<any> sbl)._boxContainer.node().firstChild.id;
      const expectedPrefix = (/MSIE [5-9]/.test(navigator.userAgent) ? "" : document.location.href).replace(/#.*/g, "");
      const expectedClipPathURL = "url(" + expectedPrefix + "#" + clipPathId + ")";

      window.history.replaceState(originalState, originalTitle, originalLocation);

      const normalizeClipPath = (s: string) => s.replace(/"/g, "");
      assert.strictEqual(normalizeClipPath((<any> sbl)._element.attr("clip-path")), expectedClipPathURL,
        "the clipPath reference was updated");
      svg.remove();
    });

    it("can set the bounds property", () => {
      const defaultBounds = sbl.bounds();
      assert.strictEqual(defaultBounds.topLeft.x, 0, "top-left bound is correct (x)");
      assert.strictEqual(defaultBounds.topLeft.y, 0, "top-left bound is correct (y)");
      assert.strictEqual(defaultBounds.bottomRight.x, 0, "bottom-right bound is correct (x)");
      assert.strictEqual(defaultBounds.bottomRight.y, 0, "bottom-right bound is correct (y)");

      const topLeft = {
        x: 100,
        y: 100,
      };
      const bottomRight = {
        x: 300,
        y: 300,
      };
      assert.doesNotThrow(() => sbl.bounds({
        topLeft: topLeft,
        bottomRight: bottomRight,
      }), Error, "can set bounds before anchoring");

      sbl.boxVisible(true);
      sbl.renderTo(svg);

      assertCorrectRendering(topLeft, bottomRight, "rendered correctly");
      let queriedBounds = sbl.bounds();
      assert.deepEqual(queriedBounds.topLeft, topLeft, "returns correct top-left position");
      assert.deepEqual(queriedBounds.bottomRight, bottomRight, "returns correct bottom-right position");

      assert.strictEqual(sbl.bounds({
        topLeft: bottomRight,
        bottomRight: topLeft,
      }), sbl, "Setting the bounds property returns the selection box layer");
      assertCorrectRendering(topLeft, bottomRight, "rendered correctly with reversed bounds");
      queriedBounds = sbl.bounds();
      assert.deepEqual(queriedBounds.topLeft, topLeft, "returns correct top-left position");
      assert.deepEqual(queriedBounds.bottomRight, bottomRight, "returns correct bottom-right position");

      sbl.destroy();
      svg.remove();

      function assertCorrectRendering(expectedTL: Plottable.Point, expectedBR: Plottable.Point, msg: string) {
        const selectionBox = svg.select(SELECTION_BOX_CLASSNAME);
        const bbox = Plottable.Utils.DOM.elementBBox(selectionBox);
        assert.strictEqual(bbox.x, expectedTL.x, msg + " (x-origin)");
        assert.strictEqual(bbox.x, expectedTL.y, msg + " (y-origin)");
        assert.strictEqual(bbox.width, expectedBR.x - expectedTL.x, msg + " (width)");
        assert.strictEqual(bbox.height, expectedBR.y - expectedTL.y, msg + " (height)");
      }
    });

    it("throws an error if the bounds have not been set properly before rendering", () => {
      const topLeft = {
        x: <any> "a",
        y: <any> "b",
      };
      const bottomRight = {
        x: 300,
        y: 300,
      };
      sbl.bounds({
        topLeft: topLeft,
        bottomRight: bottomRight,
      });

      sbl.boxVisible(true);
      sbl.anchor(svg);
      // HACKHACK #2614: chai-assert.d.ts has the wrong signature
      (<any> assert).throws(() => sbl.renderImmediately(), "bounds have not been properly set", "cannot set invalid bounds");

      sbl.destroy();
      svg.remove();
    });

    it("uses the pixel values sides if they were set last", () => {
      const xExtent = [0, 100];
      const yExtent = [0, 100];
      sbl.xExtent(xExtent);
      sbl.yExtent(yExtent);
      assert.deepEqual(sbl.xExtent(), xExtent, "x extent set");
      assert.deepEqual(sbl.yExtent(), yExtent, "y extent set");

      const topLeft = {
        x: 100,
        y: 100,
      };
      const bottomRight = {
        x: 300,
        y: 300,
      };
      assert.doesNotThrow(() => sbl.bounds({
        topLeft: topLeft,
        bottomRight: bottomRight,
      }), Error, "can set bounds before anchoring");

      const queriedBounds = sbl.bounds();
      assert.deepEqual(queriedBounds.topLeft, topLeft, "returns correct top-left position");
      assert.deepEqual(queriedBounds.bottomRight, bottomRight, "returns correct bottom-right position");

      sbl.destroy();
      svg.remove();
    });

    it("has an effective size of 0, but will occupy all offered space", () => {
      const request = sbl.requestedSpace(400, 400);
      TestMethods.verifySpaceRequest(request, 0, 0, "does not request any space");
      assert.isTrue(sbl.fixedWidth(), "fixed width");
      assert.isTrue(sbl.fixedHeight(), "fixed height");

      sbl.destroy();
      svg.remove();
    });
  });

  describe("X scale binding", () => {
    const SVG_WIDTH = 500;
    const SVG_HEIGHT = 500;
    const SELECTION_AREA_CLASSNAME = ".selection-area";
    let svg: d3.Selection<void>;
    let sbl: Plottable.Components.SelectionBoxLayer;
    let xScale: Plottable.Scales.Linear;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      sbl = new Plottable.Components.SelectionBoxLayer();
      xScale = new Plottable.Scales.Linear();
      xScale.domain([0, 2000]);
      xScale.range([0, SVG_HEIGHT]);
    });

    it("can set the xScale property", () => {
      assert.isUndefined(sbl.xScale(), "no xScale is specified by default");
      assert.strictEqual(sbl.xScale(xScale), sbl, "setting the xScale returns the selection box layer");
      assert.strictEqual(sbl.xScale(), xScale, "The getter returns the correct scale");
      sbl.renderTo(svg);

      sbl.xExtent([0, 1000]);

      sbl.boxVisible(true);
      let selectionBox = svg.select(SELECTION_AREA_CLASSNAME);
      assert.strictEqual(selectionBox.attr("x"), "0", "box starts at left edge");

      xScale.domain([-1000, 1000]);

      selectionBox = svg.select(SELECTION_AREA_CLASSNAME);
      assert.strictEqual(selectionBox.attr("x"), "250", "domain change moves box");

      sbl.destroy();
      svg.remove();
    });

    it("can set the data values of the left and right sides directly", () => {
      sbl.boxVisible(true);
      sbl.xScale(xScale);

      assert.deepEqual(sbl.xExtent(), [undefined, undefined], "xExtent is not set");
      const xExtent = [100, 250];
      assert.strictEqual(sbl.xExtent(xExtent), sbl, "returns calling object");

      assert.deepEqual(sbl.xExtent(), xExtent, "xExtent set");
      assert.strictEqual(sbl.bounds().topLeft.x, xScale.scale(xExtent[0]), "left pixel position adjusts accordingly");
      assert.strictEqual(sbl.bounds().bottomRight.x, xScale.scale(xExtent[1]), "right pixel position adjusts accordingly");
      sbl.renderTo(svg);

      const box = sbl.content().select(SELECTION_AREA_CLASSNAME);

      assert.closeTo(TestMethods.numAttr(box, "x"), xScale.scale(xExtent[0]),
        window.Pixel_CloseTo_Requirement, "box x attribute starts at start of x extent");
      assert.closeTo(TestMethods.numAttr(box, "width"), xScale.scale(xExtent[1]) - xScale.scale(xExtent[0]),
        window.Pixel_CloseTo_Requirement, "box width attribute extends for width of x extent");

      sbl.destroy();
      svg.remove();
    });

    it("uses the data values for the left and right sides if they were set last", () => {
      sbl.xScale(xScale);

      const bounds = {
        topLeft: {
          x: 100,
          y: 100,
        },
        bottomRight: {
          x: 200,
          y: 200,
        },
      };
      sbl.bounds(bounds);
      assert.deepEqual(sbl.bounds(), bounds, "bounds set");
      const xExtent = [100, 250];
      assert.strictEqual(sbl.xExtent(xExtent), sbl, "returns calling object");

      assert.deepEqual(sbl.xExtent(), xExtent, "xExtent set");
      assert.strictEqual(sbl.bounds().topLeft.x, xScale.scale(xExtent[0]), "left pixel position adjusts accordingly");
      assert.strictEqual(sbl.bounds().bottomRight.x, xScale.scale(xExtent[1]), "right pixel position adjusts accordingly");

      sbl.destroy();
      svg.remove();
    });

    it("updates left and right edge pixel positions if in VALUE mode and xScale is switched", () => {
      sbl.xScale(xScale);

      const xExtent = [100, 250];
      sbl.xExtent(xExtent);
      const leftPosition = sbl.bounds().topLeft.x;
      const rightPosition = sbl.bounds().bottomRight.x;
      assert.strictEqual(leftPosition, xScale.scale(xExtent[0]), "left pixel position adjusts accordingly");
      assert.strictEqual(rightPosition, xScale.scale(xExtent[1]), "right pixel position adjusts accordingly");

      const xScale2 = new Plottable.Scales.ModifiedLog();
      xScale2.domain([0, 1000]);
      xScale2.range([0, SVG_HEIGHT]);

      sbl.xScale(xScale2);
      assert.notStrictEqual(sbl.bounds().topLeft.x, leftPosition, "left pixel position changed");
      assert.notStrictEqual(sbl.bounds().bottomRight.x, rightPosition, "right pixel position changed");
      assert.strictEqual(sbl.bounds().topLeft.x, xScale2.scale(xExtent[0]), "left pixel position adjusts accordingly");
      assert.strictEqual(sbl.bounds().bottomRight.x, xScale2.scale(xExtent[1]), "right pixel position adjusts accordingly");

      sbl.destroy();
      svg.remove();
    });

    it("updates left and right edge pixel positions if in VALUE mode and xScale updates", () => {
      sbl.xScale(xScale);

      const xExtent = [100, 250];
      sbl.xExtent(xExtent);
      const leftPosition = sbl.bounds().topLeft.x;
      const rightPosition = sbl.bounds().bottomRight.x;
      assert.strictEqual(leftPosition, xScale.scale(xExtent[0]), "left pixel position adjusts accordingly");
      assert.strictEqual(rightPosition, xScale.scale(xExtent[1]), "right pixel position adjusts accordingly");

      xScale.domain([0, 1000]);

      assert.notStrictEqual(sbl.bounds().topLeft.x, leftPosition, "left pixel position changed");
      assert.notStrictEqual(sbl.bounds().bottomRight.x, rightPosition, "right pixel position changed");
      assert.strictEqual(sbl.bounds().topLeft.x, xScale.scale(xExtent[0]), "left pixel position adjusts accordingly");
      assert.strictEqual(sbl.bounds().bottomRight.x, xScale.scale(xExtent[1]), "right pixel position adjusts accordingly");

      sbl.destroy();
      svg.remove();
    });
  });

  describe("Y scale binding", () => {
    const SVG_WIDTH = 500;
    const SVG_HEIGHT = 500;
    const SELECTION_AREA_CLASSNAME = ".selection-area";
    let svg: d3.Selection<void>;
    let sbl: Plottable.Components.SelectionBoxLayer;
    let yScale: Plottable.Scales.Linear;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      sbl = new Plottable.Components.SelectionBoxLayer();
      yScale = new Plottable.Scales.Linear();
      yScale.domain([0, 2000]);
      yScale.range([0, SVG_HEIGHT]);
    });

    it("can set the yScale property", () => {
      assert.isUndefined(sbl.yScale(), "no yScale is specified by default");
      assert.strictEqual(sbl.yScale(yScale), sbl, "setting the yScale returns the selection box layer");
      assert.strictEqual(sbl.yScale(), yScale, "The getter returns the correct scale");

      sbl.renderTo(svg);

      sbl.yExtent([0, 1000]);

      sbl.boxVisible(true);
      let selectionBox = svg.select(SELECTION_AREA_CLASSNAME);
      assert.strictEqual(selectionBox.attr("y"), "0", "box starts at top edge");

      yScale.domain([-1000, 1000]);

      selectionBox = svg.select(SELECTION_AREA_CLASSNAME);
      assert.strictEqual(selectionBox.attr("y"), "250", "domain change moves box");

      sbl.destroy();
      svg.remove();
    });

    it("can set the data values of the top and bottom sides directly", () => {
      sbl.boxVisible(true);
      sbl.yScale(yScale);

      assert.deepEqual(sbl.yExtent(), [undefined, undefined], "yExtent is not set");
      const yExtent = [0, 300];
      assert.strictEqual(sbl.yExtent(yExtent), sbl, "returns calling object");

      assert.deepEqual(sbl.yExtent(), yExtent, "yExtent set");
      assert.strictEqual(sbl.bounds().topLeft.y, yScale.scale(yExtent[0]), "top pixel position adjusts accordingly");
      assert.strictEqual(sbl.bounds().bottomRight.y, yScale.scale(yExtent[1]), "bottom pixel position adjusts accordingly");
      sbl.renderTo(svg);

      const box = sbl.content().select(SELECTION_AREA_CLASSNAME);

      assert.closeTo(TestMethods.numAttr(box, "y"), yScale.scale(yExtent[0]),
        window.Pixel_CloseTo_Requirement, "box y attribute starts at start of y extent");
      assert.closeTo(TestMethods.numAttr(box, "height"), yScale.scale(yExtent[1]) - yScale.scale(yExtent[0]),
        window.Pixel_CloseTo_Requirement, "box height attribute extends for width of y extent");

      sbl.destroy();
      svg.remove();
    });

    it("uses the data values for the top and bottom sides if they were set last", () => {
      sbl.yScale(yScale);

      const bounds = {
        topLeft: {
          x: 100,
          y: 100,
        },
        bottomRight: {
          x: 200,
          y: 200,
        },
      };
      sbl.bounds(bounds);
      assert.deepEqual(sbl.bounds(), bounds, "bounds set");
      const yExtent = [100, 250];
      assert.strictEqual(sbl.yExtent(yExtent), sbl, "returns calling object");

      assert.deepEqual(sbl.yExtent(), yExtent, "yExtent set");
      assert.strictEqual(sbl.bounds().topLeft.y, yScale.scale(yExtent[0]), "top pixel position adjusts accordingly");
      assert.strictEqual(sbl.bounds().bottomRight.y, yScale.scale(yExtent[1]), "bottom pixel position adjusts accordingly");

      sbl.destroy();
      svg.remove();
    });

    it("updates top and bottom edge pixel positions if in VALUE mode and yScale is switched", () => {
      sbl.yScale(yScale);

      const yExtent = [100, 250];
      sbl.yExtent(yExtent);
      const topPosition = sbl.bounds().topLeft.y;
      const bottomPosition = sbl.bounds().bottomRight.y;
      assert.strictEqual(topPosition, yScale.scale(yExtent[0]), "top pixel position adjusts accordingly");
      assert.strictEqual(bottomPosition, yScale.scale(yExtent[1]), "bottom pixel position adjusts accordingly");

      const yScale2 = new Plottable.Scales.ModifiedLog();
      yScale2.domain([0, 1000]);
      yScale2.range([0, SVG_HEIGHT]);

      sbl.yScale(yScale2);
      assert.notStrictEqual(sbl.bounds().topLeft.y, topPosition, "top pixel position changed");
      assert.notStrictEqual(sbl.bounds().bottomRight.y, bottomPosition, "bottom pixel position changed");
      assert.strictEqual(sbl.bounds().topLeft.y, yScale2.scale(yExtent[0]), "top pixel position adjusts accordingly");
      assert.strictEqual(sbl.bounds().bottomRight.y, yScale2.scale(yExtent[1]), "bottom pixel position adjusts accordingly");

      sbl.destroy();
      svg.remove();
    });

    it("updates top and bottom edge pixel positions if in VALUE mode and yScale updates", () => {
      sbl.yScale(yScale);

      const yExtent = [100, 250];
      sbl.yExtent(yExtent);
      const topPosition = sbl.bounds().topLeft.y;
      const bottomPosition = sbl.bounds().bottomRight.y;
      assert.strictEqual(topPosition, yScale.scale(yExtent[0]), "top pixel position adjusts accordingly");
      assert.strictEqual(bottomPosition, yScale.scale(yExtent[1]), "bottom pixel position adjusts accordingly");

      yScale.domain([0, 1000]);

      assert.notStrictEqual(sbl.bounds().topLeft.y, topPosition, "top pixel position changed");
      assert.notStrictEqual(sbl.bounds().bottomRight.y, bottomPosition, "bottom pixel position changed");
      assert.strictEqual(sbl.bounds().topLeft.y, yScale.scale(yExtent[0]), "top pixel position adjusts accordingly");
      assert.strictEqual(sbl.bounds().bottomRight.y, yScale.scale(yExtent[1]), "bottom pixel position adjusts accordingly");

      sbl.destroy();
      svg.remove();
    });
  });
});
