///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("LinePlot", () => {
    var svg: D3.Selection;
    var xScale: Plottable.Scale.Linear;
    var yScale: Plottable.Scale.Linear;
    var xAccessor: any;
    var yAccessor: any;
    var y0Accessor: any;
    var colorAccessor: any;
    var fillAccessor: any;
    var simpleDataset: Plottable.DataSource;
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
      y0Accessor = () => 0;
      colorAccessor = (d: any, i: number, m: any) => d3.rgb(d.foo, d.bar, i).toString();
      fillAccessor = () => "steelblue";
      simpleDataset = new Plottable.DataSource([{foo: 0, bar: 0}, {foo: 1, bar: 1}]);
      linePlot = new Plottable.Plot.Line(simpleDataset, xScale, yScale);
      linePlot.project("x", xAccessor, xScale)
              .project("y", yAccessor, yScale)
              .project("y0", y0Accessor, yScale)
              .project("fill", fillAccessor)
              .project("stroke", colorAccessor)
              .renderTo(svg);
      renderArea = linePlot.renderArea;
    });

    beforeEach(() => {
      verifier.start();
    });

    it("stroke color can be changed by projecting attribute accessor (sets to first datum stroke attribute)", () => {
      var data = simpleDataset.data();
      data.forEach(function(d: any) { d.stroke = "pink"; });
      simpleDataset.data(data);
      linePlot.project("stroke", "stroke");
      renderArea = linePlot.renderArea;
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
