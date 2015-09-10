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

      it("uses the pixel values sides if they were set last", () => {
        let xExtent = [0, 100];
        let yExtent = [0, 100];
        sbl.xExtent(xExtent);
        sbl.yExtent(yExtent);
        assert.deepEqual(sbl.xExtent(), xExtent, "x extent set");
        assert.deepEqual(sbl.yExtent(), yExtent, "y extent set");

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

        let queriedBounds = sbl.bounds();
        assert.deepEqual(queriedBounds.topLeft, topLeft, "returns correct top-left position");
        assert.deepEqual(queriedBounds.bottomRight, bottomRight, "returns correct bottom-right position");

        sbl.destroy();
        svg.remove();
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

        sbl.xExtent([0, 1000]);

        sbl.boxVisible(true);
        let selectionBox = svg.select(".selection-area");
        assert.strictEqual(selectionBox.attr("x"), "0", "box starts at left edge");

        xScale.domain([-1000, 1000]);

        selectionBox = svg.select(".selection-area");
        assert.strictEqual(selectionBox.attr("x"), "250", "domain change moves box");

        sbl.destroy();
        svg.remove();
      });

      it("can set the data values of the left and right sides directly", () => {
        let xScale = new Plottable.Scales.Linear();
        xScale.domain([0, 2000]);
        xScale.range([0, svgWidth]);

        sbl.boxVisible(true);
        sbl.xScale(xScale);

        assert.deepEqual(sbl.xExtent(), [undefined, undefined], "xExtent is not set");
        let xExtent = [100, 250];
        assert.strictEqual(sbl.xExtent(xExtent), sbl, "returns calling object");

        assert.deepEqual(sbl.xExtent(), xExtent, "xExtent set");
        assert.strictEqual(sbl.bounds().topLeft.x, xScale.scale(xExtent[0]), "left pixel position adjusts accordingly");
        assert.strictEqual(sbl.bounds().bottomRight.x, xScale.scale(xExtent[1]), "right pixel position adjusts accordingly");
        sbl.renderTo(svg);

        let box = sbl.content().select(".selection-area");

        assert.closeTo(TestMethods.numAttr(box, "x"), xScale.scale(xExtent[0]),
          window.Pixel_CloseTo_Requirement, "box x attribute starts at start of x extent");
        assert.closeTo(TestMethods.numAttr(box, "width"), xScale.scale(xExtent[1]) - xScale.scale(xExtent[0]),
          window.Pixel_CloseTo_Requirement, "box width attribute extends for width of x extent");

        sbl.destroy();
        svg.remove();
      });

      it("uses the data values for the left and right sides if they were set last", () => {
        let xScale = new Plottable.Scales.Linear();
        xScale.domain([0, 2000]);
        xScale.range([0, svgWidth]);
        sbl.xScale(xScale);

        let bounds = {
          topLeft: {
            x: 100,
            y: 100
          },
          bottomRight: {
            x: 200,
            y: 200
          }
        };
        sbl.bounds(bounds);
        assert.deepEqual(sbl.bounds(), bounds, "bounds set");
        let xExtent = [100, 250];
        assert.strictEqual(sbl.xExtent(xExtent), sbl, "returns calling object");

        assert.deepEqual(sbl.xExtent(), xExtent, "xExtent set");
        assert.strictEqual(sbl.bounds().topLeft.x, xScale.scale(xExtent[0]), "left pixel position adjusts accordingly");
        assert.strictEqual(sbl.bounds().bottomRight.x, xScale.scale(xExtent[1]), "right pixel position adjusts accordingly");

        sbl.destroy();
        svg.remove();
      });

      it("updates left and right edge pixel positions if in VALUE mode and scale is switched", () => {
        let xScale = new Plottable.Scales.Linear();
        xScale.domain([0, 2000]);
        xScale.range([0, svgHeight]);
        sbl.xScale(xScale);

        let xExtent = [100, 250];
        sbl.xExtent(xExtent);
        let leftPosition = sbl.bounds().topLeft.x;
        let rightPosition = sbl.bounds().bottomRight.x;
        assert.strictEqual(leftPosition, xScale.scale(xExtent[0]), "left pixel position adjusts accordingly");
        assert.strictEqual(rightPosition, xScale.scale(xExtent[1]), "right pixel position adjusts accordingly");

        let xScale2 = new Plottable.Scales.ModifiedLog();
        xScale2.domain([0, 1000]);
        xScale2.range([0, svgHeight]);

        sbl.xScale(xScale2);
        assert.notStrictEqual(sbl.bounds().topLeft.x, leftPosition, "left pixel position changed");
        assert.notStrictEqual(sbl.bounds().bottomRight.x, rightPosition, "right pixel position changed");
        assert.strictEqual(sbl.bounds().topLeft.x, xScale2.scale(xExtent[0]), "left pixel position adjusts accordingly");
        assert.strictEqual(sbl.bounds().bottomRight.x, xScale2.scale(xExtent[1]), "right pixel position adjusts accordingly");

        sbl.destroy();
        svg.remove();
      });

      it("updates left and right edge pixel positions if in VALUE mode and scale updates", () => {
        let xScale = new Plottable.Scales.Linear();
        xScale.domain([0, 2000]);
        xScale.range([0, svgHeight]);
        sbl.xScale(xScale);

        let xExtent = [100, 250];
        sbl.xExtent(xExtent);
        let leftPosition = sbl.bounds().topLeft.x;
        let rightPosition = sbl.bounds().bottomRight.x;
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

      it("can set the yScale() property", () => {
        let yScale = new Plottable.Scales.Linear();
        yScale.domain([0, 2000]);
        yScale.range([0, svgHeight]);

        assert.isUndefined(sbl.yScale(), "no yScale is specified by default");
        assert.strictEqual(sbl.yScale(yScale), sbl, "setting the yScale returns the selection box layer");
        assert.strictEqual(sbl.yScale(), yScale, "The getter returns the correct scale");

        sbl.renderTo(svg);

        sbl.yExtent([0, 1000]);

        sbl.boxVisible(true);
        let selectionBox = svg.select(".selection-area");
        assert.strictEqual(selectionBox.attr("y"), "0", "box starts at top edge");

        yScale.domain([-1000, 1000]);

        selectionBox = svg.select(".selection-area");
        assert.strictEqual(selectionBox.attr("y"), "250", "domain change moves box");

        sbl.destroy();
        svg.remove();
      });

      it("can set the data values of the top and bottom sides directly", () => {
        let yScale = new Plottable.Scales.Linear();
        yScale.domain([0, 2000]);
        yScale.range([0, svgHeight]);

        sbl.boxVisible(true);
        sbl.yScale(yScale);

        assert.deepEqual(sbl.yExtent(), [undefined, undefined], "yExtent is not set");
        let yExtent = [0, 300];
        assert.strictEqual(sbl.yExtent(yExtent), sbl, "returns calling object");

        assert.deepEqual(sbl.yExtent(), yExtent, "yExtent set");
        assert.strictEqual(sbl.bounds().topLeft.y, yScale.scale(yExtent[0]), "top pixel position adjusts accordingly");
        assert.strictEqual(sbl.bounds().bottomRight.y, yScale.scale(yExtent[1]), "bottom pixel position adjusts accordingly");
        sbl.renderTo(svg);

        let box = sbl.content().select(".selection-area");

        assert.closeTo(TestMethods.numAttr(box, "y"), yScale.scale(yExtent[0]),
          window.Pixel_CloseTo_Requirement, "box y attribute starts at start of y extent");
        assert.closeTo(TestMethods.numAttr(box, "height"), yScale.scale(yExtent[1]) - yScale.scale(yExtent[0]),
          window.Pixel_CloseTo_Requirement, "box height attribute extends for width of y extent");

        sbl.destroy();
        svg.remove();
      });

      it("uses the data values for the top and bottom sides if they were set last", () => {
        let yScale = new Plottable.Scales.Linear();
        yScale.domain([0, 2000]);
        yScale.range([0, svgHeight]);
        sbl.yScale(yScale);

        let bounds = {
          topLeft: {
            x: 100,
            y: 100
          },
          bottomRight: {
            x: 200,
            y: 200
          }
        };
        sbl.bounds(bounds);
        assert.deepEqual(sbl.bounds(), bounds, "bounds set");
        let yExtent = [100, 250];
        assert.strictEqual(sbl.yExtent(yExtent), sbl, "returns calling object");

        assert.deepEqual(sbl.yExtent(), yExtent, "yExtent set");
        assert.strictEqual(sbl.bounds().topLeft.y, yScale.scale(yExtent[0]), "top pixel position adjusts accordingly");
        assert.strictEqual(sbl.bounds().bottomRight.y, yScale.scale(yExtent[1]), "bottom pixel position adjusts accordingly");

        sbl.destroy();
        svg.remove();
      });

      it("updates top and bottom edge pixel positions if in VALUE mode and scale is switched", () => {
        let yScale = new Plottable.Scales.Linear();
        yScale.domain([0, 2000]);
        yScale.range([0, svgHeight]);
        sbl.yScale(yScale);

        let yExtent = [100, 250];
        sbl.yExtent(yExtent);
        let topPosition = sbl.bounds().topLeft.y;
        let bottomPosition = sbl.bounds().bottomRight.y;
        assert.strictEqual(topPosition, yScale.scale(yExtent[0]), "top pixel position adjusts accordingly");
        assert.strictEqual(bottomPosition, yScale.scale(yExtent[1]), "bottom pixel position adjusts accordingly");

        let yScale2 = new Plottable.Scales.ModifiedLog();
        yScale2.domain([0, 1000]);
        yScale2.range([0, svgHeight]);

        sbl.yScale(yScale2);
        assert.notStrictEqual(sbl.bounds().topLeft.y, topPosition, "top pixel position changed");
        assert.notStrictEqual(sbl.bounds().bottomRight.y, bottomPosition, "bottom pixel position changed");
        assert.strictEqual(sbl.bounds().topLeft.y, yScale2.scale(yExtent[0]), "top pixel position adjusts accordingly");
        assert.strictEqual(sbl.bounds().bottomRight.y, yScale2.scale(yExtent[1]), "bottom pixel position adjusts accordingly");

        sbl.destroy();
        svg.remove();
      });

      it("updates top and bottom edge pixel positions if in VALUE mode and scale updates", () => {
        let yScale = new Plottable.Scales.Linear();
        yScale.domain([0, 2000]);
        yScale.range([0, svgHeight]);
        sbl.yScale(yScale);

        let yExtent = [100, 250];
        sbl.yExtent(yExtent);
        let topPosition = sbl.bounds().topLeft.y;
        let bottomPosition = sbl.bounds().bottomRight.y;
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
});
