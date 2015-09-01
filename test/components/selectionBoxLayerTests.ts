///<reference path="../testReference.ts" />

describe("Interactive Components", () => {
  describe("SelectionBoxLayer", () => {

    describe("Basic Usage", () => {
      let svgWidth = 500;
      let svgHeight = 500;

      let svg: d3.Selection<void>;
      let sbl: Plottable.Components.SelectionBoxLayer;

      beforeEach(() => {
        svg = TestMethods.generateSVG(svgWidth, svgHeight);
        sbl = new Plottable.Components.SelectionBoxLayer();
      });

      it("can set the boxVisible() property", () => {
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

      it("renders the box in accordance to boxVisible() property", () => {
        sbl.renderTo(svg);

        let selectionBox = svg.select(".selection-box");
        assert.isTrue(selectionBox.empty(), "initilizes without box in DOM");

        sbl.boxVisible(true);
        selectionBox = svg.select(".selection-box");
        assert.isFalse(selectionBox.empty(), "box is inserted in DOM when showing");

        sbl.boxVisible(false);
        selectionBox = svg.select(".selection-box");
        assert.isTrue(selectionBox.empty(), "box is removed from DOM when not showing");

        sbl.destroy();
        svg.remove();
      });

      it("can set the bounds() property", () => {
        let defaultBounds = sbl.bounds();
        assert.strictEqual(defaultBounds.topLeft.x, 0, "top-left bound is correct (x)");
        assert.strictEqual(defaultBounds.topLeft.y, 0, "top-left bound is correct (y)");
        assert.strictEqual(defaultBounds.bottomRight.x, 0, "bottom-right bound is correct (x)");
        assert.strictEqual(defaultBounds.bottomRight.y, 0, "bottom-right bound is correct (y)");

        let topLeft: Plottable.Point = {
          x: 100,
          y: 100
        };
        let bottomRight: Plottable.Point = {
          x: 300,
          y: 300
        };
        assert.doesNotThrow(() => sbl.bounds({
          topLeft: topLeft,
          bottomRight: bottomRight
        }), Error, "can set bounds before anchoring");

        sbl.boxVisible(true);
        sbl.renderTo(svg);

        assertCorrectRendering(topLeft, bottomRight, "rendered correctly");
        let queriedBounds = sbl.bounds();
        assert.deepEqual(queriedBounds.topLeft, topLeft, "returns correct top-left position");
        assert.deepEqual(queriedBounds.bottomRight, bottomRight, "returns correct bottom-right position");

        assert.strictEqual(sbl.bounds({
          topLeft: bottomRight,
          bottomRight: topLeft
        }), sbl, "Setting the bounds property returns the selection box layer");
        assertCorrectRendering(topLeft, bottomRight, "rendered correctly with reversed bounds");
        queriedBounds = sbl.bounds();
        assert.deepEqual(queriedBounds.topLeft, topLeft, "returns correct top-left position");
        assert.deepEqual(queriedBounds.bottomRight, bottomRight, "returns correct bottom-right position");

        sbl.destroy();
        svg.remove();

        function assertCorrectRendering(expectedTL: Plottable.Point, expectedBR: Plottable.Point, msg: string) {
          let selectionBox = svg.select(".selection-box");
          let bbox = Plottable.Utils.DOM.elementBBox(selectionBox);
          assert.strictEqual(bbox.x, expectedTL.x, msg + " (x-origin)");
          assert.strictEqual(bbox.x, expectedTL.y, msg + " (y-origin)");
          assert.strictEqual(bbox.width, expectedBR.x - expectedTL.x, msg + " (width)");
          assert.strictEqual(bbox.height, expectedBR.y - expectedTL.y, msg + " (height)");
        }
      });

      it("has an effective size of 0, but will occupy all offered space", () => {
        let request = sbl.requestedSpace(400, 400);
        TestMethods.verifySpaceRequest(request, 0, 0, "does not request any space");
        assert.isTrue(sbl.fixedWidth(), "fixed width");
        assert.isTrue(sbl.fixedHeight(), "fixed height");

        sbl.destroy();
        svg.remove();
      });

      it("can set the xScale() property", () => {
        let xScale = new Plottable.Scales.Linear();
        xScale.domain([0, 2000]);
        xScale.range([0, svgWidth]);

        assert.isUndefined(sbl.xScale(), "no xScale is specified by default");
        assert.strictEqual(sbl.xScale(xScale), sbl, "setting the xScale returns the selection box layer");
        assert.strictEqual(sbl.xScale(), xScale, "The getter returns the correct scale");
        sbl.renderTo(svg);

        let topLeft: Plottable.Point = {
          x: 0,
          y: 0
        };
        let bottomRight: Plottable.Point = {
          x: 250,
          y: 300
        };
        sbl.bounds({
          topLeft: topLeft,
          bottomRight: bottomRight
        });

        sbl.boxVisible(true);
        let selectionBox = svg.select(".selection-area");
        assert.strictEqual(selectionBox.attr("x"), "0", "box starts at left edge");

        xScale.domain([-1000, 1000]);

        selectionBox = svg.select(".selection-area");
        assert.strictEqual(selectionBox.attr("x"), "250", "domain change moves box");

        sbl.destroy();
        svg.remove();
      });

      it("gets the correct xExtent", () => {
        let xScale = new Plottable.Scales.Linear();
        xScale.domain([0, 2000]);
        xScale.range([0, svgWidth]);

        assert.deepEqual(sbl.xExtent(), [undefined, undefined], "xExtent is not set unless an yScale is set");
        sbl.xScale(xScale);
        sbl.renderTo(svg);

        let topLeft: Plottable.Point = {
          x: 100,
          y: 0
        };
        let bottomRight: Plottable.Point = {
          x: 250,
          y: 300
        };
        sbl.bounds({
          topLeft: topLeft,
          bottomRight: bottomRight
        });

        assert.strictEqual(sbl.xExtent()[0], xScale.invert(100), "left data value maps correctly");
        assert.strictEqual(sbl.xExtent()[1], xScale.invert(250), "right data value maps correctly");

        sbl.destroy();
        svg.remove();
      });

      it("can set the yScale() property", () => {
        let yScale = new Plottable.Scales.Linear();
        yScale.domain([0, 2000]);
        yScale.range([0, svgHeight]);

        assert.isUndefined(sbl.yScale(), "no yScale is specified by default");
        assert.strictEqual(sbl.yScale(yScale), sbl, "setting the yScale returns the selection box layer");
        assert.strictEqual(sbl.yScale(), yScale, "The getter returns the correct scale");

        sbl.renderTo(svg);

        let topLeft: Plottable.Point = {
          x: 0,
          y: 0
        };
        let bottomRight: Plottable.Point = {
          x: 250,
          y: 300
        };
        sbl.bounds({
          topLeft: topLeft,
          bottomRight: bottomRight
        });

        sbl.boxVisible(true);
        let selectionBox = svg.select(".selection-area");
        assert.strictEqual(selectionBox.attr("y"), "0", "box starts at top edge");

        yScale.domain([-1000, 1000]);

        selectionBox = svg.select(".selection-area");
        assert.strictEqual(selectionBox.attr("y"), "250", "domain change moves box");

        sbl.destroy();
        svg.remove();
      });

      it("gets the correct yExtent", () => {
        let yScale = new Plottable.Scales.Linear();
        yScale.domain([0, 2000]);
        yScale.range([0, svgHeight]);

        assert.deepEqual(sbl.yExtent(), [undefined, undefined], "yExtent is not set unless an yScale is set");

        sbl.yScale(yScale);
        sbl.renderTo(svg);

        let topLeft: Plottable.Point = {
          x: 100,
          y: 0
        };
        let bottomRight: Plottable.Point = {
          x: 250,
          y: 300
        };
        sbl.bounds({
          topLeft: topLeft,
          bottomRight: bottomRight
        });

        assert.strictEqual(sbl.yExtent()[0], yScale.invert(0), "bottom data value maps correctly");
        assert.strictEqual(sbl.yExtent()[1], yScale.invert(300), "top data value maps correctly");

        sbl.destroy();
        svg.remove();
      });
    });
  });
});
