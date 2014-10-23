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
    var scale = new Plottable.Scale.Linear();
    var horizontalAxis = new Plottable.Axis.Numeric(scale, "bottom");
    assert.throws(() => horizontalAxis.tickLabelPosition("top"), "horizontal");
    assert.throws(() => horizontalAxis.tickLabelPosition("bottom"), "horizontal");

    var verticalAxis = new Plottable.Axis.Numeric(scale, "left");
    assert.throws(() => verticalAxis.tickLabelPosition("left"), "vertical");
    assert.throws(() => verticalAxis.tickLabelPosition("right"), "vertical");
  });

  it("tickLabelMode() input validation", () => {
    var scale = new Plottable.Scale.Linear();
    var horizontalAxis = new Plottable.Axis.Numeric(scale, "bottom");
    assert.doesNotThrow(() => horizontalAxis.tickLabelMode("interval"), "inteval is valid input");
    assert.doesNotThrow(() => horizontalAxis.tickLabelMode("point"), "point is valid input");
    assert.throws(() => horizontalAxis.tickLabelMode("right"), "unsupported tick label mode: right");
  });

  it("draws tick labels correctly (point, horizontal)", () => {
    var SVG_WIDTH = 500;
    var SVG_HEIGHT = 100;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scale.Linear();
    scale.range([0, SVG_WIDTH]);
    var numericAxis = new Plottable.Axis.Numeric(scale, "bottom");
    numericAxis.renderTo(svg);

    var tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
    assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
    var tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
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
    tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
    tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBoundingClientRect();
      labelBB = tickLabels[0][i].getBoundingClientRect();
      assert.operator(labelBB.left, "<=", markBB.right, "tick label is to left of mark");
    }

    // labels to right
    numericAxis.tickLabelPosition("right");
    tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
    tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBoundingClientRect();
      labelBB = tickLabels[0][i].getBoundingClientRect();
      assert.operator(markBB.right, "<=", labelBB.left, "tick label is to right of mark");
    }

    svg.remove();
  });

  it("draws ticks correctly (point, vertical)", () => {
    var SVG_WIDTH = 100;
    var SVG_HEIGHT = 500;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scale.Linear();
    scale.range([0, SVG_HEIGHT]);
    var numericAxis = new Plottable.Axis.Numeric(scale, "left");
    numericAxis.renderTo(svg);

    var tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
    assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
    var tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
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
    tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
    tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBoundingClientRect();
      labelBB = tickLabels[0][i].getBoundingClientRect();
      assert.operator(labelBB.bottom, "<=", markBB.top, "tick label is above mark");
    }

    // labels to bottom
    numericAxis.tickLabelPosition("bottom");
    tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
    tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBoundingClientRect();
      labelBB = tickLabels[0][i].getBoundingClientRect();
      assert.operator(markBB.bottom, "<=", labelBB.top, "tick label is below mark");
    }

    svg.remove();
  });

  it("draws tick labels correctly (interval, horizontal)", () => {
      var SVG_WIDTH = 500;
      var SVG_HEIGHT = 100;
      var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var scale = new Plottable.Scale.Linear();
      scale.range([0, SVG_WIDTH]);
      var numericAxis = new Plottable.Axis.Numeric(scale, "bottom").tickLabelMode("interval");

      numericAxis.renderTo(svg);

      var tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
      assert.operator(tickLabels[0].length, ">=", 1, "at least one tick labels were drawn");
      var tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
      assert.strictEqual( tickLabels[0].length, tickMarks[0].length - 1, "there is one label per two consecutive marks");

      var i: number;
      var markLeftBB: ClientRect, markRightBB: ClientRect;
      var labelBB: ClientRect;
      for (i = 0; i < tickLabels[0].length; i++) {
        markLeftBB = tickMarks[0][i].getBoundingClientRect();
        markRightBB = tickMarks[0][i + 1].getBoundingClientRect();
        var marksCenter = (markLeftBB.left + markRightBB.right) / 2;
        labelBB = tickLabels[0][i].getBoundingClientRect();
        var labelCenter = (labelBB.left + labelBB.right) / 2;
        assert.closeTo(labelCenter, marksCenter, 1, "tick label is centered between two consecutive marks");
      }

      // labels to left
      numericAxis.tickLabelPosition("left");
      tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
      assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
      tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
      assert.strictEqual( tickLabels[0].length, tickMarks[0].length, "there is one label per mark");
      for (i = 0; i < tickLabels[0].length; i++) {
        markLeftBB = tickMarks[0][i].getBoundingClientRect();
        labelBB = tickLabels[0][i].getBoundingClientRect();
        assert.operator(labelBB.left, "<=", markLeftBB.right, "tick label is to left of mark");
      }

      // labels to right
      numericAxis.tickLabelPosition("right");
      tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
      assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
      tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
      assert.strictEqual( tickLabels[0].length, tickMarks[0].length, "there is one label per mark");
      for (i = 0; i < tickLabels[0].length; i++) {
        markLeftBB = tickMarks[0][i].getBoundingClientRect();
        labelBB = tickLabels[0][i].getBoundingClientRect();
        assert.operator(markLeftBB.right, "<=", labelBB.left, "tick label is to right of mark");
      }

      svg.remove();
    });

    it("draws ticks correctly (interval, vertical)", () => {
      var SVG_WIDTH = 100;
      var SVG_HEIGHT = 500;
      var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var scale = new Plottable.Scale.Linear();
      scale.range([0, SVG_HEIGHT]);
      var numericAxis = new Plottable.Axis.Numeric(scale, "left").tickLabelMode("interval");
      numericAxis.renderTo(svg);

      var tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
      assert.operator(tickLabels[0].length, ">=", 1, "at least one tick labels were drawn");
      var tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
      assert.strictEqual( tickLabels[0].length, tickMarks[0].length - 1, "there is one label per two consecutive marks");

      var i: number;
      var markTopBB: ClientRect, markBottomBB: ClientRect;
      var labelBB: ClientRect;
      for (i = 0; i < tickLabels[0].length; i++) {
        markTopBB = tickMarks[0][i].getBoundingClientRect();
        markBottomBB = tickMarks[0][i + 1].getBoundingClientRect();
        var marksCenter = (markTopBB.top + markBottomBB.bottom) / 2;
        labelBB = tickLabels[0][i].getBoundingClientRect();
        var labelCenter = (labelBB.top + labelBB.bottom) / 2;
        assert.closeTo(labelCenter, marksCenter, 1, "tick label is centered between two consecutive marks");
      }

      // labels to top
      numericAxis.tickLabelPosition("top");
      tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
      assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
      tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
      assert.strictEqual( tickLabels[0].length, tickMarks[0].length, "there is one label per mark");
      for (i = 0; i < tickLabels[0].length; i++) {
        markTopBB = tickMarks[0][i].getBoundingClientRect();
        labelBB = tickLabels[0][i].getBoundingClientRect();
        assert.operator(labelBB.bottom, "<=", markTopBB.top, "tick label is above mark");
      }

      // labels to bottom
      numericAxis.tickLabelPosition("bottom");
      tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
      assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
      tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
      assert.strictEqual( tickLabels[0].length, tickMarks[0].length, "there is one label per mark");
      for (i = 0; i < tickLabels[0].length; i++) {
        markTopBB = tickMarks[0][i].getBoundingClientRect();
        labelBB = tickLabels[0][i].getBoundingClientRect();
        assert.operator(markTopBB.bottom, "<=", labelBB.top, "tick label is below mark");
      }

      svg.remove();
    });

  it("uses the supplied Formatter", () => {
    var SVG_WIDTH = 100;
    var SVG_HEIGHT = 500;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scale.Linear();
    scale.range([0, SVG_HEIGHT]);

    var formatter = Plottable.Formatters.fixed(2);

    var numericAxis = new Plottable.Axis.Numeric(scale, "left", formatter);
    numericAxis.renderTo(svg);

    var tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
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
    var scale = new Plottable.Scale.Linear();
    scale.range([0, SVG_WIDTH]);
    var numericAxis = new Plottable.Axis.Numeric(scale, "bottom");

    numericAxis.showEndTickLabel("left", false);
    assert.isFalse(numericAxis.showEndTickLabel("left"), "retrieve showEndTickLabel setting");
    numericAxis.showEndTickLabel("right", true);
    assert.isTrue(numericAxis.showEndTickLabel("right"), "retrieve showEndTickLabel setting");
    assert.throws(() => numericAxis.showEndTickLabel("top", true), Error);
    assert.throws(() => numericAxis.showEndTickLabel("bottom", true), Error);

    numericAxis.renderTo(svg);

    var tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
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
    var scale = new Plottable.Scale.Linear();
    scale.range([0, SVG_WIDTH]);
    var numericAxis = new Plottable.Axis.Numeric(scale, "bottom");
    numericAxis.showEndTickLabel("left", false).showEndTickLabel("right", false);
    numericAxis.renderTo(svg);

    var visibleTickLabels = numericAxis._element
                              .selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS)
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

        assert.isFalse(Plottable._Util.DOM.boxesOverlap(box1, box2), "tick labels don't overlap");
      }
    }

    numericAxis.orient("bottom");
    visibleTickLabels = numericAxis._element
                          .selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS)
                          .filter(function(d: any, i: number) {
                            return d3.select(this).style("visibility") === "visible";
                          });
    numLabels = visibleTickLabels[0].length;
    for (i = 0; i < numLabels; i++) {
      for (j = i + 1; j < numLabels; j++) {
        box1 = visibleTickLabels[0][i].getBoundingClientRect();
        box2 = visibleTickLabels[0][j].getBoundingClientRect();

        assert.isFalse(Plottable._Util.DOM.boxesOverlap(box1, box2), "tick labels don't overlap");
      }
    }

    svg.remove();
  });

  it("allocates enough width to show all tick labels when vertical", () => {
    var SVG_WIDTH = 150;
    var SVG_HEIGHT = 500;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scale.Linear();
    scale.domain([5, -5]);
    scale.range([0, SVG_HEIGHT]);

    var formatter = (d: any) => {
      if (d === 0) {
        return "ZERO";
      }
      return String(d);
    };

    var numericAxis = new Plottable.Axis.Numeric(scale, "left", formatter);
    numericAxis.renderTo(svg);

    var visibleTickLabels = numericAxis._element
                          .selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS)
                          .filter(function(d: any, i: number) {
                            return d3.select(this).style("visibility") === "visible";
                          });
    var boundingBox: ClientRect = numericAxis._element.select(".bounding-box").node().getBoundingClientRect();
    var labelBox: ClientRect;
    visibleTickLabels[0].forEach((label: Element) => {
      labelBox = label.getBoundingClientRect();
      assert.isTrue(boxIsInside(labelBox, boundingBox), "tick labels don't extend outside the bounding box");
    });

    scale.domain([50000000000, -50000000000]);
    visibleTickLabels = numericAxis._element
                          .selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS)
                          .filter(function(d: any, i: number) {
                            return d3.select(this).style("visibility") === "visible";
                          });
    boundingBox = numericAxis._element.select(".bounding-box").node().getBoundingClientRect();
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
    var scale = new Plottable.Scale.Linear();
    scale.domain([5, -5]);
    scale.range([0, SVG_WIDTH]);

    var formatter = Plottable.Formatters.fixed(2);

    var numericAxis = new Plottable.Axis.Numeric(scale, "bottom", formatter);
    numericAxis.renderTo(svg);

    var visibleTickLabels = numericAxis._element
                          .selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS)
                          .filter(function(d: any, i: number) {
                            return d3.select(this).style("visibility") === "visible";
                          });
    var boundingBox: ClientRect = numericAxis._element.select(".bounding-box").node().getBoundingClientRect();
    var labelBox: ClientRect;
    visibleTickLabels[0].forEach((label: Element) => {
      labelBox = label.getBoundingClientRect();
      assert.isTrue(boxIsInside(labelBox, boundingBox, 0.5), "tick labels don't extend outside the bounding box");
    });

    svg.remove();
  });
});
