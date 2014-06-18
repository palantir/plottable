///<reference path="testReference.ts" />

var assert = chai.assert;

describe("NumberAxis", () => {
  it("tickLabelPosition() input validation", () => {
    var scale = new Plottable.Scale.Linear();
    var horizontalAxis = new Plottable.Axis.Number(scale, "bottom");
    assert.throws(() => horizontalAxis.tickLabelPosition("top"), "horizontal");
    assert.throws(() => horizontalAxis.tickLabelPosition("bottom"), "horizontal");

    var verticalAxis = new Plottable.Axis.Number(scale, "left");
    assert.throws(() => verticalAxis.tickLabelPosition("left"), "vertical");
    assert.throws(() => verticalAxis.tickLabelPosition("right"), "vertical");
  });

  it("draws tick labels correctly (horizontal)", () => {
    var SVG_WIDTH = 500;
    var SVG_HEIGHT = 100;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scale.Linear();
    scale.range([0, SVG_WIDTH]);
    var numberAxis = new Plottable.Axis.Number(scale, "bottom");
    numberAxis.renderTo(svg);

    var tickLabels = numberAxis.element.selectAll("." + Plottable.Abstract.Axis.TICK_LABEL_CLASS);
    assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
    var tickMarks = numberAxis.element.selectAll("." + Plottable.Abstract.Axis.TICK_MARK_CLASS);
    assert.strictEqual( tickLabels[0].length, tickMarks[0].length, "there is one label per mark");

    var i: number;
    var markBB: SVGRect;
    var labelBB: SVGRect;
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBBox();
      var markCenter = markBB.x + markBB.width / 2;
      labelBB = tickLabels[0][i].getBBox();
      var labelCenter = labelBB.x + labelBB.width / 2;
      assert.closeTo(labelCenter, markCenter, 1, "tick label is centered on mark");
    }

    // labels to left
    numberAxis.tickLabelPosition("left");
    tickLabels = numberAxis.element.selectAll("." + Plottable.Abstract.Axis.TICK_LABEL_CLASS);
    tickMarks = numberAxis.element.selectAll("." + Plottable.Abstract.Axis.TICK_MARK_CLASS);
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBBox();
      labelBB = tickLabels[0][i].getBBox();
      var labelRight = labelBB.x + labelBB.width;
      assert.operator(labelRight, "<=", markBB.x, "tick label is to left of mark");
    }

    // labels to right
    numberAxis.tickLabelPosition("right");
    tickLabels = numberAxis.element.selectAll("." + Plottable.Abstract.Axis.TICK_LABEL_CLASS);
    tickMarks = numberAxis.element.selectAll("." + Plottable.Abstract.Axis.TICK_MARK_CLASS);
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBBox();
      labelBB = tickLabels[0][i].getBBox();
      var markRight = markBB.x + markBB.width;
      assert.operator(markRight, "<=", labelBB.x, "tick label is to right of mark");
    }

    svg.remove();
  });

  it("draws ticks correctly (vertical)", () => {
    var SVG_WIDTH = 100;
    var SVG_HEIGHT = 500;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scale.Linear();
    scale.range([0, SVG_HEIGHT]);
    var numberAxis = new Plottable.Axis.Number(scale, "left");
    numberAxis.renderTo(svg);

    var tickLabels = numberAxis.element.selectAll("." + Plottable.Abstract.Axis.TICK_LABEL_CLASS);
    assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
    var tickMarks = numberAxis.element.selectAll("." + Plottable.Abstract.Axis.TICK_MARK_CLASS);
    assert.strictEqual(tickLabels[0].length, tickMarks[0].length, "there is one label per mark");

    var i: number;
    var markBB: SVGRect;
    var labelBB: SVGRect;
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBBox();
      var markCenter = markBB.y + markBB.height / 2;
      labelBB = tickLabels[0][i].getBBox();
      var labelCenter = labelBB.y + labelBB.height / 2;
      assert.closeTo(labelCenter, markCenter, 1, "tick label is centered on mark");
    }

    // labels to top
    numberAxis.tickLabelPosition("top");
    tickLabels = numberAxis.element.selectAll("." + Plottable.Abstract.Axis.TICK_LABEL_CLASS);
    tickMarks = numberAxis.element.selectAll("." + Plottable.Abstract.Axis.TICK_MARK_CLASS);
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBBox();
      labelBB = tickLabels[0][i].getBBox();
      var labelBottom = labelBB.y + labelBB.height;
      assert.operator(labelBottom, "<=", markBB.y, "tick label is above mark");
    }

    // labels to bottom
    numberAxis.tickLabelPosition("bottom");
    tickLabels = numberAxis.element.selectAll("." + Plottable.Abstract.Axis.TICK_LABEL_CLASS);
    tickMarks = numberAxis.element.selectAll("." + Plottable.Abstract.Axis.TICK_MARK_CLASS);
    for (i = 0; i < tickLabels[0].length; i++) {
      markBB = tickMarks[0][i].getBBox();
      labelBB = tickLabels[0][i].getBBox();
      var markBottom = markBB.y + markBB.height;
      assert.operator(markBottom, "<=", labelBB.y, "tick label is below mark");
    }

    svg.remove();
  });

  it("uses the supplied Formatter", () => {
    var SVG_WIDTH = 100;
    var SVG_HEIGHT = 500;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scale.Linear();
    scale.range([0, SVG_HEIGHT]);

    var formatter = new Plottable.Formatter.Fixed(2);

    var numberAxis = new Plottable.Axis.Number(scale, "left", formatter);
    numberAxis.renderTo(svg);

    var tickLabels = numberAxis.element.selectAll("." + Plottable.Abstract.Axis.TICK_LABEL_CLASS);
    tickLabels.each(function(d: any, i: number) {
      var labelText = d3.select(this).text();
      var formattedValue = formatter.format(d);
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
    var numberAxis = new Plottable.Axis.Number(scale, "bottom");
    numberAxis.showEndTickLabels(false);
    numberAxis.renderTo(svg);

    var tickLabels = numberAxis.element.selectAll("." + Plottable.Abstract.Axis.TICK_LABEL_CLASS);
    var firstLabel = d3.select(tickLabels[0][0]);
    assert.strictEqual(firstLabel.style("visibility"), "hidden", "first label is hidden");
    var lastLabel = d3.select(tickLabels[0][tickLabels[0].length - 1]);
    assert.strictEqual(lastLabel.style("visibility"), "hidden", "last label is hidden");

    svg.remove();
  });
});
