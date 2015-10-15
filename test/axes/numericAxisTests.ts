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

  it("tickLabelPosition() input validation", () => {
    let scale = new Plottable.Scales.Linear();
    let horizontalAxis = new Plottable.Axes.Numeric(scale, "bottom");
    assert.throws(() => horizontalAxis.tickLabelPosition("top"), "horizontal");
    assert.throws(() => horizontalAxis.tickLabelPosition("bottom"), "horizontal");

    let verticalAxis = new Plottable.Axes.Numeric(scale, "left");
    assert.throws(() => verticalAxis.tickLabelPosition("left"), "vertical");
    assert.throws(() => verticalAxis.tickLabelPosition("right"), "vertical");
  });

  it("draws tick labels correctly (horizontal)", () => {
    let SVG_WIDTH = 500;
    let SVG_HEIGHT = 100;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    scale.range([0, SVG_WIDTH]);
    let numericAxis = new Plottable.Axes.Numeric(scale, "bottom");
    numericAxis.renderTo(svg);

    let tickLabels = (<any> numericAxis)._element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
    let tickMarks = (<any> numericAxis)._element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
    assert.strictEqual( tickLabels[0].length, tickMarks[0].length, "there is one label per mark");

    let i: number;
    let markBB: ClientRect;
    let labelBB: ClientRect;
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBoundingClientRect();
      let markCenter = (markBB.left + markBB.right) / 2;
      labelBB = tickLabels[0][i].getBoundingClientRect();
      let labelCenter = (labelBB.left + labelBB.right) / 2;
      assert.closeTo(labelCenter, markCenter, 1, "tick label is centered on mark");
    }

    // labels to left
    numericAxis.tickLabelPosition("left");
    tickLabels = (<any> numericAxis)._element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    tickMarks = (<any> numericAxis)._element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBoundingClientRect();
      labelBB = tickLabels[0][i].getBoundingClientRect();
      assert.operator(labelBB.left, "<=", markBB.right, "tick label is to left of mark");
    }

    // labels to right
    numericAxis.tickLabelPosition("right");
    tickLabels = (<any> numericAxis)._element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    tickMarks = (<any> numericAxis)._element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBoundingClientRect();
      labelBB = tickLabels[0][i].getBoundingClientRect();
      assert.operator(markBB.right, "<=", labelBB.left, "tick label is to right of mark");
    }

    svg.remove();
  });

  it("draws ticks correctly (vertical)", () => {
    let SVG_WIDTH = 100;
    let SVG_HEIGHT = 500;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    scale.range([0, SVG_HEIGHT]);
    let numericAxis = new Plottable.Axes.Numeric(scale, "left");
    numericAxis.renderTo(svg);

    let tickLabels = (<any> numericAxis)._element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
    let tickMarks = (<any> numericAxis)._element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
    assert.strictEqual(tickLabels[0].length, tickMarks[0].length, "there is one label per mark");

    let i: number;
    let markBB: ClientRect;
    let labelBB: ClientRect;
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBoundingClientRect();
      let markCenter = (markBB.top + markBB.bottom) / 2;
      labelBB = tickLabels[0][i].getBoundingClientRect();
      let labelCenter = (labelBB.top + labelBB.bottom) / 2;
      assert.closeTo(labelCenter, markCenter, 1.5, "tick label is centered on mark");
    }

    // labels to top
    numericAxis.tickLabelPosition("top");
    tickLabels = (<any> numericAxis)._element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    tickMarks = (<any> numericAxis)._element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBoundingClientRect();
      labelBB = tickLabels[0][i].getBoundingClientRect();
      assert.operator(labelBB.bottom, "<=", markBB.top, "tick label is above mark");
    }

    // labels to bottom
    numericAxis.tickLabelPosition("bottom");
    tickLabels = (<any> numericAxis)._element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    tickMarks = (<any> numericAxis)._element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBoundingClientRect();
      labelBB = tickLabels[0][i].getBoundingClientRect();
      assert.operator(markBB.bottom, "<=", labelBB.top, "tick label is below mark");
    }

    svg.remove();
  });

  it("uses the supplied Formatter", () => {
    let SVG_WIDTH = 100;
    let SVG_HEIGHT = 500;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    scale.range([0, SVG_HEIGHT]);

    let formatter = Plottable.Formatters.fixed(2);

    let numericAxis = new Plottable.Axes.Numeric(scale, "left");
    numericAxis.formatter(formatter);
    numericAxis.renderTo(svg);

    let tickLabels = (<any> numericAxis)._element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    tickLabels.each(function(d: any, i: number) {
      let labelText = d3.select(this).text();
      let formattedValue = formatter(d);
      assert.strictEqual(labelText, formattedValue, "The supplied Formatter was used to format the tick label");
    });

    svg.remove();
  });

  it("tick labels don't overlap in a constrained space", () => {
    let SVG_WIDTH = 100;
    let SVG_HEIGHT = 100;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    scale.range([0, SVG_WIDTH]);
    let numericAxis = new Plottable.Axes.Numeric(scale, "bottom");
    numericAxis.renderTo(svg);

    let visibleTickLabels = (<any> numericAxis)._element
                              .selectAll("." + Plottable.Axis.TICK_LABEL_CLASS)
                              .filter(function(d: any, i: number) {
                                return d3.select(this).style("visibility") === "visible";
                              });
    let numLabels = visibleTickLabels[0].length;
    let clientRect1: ClientRect;
    let clientRect2: ClientRect;
    for (let i = 0; i < numLabels; i++) {
      for (let j = i + 1; j < numLabels; j++) {
        clientRect1 = visibleTickLabels[0][i].getBoundingClientRect();
        clientRect2 = visibleTickLabels[0][j].getBoundingClientRect();

        assert.isFalse(Plottable.Utils.DOM.clientRectsOverlap(clientRect1, clientRect2), "tick labels don't overlap");
      }
    }

    numericAxis.orientation("bottom");
    visibleTickLabels = (<any> numericAxis)._element
                          .selectAll("." + Plottable.Axis.TICK_LABEL_CLASS)
                          .filter(function(d: any, i: number) {
                            return d3.select(this).style("visibility") === "visible";
                          });
    numLabels = visibleTickLabels[0].length;
    for (let i = 0; i < numLabels; i++) {
      for (let j = i + 1; j < numLabels; j++) {
        clientRect1 = visibleTickLabels[0][i].getBoundingClientRect();
        clientRect2 = visibleTickLabels[0][j].getBoundingClientRect();

        assert.isFalse(Plottable.Utils.DOM.clientRectsOverlap(clientRect1, clientRect2), "tick labels don't overlap");
      }
    }

    svg.remove();
  });

  it("allocates enough width to show all tick labels when vertical", () => {
    let SVG_WIDTH = 150;
    let SVG_HEIGHT = 500;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    scale.domain([5, -5]);
    scale.range([0, SVG_HEIGHT]);

    let formatter = (d: any) => {
      if (d === 0) {
        return "ZERO";
      }
      return String(d);
    };

    let numericAxis = new Plottable.Axes.Numeric(scale, "left");
    numericAxis.formatter(formatter);
    numericAxis.renderTo(svg);

    let visibleTickLabels = (<any> numericAxis)._element
                          .selectAll("." + Plottable.Axis.TICK_LABEL_CLASS)
                          .filter(function(d: any, i: number) {
                            return d3.select(this).style("visibility") === "visible";
                          });
    let boundingBox: ClientRect = (<any> numericAxis)._element.select(".bounding-box").node().getBoundingClientRect();
    let labelBox: ClientRect;
    visibleTickLabels[0].forEach((label: Element) => {
      labelBox = label.getBoundingClientRect();
      assert.isTrue(boxIsInside(labelBox, boundingBox), "tick labels don't extend outside the bounding box");
    });

    scale.domain([50000000000, -50000000000]);
    visibleTickLabels = (<any> numericAxis)._element
                          .selectAll("." + Plottable.Axis.TICK_LABEL_CLASS)
                          .filter(function(d: any, i: number) {
                            return d3.select(this).style("visibility") === "visible";
                          });
    boundingBox = (<any> numericAxis)._element.select(".bounding-box").node().getBoundingClientRect();
    visibleTickLabels[0].forEach((label: Element) => {
      labelBox = label.getBoundingClientRect();
      assertBoxInside(labelBox, boundingBox, 0, "long tick " + label.textContent + " is inside the bounding box");
    });

    svg.remove();
  });

  it("allocates enough height to show all tick labels when horizontal", () => {
    let SVG_WIDTH = 500;
    let SVG_HEIGHT = 100;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    scale.domain([5, -5]);
    scale.range([0, SVG_WIDTH]);

    let formatter = Plottable.Formatters.fixed(2);

    let numericAxis = new Plottable.Axes.Numeric(scale, "bottom");
    numericAxis.formatter(formatter);
    numericAxis.renderTo(svg);

    let visibleTickLabels = (<any> numericAxis)._element
                          .selectAll("." + Plottable.Axis.TICK_LABEL_CLASS)
                          .filter(function(d: any, i: number) {
                            return d3.select(this).style("visibility") === "visible";
                          });
    let boundingBox: ClientRect = (<any> numericAxis)._element.select(".bounding-box").node().getBoundingClientRect();
    let labelBox: ClientRect;
    visibleTickLabels[0].forEach((label: Element) => {
      labelBox = label.getBoundingClientRect();
      assert.isTrue(boxIsInside(labelBox, boundingBox, 0.5), "tick labels don't extend outside the bounding box");
    });

    svg.remove();
  });

  it("truncates long labels", () => {
    let dataset = new Plottable.Dataset([
      { x: "A", y: 500000000 },
      { x: "B", y: 400000000 }
    ]);
    let SVG_WIDTH = 120;
    let SVG_HEIGHT = 300;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);

    let xScale = new Plottable.Scales.Category();
    let yScale = new Plottable.Scales.Linear();
    let yAxis = new Plottable.Axes.Numeric(yScale, "left");

    let yLabel = new Plottable.Components.AxisLabel("LABEL");
    yLabel.angle(-90);
    let barPlot = new Plottable.Plots.Bar();
    barPlot.x((d: any) => d.x, xScale);
    barPlot.y((d: any) => d.y, yScale);
    barPlot.addDataset(dataset);

    let chart = new Plottable.Components.Table([
        [ yLabel, yAxis, barPlot ]
    ]);
    chart.renderTo(svg);

    let labelContainer = d3.select(".tick-label-container");
    d3.selectAll(".tick-label").each(function() {
      TestMethods.assertBBoxInclusion(labelContainer, d3.select(this));
    });
    svg.remove();
  });

  it("confines labels to the bounding box for the axis", () => {
    let SVG_WIDTH = 500;
    let SVG_HEIGHT = 100;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    let axis = new Plottable.Axes.Numeric(scale, "bottom");
    axis.formatter((d: any) => "longstringsareverylong");
    axis.renderTo(svg);
    let boundingBox = d3.select(".x-axis .bounding-box");
    d3.selectAll(".x-axis .tick-label").each(function() {
      let tickLabel = d3.select(this);
      if (tickLabel.style("visibility") === "inherit") {
        TestMethods.assertBBoxInclusion(boundingBox, tickLabel);
      }
    });
    svg.remove();
  });

  function getClientRectCenter(rect: ClientRect) {
    return rect.left + rect.width / 2;
  }

  it("tick labels follow a sensible interval", () => {
    let SVG_WIDTH = 500;
    let SVG_HEIGHT = 100;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);

    let scale = new Plottable.Scales.Linear();
    scale.domain([-2500000, 2500000]);

    let baseAxis = new Plottable.Axes.Numeric(scale, "bottom");
    baseAxis.renderTo(svg);

    let visibleTickLabels = (<any> baseAxis)._element.selectAll(".tick-label")
      .filter(function(d: any, i: number) {
        let visibility = d3.select(this).style("visibility");
        return (visibility === "visible") || (visibility === "inherit");
      });

    let visibleTickLabelRects = visibleTickLabels[0].map((label: HTMLScriptElement) => label.getBoundingClientRect());
    let interval = getClientRectCenter(visibleTickLabelRects[1]) - getClientRectCenter(visibleTickLabelRects[0]);
    for (let i = 0; i < visibleTickLabelRects.length - 1; i++) {
      assert.closeTo(getClientRectCenter(visibleTickLabelRects[i + 1]) - getClientRectCenter(visibleTickLabelRects[i]),
        interval, 0.5, "intervals are all spaced the same");
    }

    svg.remove();
  });

  it("does not draw ticks marks outside of the svg", () => {
    let SVG_WIDTH = 300;
    let SVG_HEIGHT = 100;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    scale.domain([0, 3]);
    scale.tickGenerator(function(s) {
      return [0, 1, 2, 3, 4];
    });
    let baseAxis = new Plottable.Axes.Numeric(scale, "bottom");
    baseAxis.renderTo(svg);
    let tickMarks = (<any> baseAxis)._element.selectAll(".tick-mark");
    tickMarks.each(function() {
      let tickMark = d3.select(this);
      let tickMarkPosition = Number(tickMark.attr("x"));
      assert.isTrue(tickMarkPosition >= 0 && tickMarkPosition <= SVG_WIDTH, "tick marks are located within the bounding SVG");
    });
    svg.remove();
  });

  it("renders tick labels properly when the domain is reversed", () => {
    let SVG_WIDTH = 300;
    let SVG_HEIGHT = 100;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);

    let scale = new Plottable.Scales.Linear();
    scale.domain([3, 0]);

    let baseAxis = new Plottable.Axes.Numeric(scale, "bottom");
    baseAxis.renderTo(svg);

    let tickLabels = (<any> baseAxis)._element.selectAll(".tick-label")
        .filter(function(d: any, i: number) {
          let visibility = d3.select(this).style("visibility");
          return (visibility === "visible") || (visibility === "inherit");
        });
    assert.isTrue(tickLabels[0].length > 1, "more than one tick label is shown");

    for (let i = 0; i < tickLabels[0].length - 1; i++) {
      let currLabel = d3.select(tickLabels[0][i]);
      let nextLabel = d3.select(tickLabels[0][i + 1]);
      assert.isTrue(Number(currLabel.text()) > Number(nextLabel.text()), "numbers are arranged in descending order from left to right");
    }

    svg.remove();
  });

  it("constrained tick labels do not overlap tick marks", () => {
    let svg = TestMethods.generateSVG(100, 50);

    let yScale = new Plottable.Scales.Linear();
    yScale.domain([175, 185]);
    let yAxis = new Plottable.Axes.Numeric(yScale, "left")
                                  .tickLabelPosition("top")
                                  .innerTickLength(50);
    yAxis.renderTo(svg);

    let tickLabels = (<any> yAxis)._element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS)
        .filter(function(d: any, i: number) {
          let visibility = d3.select(this).style("visibility");
          return (visibility === "visible") || (visibility === "inherit");
        });

    let tickMarks = (<any> yAxis)._element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS)
        .filter(function(d: any, i: number) {
          let visibility = d3.select(this).style("visibility");
          return (visibility === "visible") || (visibility === "inherit");
        });

    tickLabels.each(function() {
      let tickLabelRect = this.getBoundingClientRect();

      tickMarks.each(function() {
        let tickMarkRect = this.getBoundingClientRect();
          assert.isFalse(Plottable.Utils.DOM.clientRectsOverlap(tickLabelRect, tickMarkRect),
            "tickMarks and tickLabels should not overlap when top/bottom/left/right position is used for the tickLabel");
      });
    });

    svg.remove();
  });

  it("reasonably approximates tick label sizes with approximate measuring", () => {
    let SVG_WIDTH = 500;
    let SVG_HEIGHT = 100;

    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);

    let testCases = [[-1, 1],
                     [0, 10],
                     [0, 999999999]];

    let maxErrorFactor = 1.4;

    testCases.forEach((domainBounds) => {
      let scale = new Plottable.Scales.Linear();
      scale.domain(domainBounds);
      let numericAxis = new Plottable.Axes.Numeric(scale, "left");

      numericAxis.usesTextWidthApproximation(true);
      numericAxis.renderTo(svg);
      let widthApprox = numericAxis.width();

      numericAxis.usesTextWidthApproximation(false);
      numericAxis.redraw();
      let widthExact = numericAxis.width();

      assert.operator(widthApprox, "<", (widthExact * maxErrorFactor),
        "an approximate scale of [" + domainBounds[0] + "," + domainBounds[1] + "] is less than "
        + maxErrorFactor + "x larger than an exact scale");
      assert.operator(widthApprox, ">=", widthExact,
        "an approximate scale of [" + domainBounds[0] + "," + domainBounds[1] + "] is smaller than an exact scale");

      numericAxis.destroy();
    });

    svg.remove();
  });
});
