///<reference path="../testReference.ts" />

describe("BaseAxis", () => {
  it("orientation", () => {
    let scale = new Plottable.Scales.Linear();
    assert.throws(() => new Plottable.Axis(scale, "blargh"), "unsupported");
  });

  it("tickLabelPadding() rejects negative values", () => {
    let scale = new Plottable.Scales.Linear();
    let baseAxis = new Plottable.Axis(scale, "bottom");

    assert.throws(() => baseAxis.tickLabelPadding(-1), "must be positive");
  });

  it("margin() rejects negative values", () => {
    let scale = new Plottable.Scales.Linear();
    let axis = new Plottable.Axis(scale, "right");

    assert.throws(() => axis.margin(-1), "must be positive");
  });

  it("width() + margin()", () => {
    let SVG_WIDTH = 100;
    let SVG_HEIGHT = 500;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    let verticalAxis = new Plottable.Axis(scale, "right");
    verticalAxis.renderTo(svg);

    let defaultWidth = verticalAxis.innerTickLength() + verticalAxis.margin();
    assert.strictEqual(verticalAxis.width(), defaultWidth, "calling width() with no arguments returns currently used width");

    verticalAxis.margin(20);
    defaultWidth = verticalAxis.innerTickLength() + verticalAxis.margin();
    assert.strictEqual(verticalAxis.width(), defaultWidth, "changing the margin size updates the width");

    svg.remove();
  });

  it("height() + margin()", () => {
    let SVG_WIDTH = 500;
    let SVG_HEIGHT = 100;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    let horizontalAxis = new Plottable.Axis(scale, "bottom");
    horizontalAxis.renderTo(svg);

    let defaultHeight = horizontalAxis.innerTickLength() + horizontalAxis.margin();
    assert.strictEqual(horizontalAxis.height(), defaultHeight, "calling height() with no arguments returns currently used height");

    horizontalAxis.margin(20);
    defaultHeight = horizontalAxis.innerTickLength() + horizontalAxis.margin();
    assert.strictEqual(horizontalAxis.height(), defaultHeight, "changing the margin size updates the height");

    svg.remove();
  });

  it("draws ticks and baseline (horizontal)", () => {
    let SVG_WIDTH = 500;
    let SVG_HEIGHT = 100;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    scale.domain([0, 10]);
    scale.range([0, SVG_WIDTH]);
    let baseAxis = new Plottable.Axis(scale, "bottom");
    let tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    (<any> baseAxis)._getTickValues = function() { return tickValues; };
    baseAxis.renderTo(svg);

    let tickMarks = svg.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
    assert.strictEqual(tickMarks[0].length, tickValues.length, "A tick mark was created for each value");
    let baseline = svg.select(".baseline");

    assert.isNotNull(baseline.node(), "baseline was drawn");
    assert.strictEqual(baseline.attr("x1"), "0");
    assert.strictEqual(baseline.attr("x2"), String(SVG_WIDTH));
    assert.strictEqual(baseline.attr("y1"), "0");
    assert.strictEqual(baseline.attr("y2"), "0");

    baseAxis.orientation("top");
    assert.isNotNull(baseline.node(), "baseline was drawn");
    assert.strictEqual(baseline.attr("x1"), "0");
    assert.strictEqual(baseline.attr("x2"), String(SVG_WIDTH));
    assert.strictEqual(baseline.attr("y1"), String(baseAxis.height()));
    assert.strictEqual(baseline.attr("y2"), String(baseAxis.height()));

    svg.remove();
  });

  it("draws ticks and baseline (vertical)", () => {
    let SVG_WIDTH = 100;
    let SVG_HEIGHT = 500;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    scale.domain([0, 10]);
    scale.range([0, SVG_HEIGHT]);
    let baseAxis = new Plottable.Axis(scale, "left");
    let tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    (<any> baseAxis)._getTickValues = function() { return tickValues; };
    baseAxis.renderTo(svg);

    let tickMarks = svg.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
    assert.strictEqual(tickMarks[0].length, tickValues.length, "A tick mark was created for each value");
    let baseline = svg.select(".baseline");

    assert.isNotNull(baseline.node(), "baseline was drawn");
    assert.strictEqual(baseline.attr("x1"), String(baseAxis.width()));
    assert.strictEqual(baseline.attr("x2"), String(baseAxis.width()));
    assert.strictEqual(baseline.attr("y1"), "0");
    assert.strictEqual(baseline.attr("y2"), String(SVG_HEIGHT));

    baseAxis.orientation("right");
    assert.isNotNull(baseline.node(), "baseline was drawn");
    assert.strictEqual(baseline.attr("x1"), "0");
    assert.strictEqual(baseline.attr("x2"), "0");
    assert.strictEqual(baseline.attr("y1"), "0");
    assert.strictEqual(baseline.attr("y2"), String(SVG_HEIGHT));

    svg.remove();
  });

  it("innerTickLength()", () => {
    let SVG_WIDTH = 500;
    let SVG_HEIGHT = 100;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    scale.domain([0, 10]);
    scale.range([0, SVG_WIDTH]);
    let baseAxis = new Plottable.Axis(scale, "bottom");
    let tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    (<any> baseAxis)._getTickValues = function() { return tickValues; };
    baseAxis.renderTo(svg);
    let secondTickMark = svg.selectAll("." + Plottable.Axis.TICK_MARK_CLASS + ":nth-child(2)");
    assert.strictEqual(secondTickMark.attr("x1"), "50");
    assert.strictEqual(secondTickMark.attr("x2"), "50");
    assert.strictEqual(secondTickMark.attr("y1"), "0");
    assert.strictEqual(secondTickMark.attr("y2"), String(baseAxis.innerTickLength()));

    baseAxis.innerTickLength(10);
    assert.strictEqual(secondTickMark.attr("y2"), String(baseAxis.innerTickLength()), "inner tick length was updated");

    assert.throws(() => baseAxis.innerTickLength(-1), "must be positive");

    svg.remove();
  });

  it("endTickLength()", () => {
    let SVG_WIDTH = 500;
    let SVG_HEIGHT = 100;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    scale.domain([0, 10]);
    scale.range([0, SVG_WIDTH]);
    let baseAxis = new Plottable.Axis(scale, "bottom");
    let tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    (<any> baseAxis)._getTickValues = () => tickValues;
    baseAxis.renderTo(svg);

    let firstTickMark = svg.selectAll("." + Plottable.Axis.END_TICK_MARK_CLASS);
    assert.strictEqual(firstTickMark.attr("x1"), "0");
    assert.strictEqual(firstTickMark.attr("x2"), "0");
    assert.strictEqual(firstTickMark.attr("y1"), "0");
    assert.strictEqual(firstTickMark.attr("y2"), String(baseAxis.endTickLength()));

    baseAxis.endTickLength(10);
    assert.strictEqual(firstTickMark.attr("y2"), String(baseAxis.endTickLength()), "end tick length was updated");

    assert.throws(() => baseAxis.endTickLength(-1), "must be positive");

    svg.remove();
  });

  it("height is adjusted to greater of innerTickLength or endTickLength", () => {
    let SVG_WIDTH = 500;
    let SVG_HEIGHT = 100;
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let scale = new Plottable.Scales.Linear();
    let baseAxis = new Plottable.Axis(scale, "bottom");
    baseAxis.showEndTickLabels(true);
    baseAxis.renderTo(svg);

    let expectedHeight = Math.max(baseAxis.innerTickLength(), baseAxis.endTickLength()) + baseAxis.margin();
    assert.strictEqual(baseAxis.height(), expectedHeight, "height should be equal to the maximum of the two");

    baseAxis.innerTickLength(20);
    assert.strictEqual(baseAxis.height(), 20 + baseAxis.margin(), "height should increase to inner tick length");

    baseAxis.endTickLength(30);
    assert.strictEqual(baseAxis.height(), 30 + baseAxis.margin(), "height should increase to end tick length");

    baseAxis.innerTickLength(10);
    assert.strictEqual(baseAxis.height(), 30 + baseAxis.margin(), "height should not decrease");

    svg.remove();
  });

  it("default alignment based on orientation", () => {
    let scale = new Plottable.Scales.Linear();
    let baseAxis = new Plottable.Axis(scale, "bottom");
    assert.strictEqual(baseAxis.yAlignment(), "top", "y alignment defaults to \"top\" for bottom axis");
    baseAxis = new Plottable.Axis(scale, "top");
    assert.strictEqual(baseAxis.yAlignment(), "bottom", "y alignment defaults to \"bottom\" for top axis");
    baseAxis = new Plottable.Axis(scale, "left");
    assert.strictEqual(baseAxis.xAlignment(), "right", "x alignment defaults to \"right\" for left axis");
    baseAxis = new Plottable.Axis(scale, "right");
    assert.strictEqual(baseAxis.xAlignment(), "left", "x alignment defaults to \"left\" for right axis");
  });
});
