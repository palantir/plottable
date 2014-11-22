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
    var twoPointData = [{foo: 0, bar: 0}, {foo: 1, bar: 1}];
    var simpleDataset: Plottable.Dataset;
    var areaPlot: Plottable.Plot.Area<number>;
    var renderArea: D3.Selection;

    before(() => {
      xScale = new Plottable.Scale.Linear().domain([0, 1]);
      yScale = new Plottable.Scale.Linear().domain([0, 1]);
      xAccessor = (d: any) => d.foo;
      yAccessor = (d: any) => d.bar;
      y0Accessor = () => 0;
      colorAccessor = (d: any, i: number, m: any) => d3.rgb(d.foo, d.bar, i).toString();
      fillAccessor = () => "steelblue";
    });

    beforeEach(() => {
      svg = generateSVG(500, 500);
      simpleDataset = new Plottable.Dataset(twoPointData);
      areaPlot = new Plottable.Plot.Area(xScale, yScale);
      areaPlot.addDataset(simpleDataset)
              .project("x", xAccessor, xScale)
              .project("y", yAccessor, yScale)
              .project("y0", y0Accessor, yScale)
              .project("fill", fillAccessor)
              .project("stroke", colorAccessor)
              .renderTo(svg);
      renderArea = (<any> areaPlot)._renderArea;
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
      svg.remove();
    });

    it("area fill works for non-zero floor values appropriately, e.g. half the height of the line", () => {
      areaPlot.project("y0", (d: any) => d.bar/2, yScale);
      areaPlot.renderTo(svg);
      renderArea = (<any> areaPlot)._renderArea;
      var areaPath = renderArea.select(".area");
      assert.equal(normalizePath(areaPath.attr("d")), "M0,500L500,0L500,250L0,500Z");
      svg.remove();
    });

    it("area is appended before line", () => {
      var paths = renderArea.selectAll("path")[0];
      var areaSelection = renderArea.select(".area")[0][0];
      var lineSelection = renderArea.select(".line")[0][0];
      assert.operator(paths.indexOf(areaSelection), "<", paths.indexOf(lineSelection), "area appended before line");
      svg.remove();
    });

    it("correctly handles NaN and undefined x and y values", () => {
      var areaData = [
        { foo: 0.0, bar: 0.0 },
        { foo: 0.2, bar: 0.2 },
        { foo: 0.4, bar: 0.4 },
        { foo: 0.6, bar: 0.6 },
        { foo: 0.8, bar: 0.8 }
      ];
      var expectedPath = "M0,500L100,400L100,500L0,500ZM300,200L400,100L400,500L300,500Z";
      var areaPath = renderArea.select(".area");

      var dataWithNaN = areaData.slice();
      dataWithNaN[2] = { foo: 0.4, bar: NaN };
      simpleDataset.data(dataWithNaN);

      var areaPathString = normalizePath(areaPath.attr("d"));
      assertAreaPathCloseTo(areaPathString, expectedPath, 0.1, "area d was set correctly (y=NaN case)");

      dataWithNaN[2] = { foo: NaN, bar: 0.4 };
      simpleDataset.data(dataWithNaN);

      areaPathString = normalizePath(areaPath.attr("d"));
      assertAreaPathCloseTo(areaPathString, expectedPath, 0.1, "area d was set correctly (x=NaN case)");

      var dataWithUndefined = areaData.slice();
      dataWithUndefined[2] = { foo: 0.4, bar: undefined };
      simpleDataset.data(dataWithUndefined);

      areaPathString = normalizePath(areaPath.attr("d"));
      assertAreaPathCloseTo(areaPathString, expectedPath, 0.1, "area d was set correctly (y=undefined case)");

      dataWithUndefined[2] = { foo: undefined, bar: 0.4 };
      simpleDataset.data(dataWithUndefined);

      areaPathString = normalizePath(areaPath.attr("d"));
      assertAreaPathCloseTo(areaPathString, expectedPath, 0.1, "area d was set correctly (x=undefined case)");

      svg.remove();
    });

  });
});
