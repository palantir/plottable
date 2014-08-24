///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("Stacked Bar Plot", () => {
    var verifier = new MultiTestVerifier();
    var svg: D3.Selection;
    var dataset1: Plottable.DataSource;
    var dataset2: Plottable.DataSource;
    var xScale: Plottable.Scale.Ordinal<string>;
    var yScale: Plottable.Scale.Linear;
    var renderer: Plottable.Plot.StackedBar<string>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;
    var axisHeight = 0;
    var bandWidth = 0;

    var numAttr = (s: D3.Selection, a: string) => parseFloat(s.attr(a));

    before(() => {
      svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scale.Ordinal<string>();
      yScale = new Plottable.Scale.Linear().domain([0, 3]);

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

      renderer = new Plottable.Plot.StackedBar(xScale, yScale);
      renderer.addDataset(data1);
      renderer.addDataset(data2);
      renderer.baseline(0);
      var xAxis = new Plottable.Axis.Category(xScale, "bottom");
      var table = new Plottable.Component.Table([[renderer], [xAxis]]).renderTo(svg);
      axisHeight = xAxis.availableHeight;
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
});
