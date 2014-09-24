///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("Stacked Bar Plot", () => {
    var verifier = new MultiTestVerifier();
    var svg: D3.Selection;
    var dataset1: Plottable.Dataset;
    var dataset2: Plottable.Dataset;
    var xScale: Plottable.Scale.Ordinal;
    var yScale: Plottable.Scale.Linear;
    var renderer: Plottable.Plot.StackedBar<string, number>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;
    var axisHeight = 0;
    var bandWidth = 0;

    var numAttr = (s: D3.Selection, a: string) => parseFloat(s.attr(a));

    before(() => {
      svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scale.Ordinal();
      yScale = new Plottable.Scale.Linear().domain([0, 3]);

      var data1 = [
        {x: "A", y: 1},
        {x: "B", y: 2}
      ];
      var data2 = [
        {x: "A", y: 2},
        {x: "B", y: 1}
      ];
      dataset1 = new Plottable.Dataset(data1);
      dataset2 = new Plottable.Dataset(data2);

      renderer = new Plottable.Plot.StackedBar(xScale, yScale);
      renderer.addDataset(data1);
      renderer.addDataset(data2);
      renderer.baseline(0);
      var xAxis = new Plottable.Axis.Category(xScale, "bottom");
      var table = new Plottable.Component.Table([[renderer], [xAxis]]).renderTo(svg);
      axisHeight = xAxis.height();
      bandWidth = xScale.rangeBand();
    });

    beforeEach(() => {
      verifier.start();
    });

    afterEach(() => {
      verifier.end();
    });

    after(() => {
      if (verifier.passed) {svg.remove();};
    });

    it("renders correctly", () => {
      var bars = renderer._renderArea.selectAll("rect");
      var bar0 = d3.select(bars[0][0]);
      var bar1 = d3.select(bars[0][1]);
      var bar2 = d3.select(bars[0][2]);
      var bar3 = d3.select(bars[0][3]);
      var bar0X = bar0.data()[0].x;
      var bar1X = bar1.data()[0].x;
      var bar2X = bar2.data()[0].x;
      var bar3X = bar3.data()[0].x;
      // check widths
      assert.closeTo(numAttr(bar0, "width"), bandWidth, 2);
      assert.closeTo(numAttr(bar1, "width"), bandWidth, 2);
      assert.closeTo(numAttr(bar2, "width"), bandWidth, 2);
      assert.closeTo(numAttr(bar3, "width"), bandWidth, 2);
      // check heights
      assert.closeTo(numAttr(bar0, "height"), (400 - axisHeight) / 3, 0.01, "height is correct for bar0");
      assert.closeTo(numAttr(bar1, "height"), (400 - axisHeight) / 3 * 2, 0.01, "height is correct for bar1");
      assert.closeTo(numAttr(bar2, "height"), (400 - axisHeight) / 3 * 2, 0.01, "height is correct for bar2");
      assert.closeTo(numAttr(bar3, "height"), (400 - axisHeight) / 3, 0.01, "height is correct for bar3");
      // check that bar is aligned on the center of the scale
      assert.closeTo(numAttr(bar0, "x") + numAttr(bar0, "width") / 2, xScale.scale(bar0X) + bandWidth / 2, 0.01, "x pos correct for bar0");
      assert.closeTo(numAttr(bar1, "x") + numAttr(bar1, "width") / 2, xScale.scale(bar1X) + bandWidth / 2, 0.01, "x pos correct for bar1");
      assert.closeTo(numAttr(bar2, "x") + numAttr(bar2, "width") / 2, xScale.scale(bar2X) + bandWidth / 2, 0.01, "x pos correct for bar2");
      assert.closeTo(numAttr(bar3, "x") + numAttr(bar3, "width") / 2, xScale.scale(bar3X) + bandWidth / 2, 0.01, "x pos correct for bar3");
      // now check y values to ensure they do indeed stack
      assert.closeTo(numAttr(bar0, "y"), (400 - axisHeight) / 3 * 2, 0.01, "y is correct for bar0");
      assert.closeTo(numAttr(bar1, "y"), (400 - axisHeight) / 3, 0.01, "y is correct for bar1");
      assert.closeTo(numAttr(bar2, "y"), 0, 0.01, "y is correct for bar2");
      assert.closeTo(numAttr(bar3, "y"), 0, 0.01, "y is correct for bar3");
    });
  });

  describe("Stacked Bar Plot Negative Values", () => {
    var svg: D3.Selection;
    var xScale: Plottable.Scale.Ordinal;
    var yScale: Plottable.Scale.Linear;
    var renderer: Plottable.Plot.StackedBar<string, number>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;
    var axisHeight = 0;
    var bandWidth = 0;

    var numAttr = (s: D3.Selection, a: string) => parseFloat(s.attr(a));

    before(() => {
      svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scale.Ordinal();
      yScale = new Plottable.Scale.Linear().domain([-4, 4]);

      var data1 = [
        {x: "A", y: 1},
        {x: "B", y: -4}
      ];
      var data2 = [
        {x: "A", y: -1},
        {x: "B", y: 4}
      ];

      renderer = new Plottable.Plot.StackedBar(xScale, yScale);
      renderer.addDataset(data1);
      renderer.addDataset(data2);
      renderer.baseline(0);
      var xAxis = new Plottable.Axis.Category(xScale, "bottom");
      var table = new Plottable.Component.Table([[renderer], [xAxis]]).renderTo(svg);
      axisHeight = xAxis.height();
      bandWidth = xScale.rangeBand();
    });

    it("renders correctly", () => {
      var bars = renderer._renderArea.selectAll("rect");
      var bar0 = d3.select(bars[0][0]);
      var bar1 = d3.select(bars[0][1]);
      var bar2 = d3.select(bars[0][2]);
      var bar3 = d3.select(bars[0][3]);
      var bar0X = bar0.data()[0].x;
      var bar1X = bar1.data()[0].x;
      var bar2X = bar2.data()[0].x;
      var bar3X = bar3.data()[0].x;
      // check widths
      assert.closeTo(numAttr(bar0, "width"), bandWidth, 2);
      assert.closeTo(numAttr(bar1, "width"), bandWidth, 2);
      assert.closeTo(numAttr(bar2, "width"), bandWidth, 2);
      assert.closeTo(numAttr(bar3, "width"), bandWidth, 2);
      // check heights
      assert.closeTo(numAttr(bar0, "height"), (400 - axisHeight) / 8, 0.01, "height is correct for bar0");
      assert.closeTo(numAttr(bar1, "height"), (400 - axisHeight) / 2, 0.01, "height is correct for bar1");
      assert.closeTo(numAttr(bar2, "height"), (400 - axisHeight) / 8, 0.01, "height is correct for bar2");
      assert.closeTo(numAttr(bar3, "height"), (400 - axisHeight) / 2, 0.01, "height is correct for bar3");
      // check that bar is aligned on the center of the scale
      assert.closeTo(numAttr(bar0, "x") + numAttr(bar0, "width") / 2, xScale.scale(bar0X) + bandWidth / 2, 0.01, "x pos correct for bar0");
      assert.closeTo(numAttr(bar1, "x") + numAttr(bar1, "width") / 2, xScale.scale(bar1X) + bandWidth / 2, 0.01, "x pos correct for bar1");
      assert.closeTo(numAttr(bar2, "x") + numAttr(bar2, "width") / 2, xScale.scale(bar2X) + bandWidth / 2, 0.01, "x pos correct for bar2");
      assert.closeTo(numAttr(bar3, "x") + numAttr(bar3, "width") / 2, xScale.scale(bar3X) + bandWidth / 2, 0.01, "x pos correct for bar3");
      // now check y values to ensure they do indeed stack
      assert.closeTo(numAttr(bar0, "y"), (400 - axisHeight) / 8 * 3, 0.01, "y is correct for bar0");
      assert.closeTo(numAttr(bar1, "y"), (400 - axisHeight) / 2, 0.01, "y is correct for bar1");
      assert.closeTo(numAttr(bar2, "y"), (400 - axisHeight) / 2, 0.01, "y is correct for bar2");
      assert.closeTo(numAttr(bar3, "y"), 0, 0.01, "y is correct for bar3");

      svg.remove();
    });
  });

  describe("Horizontal Stacked Bar Plot", () => {
    var verifier = new MultiTestVerifier();
    var svg: D3.Selection;
    var dataset1: Plottable.Dataset;
    var dataset2: Plottable.Dataset;
    var xScale: Plottable.Scale.Linear;
    var yScale: Plottable.Scale.Ordinal;
    var renderer: Plottable.Plot.StackedBar<number, string>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;
    var rendererWidth: number;
    var bandWidth = 0;

    var numAttr = (s: D3.Selection, a: string) => parseFloat(s.attr(a));

    before(() => {
      svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scale.Linear().domain([0, 6]);
      yScale = new Plottable.Scale.Ordinal();

      var data1 = [
        {name: "jon", y: 0, type: "q1"},
        {name: "dan", y: 2, type: "q1"}
      ];
      var data2 = [
        {name: "jon", y: 2, type: "q2"},
        {name: "dan", y: 4, type: "q2"}
      ];
      dataset1 = new Plottable.Dataset(data1);
      dataset2 = new Plottable.Dataset(data2);

      renderer = new Plottable.Plot.StackedBar(xScale, yScale, false);
      renderer.project("y", "name", yScale);
      renderer.project("x", "y", xScale);
      renderer.addDataset(data1);
      renderer.addDataset(data2);
      renderer.baseline(0);
      var yAxis = new Plottable.Axis.Category(yScale, "left");
      var table = new Plottable.Component.Table([[yAxis, renderer]]).renderTo(svg);
      rendererWidth = renderer.width();
      bandWidth = yScale.rangeBand();
    });

    beforeEach(() => {
      verifier.start();
    });

    afterEach(() => {
      verifier.end();
    });

    after(() => {
      if (verifier.passed) {svg.remove();};
    });

    it("renders correctly", () => {
      var bars = renderer._renderArea.selectAll("rect");
      var bar0 = d3.select(bars[0][0]);
      var bar1 = d3.select(bars[0][1]);
      var bar2 = d3.select(bars[0][2]);
      var bar3 = d3.select(bars[0][3]);
      // check heights
      assert.closeTo(numAttr(bar0, "height"), bandWidth, 2);
      assert.closeTo(numAttr(bar1, "height"), bandWidth, 2);
      assert.closeTo(numAttr(bar2, "height"), bandWidth, 2);
      assert.closeTo(numAttr(bar3, "height"), bandWidth, 2);
      // check widths
      assert.closeTo(numAttr(bar0, "width"), 0, 0.01, "width is correct for bar0");
      assert.closeTo(numAttr(bar1, "width"), rendererWidth / 3, 0.01, "width is correct for bar1");
      assert.closeTo(numAttr(bar2, "width"), rendererWidth / 3, 0.01, "width is correct for bar2");
      assert.closeTo(numAttr(bar3, "width"), rendererWidth / 3 * 2, 0.01, "width is correct for bar3");

      var bar0Y = bar0.data()[0].name;
      var bar1Y = bar1.data()[0].name;
      var bar2Y = bar2.data()[0].name;
      var bar3Y = bar3.data()[0].name;

      // check that bar is aligned on the center of the scale
      assert.closeTo(numAttr(bar0, "y") + numAttr(bar0, "height") / 2, yScale.scale(bar0Y) + bandWidth / 2, 0.01, "y pos correct for bar0");
      assert.closeTo(numAttr(bar1, "y") + numAttr(bar1, "height") / 2, yScale.scale(bar1Y) + bandWidth / 2, 0.01, "y pos correct for bar1");
      assert.closeTo(numAttr(bar2, "y") + numAttr(bar2, "height") / 2, yScale.scale(bar2Y) + bandWidth / 2, 0.01, "y pos correct for bar2");
      assert.closeTo(numAttr(bar3, "y") + numAttr(bar3, "height") / 2, yScale.scale(bar3Y) + bandWidth / 2, 0.01, "y pos correct for bar3");
      // now check x values to ensure they do indeed stack
      assert.closeTo(numAttr(bar0, "x"), 0, 0.01, "x is correct for bar0");
      assert.closeTo(numAttr(bar1, "x"), 0, 0.01, "x is correct for bar1");
      assert.closeTo(numAttr(bar2, "x"), 0, 0.01, "x is correct for bar2");
      assert.closeTo(numAttr(bar3, "x"), rendererWidth / 3, 0.01, "x is correct for bar3");
    });
  });
});
