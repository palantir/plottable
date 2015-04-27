///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("NumericAxis", () => {
  function boxesOverlap(boxA: ClientRect, boxB: ClientRect) {
    if (boxA.right < boxB.left) { return false; }
    if (boxA.left > boxB.right) { return false; }
    if (boxA.bottom < boxB.top) { return false; }
    if (boxA.top > boxB.bottom) { return false; }
    return true;
  }

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
    var scale = new Plottable.Scales.Linear();
    var horizontalAxis = new Plottable.Axes.Numeric(scale, "bottom");
    assert.throws(() => horizontalAxis.tickLabelPosition("top"), "horizontal");
    assert.throws(() => horizontalAxis.tickLabelPosition("bottom"), "horizontal");

    var verticalAxis = new Plottable.Axes.Numeric(scale, "left");
    assert.throws(() => verticalAxis.tickLabelPosition("left"), "vertical");
    assert.throws(() => verticalAxis.tickLabelPosition("right"), "vertical");
  });

  it("draws tick labels correctly (horizontal)", () => {
    var SVG_WIDTH = 500;
    var SVG_HEIGHT = 100;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scales.Linear();
    scale.range([0, SVG_WIDTH]);
    var numericAxis = new Plottable.Axes.Numeric(scale, "bottom");
    numericAxis.renderTo(svg);

    var tickLabels = (<any> numericAxis).element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
    var tickMarks = (<any> numericAxis).element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
    assert.strictEqual( tickLabels[0].length, tickMarks[0].length, "there is one label per mark");

    var i: number;
    var markBB: ClientRect;
    var labelBB: ClientRect;
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBoundingClientRect();
      var markCenter = (markBB.left + markBB.right) / 2;
      labelBB = tickLabels[0][i].getBoundingClientRect();
      var labelCenter = (labelBB.left + labelBB.right) / 2;
      assert.closeTo(labelCenter, markCenter, 1, "tick label is centered on mark");
    }

    // labels to left
    numericAxis.tickLabelPosition("left");
    tickLabels = (<any> numericAxis).element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    tickMarks = (<any> numericAxis).element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBoundingClientRect();
      labelBB = tickLabels[0][i].getBoundingClientRect();
      assert.operator(labelBB.left, "<=", markBB.right, "tick label is to left of mark");
    }

    // labels to right
    numericAxis.tickLabelPosition("right");
    tickLabels = (<any> numericAxis).element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    tickMarks = (<any> numericAxis).element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBoundingClientRect();
      labelBB = tickLabels[0][i].getBoundingClientRect();
      assert.operator(markBB.right, "<=", labelBB.left, "tick label is to right of mark");
    }

    svg.remove();
  });

  it("draws ticks correctly (vertical)", () => {
    var SVG_WIDTH = 100;
    var SVG_HEIGHT = 500;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scales.Linear();
    scale.range([0, SVG_HEIGHT]);
    var numericAxis = new Plottable.Axes.Numeric(scale, "left");
    numericAxis.renderTo(svg);

    var tickLabels = (<any> numericAxis).element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
    var tickMarks = (<any> numericAxis).element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
    assert.strictEqual(tickLabels[0].length, tickMarks[0].length, "there is one label per mark");

    var i: number;
    var markBB: ClientRect;
    var labelBB: ClientRect;
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBoundingClientRect();
      var markCenter = (markBB.top + markBB.bottom) / 2;
      labelBB = tickLabels[0][i].getBoundingClientRect();
      var labelCenter = (labelBB.top + labelBB.bottom) / 2;
      assert.closeTo(labelCenter, markCenter, 1, "tick label is centered on mark");
    }

    // labels to top
    numericAxis.tickLabelPosition("top");
    tickLabels = (<any> numericAxis).element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    tickMarks = (<any> numericAxis).element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBoundingClientRect();
      labelBB = tickLabels[0][i].getBoundingClientRect();
      assert.operator(labelBB.bottom, "<=", markBB.top, "tick label is above mark");
    }

    // labels to bottom
    numericAxis.tickLabelPosition("bottom");
    tickLabels = (<any> numericAxis).element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    tickMarks = (<any> numericAxis).element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBoundingClientRect();
      labelBB = tickLabels[0][i].getBoundingClientRect();
      assert.operator(markBB.bottom, "<=", labelBB.top, "tick label is below mark");
    }

    svg.remove();
  });

  it("uses the supplied Formatter", () => {
    var SVG_WIDTH = 100;
    var SVG_HEIGHT = 500;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scales.Linear();
    scale.range([0, SVG_HEIGHT]);

    var formatter = Plottable.Formatters.fixed(2);

    var numericAxis = new Plottable.Axes.Numeric(scale, "left", formatter);
    numericAxis.renderTo(svg);

    var tickLabels = (<any> numericAxis).element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    tickLabels.each(function(d: any, i: number) {
      var labelText = d3.select(this).text();
      var formattedValue = formatter(d);
      assert.strictEqual(labelText, formattedValue, "The supplied Formatter was used to format the tick label");
    });

    svg.remove();
  });

  it("can hide tick labels that don't fit", () => {
    var SVG_WIDTH = 500;
    var SVG_HEIGHT = 100;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scales.Linear();
    scale.range([0, SVG_WIDTH]);
    var numericAxis = new Plottable.Axes.Numeric(scale, "bottom");

    numericAxis.showEndTickLabel("left", false);
    assert.isFalse(numericAxis.showEndTickLabel("left"), "retrieve showEndTickLabel setting");
    numericAxis.showEndTickLabel("right", true);
    assert.isTrue(numericAxis.showEndTickLabel("right"), "retrieve showEndTickLabel setting");
    assert.throws(() => numericAxis.showEndTickLabel("top", true), Error);
    assert.throws(() => numericAxis.showEndTickLabel("bottom", true), Error);

    numericAxis.renderTo(svg);

    var tickLabels = (<any> numericAxis).element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
    var firstLabel = d3.select(tickLabels[0][0]);
    assert.strictEqual(firstLabel.style("visibility"), "hidden", "first label is hidden");
    var lastLabel = d3.select(tickLabels[0][tickLabels[0].length - 1]);
    assert.strictEqual(lastLabel.style("visibility"), "hidden", "last label is hidden");

    svg.remove();
  });


  it("tick labels don't overlap in a constrained space", () => {
    var SVG_WIDTH = 100;
    var SVG_HEIGHT = 100;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scales.Linear();
    scale.range([0, SVG_WIDTH]);
    var numericAxis = new Plottable.Axes.Numeric(scale, "bottom");
    numericAxis.showEndTickLabel("left", false).showEndTickLabel("right", false);
    numericAxis.renderTo(svg);

    var visibleTickLabels = (<any> numericAxis).element
                              .selectAll("." + Plottable.Axis.TICK_LABEL_CLASS)
                              .filter(function(d: any, i: number) {
                                return d3.select(this).style("visibility") === "visible";
                              });
    var numLabels = visibleTickLabels[0].length;
    var box1: ClientRect;
    var box2: ClientRect;
    for (var i = 0; i < numLabels; i++) {
      for (var j = i + 1; j < numLabels; j++) {
        box1 = visibleTickLabels[0][i].getBoundingClientRect();
        box2 = visibleTickLabels[0][j].getBoundingClientRect();

        assert.isFalse(Plottable.Utils.DOM.boxesOverlap(box1, box2), "tick labels don't overlap");
      }
    }

    numericAxis.orientation("bottom");
    visibleTickLabels = (<any> numericAxis).element
                          .selectAll("." + Plottable.Axis.TICK_LABEL_CLASS)
                          .filter(function(d: any, i: number) {
                            return d3.select(this).style("visibility") === "visible";
                          });
    numLabels = visibleTickLabels[0].length;
    for (i = 0; i < numLabels; i++) {
      for (j = i + 1; j < numLabels; j++) {
        box1 = visibleTickLabels[0][i].getBoundingClientRect();
        box2 = visibleTickLabels[0][j].getBoundingClientRect();

        assert.isFalse(Plottable.Utils.DOM.boxesOverlap(box1, box2), "tick labels don't overlap");
      }
    }

    svg.remove();
  });

  it("allocates enough width to show all tick labels when vertical", () => {
    var SVG_WIDTH = 150;
    var SVG_HEIGHT = 500;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scales.Linear();
    scale.domain([5, -5]);
    scale.range([0, SVG_HEIGHT]);

    var formatter = (d: any) => {
      if (d === 0) {
        return "ZERO";
      }
      return String(d);
    };

    var numericAxis = new Plottable.Axes.Numeric(scale, "left", formatter);
    numericAxis.renderTo(svg);

    var visibleTickLabels = (<any> numericAxis).element
                          .selectAll("." + Plottable.Axis.TICK_LABEL_CLASS)
                          .filter(function(d: any, i: number) {
                            return d3.select(this).style("visibility") === "visible";
                          });
    var boundingBox: ClientRect = (<any> numericAxis).element.select(".bounding-box").node().getBoundingClientRect();
    var labelBox: ClientRect;
    visibleTickLabels[0].forEach((label: Element) => {
      labelBox = label.getBoundingClientRect();
      assert.isTrue(boxIsInside(labelBox, boundingBox), "tick labels don't extend outside the bounding box");
    });

    scale.domain([50000000000, -50000000000]);
    visibleTickLabels = (<any> numericAxis).element
                          .selectAll("." + Plottable.Axis.TICK_LABEL_CLASS)
                          .filter(function(d: any, i: number) {
                            return d3.select(this).style("visibility") === "visible";
                          });
    boundingBox = (<any> numericAxis).element.select(".bounding-box").node().getBoundingClientRect();
    visibleTickLabels[0].forEach((label: Element) => {
      labelBox = label.getBoundingClientRect();
      assertBoxInside(labelBox, boundingBox, 0, "long tick " + label.textContent + " is inside the bounding box");
    });


    svg.remove();
  });

  it("allocates enough height to show all tick labels when horizontal", () => {
    var SVG_WIDTH = 500;
    var SVG_HEIGHT = 100;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scales.Linear();
    scale.domain([5, -5]);
    scale.range([0, SVG_WIDTH]);

    var formatter = Plottable.Formatters.fixed(2);

    var numericAxis = new Plottable.Axes.Numeric(scale, "bottom", formatter);
    numericAxis.renderTo(svg);

    var visibleTickLabels = (<any> numericAxis).element
                          .selectAll("." + Plottable.Axis.TICK_LABEL_CLASS)
                          .filter(function(d: any, i: number) {
                            return d3.select(this).style("visibility") === "visible";
                          });
    var boundingBox: ClientRect = (<any> numericAxis).element.select(".bounding-box").node().getBoundingClientRect();
    var labelBox: ClientRect;
    visibleTickLabels[0].forEach((label: Element) => {
      labelBox = label.getBoundingClientRect();
      assert.isTrue(boxIsInside(labelBox, boundingBox, 0.5), "tick labels don't extend outside the bounding box");
    });

    svg.remove();
  });

  it("truncates long labels", () => {
    var data = [
      { x: "A", y: 500000000 },
      { x: "B", y:  400000000 }
    ];
    var SVG_WIDTH = 120;
    var SVG_HEIGHT = 300;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);

    var xScale = new Plottable.Scales.Category();
    var yScale = new Plottable.Scales.Linear();
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");
    var yLabel = new Plottable.Components.AxisLabel("LABEL", "left");
    var barPlot = new Plottable.Plots.Bar(xScale, yScale);
    barPlot.project("x", "x", xScale);
    barPlot.project("y", "y", yScale);
    barPlot.addDataset(data);

    var chart = new Plottable.Components.Table([
        [ yLabel, yAxis, barPlot ]
    ]);
    chart.renderTo(svg);

    var labelContainer = d3.select(".tick-label-container");
    d3.selectAll(".tick-label").each(function() {
      assertBBoxInclusion(labelContainer, d3.select(this));
    });
    svg.remove();
  });

  it("confines labels to the bounding box for the axis", () => {
    var SVG_WIDTH = 500;
    var SVG_HEIGHT = 100;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scales.Linear();
    var axis = new Plottable.Axes.Numeric(scale, "bottom");
    axis.formatter((d: any) => "longstringsareverylong");
    axis.renderTo(svg);
    var boundingBox = d3.select(".x-axis .bounding-box");
    d3.selectAll(".x-axis .tick-label").each(function() {
      var tickLabel = d3.select(this);
      if (tickLabel.style("visibility") === "inherit") {
        assertBBoxInclusion(boundingBox, tickLabel);
      }
    });
    svg.remove();
  });

  function getClientRectCenter(rect: ClientRect) {
    return rect.left + rect.width / 2;
  }

  it("tick labels follow a sensible interval", () => {
    var SVG_WIDTH = 500;
    var SVG_HEIGHT = 100;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);

    var scale = new Plottable.Scales.Linear();
    scale.domain([-2500000, 2500000]);

    var baseAxis = new Plottable.Axes.Numeric(scale, "bottom");
    baseAxis.renderTo(svg);

    var visibleTickLabels = (<any> baseAxis).element.selectAll(".tick-label")
      .filter(function(d: any, i: number) {
        var visibility = d3.select(this).style("visibility");
        return (visibility === "visible") || (visibility === "inherit");
      });

    var visibleTickLabelRects = visibleTickLabels[0].map((label: HTMLScriptElement) => label.getBoundingClientRect());
    var interval = getClientRectCenter(visibleTickLabelRects[1]) - getClientRectCenter(visibleTickLabelRects[0]);
    for (var i = 0; i < visibleTickLabelRects.length - 1; i++) {
      assert.closeTo(getClientRectCenter(visibleTickLabelRects[i + 1]) - getClientRectCenter(visibleTickLabelRects[i]),
        interval, 0.5, "intervals are all spaced the same");
    }

    svg.remove();
  });

  it("does not draw ticks marks outside of the svg", () => {
    var SVG_WIDTH = 300;
    var SVG_HEIGHT = 100;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scales.Linear();
    scale.domain([0, 3]);
    scale.tickGenerator(function(s) {
      return [0, 1, 2, 3, 4];
    });
    var baseAxis = new Plottable.Axes.Numeric(scale, "bottom");
    baseAxis.renderTo(svg);
    var tickMarks = (<any> baseAxis).element.selectAll(".tick-mark");
    tickMarks.each(function() {
      var tickMark = d3.select(this);
      var tickMarkPosition = Number(tickMark.attr("x"));
      assert.isTrue(tickMarkPosition >= 0 && tickMarkPosition <=  SVG_WIDTH, "tick marks are located within the bounding SVG");
    });
    svg.remove();
  });

  it("renders tick labels properly when the domain is reversed", () => {
    var SVG_WIDTH = 300;
    var SVG_HEIGHT = 100;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);

    var scale = new Plottable.Scales.Linear();
    scale.domain([3, 0]);

    var baseAxis = new Plottable.Axes.Numeric(scale, "bottom");
    baseAxis.renderTo(svg);

    var tickLabels = (<any> baseAxis).element.selectAll(".tick-label")
        .filter(function(d: any, i: number) {
          var visibility = d3.select(this).style("visibility");
          return (visibility === "visible") || (visibility === "inherit");
        });
    assert.isTrue(tickLabels[0].length > 1, "more than one tick label is shown");

    for (var i = 0; i < tickLabels[0].length - 1; i++) {
      var currLabel = d3.select(tickLabels[0][i]);
      var nextLabel = d3.select(tickLabels[0][i + 1]);
      assert.isTrue(Number(currLabel.text()) > Number(nextLabel.text()), "numbers are arranged in descending order from left to right");
    }

    svg.remove();
  });

  it("constrained tick labels do not overlap tick marks", () => {

    var svg = generateSVG(300, 400);

    var yScale = new Plottable.Scales.Linear().numTicks(100);
    yScale.domain([175, 185]);
    var yAxis = new Plottable.Axes.Numeric(yScale, "left")
                                  .tickLabelPosition("top")
                                  .tickLength(50);

    var chartTable = new Plottable.Components.Table([
      [yAxis],
    ]);

    chartTable.renderTo(svg);

    var tickLabels = (<any> yAxis).element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS)
        .filter(function(d: any, i: number) {
          var visibility = d3.select(this).style("visibility");
          return (visibility === "visible") || (visibility === "inherit");
        });

    var tickMarks = (<any> yAxis).element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS)
        .filter(function(d: any, i: number) {
          var visibility = d3.select(this).style("visibility");
          return (visibility === "visible") || (visibility === "inherit");
        });


    tickLabels.each(function() {
      var tickLabelBox = this.getBoundingClientRect();

      tickMarks.each(function() {
        var tickMarkBox = this.getBoundingClientRect();
          assert.isFalse(Plottable.Utils.DOM.boxesOverlap(tickLabelBox, tickMarkBox),
            "tickMarks and tickLabels should not overlap when top/bottom/left/right position is used for the tickLabel");
      });
    });

    svg.remove();
  });



});
