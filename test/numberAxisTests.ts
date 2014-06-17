///<reference path="testReference.ts" />

var assert = chai.assert;

describe("NumberAxis", () => {
  it("draws ticks correctly (horizontal)", () => {
    var SVG_WIDTH = 500;
    var SVG_HEIGHT = 100;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scale.Linear();
    scale.range([0, SVG_WIDTH]);
    var numberAxis = new Plottable.Axis.Number(scale, "bottom");
    numberAxis.renderTo(svg);

    var ticks = numberAxis.element.selectAll(".tick");
    assert.operator(ticks[0].length, ">=", 2, "at least two ticks were drawn");
    var tickLabels = numberAxis.element.selectAll("text");
    assert.strictEqual(ticks[0].length, tickLabels[0].length, "there is one label per tick");
    ticks.each(function(d: any, i: number) {
      var tick = d3.select(this);
      var mark = tick.select("." + Plottable.Abstract.Axis.TICK_MARK_CLASS);
      var label = tick.select("." + Plottable.Abstract.Axis.TICK_LABEL_CLASS);

      assert.isNotNull(label[0][0], "each tick has a label");
      var markBB = (<any> mark.node()).getBBox();
      var markCenter = markBB.x + markBB.width / 2;
      var labelBB = (<any> mark.node()).getBBox();
      var labelCenter = labelBB.x + labelBB.width / 2;

      assert.strictEqual(labelCenter, markCenter, "tick label is centered on mark");
    });

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

    var ticks = numberAxis.element.selectAll(".tick");
    assert.operator(ticks[0].length, ">=", 2, "at least two ticks were drawn");
    var tickLabels = numberAxis.element.selectAll("text");
    assert.strictEqual(ticks[0].length, tickLabels[0].length, "there is one label per tick");
    ticks.each(function(d: any, i: number) {
      var tick = d3.select(this);
      var mark = tick.select("." + Plottable.Abstract.Axis.TICK_MARK_CLASS);
      var label = tick.select("." + Plottable.Abstract.Axis.TICK_LABEL_CLASS);

      assert.isNotNull(label[0][0], "each tick has a label");
      var markBB = (<any> mark.node()).getBBox();
      var markCenter = markBB.y + markBB.height / 2;
      var labelBB = (<any> mark.node()).getBBox();
      var labelCenter = labelBB.y + labelBB.height / 2;

      assert.strictEqual(labelCenter, markCenter, "tick label is centered on mark");
    });

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

    var tickLabels = numberAxis.element.selectAll(".tick").select("text");
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

    var tickLabels = numberAxis.element.selectAll(".tick").select("text");
    var firstLabel = d3.select(tickLabels[0][0]);
    assert.strictEqual(firstLabel.style("visibility"), "hidden", "first label is hidden");
    var lastLabel = d3.select(tickLabels[0][tickLabels[0].length - 1]);
    assert.strictEqual(lastLabel.style("visibility"), "hidden", "last label is hidden");

    svg.remove();
  });
});
