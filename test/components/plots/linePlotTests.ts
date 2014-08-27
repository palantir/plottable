///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("LinePlot", () => {
    var svg: D3.Selection;
    var xScale: Plottable.Scale.Linear;
    var yScale: Plottable.Scale.Linear;
    var xAccessor: any;
    var yAccessor: any;
    var colorAccessor: any;
    var simpleDataset: Plottable.Dataset;
    var linePlot: Plottable.Plot.Line;
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
      colorAccessor = (d: any, i: number, m: any) => d3.rgb(d.foo, d.bar, i).toString();
      simpleDataset = new Plottable.Dataset([{foo: 0, bar: 0}, {foo: 1, bar: 1}]);
      linePlot = new Plottable.Plot.Line(simpleDataset, xScale, yScale);
      linePlot.project("x", xAccessor, xScale)
              .project("y", yAccessor, yScale)
              .project("stroke", colorAccessor)
              .renderTo(svg);
      renderArea = linePlot.renderArea;
    });

    beforeEach(() => {
      verifier.start();
    });

    it("draws a line correctly", () => {
      var linePath = renderArea.select(".line");
      assert.strictEqual(normalizePath(linePath.attr("d")), "M0,500L500,0", "line d was set correctly");
      var lineComputedStyle = window.getComputedStyle(linePath.node());
      assert.strictEqual(lineComputedStyle.fill, "none", "line fill renders as \"none\"");
      verifier.end();
    });

    it("attributes set appropriately from accessor", () => {
      var areaPath = renderArea.select(".line");
      assert.equal(areaPath.attr("stroke"), "#000000", "stroke set correctly");
      verifier.end();
    });

    it("attributes can be changed by projecting new accessor and re-render appropriately", () => {
      var newColorAccessor = () => "pink";
      linePlot.project("stroke", newColorAccessor);
      linePlot.renderTo(svg);
      var linePath = renderArea.select(".line");
      assert.equal(linePath.attr("stroke"), "pink", "stroke changed correctly");
      verifier.end();
    });

    it("attributes can be changed by projecting attribute accessor (sets to first datum attribute)", () => {
      var data = simpleDataset.data();
      data.forEach(function(d: any) { d.stroke = "pink"; });
      simpleDataset.data(data);
      linePlot.project("stroke", "stroke");
      var areaPath = renderArea.select(".line");
      assert.equal(areaPath.attr("stroke"), "pink", "stroke set to uniform stroke color");

      data[0].stroke = "green";
      simpleDataset.data(data);
      assert.equal(areaPath.attr("stroke"), "green", "stroke set to first datum stroke color");
      verifier.end();
    });

    after(() => {
      if (verifier.passed) {svg.remove();};
    });
  });
});
