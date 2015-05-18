///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  // HACKHACK #1798: beforeEach being used below
  describe("LinePlot", () => {
    it("getAllPlotData with NaNs", () => {
      var svg = TestMethods.generateSVG(500, 500);
      var dataWithNaN = [
        { foo: 0.0, bar: 0.0 },
        { foo: 0.2, bar: 0.2 },
        { foo: 0.4, bar: NaN },
        { foo: 0.6, bar: 0.6 },
        { foo: 0.8, bar: 0.8 }
      ];

      var xScale = new Plottable.Scales.Linear().domain([0, 1]);
      var yScale = new Plottable.Scales.Linear().domain([0, 1]);

      var linePlot = new Plottable.Plots.Line(xScale, yScale);
      linePlot.addDataset(new Plottable.Dataset(dataWithNaN));
      linePlot.x((d: any) => d.foo, xScale);
      linePlot.y((d: any) => d.bar, yScale);
      linePlot.renderTo(svg);

      var apd = linePlot.getAllPlotData();

      var expectedLength = dataWithNaN.length - 1;
      assert.strictEqual(apd.data.length, expectedLength, "NaN data was not returned");
      assert.strictEqual(apd.pixelPoints.length, expectedLength, "NaN data doesn't appear in pixelPoints");

      svg.remove();
    });
  });

  describe("LinePlot", () => {
    // HACKHACK #1798: beforeEach being used below
    it("renders correctly with no data", () => {
      var svg = TestMethods.generateSVG(400, 400);
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();
      var plot = new Plottable.Plots.Line(xScale, yScale);
      plot.x((d: any) => d.x, xScale);
      plot.y((d: any) => d.y, yScale);
      assert.doesNotThrow(() => plot.renderTo(svg), Error);
      assert.strictEqual(plot.width(), 400, "was allocated width");
      assert.strictEqual(plot.height(), 400, "was allocated height");
      svg.remove();
    });
  });

  describe("LinePlot", () => {
    var svg: D3.Selection;
    var xScale: Plottable.Scales.Linear;
    var yScale: Plottable.Scales.Linear;
    var xAccessor: any;
    var yAccessor: any;
    var colorAccessor: any;
    var twoPointData = [{foo: 0, bar: 0}, {foo: 1, bar: 1}];
    var simpleDataset: Plottable.Dataset;
    var linePlot: Plottable.Plots.Line<number>;
    var renderArea: D3.Selection;

    before(() => {
      xScale = new Plottable.Scales.Linear();
      xScale.domain([0, 1]);
      yScale = new Plottable.Scales.Linear();
      yScale.domain([0, 1]);
      xAccessor = (d: any) => d.foo;
      yAccessor = (d: any) => d.bar;
      colorAccessor = (d: any, i: number, m: any) => d3.rgb(d.foo, d.bar, i).toString();
    });

    beforeEach(() => {
      svg = TestMethods.generateSVG(500, 500);
      simpleDataset = new Plottable.Dataset(twoPointData);
      linePlot = new Plottable.Plots.Line(xScale, yScale);
      linePlot.addDataset(simpleDataset);
      linePlot.x(xAccessor, xScale)
              .y(yAccessor, yScale)
              .attr("stroke", colorAccessor)
              .renderTo(svg);
      renderArea = (<any> linePlot)._renderArea;
    });

    it("draws a line correctly", () => {
      var linePath = renderArea.select(".line");
      assert.strictEqual(TestMethods.normalizePath(linePath.attr("d")), "M0,500L500,0", "line d was set correctly");
      var lineComputedStyle = window.getComputedStyle(linePath.node());
      assert.strictEqual(lineComputedStyle.fill, "none", "line fill renders as \"none\"");
      svg.remove();
    });

    it("attributes set appropriately from accessor", () => {
      var areaPath = renderArea.select(".line");
      assert.strictEqual(areaPath.attr("stroke"), "#000000", "stroke set correctly");
      svg.remove();
    });

    it("attributes can be changed by projecting new accessor and re-render appropriately", () => {
      var newColorAccessor = () => "pink";
      linePlot.attr("stroke", newColorAccessor);
      linePlot.renderTo(svg);
      var linePath = renderArea.select(".line");
      assert.strictEqual(linePath.attr("stroke"), "pink", "stroke changed correctly");
      svg.remove();
    });

    it("attributes can be changed by projecting attribute accessor (sets to first datum attribute)", () => {
      var data = JSON.parse(JSON.stringify(twoPointData)); // deep copy to not affect other tests
      data.forEach(function(d: any) { d.stroke = "pink"; });
      simpleDataset.data(data);
      linePlot.attr("stroke", (d) => d.stroke);
      var areaPath = renderArea.select(".line");
      assert.strictEqual(areaPath.attr("stroke"), "pink", "stroke set to uniform stroke color");

      data[0].stroke = "green";
      simpleDataset.data(data);
      assert.strictEqual(areaPath.attr("stroke"), "green", "stroke set to first datum stroke color");
      svg.remove();
    });

    it("correctly handles NaN and undefined x and y values", () => {
      var lineData = [
        { foo: 0.0, bar: 0.0 },
        { foo: 0.2, bar: 0.2 },
        { foo: 0.4, bar: 0.4 },
        { foo: 0.6, bar: 0.6 },
        { foo: 0.8, bar: 0.8 }
      ];
      simpleDataset.data(lineData);
      var linePath = renderArea.select(".line");
      var d_original = TestMethods.normalizePath(linePath.attr("d"));

      function assertCorrectPathSplitting(msgPrefix: string) {
        var d = TestMethods.normalizePath(linePath.attr("d"));
        var pathSegements = d.split("M").filter((segment) => segment !== "");
        assert.lengthOf(pathSegements, 2, msgPrefix + " split path into two segments");
        var firstSegmentContained = d_original.indexOf(pathSegements[0]) >= 0;
        assert.isTrue(firstSegmentContained, "first path segment is a subpath of the original path");
        var secondSegmentContained = d_original.indexOf(pathSegements[1]) >= 0;
        assert.isTrue(secondSegmentContained, "second path segment is a subpath of the original path");
      }

      var dataWithNaN = lineData.slice();
      dataWithNaN[2] = { foo: 0.4, bar: NaN };
      simpleDataset.data(dataWithNaN);
      assertCorrectPathSplitting("y=NaN");
      dataWithNaN[2] = { foo: NaN, bar: 0.4 };
      simpleDataset.data(dataWithNaN);
      assertCorrectPathSplitting("x=NaN");

      var dataWithUndefined = lineData.slice();
      dataWithUndefined[2] = { foo: 0.4, bar: undefined };
      simpleDataset.data(dataWithUndefined);
      assertCorrectPathSplitting("y=undefined");
      dataWithUndefined[2] = { foo: undefined, bar: 0.4 };
      simpleDataset.data(dataWithUndefined);
      assertCorrectPathSplitting("x=undefined");

      svg.remove();
    });

    describe("getAllSelections()", () => {
      it("retrieves all dataset selections with no args", () => {
        var dataset3 = new Plottable.Dataset([
          { foo: 0, bar: 1 },
          { foo: 1, bar: 0.95 }
        ]);
        linePlot.addDataset(dataset3);

        var allLines = linePlot.getAllSelections();
        assert.strictEqual(allLines.size(), 2, "all lines retrieved");

        svg.remove();
      });

      it("retrieves correct selections", () => {
        var dataset3 = new Plottable.Dataset([
          { foo: 0, bar: 1 },
          { foo: 1, bar: 0.95 }
        ]);
        linePlot.addDataset(dataset3);

        var allLines = linePlot.getAllSelections([dataset3]);
        assert.strictEqual(allLines.size(), 1, "all lines retrieved");
        var selectionData = allLines.data();
        assert.include(selectionData, dataset3.data(), "third dataset data in selection data");

        svg.remove();
      });

      it("skips invalid Dataset", () => {
        var dataset3 = new Plottable.Dataset([
          { foo: 0, bar: 1 },
          { foo: 1, bar: 0.95 }
        ]);
        linePlot.addDataset(dataset3);
        var dummyDataset = new Plottable.Dataset([]);

        var allLines = linePlot.getAllSelections([dataset3, dummyDataset]);
        assert.strictEqual(allLines.size(), 1, "all lines retrieved");
        var selectionData = allLines.data();
        assert.include(selectionData, dataset3.data(), "third dataset data in selection data");

        svg.remove();
      });

    });

    describe("getAllPlotData()", () => {

      it("retrieves correct data", () => {
        var dataset3 = new Plottable.Dataset([
          { foo: 0, bar: 1 },
          { foo: 1, bar: 0.95 }
        ]);
        linePlot.addDataset(dataset3);

        var allLines = linePlot.getAllPlotData().selection;
        assert.strictEqual(allLines.size(), linePlot.datasets().length, "single line per dataset");
        svg.remove();
      });
    });

    describe("getClosestPlotData()", () => {
      var lines: D3.Selection;
      var d0: any, d1: any;
      var d0Px: Plottable.Point, d1Px: Plottable.Point;
      var dataset2: Plottable.Dataset;

      function assertPlotDataEqual(actual: Plottable.Plots.PlotData, expected: Plottable.Plots.PlotData, msg: string) {
        assert.deepEqual(actual.data, expected.data, msg);
        assert.closeTo(actual.pixelPoints[0].x, expected.pixelPoints[0].x, 0.01, msg);
        assert.closeTo(actual.pixelPoints[0].y, expected.pixelPoints[0].y, 0.01, msg);
        assert.deepEqual(actual.selection, expected.selection, msg);
      }

      beforeEach(() => {
        dataset2 = new Plottable.Dataset([
          { foo: 0, bar: 0.75 },
          { foo: 1, bar: 0.25 }
        ]);

        linePlot.addDataset(dataset2);

        lines = d3.selectAll(".line-plot .line");
        d0 = dataset2.data()[0];
        d0Px = {
          x: xScale.scale(xAccessor(d0)),
          y: yScale.scale(yAccessor(d0))
        };

        d1 = dataset2.data()[1];
        d1Px = {
          x: xScale.scale(xAccessor(d1)),
          y: yScale.scale(yAccessor(d1))
        };
      });

      it("returns correct closest plot data", () => {
        var expected = {
          data: [d0],
          pixelPoints: [d0Px],
          selection: d3.selectAll([lines[0][1]])
        };

        var closest = linePlot.getClosestPlotData({x: d0Px.x, y: d0Px.y - 1});
        assertPlotDataEqual(closest, expected, "if above a point, it is closest");

        closest = linePlot.getClosestPlotData({x: d0Px.x, y: d0Px.y + 1});
        assertPlotDataEqual(closest, expected, "if below a point, it is closest");

        closest = linePlot.getClosestPlotData({x: d0Px.x + 1, y: d0Px.y + 1});
        assertPlotDataEqual(closest, expected, "if right of a point, it is closest");

        expected = {
          data: [d1],
          pixelPoints: [d1Px],
          selection: d3.selectAll([lines[0][1]])
        };

        closest = linePlot.getClosestPlotData({x: d1Px.x - 1, y: d1Px.y});
        assertPlotDataEqual(closest, expected, "if left of a point, it is closest");

        svg.remove();
      });

      it("considers only in-view points", () => {
        xScale.domain([0.25, 1]);

        var expected = {
          data: [d1],
          pixelPoints: [{
            x: xScale.scale(xAccessor(d1)),
            y: yScale.scale(yAccessor(d1))
          }],
          selection: d3.selectAll([lines[0][1]])
        };

        var closest = linePlot.getClosestPlotData({ x: xScale.scale(0.25), y: d1Px.y });
        assertPlotDataEqual(closest, expected, "only in-view points are considered");

        svg.remove();
      });

      it("handles empty plots gracefully", () => {
        linePlot = new Plottable.Plots.Line(xScale, yScale);

        var closest = linePlot.getClosestPlotData({ x: d0Px.x, y: d0Px.y });
        assert.lengthOf(closest.data, 0);
        assert.lengthOf(closest.pixelPoints, 0);
        assert.isTrue(closest.selection.empty());

        svg.remove();
      });
    });

    it("retains original classes when class is projected", () => {
      var newClassProjector = () => "pink";
      linePlot.attr("class", newClassProjector);
      linePlot.renderTo(svg);
      var linePath = renderArea.select("." + Plottable.Drawers.Line.LINE_CLASS);
      assert.isTrue(linePath.classed("pink"));
      assert.isTrue(linePath.classed(Plottable.Drawers.Line.LINE_CLASS));
      svg.remove();
    });
  });
});
