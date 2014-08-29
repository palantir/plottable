///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("Clustered Bar Plot", () => {
    var verifier = new MultiTestVerifier();
    var svg: D3.Selection;
    var dataset1: Plottable.DataSource;
    var dataset2: Plottable.DataSource;
    var xScale: Plottable.Scale.Ordinal;
    var yScale: Plottable.Scale.Linear;
    var renderer: Plottable.Plot.ClusteredBar;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;
    var axisHeight = 0;
    var bandWidth = 0;

    var numAttr = (s: D3.Selection, a: string) => parseFloat(s.attr(a));

    before(() => {
      svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scale.Ordinal();
      yScale = new Plottable.Scale.Linear().domain([0, 2]);

      var data1 = [
        {x: "A", y: 1},
        {x: "B", y: 2}
      ];
      var data2 = [
        {x: "A", y: 2},
        {x: "B", y: 1}
      ];
      dataset1 = new Plottable.DataSource(data1);
      dataset2 = new Plottable.DataSource(data2);

      renderer = new Plottable.Plot.ClusteredBar(xScale, yScale);
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
      var bars = renderer.renderArea.selectAll("rect");
      var bar0 = d3.select(bars[0][0]);
      var bar1 = d3.select(bars[0][1]);
      var bar2 = d3.select(bars[0][2]);
      var bar3 = d3.select(bars[0][3]);
      var bar0X = bar0.data()[0].x;
      var bar1X = bar1.data()[0].x;
      var bar2X = bar2.data()[0].x;
      var bar3X = bar3.data()[0].x;

      // check widths
      var width = bandWidth / 2 * .518;
      assert.closeTo(numAttr(bar0, "width"), width, 2);
      assert.closeTo(numAttr(bar1, "width"), width, 2);
      assert.closeTo(numAttr(bar2, "width"), width, 2);
      assert.closeTo(numAttr(bar3, "width"), width, 2);

      // check heights
      assert.closeTo(numAttr(bar0, "height"), (400 - axisHeight) / 2, 0.01, "height is correct for bar0");
      assert.closeTo(numAttr(bar1, "height"), (400 - axisHeight), 0.01, "height is correct for bar1");
      assert.closeTo(numAttr(bar2, "height"), (400 - axisHeight), 0.01, "height is correct for bar2");
      assert.closeTo(numAttr(bar3, "height"), (400 - axisHeight) / 2, 0.01, "height is correct for bar3");

      // check that clustering is correct
      var off = (<any>renderer).innerScale.scale("_0");
      assert.closeTo(numAttr(bar0, "x") + numAttr(bar0, "width") / 2, xScale.scale(bar0X) + bandWidth / 2 - off, 0.01, "x pos correct for bar0");
      assert.closeTo(numAttr(bar1, "x") + numAttr(bar1, "width") / 2, xScale.scale(bar1X) + bandWidth / 2 - off, 0.01, "x pos correct for bar1");
      assert.closeTo(numAttr(bar2, "x") + numAttr(bar2, "width") / 2, xScale.scale(bar2X) + bandWidth / 2 + off, 0.01, "x pos correct for bar2");
      assert.closeTo(numAttr(bar3, "x") + numAttr(bar3, "width") / 2, xScale.scale(bar3X) + bandWidth / 2 + off, 0.01, "x pos correct for bar3");
    });
  });

  describe("Horizontal Clustered Bar Plot", () => {
    var verifier = new MultiTestVerifier();
    var svg: D3.Selection;
    var dataset1: Plottable.DataSource;
    var dataset2: Plottable.DataSource;
    var yScale: Plottable.Scale.Ordinal;
    var xScale: Plottable.Scale.Linear;
    var renderer: Plottable.Plot.ClusteredBar;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;
    var rendererWidth: number;
    var bandWidth = 0;

    var numAttr = (s: D3.Selection, a: string) => parseFloat(s.attr(a));

    before(() => {
      svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      yScale = new Plottable.Scale.Ordinal();
      xScale = new Plottable.Scale.Linear().domain([0, 2]);

      var data1 = [
        {y: "A", x: 1},
        {y: "B", x: 2}
      ];
      var data2 = [
        {y: "A", x: 2},
        {y: "B", x: 1}
      ];
      dataset1 = new Plottable.DataSource(data1);
      dataset2 = new Plottable.DataSource(data2);

      renderer = new Plottable.Plot.ClusteredBar(xScale, yScale, false);
      renderer.addDataset(data1);
      renderer.addDataset(data2);
      renderer.baseline(0);
      var yAxis = new Plottable.Axis.Category(yScale, "left");
      var table = new Plottable.Component.Table([[yAxis, renderer]]).renderTo(svg);
      rendererWidth = renderer.availableWidth;
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
      var bars = renderer.renderArea.selectAll("rect");
      var bar0 = d3.select(bars[0][0]);
      var bar1 = d3.select(bars[0][1]);
      var bar2 = d3.select(bars[0][2]);
      var bar3 = d3.select(bars[0][3]);

      // check widths
      var width = bandWidth / 2 * .518;
      assert.closeTo(numAttr(bar0, "height"), width, 2, "height is correct for bar0");
      assert.closeTo(numAttr(bar1, "height"), width, 2, "height is correct for bar1");
      assert.closeTo(numAttr(bar2, "height"), width, 2, "height is correct for bar2");
      assert.closeTo(numAttr(bar3, "height"), width, 2, "height is correct for bar3");

      // check heights
      assert.closeTo(numAttr(bar0, "width"), rendererWidth / 2, 0.01, "width is correct for bar0");
      assert.closeTo(numAttr(bar1, "width"), rendererWidth, 0.01, "width is correct for bar1");
      assert.closeTo(numAttr(bar2, "width"), rendererWidth, 0.01, "width is correct for bar2");
      assert.closeTo(numAttr(bar3, "width"), rendererWidth / 2, 0.01, "width is correct for bar3");

      var bar0Y = bar0.data()[0].y;
      var bar1Y = bar1.data()[0].y;
      var bar2Y = bar2.data()[0].y;
      var bar3Y = bar3.data()[0].y;

      // check that clustering is correct
      var off = (<any>renderer).innerScale.scale("_0");
      assert.closeTo(numAttr(bar0, "y") + numAttr(bar0, "height") / 2, yScale.scale(bar0Y) + bandWidth / 2 - off, 0.01, "y pos correct for bar0");
      assert.closeTo(numAttr(bar1, "y") + numAttr(bar1, "height") / 2, yScale.scale(bar1Y) + bandWidth / 2 - off, 0.01, "y pos correct for bar1");
      assert.closeTo(numAttr(bar2, "y") + numAttr(bar2, "height") / 2, yScale.scale(bar2Y) + bandWidth / 2 + off, 0.01, "y pos correct for bar2");
      assert.closeTo(numAttr(bar3, "y") + numAttr(bar3, "height") / 2, yScale.scale(bar3Y) + bandWidth / 2 + off, 0.01, "y pos correct for bar3");
    });
  });
});
