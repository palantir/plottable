///<reference path="testReference.ts" />

var assert = chai.assert;

describe("BaseAxis", () => {
  it("orientation", () => {
    var scale = new Plottable.Scale.Linear();
    assert.throws(() => new Plottable.Abstract.Axis(scale, "blargh"), "unsupported");
  });

    it("tickLabelPadding() rejects negative values", () => {
    var scale = new Plottable.Scale.Linear();
    var baseAxis = new Plottable.Abstract.Axis(scale, "bottom");

    assert.throws(() => baseAxis.tickLabelPadding(-1), "must be positive");
  });

  it("width()", () => {
    var SVG_WIDTH = 100;
    var SVG_HEIGHT = 500;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scale.Linear();
    var verticalAxis = new Plottable.Abstract.Axis(scale, "right");
    verticalAxis.renderTo(svg);

    var expectedWidth = verticalAxis.tickLength(); // vertical BaseAxis returns tick length as width
    assert.strictEqual(verticalAxis.width(), expectedWidth, "calling width() with no arguments returns currently used width");

    verticalAxis.width(20);
    assert.strictEqual(verticalAxis.width(), 20, "width was set to user-specified value");

    verticalAxis.width(10 * SVG_WIDTH); // way too big
    assert.strictEqual(verticalAxis.width(), SVG_WIDTH, "returns actual used width if requested width is too large");

    assert.doesNotThrow(() => verticalAxis.width("auto"), Error, "can be set to auto mode");
    assert.throws(() => verticalAxis.width(-999), Error, "invalid");

    var horizontalAxis = new Plottable.Abstract.Axis(scale, "bottom");
    assert.throws(() => horizontalAxis.width(2014), Error, "horizontal");

    svg.remove();
  });

  it("height()", () => {
    var SVG_WIDTH = 500;
    var SVG_HEIGHT = 100;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scale.Linear();
    var horizontalAxis = new Plottable.Abstract.Axis(scale, "bottom");
    horizontalAxis.renderTo(svg);

    var expectedHeight = horizontalAxis.tickLength(); // horizontal BaseAxis returns tick length as height
    assert.strictEqual(horizontalAxis.height(), expectedHeight, "calling height() with no arguments returns currently used height");

    horizontalAxis.height(20);
    assert.strictEqual(horizontalAxis.height(), 20, "height was set to user-specified value");

    horizontalAxis.height(10 * SVG_HEIGHT); // way too big
    assert.strictEqual(horizontalAxis.height(), SVG_HEIGHT, "returns actual used height if requested height is too large");

    assert.doesNotThrow(() => horizontalAxis.height("auto"), Error, "can be set to auto mode");
    assert.throws(() => horizontalAxis.height(-999), Error, "invalid");

    var verticalAxis = new Plottable.Abstract.Axis(scale, "right");
    assert.throws(() => verticalAxis.height(2014), Error, "vertical");

    svg.remove();
  });

  it("draws ticks and baseline (horizontal)", () => {
    var SVG_WIDTH = 500;
    var SVG_HEIGHT = 100;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scale.Linear();
    scale.domain([0, 10]);
    scale.range([0, SVG_WIDTH]);
    var baseAxis = new Plottable.Abstract.Axis(scale, "bottom");
    baseAxis.height(SVG_HEIGHT);
    var tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    (<any> baseAxis)._getTickValues = function() { return tickValues; };
    baseAxis.renderTo(svg);

    var tickMarks = svg.selectAll("." + Plottable.Abstract.Axis.TICK_MARK_CLASS);
    assert.strictEqual(tickMarks[0].length, tickValues.length, "A tick mark was created for each value");
    var baseline = svg.select(".baseline");

    assert.isNotNull(baseline.node(), "baseline was drawn");
    assert.strictEqual(baseline.attr("x1"), "0");
    assert.strictEqual(baseline.attr("x2"), String(SVG_WIDTH));
    assert.strictEqual(baseline.attr("y1"), "0");
    assert.strictEqual(baseline.attr("y2"), "0");

    baseAxis.orient("top");
    assert.isNotNull(baseline.node(), "baseline was drawn");
    assert.strictEqual(baseline.attr("x1"), "0");
    assert.strictEqual(baseline.attr("x2"), String(SVG_WIDTH));
    assert.strictEqual(baseline.attr("y1"), String(SVG_HEIGHT));
    assert.strictEqual(baseline.attr("y2"), String(SVG_HEIGHT));

    svg.remove();
  });

  it("draws ticks and baseline (vertical)", () => {
    var SVG_WIDTH = 100;
    var SVG_HEIGHT = 500;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scale.Linear();
    scale.domain([0, 10]);
    scale.range([0, SVG_HEIGHT]);
    var baseAxis = new Plottable.Abstract.Axis(scale, "left");
    baseAxis.width(SVG_WIDTH);
    var tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    (<any> baseAxis)._getTickValues = function() { return tickValues; };
    baseAxis.renderTo(svg);

    var tickMarks = svg.selectAll("." + Plottable.Abstract.Axis.TICK_MARK_CLASS);
    assert.strictEqual(tickMarks[0].length, tickValues.length, "A tick mark was created for each value");
    var baseline = svg.select(".baseline");

    assert.isNotNull(baseline.node(), "baseline was drawn");
    assert.strictEqual(baseline.attr("x1"), String(SVG_WIDTH));
    assert.strictEqual(baseline.attr("x2"), String(SVG_WIDTH));
    assert.strictEqual(baseline.attr("y1"), "0");
    assert.strictEqual(baseline.attr("y2"), String(SVG_HEIGHT));

    baseAxis.orient("right");
    assert.isNotNull(baseline.node(), "baseline was drawn");
    assert.strictEqual(baseline.attr("x1"), "0");
    assert.strictEqual(baseline.attr("x2"), "0");
    assert.strictEqual(baseline.attr("y1"), "0");
    assert.strictEqual(baseline.attr("y2"), String(SVG_HEIGHT));

    svg.remove();
  });

  it("tickLength()", () => {
    var SVG_WIDTH = 500;
    var SVG_HEIGHT = 100;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.Scale.Linear();
    scale.domain([0, 10]);
    scale.range([0, SVG_WIDTH]);
    var baseAxis = new Plottable.Abstract.Axis(scale, "bottom");
    var tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    (<any> baseAxis)._getTickValues = function() { return tickValues; };
    baseAxis.renderTo(svg);

    var firstTickMark = svg.select("." + Plottable.Abstract.Axis.TICK_MARK_CLASS);
    assert.strictEqual(firstTickMark.attr("x1"), "0");
    assert.strictEqual(firstTickMark.attr("x2"), "0");
    assert.strictEqual(firstTickMark.attr("y1"), "0");
    assert.strictEqual(firstTickMark.attr("y2"), String(baseAxis.tickLength()));

    baseAxis.tickLength(10);
    assert.strictEqual(firstTickMark.attr("y2"), String(baseAxis.tickLength()), "tick length was updated");

    assert.throws(() => baseAxis.tickLength(-1), "must be positive");

    svg.remove();
  });
});
