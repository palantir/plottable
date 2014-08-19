///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("Stacked Area Plot", () => {
    var verifier = new MultiTestVerifier();
    var svg: D3.Selection;
    var dataset1: Plottable.DataSource;
    var dataset2: Plottable.DataSource;
    var xScale: Plottable.Scale.Linear;
    var yScale: Plottable.Scale.Linear;
    var renderer: Plottable.Plot.StackedArea;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;
    var axisHeight = 0;

    var numAttr = (s: D3.Selection, a: string) => parseFloat(s.attr(a));
    var normalizePath = (s: string) => s.replace(/ *([A-Z]) */g, "$1").replace(/ /g, ",");

    before(() => {
      svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scale.Linear().domain([1, 2]);
      yScale = new Plottable.Scale.Linear().domain([0, 4]);

      var data1 = [
        {x: 1, y: 1},
        {x: 2, y: 2}
      ];
      var data2 = [
        {x: 1, y: 3},
        {x: 2, y: 1}
      ];
      dataset1 = new Plottable.DataSource(data1);
      dataset2 = new Plottable.DataSource(data2);

      renderer = new Plottable.Plot.StackedArea(xScale, yScale);
      renderer.addDataset(data1);
      renderer.addDataset(data2);
      var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
      var table = new Plottable.Component.Table([[renderer], [xAxis]]).renderTo(svg);
      axisHeight = xAxis.availableHeight;
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
      var areas = renderer.renderArea.selectAll(".area");
      var area0 = d3.select(areas[0][0]);
      var area1 = d3.select(areas[0][1]);
      assert.strictEqual(normalizePath(area0.attr("d")), "M0,266.87109375L600,177.9140625L600,355.828125L0,355.828125Z", "area0 d was set correctly");
      assert.strictEqual(normalizePath(area1.attr("d")), "M0,0L600,88.95703125L600,177.9140625L0,266.87109375Z", "area1 d was set correctly");
    });
  });
});
