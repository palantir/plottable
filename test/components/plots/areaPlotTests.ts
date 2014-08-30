///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("AreaPlot", () => {
    var svg: D3.Selection;
    var xScale: Plottable.Scale.Linear;
    var yScale: Plottable.Scale.Linear;
    var xAccessor: any;
    var yAccessor: any;
    var y0Accessor: any;
    var colorAccessor: any;
    var fillAccessor: any;
    var simpleDataset: Plottable.Dataset;
    var areaPlot: Plottable.Plot.Area<number>;
    var renderArea: D3.Selection;
    var verifier: MultiTestVerifier;
    // for IE, whose paths look like "M 0 500 L" instead of "M0,500L"
    var normalizePath = (s: string) => s.replace(/ *([A-Z]) */g, "$1").replace(/ /g, ",");

    before(() => {
      svg = generateSVG(500, 500);
      verifier = new MultiTestVerifier();
      xScale = new Plottable.Scale.Linear().domain([0, 1]);
      yScale = new Plottable.Scale.Linear().domain([0, 1]);
      xAccessor = (d: any) => d.foo;
      yAccessor = (d: any) => d.bar;
      y0Accessor = () => 0;
      colorAccessor = (d: any, i: number, m: any) => d3.rgb(d.foo, d.bar, i).toString();
      fillAccessor = () => "steelblue";
      simpleDataset = new Plottable.Dataset([{foo: 0, bar: 0}, {foo: 1, bar: 1}]);
      areaPlot = new Plottable.Plot.Area(simpleDataset, xScale, yScale);
      areaPlot.project("x", xAccessor, xScale)
              .project("y", yAccessor, yScale)
              .project("y0", y0Accessor, yScale)
              .project("fill", fillAccessor)
              .project("stroke", colorAccessor)
              .renderTo(svg);
      renderArea = areaPlot.renderArea;
    });

    beforeEach(() => {
      verifier.start();
    });

    it("draws area and line correctly", () => {
      var areaPath = renderArea.select(".area");
      assert.strictEqual(normalizePath(areaPath.attr("d")), "M0,500L500,0L500,500L0,500Z", "area d was set correctly");
      assert.strictEqual(areaPath.attr("fill"), "steelblue", "area fill was set correctly");
      var areaComputedStyle = window.getComputedStyle(areaPath.node());
      assert.strictEqual(areaComputedStyle.stroke, "none", "area stroke renders as \"none\"");

      var linePath = renderArea.select(".line");
      assert.strictEqual(normalizePath(linePath.attr("d")), "M0,500L500,0", "line d was set correctly");
      assert.strictEqual(linePath.attr("stroke"), "#000000", "line stroke was set correctly");
      var lineComputedStyle = window.getComputedStyle(linePath.node());
      assert.strictEqual(lineComputedStyle.fill, "none", "line fill renders as \"none\"");
      verifier.end();
    });

    it("area fill works for non-zero floor values appropriately, e.g. half the height of the line", () => {
      areaPlot.project("y0", (d: any) => d.bar/2, yScale);
      areaPlot.renderTo(svg);
      renderArea = areaPlot.renderArea;
      var areaPath = renderArea.select(".area");
      assert.equal(normalizePath(areaPath.attr("d")), "M0,500L500,0L500,250L0,500Z");
      verifier.end();
    });

    it("area is appended before line", () => {
      var paths = renderArea.selectAll("path")[0];
      var areaSelection = renderArea.select(".area")[0][0];
      var lineSelection = renderArea.select(".line")[0][0];
      assert.operator(paths.indexOf(areaSelection), "<", paths.indexOf(lineSelection), "area appended before line");
      verifier.end();
    });

    after(() => {
      if (verifier.passed) {svg.remove();};
    });
  });
});
