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
    var twoPointData = [{foo: 0, bar: 0}, {foo: 1, bar: 1}];
    var simpleDataset: Plottable.Dataset;
    var linePlot: Plottable.Plot.Line<number>;
    var renderArea: D3.Selection;

    before(() => {
      xScale = new Plottable.Scale.Linear().domain([0, 1]);
      yScale = new Plottable.Scale.Linear().domain([0, 1]);
      xAccessor = (d: any) => d.foo;
      yAccessor = (d: any) => d.bar;
      colorAccessor = (d: any, i: number, m: any) => d3.rgb(d.foo, d.bar, i).toString();
    });

    beforeEach(() => {
      svg = generateSVG(500, 500);
      simpleDataset = new Plottable.Dataset(twoPointData);
      linePlot = new Plottable.Plot.Line(simpleDataset, xScale, yScale);
      linePlot.project("x", xAccessor, xScale)
              .project("y", yAccessor, yScale)
              .project("stroke", colorAccessor)
              .renderTo(svg);
      renderArea = linePlot._renderArea;
    });

    it("draws a line correctly", () => {
      var linePath = renderArea.select(".line");
      assert.strictEqual(normalizePath(linePath.attr("d")), "M0,500L500,0", "line d was set correctly");
      var lineComputedStyle = window.getComputedStyle(linePath.node());
      assert.strictEqual(lineComputedStyle.fill, "none", "line fill renders as \"none\"");
      svg.remove();
    });

    it("attributes set appropriately from accessor", () => {
      var areaPath = renderArea.select(".line");
      assert.equal(areaPath.attr("stroke"), "#000000", "stroke set correctly");
      svg.remove();
    });

    it("attributes can be changed by projecting new accessor and re-render appropriately", () => {
      var newColorAccessor = () => "pink";
      linePlot.project("stroke", newColorAccessor);
      linePlot.renderTo(svg);
      var linePath = renderArea.select(".line");
      assert.equal(linePath.attr("stroke"), "pink", "stroke changed correctly");
      svg.remove();
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
      svg.remove();
    });

    it("correctly handles NaN and undefined y-values", () => {
      simpleDataset.data([
        { foo: 0.0, bar: 0.0 },
        { foo: 0.2, bar: 0.2 },
        { foo: 0.4, bar: NaN },
        { foo: 0.6, bar: 0.6 },
        { foo: 0.8, bar: 0.8 }
      ]);
      var linePath = renderArea.select(".line");
      assert.strictEqual(normalizePath(linePath.attr("d")), "M0,500L100,400M300,200L400,100", "line d was set correctly");

      simpleDataset.data([
        { foo: 0.0, bar: 0.0 },
        { foo: 0.2, bar: 0.2 },
        { foo: 0.4, bar: undefined },
        { foo: 0.6, bar: 0.6 },
        { foo: 0.8, bar: 0.8 }
      ]);
      assert.strictEqual(normalizePath(linePath.attr("d")), "M0,500L100,400M300,200L400,100", "line d was set correctly");
      svg.remove();
    });
  });
});
