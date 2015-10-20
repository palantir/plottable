///<reference path="../testReference.ts" />

describe("NumericAxis", () => {
  function boxIsInside(inner: ClientRect, outer: ClientRect, epsilon = 0) {
    if (inner.left < outer.left - epsilon) { return false; }
    if (inner.right > outer.right + epsilon) { return false; }
    if (inner.top < outer.top - epsilon) { return false; }
    if (inner.bottom > outer.bottom + epsilon) { return false; }
    return true;
  }

  function assertBoxInside(inner: ClientRect, outer: ClientRect, epsilon = 0, message = "") {
    assert.operator(inner.left, ">", outer.left - epsilon, message + " (box inside (left))");
    assert.operator(inner.right, "<", outer.right + epsilon, message + " (box inside (right))");
    assert.operator(inner.top, ">", outer.top - epsilon, message + " (box inside (top))");
    assert.operator(inner.bottom, "<", outer.bottom + epsilon, message + " (box inside (bottom))");
  }

  function applyVisibleFilter(selection: d3.Selection<any>) {
    return selection.filter(function() {
      let visibilityAttr =  d3.select(this).style("visibility");
      return visibilityAttr === "visible" || visibilityAttr === "inherit";
    });
  }

  const horizontalOrientations = ["bottom", "top"];
  const verticalOrientations = ["left", "right"];
  const orientations = horizontalOrientations.concat(verticalOrientations);

  const isHorizontalOrientation = (orientation: string) => horizontalOrientations.indexOf(orientation) >= 0;

  horizontalOrientations.forEach((orientation) => {
    const verticalTickLabelPositions = ["top", "bottom"];
    it(`throws an error when setting an invalid position on orientation ${orientation}`, () => {
      const scale = new Plottable.Scales.Linear();
      const axis = new Plottable.Axes.Numeric(scale, orientation);
      verticalTickLabelPositions.forEach((position) => {
        (<any> assert).throws(() => axis.tickLabelPosition(position), "horizontal", "cannot set position");
      });
    });
  });

  verticalOrientations.forEach((orientation) => {
    const horizontalTickLabelPositions = ["left", "right"];
    it(`throws an error when setting an invalid position on orientation ${orientation}`, () => {
      const scale = new Plottable.Scales.Linear();
      const axis = new Plottable.Axes.Numeric(scale, orientation);
      horizontalTickLabelPositions.forEach((position) => {
        (<any> assert).throws(() => axis.tickLabelPosition(position), "vertical", "cannot set position");
      });
    });
  });

  orientations.forEach((orientation) => {
    const verticalTickLabelPositions = ["top", "bottom"];
    const horizontalTickLabelPositions = ["left", "right"];

    const labelPositions = isHorizontalOrientation(orientation) ? horizontalTickLabelPositions : verticalTickLabelPositions;
    labelPositions.forEach((labelPosition) => {
      it(`draws tick labels ${labelPosition} of the corresponding mark if specified for orientation ${orientation}`, () => {
        const scale = new Plottable.Scales.Linear();
        const axis = new Plottable.Axes.Numeric(scale, orientation);
        const svg = TestMethods.generateSVG();
        axis.tickLabelPosition(labelPosition);
        axis.renderTo(svg);

        const tickLabels = axis.content().selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`);
        const tickMarks = axis.content().selectAll(`.${Plottable.Axis.TICK_MARK_CLASS}`);
        assert.operator(tickLabels.size(), ">=", 2, "at least two tick labels were drawn");
        assert.strictEqual(tickLabels.size(), tickMarks.size(), "there is one label per mark");

        tickLabels.each(function(d, i) {
          TestMethods.assertBBoxNonIntersection(d3.select(this), d3.select(tickMarks[0][i]));
        });
        svg.remove();
      });
    });
  });

  describe("drawing tick labels when bottom oriented", () => {

    let svg: d3.Selection<void>;

    beforeEach(() => {
      svg = TestMethods.generateSVG();
    });

    it("draws ticks labels centered with the corresponding tick mark", () => {
      let scale = new Plottable.Scales.Linear();
      let numericAxis = new Plottable.Axes.Numeric(scale, "bottom");
      numericAxis.renderTo(svg);

      let tickLabels = numericAxis.content().selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`);
      assert.operator(tickLabels.size(), ">=", 2, "at least two tick labels were drawn");
      let tickMarks = numericAxis.content().selectAll(`.${Plottable.Axis.TICK_MARK_CLASS}`);
      assert.strictEqual(tickLabels.size(), tickMarks.size(), "there is one label per mark");

      tickLabels.each(function(d, i) {
        let tickLabelClientRect = this.getBoundingClientRect();
        let tickMarkClientRect = (<Element> tickMarks[0][i]).getBoundingClientRect();
        let labelCenter = (tickLabelClientRect.left + tickLabelClientRect.right) / 2;
        let markCenter = (tickMarkClientRect.left + tickMarkClientRect.right) / 2;
        assert.closeTo(labelCenter, markCenter, window.Pixel_CloseTo_Requirement, `tick label ${i} is centered on mark`);
      });

      svg.remove();
    });

    it("does not overlap tick labels in a constrained space", () => {
      let constrainedWidth = 50;
      let constrainedHeight = 50;
      svg.attr("width", constrainedWidth);
      svg.attr("height", constrainedHeight);
      let scale = new Plottable.Scales.Linear();
      let numericAxis = new Plottable.Axes.Numeric(scale, "bottom");
      numericAxis.renderTo(svg);

      let visibleTickLabels = applyVisibleFilter(numericAxis.content()
        .selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`));

      visibleTickLabels.each(function(d, i) {
        let labelRect = this.getBoundingClientRect();
        visibleTickLabels[0].slice(i + 1).forEach(function(otherVisibleTickLabel, i2) {
          let labelRect2 = (<Element> otherVisibleTickLabel).getBoundingClientRect();
          let rectOverlap = Plottable.Utils.DOM.clientRectsOverlap(labelRect, labelRect2);
          assert.isFalse(rectOverlap, `tick label ${i} does not overlap with tick label ${i2}`);
        });
      });

      svg.remove();
    });

    it("ensures that long labels are contained", () => {
      let scale = new Plottable.Scales.Linear().domain([400000000, 500000000]);
      let axis = new Plottable.Axes.Numeric(scale, "left");

      axis.renderTo(svg);

      let tickLabelContainerClass = "tick-label-container";
      let labelContainer = axis.content().select(`.${tickLabelContainerClass}`);
      axis.content().selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`).each(function() {
        TestMethods.assertBBoxInclusion(labelContainer, d3.select(this));
      });
      svg.remove();
    });

    it("separates tick labels with the same spacing", () => {
      let scale = new Plottable.Scales.Linear();
      scale.domain([-2500000, 2500000]);

      let axis = new Plottable.Axes.Numeric(scale, "bottom");
      axis.renderTo(svg);

      let visibleTickLabels = applyVisibleFilter(axis.content().selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`));

      let visibleTickLabelRects = visibleTickLabels[0].map((label: Element) => label.getBoundingClientRect());

      function getClientRectCenter(rect: ClientRect) {
        return rect.left + rect.width / 2;
      }

      let interval = getClientRectCenter(visibleTickLabelRects[1]) - getClientRectCenter(visibleTickLabelRects[0]);
      d3.pairs(visibleTickLabelRects).forEach((rects, i) => {
        assert.closeTo(getClientRectCenter(rects[1]) - getClientRectCenter(rects[0]),
          interval, window.Pixel_CloseTo_Requirement, `tick label pair ${i} is spaced the same as the first pair`);
      });

      svg.remove();
    });

    it("renders numbers in order with a reversed domain", () => {
      let scale = new Plottable.Scales.Linear();
      scale.domain([3, 0]);

      let axis = new Plottable.Axes.Numeric(scale, "bottom");
      axis.renderTo(svg);

      let tickLabels = applyVisibleFilter(axis.content().selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`));
      assert.operator(tickLabels.size(), ">", 1, "more than one tick label is shown");

      let tickLabelElementPairs = d3.pairs(tickLabels[0]);
      tickLabelElementPairs.forEach(function(tickLabelElementPair, i) {
        let label1 = d3.select(tickLabelElementPair[0]);
        let label2 = d3.select(tickLabelElementPair[1]);
        let labelNumber1 = parseFloat(label1.text());
        let labelNumber2 = parseFloat(label2.text());
        assert.operator(labelNumber1, ">", labelNumber2, `pair ${i} arranged in descending order from left to right`);
      });

      svg.remove();
    });
  });

  describe("drawing tick labels when left oriented", () => {
    it("draws ticks labels centered with the corresponding tick mark", () => {
      let svg = TestMethods.generateSVG();
      let scale = new Plottable.Scales.Linear();
      let numericAxis = new Plottable.Axes.Numeric(scale, "left");
      numericAxis.renderTo(svg);

      let tickLabels = numericAxis.content().selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`);
      assert.operator(tickLabels.size(), ">=", 2, "at least two tick labels were drawn");
      let tickMarks = numericAxis.content().selectAll(`.${Plottable.Axis.TICK_MARK_CLASS}`);
      assert.strictEqual(tickLabels.size(), tickMarks.size(), "there is one label per mark");

      tickLabels.each(function(d, i) {
        let tickLabelClientRect = this.getBoundingClientRect();
        let tickMarkClientRect = (<Element> tickMarks[0][i]).getBoundingClientRect();
        let labelCenter = (tickLabelClientRect.top + tickLabelClientRect.bottom) / 2;
        let markCenter = (tickMarkClientRect.top + tickMarkClientRect.bottom) / 2;
        assert.closeTo(labelCenter, markCenter, 1.5, `tick label ${i} is centered on mark`);
      });

      svg.remove();
    });

    it("does not overlap tick marks with tick labels", () => {
      let svg = TestMethods.generateSVG();

      let scale = new Plottable.Scales.Linear();
      scale.domain([175, 185]);
      let axis = new Plottable.Axes.Numeric(scale, "left")
                                    .innerTickLength(50);
      axis.renderTo(svg);

      let tickLabels = applyVisibleFilter(axis.content().selectAll("." + Plottable.Axis.TICK_LABEL_CLASS));

      let tickMarks = applyVisibleFilter(axis.content().selectAll("." + Plottable.Axis.TICK_MARK_CLASS));

      tickLabels.each(function(d, i) {
        let tickLabelRect = this.getBoundingClientRect();
        tickMarks.each(function(d2, i2) {
          let tickMarkRect = this.getBoundingClientRect();
            assert.isFalse(Plottable.Utils.DOM.clientRectsOverlap(tickLabelRect, tickMarkRect),
              `tickMark ${i} and tickLabel ${i2} should not overlap`);
        });
      });
      svg.remove();
    });
  });

  describe("formatting the labels", () => {
    it("formats to the specified formatter", () => {
      let svg = TestMethods.generateSVG();
      let scale = new Plottable.Scales.Linear();

      let formatter = Plottable.Formatters.fixed(2);

      let numericAxis = new Plottable.Axes.Numeric(scale, "left");
      numericAxis.formatter(formatter);
      numericAxis.renderTo(svg);

      let tickLabels = numericAxis.content().selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`);
      tickLabels.each(function(d, i) {
        let labelText = d3.select(this).text();
        let formattedValue = formatter(d);
        assert.strictEqual(labelText, formattedValue, `formatter used to format tick label ${i}`);
      });

      svg.remove();
    });
  });

  orientations.forEach((orientation) => {
    it(`allocates enough height to show all tick labels for orientation ${orientation}`, () => {
      let svg = TestMethods.generateSVG();
      let scale = new Plottable.Scales.Linear();
      scale.domain([5, -5]);

      let formatter = (d: any) => (d === 0) ? "ZERO" : String(d);

      let axis = new Plottable.Axes.Numeric(scale, orientation);
      axis.formatter(formatter);
      axis.renderTo(svg);

      let visibleTickLabels = applyVisibleFilter(axis.content()
        .selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`));
      let boundingBox = (<Element> svg.select(".axis").select(".bounding-box").node()).getBoundingClientRect();
      visibleTickLabels.each(function(d, i) {
        let visibleTickLabelRect = this.getBoundingClientRect();
        assert.isTrue(boxIsInside(visibleTickLabelRect, boundingBox, 0.5), `tick label ${i} is inside the bounding box`);
      });

      svg.remove();
    });
  });

  verticalOrientations.forEach((verticalOrientation) => {
    it(`allocates enough width to show long tick labels for orientation ${verticalOrientation}`, () => {
      let svg = TestMethods.generateSVG();
      let scale = new Plottable.Scales.Linear();
      scale.domain([50000000000, -50000000000]);

      let formatter = (d: any) => (d === 0) ? "ZERO" : String(d);

      let axis = new Plottable.Axes.Numeric(scale, verticalOrientation);
      axis.formatter(formatter);
      axis.renderTo(svg);

      let visibleTickLabels = applyVisibleFilter(axis.content()
        .selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`));
      let boundingBox = (<Element> svg.select(".axis").select(".bounding-box").node()).getBoundingClientRect();
      visibleTickLabels.each(function(d, i) {
        let visibleTickLabelRect = this.getBoundingClientRect();
        assertBoxInside(visibleTickLabelRect, boundingBox, 0, `long tick label ${i} is inside the bounding box`);
      });
      svg.remove();
    });
  });

  describe("drawing tick marks", () => {
    it("does not draw ticks marks outside of the svg", () => {
      let svg = TestMethods.generateSVG();
      let scale = new Plottable.Scales.Linear();
      let domainMin = 0;
      let domainMax = 3;
      scale.domain([domainMin, domainMax]);
      scale.tickGenerator(function() {
        return Plottable.Utils.Math.range(domainMin, domainMax + 4);
      });
      let axis = new Plottable.Axes.Numeric(scale, "bottom");
      axis.renderTo(svg);
      let tickMarks = axis.content().selectAll(".tick-mark");
      tickMarks.each(function(d, i) {
        let tickMark = d3.select(this);
        let tickMarkPosition = TestMethods.numAttr(tickMark, "x1");
        assert.operator(tickMarkPosition, ">=", 0, `tick mark ${i} drawn right of left edge`);
        assert.operator(tickMarkPosition, "<=", axis.width(), `tick mark ${i} drawn left of right edge`);
      });
      svg.remove();
    });
  });

  describe("using width approximation", () => {
    it("reasonably approximates tick label sizes with approximate measuring", () => {
      let svg = TestMethods.generateSVG();

      let testDomains = [[-1, 1],
                      [0, 10],
                      [0, 999999999]];

      let maxErrorFactor = 1.4;

      testDomains.forEach((testDomain) => {
        let scale = new Plottable.Scales.Linear();
        scale.domain(testDomain);
        let numericAxis = new Plottable.Axes.Numeric(scale, "left");

        numericAxis.usesTextWidthApproximation(true);
        numericAxis.renderTo(svg);
        let widthApprox = numericAxis.width();

        numericAxis.usesTextWidthApproximation(false);
        numericAxis.redraw();
        let widthExact = numericAxis.width();

        assert.operator(widthApprox, "<", (widthExact * maxErrorFactor),
          `approximate domain of [${testDomain[0]},${testDomain[1]}] less than ${maxErrorFactor} times larger than exact scale`);
        assert.operator(widthApprox, ">=", widthExact,
          `approximate domain of [${testDomain[0]},${testDomain[1]}] greater than an exact scale`);
        numericAxis.destroy();
      });

      svg.remove();
    });
  });
});
