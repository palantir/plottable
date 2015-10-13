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

  describe("setting the position of the tick labels when bottom oriented", () => {

    let axis: Plottable.Axes.Numeric;

    beforeEach(() => {
      let scale = new Plottable.Scales.Linear();
      axis = new Plottable.Axes.Numeric(scale, "bottom");
    });

    it("throws an error when setting an invalid position", () => {
      assert.throws(() => axis.tickLabelPosition("top"), "horizontal");
      assert.throws(() => axis.tickLabelPosition("bottom"), "horizontal");
    });

    it("draws tick labels left of the corresponding mark if specified", () => {
      let svg = TestMethods.generateSVG();
      axis.tickLabelPosition("left");
      axis.renderTo(svg);

      let tickLabels = axis.content().selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`);
      let tickMarks = axis.content().selectAll(`.${Plottable.Axis.TICK_MARK_CLASS}`);
      assert.operator(tickLabels.size(), ">=", 2, "at least two tick labels were drawn");
      assert.strictEqual(tickLabels.size(), tickMarks.size(), "there is one label per mark");

      tickLabels.each(function(d, i) {
        let tickLabelClientRect = this.getBoundingClientRect();
        let tickMarkClientRect = (<Element> tickMarks[0][i]).getBoundingClientRect();
        assert.operator(tickLabelClientRect.left, "<=", tickMarkClientRect.right, `tick label ${i} is to left of mark`);
      });
      svg.remove();
    });

    it("draws tick labels right of the corresponding mark if specified", () => {
      let svg = TestMethods.generateSVG();
      axis.tickLabelPosition("right");
      axis.renderTo(svg);

      let tickLabels = axis.content().selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`);
      let tickMarks = axis.content().selectAll(`.${Plottable.Axis.TICK_MARK_CLASS}`);
      assert.operator(tickLabels.size(), ">=", 2, "at least two tick labels were drawn");
      assert.strictEqual(tickLabels.size(), tickMarks.size(), "there is one label per mark");

      tickLabels.each(function(d, i) {
        let tickLabelClientRect = this.getBoundingClientRect();
        let tickMarkClientRect = (<Element> tickMarks[0][i]).getBoundingClientRect();
        assert.operator(tickMarkClientRect.right, "<=", tickLabelClientRect.left, `tick label ${i} is to right of mark`);
      });
      svg.remove();
    });
  });

  describe("setting the position of the tick labels when left oriented", () => {

    let axis: Plottable.Axes.Numeric;

    beforeEach(() => {
      let scale = new Plottable.Scales.Linear();
      axis = new Plottable.Axes.Numeric(scale, "left");
    });

    it("throws an error when setting an invalid position", () => {
      assert.throws(() => axis.tickLabelPosition("left"), "vertical");
      assert.throws(() => axis.tickLabelPosition("right"), "vertical");
    });

    it("draws tick labels top of the corresponding mark if specified", () => {
      let svg = TestMethods.generateSVG();
      axis.tickLabelPosition("top");
      axis.renderTo(svg);

      let tickLabels = axis.content().selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`);
      let tickMarks = axis.content().selectAll(`.${Plottable.Axis.TICK_MARK_CLASS}`);
      assert.operator(tickLabels.size(), ">=", 2, "at least two tick labels were drawn");
      assert.strictEqual(tickLabels.size(), tickMarks.size(), "there is one label per mark");

      tickLabels.each(function(d, i) {
        let tickLabelClientRect = this.getBoundingClientRect();
        let tickMarkClientRect = (<Element> tickMarks[0][i]).getBoundingClientRect();
        assert.operator(tickLabelClientRect.bottom, "<=", tickMarkClientRect.top, `tick label ${i} is above mark`);
      });
      svg.remove();
    });

    it("draws tick labels bottom of the corresponding mark if specified", () => {
      let svg = TestMethods.generateSVG();
      axis.tickLabelPosition("bottom");
      axis.renderTo(svg);

      let tickLabels = axis.content().selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`);
      let tickMarks = axis.content().selectAll(`.${Plottable.Axis.TICK_MARK_CLASS}`);
      assert.operator(tickLabels.size(), ">=", 2, "at least two tick labels were drawn");
      assert.strictEqual(tickLabels.size(), tickMarks.size(), "there is one label per mark");

      tickLabels.each(function(d, i) {
        let tickLabelClientRect = this.getBoundingClientRect();
        let tickMarkClientRect = (<Element> tickMarks[0][i]).getBoundingClientRect();
        assert.operator(tickMarkClientRect.bottom, "<=", tickLabelClientRect.top, `tick label ${i} is below mark`);
      });
      svg.remove();
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

      let visibleTickLabels = numericAxis.content()
        .selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`)
        .filter(function() {
          return d3.select(this).style("visibility") === "visible";
        });

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

      let labelContainer = axis.content().select(".tick-label-container");
      axis.content().selectAll(".tick-label").each(function() {
        TestMethods.assertBBoxInclusion(labelContainer, d3.select(this));
      });
      svg.remove();
    });

    it("separates tick labels with the same spacing", () => {
      let scale = new Plottable.Scales.Linear();
      scale.domain([-2500000, 2500000]);

      let axis = new Plottable.Axes.Numeric(scale, "bottom");
      axis.renderTo(svg);

      let visibleTickLabels = axis.content().selectAll(".tick-label")
        .filter(function(d: any, i: number) {
          let visibility = d3.select(this).style("visibility");
          return (visibility === "visible") || (visibility === "inherit");
        });

      let visibleTickLabelRects = visibleTickLabels[0].map((label: Element) => label.getBoundingClientRect());

      function getClientRectCenter(rect: ClientRect) {
        return rect.left + rect.width / 2;
      }

      let interval = getClientRectCenter(visibleTickLabelRects[1]) - getClientRectCenter(visibleTickLabelRects[0]);
      d3.pairs(visibleTickLabelRects).forEach((rects, i) => {
        assert.closeTo(getClientRectCenter(rects[1]) - getClientRectCenter(rects[0]),
          interval, 0.5, `tick label pair ${i} is spaced the same as the first pair`);
      });

      svg.remove();
    });

    it("renders numbers in order with a reversed domain", () => {
      let scale = new Plottable.Scales.Linear();
      scale.domain([3, 0]);

      let axis = new Plottable.Axes.Numeric(scale, "bottom");
      axis.renderTo(svg);

      let tickLabels = axis.content().selectAll(".tick-label")
          .filter(function(d: any, i: number) {
            let visibility = d3.select(this).style("visibility");
            return (visibility === "visible") || (visibility === "inherit");
          });
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

      let tickLabels = axis.content().selectAll("." + Plottable.Axis.TICK_LABEL_CLASS)
          .filter(function(d: any, i: number) {
            let visibility = d3.select(this).style("visibility");
            return (visibility === "visible") || (visibility === "inherit");
          });

      let tickMarks = axis.content().selectAll("." + Plottable.Axis.TICK_MARK_CLASS)
          .filter(function(d: any, i: number) {
            let visibility = d3.select(this).style("visibility");
            return (visibility === "visible") || (visibility === "inherit");
          });

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

  describe("allocating space when left oriented", () => {
    it("allocates enough width to show short tick labels when vertical", () => {
      let svg = TestMethods.generateSVG();
      let scale = new Plottable.Scales.Linear();
      scale.domain([5, -5]);

      let formatter = (d: any) => (d === 0) ? "ZERO" : String(d);

      let axis = new Plottable.Axes.Numeric(scale, "left");
      axis.formatter(formatter);
      axis.renderTo(svg);

      let visibleTickLabels = axis.content()
        .selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`)
        .filter(function() {
          return d3.select(this).style("visibility") === "visible";
        });
      let boundingBox = (<Element> svg.select(".axis").select(".bounding-box").node()).getBoundingClientRect();
      visibleTickLabels.each(function(d, i) {
        let visibleTickLabelRect = this.getBoundingClientRect();
        assert.isTrue(boxIsInside(visibleTickLabelRect, boundingBox), `tick label ${i} is inside the bounding box`);
      });
      svg.remove();
    });

    it("allocates enough width to show long tick labels when vertical", () => {
      let svg = TestMethods.generateSVG();
      let scale = new Plottable.Scales.Linear();
      scale.domain([50000000000, -50000000000]);

      let formatter = (d: any) => (d === 0) ? "ZERO" : String(d);

      let axis = new Plottable.Axes.Numeric(scale, "left");
      axis.formatter(formatter);
      axis.renderTo(svg);

      let visibleTickLabels = axis.content()
        .selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`)
        .filter(function() {
          return d3.select(this).style("visibility") === "visible";
        });
      let boundingBox = (<Element> svg.select(".axis").select(".bounding-box").node()).getBoundingClientRect();
      visibleTickLabels.each(function(d, i) {
        let visibleTickLabelRect = this.getBoundingClientRect();
        assertBoxInside(visibleTickLabelRect, boundingBox, 0, `long tick label ${i} is inside the bounding box`);
      });
      svg.remove();
    });
  });

  describe("allocating space when bottom oriented", () => {
    it("allocates enough height to show all tick labels when horizontal", () => {
      let svg = TestMethods.generateSVG();
      let scale = new Plottable.Scales.Linear();
      scale.domain([5, -5]);

      let axis = new Plottable.Axes.Numeric(scale, "bottom");
      axis.renderTo(svg);

      let visibleTickLabels = axis.content()
        .selectAll(`.${Plottable.Axis.TICK_LABEL_CLASS}`)
        .filter(function() {
          return d3.select(this).style("visibility") === "visible";
        });
      let boundingBox = (<Element> svg.select(".axis").select(".bounding-box").node()).getBoundingClientRect();
      visibleTickLabels.each(function(d, i) {
        let visibleTickLabelRect = this.getBoundingClientRect();
        assert.isTrue(boxIsInside(visibleTickLabelRect, boundingBox, 0.5), `tick label ${i} is inside the bounding box`);
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
