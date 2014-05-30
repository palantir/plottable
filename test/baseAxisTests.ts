///<reference path="testReference.ts" />

var assert = chai.assert;

describe("BaseAxis", () => {
  it("orientation", () => {
    var scale = new Plottable.LinearScale();
    assert.throws(() => new Plottable.BaseAxis(scale, "blargh"), "unsupported");
  });

  it("draws ticks and baseline (horizontal)", () => {
    var SVG_WIDTH = 500;
    var SVG_HEIGHT = 100;
    var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
    var scale = new Plottable.LinearScale();
    scale.range([0, SVG_WIDTH]);
    var baseAxis = new Plottable.BaseAxis(scale, "bottom");
    (<any> baseAxis)._getTickValues = function() { return scale.ticks(10); };
    baseAxis.renderTo(svg);

    var ticks = svg.selectAll(".tick");
    assert.strictEqual(ticks[0].length, scale.ticks(10).length, "A line was drawn for each tick");
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
    var scale = new Plottable.LinearScale();
    scale.range([0, SVG_WIDTH]);
    var baseAxis = new Plottable.BaseAxis(scale, "left");
    (<any> baseAxis)._getTickValues = function() { return scale.ticks(10); };
    baseAxis.renderTo(svg);

    var ticks = svg.selectAll(".tick");
    assert.strictEqual(ticks[0].length, scale.ticks(10).length, "A line was drawn for each tick");
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
    var scale = new Plottable.LinearScale();
    scale.range([0, SVG_WIDTH]);
    var baseAxis = new Plottable.BaseAxis(scale, "bottom");
    (<any> baseAxis)._getTickValues = function() { return scale.ticks(10); };
    baseAxis.renderTo(svg);

    var firstTick = svg.select(".tick").select("line");
    assert.strictEqual(firstTick.attr("x1"), "0");
    assert.strictEqual(firstTick.attr("x2"), "0");
    assert.strictEqual(firstTick.attr("y1"), "0");
    assert.strictEqual(firstTick.attr("y2"), String(baseAxis.tickLength()));

    baseAxis.tickLength(10);
    assert.strictEqual(firstTick.attr("y2"), String(baseAxis.tickLength()), "tick length was updated");

    assert.throws(() => baseAxis.tickLength(-1), "must be positive");

    svg.remove();
  });

  it("tickLabelPadding()", () => {
    var scale = new Plottable.LinearScale();
    var baseAxis = new Plottable.BaseAxis(scale, "bottom");

    assert.throws(() => baseAxis.tickLabelPadding(-1), "must be positive");
  });
});
