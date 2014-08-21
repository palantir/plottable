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

    var numAttr = (s: D3.Selection, a: string) => parseFloat(s.attr(a));
    var normalizePath = (s: string) => s.replace(/ *([A-Z]) */g, "$1").replace(/ /g, ",");

    before(() => {
      svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scale.Linear().domain([1, 3]);
      yScale = new Plottable.Scale.Linear().domain([0, 4]);
      var colorScale = new Plottable.Scale.Color("10").domain(["a", "b"]);

      var data1 = [
        {x: 1, y: 1, type: "a"},
        {x: 3, y: 2, type: "a"}
      ];
      var data2 = [
        {x: 1, y: 3, type: "b"},
        {x: 3, y: 1, type: "b"}
      ];
      dataset1 = new Plottable.DataSource(data1);
      dataset2 = new Plottable.DataSource(data2);

      renderer = new Plottable.Plot.StackedArea(xScale, yScale);
      renderer.addDataset(data1);
      renderer.addDataset(data2);
      renderer.project("fill", "type", colorScale);
      var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
      var table = new Plottable.Component.Table([[renderer], [xAxis]]).renderTo(svg);
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

    it("correctly stacks", () => {
      var areas = renderer.renderArea.selectAll(".area");
      var area0 = d3.select(areas[0][0]);
      var d0 = normalizePath(area0.attr("d")).split(/[a-zA-Z]/);
      var d0Ys = d0.slice(1, d0.length - 1).map((s) => parseFloat(s.split(",")[1]));
      assert.strictEqual(d0Ys.indexOf(0), -1, "bottom area never touches the top");

      var area1 = d3.select(areas[0][1]);
      var d1 = normalizePath(area1.attr("d")).split(/[a-zA-Z]/);
      var d1Ys = d1.slice(1, d1.length - 1).map((s) => parseFloat(s.split(",")[1]));
      assert.notEqual(d1Ys.indexOf(0), -1, "touches the top");
    });
  });
});
