///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("LinePlot", () => {
    // HACKHACK beforeEach being used below
    it("renders correctly with no data", () => {
      var svg = generateSVG(400, 400);
      var xScale = new Plottable.Scale.Linear();
      var yScale = new Plottable.Scale.Linear();
      var plot = new Plottable.Plot.Line(xScale, yScale);
      plot.project("x", (d: any) => d.x, xScale);
      plot.project("y", (d: any) => d.y, yScale);
      assert.doesNotThrow(() => plot.renderTo(svg), Error);
      assert.strictEqual(plot.width(), 400, "was allocated width");
      assert.strictEqual(plot.height(), 400, "was allocated height");
      svg.remove();
    });
  });

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
      linePlot = new Plottable.Plot.Line(xScale, yScale);
      linePlot.addDataset("s1", simpleDataset)
              .project("x", xAccessor, xScale)
              .project("y", yAccessor, yScale)
              .project("stroke", colorAccessor)
              .addDataset("s2", simpleDataset)
              .renderTo(svg);
      renderArea = (<any> linePlot)._renderArea;
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
      var data = JSON.parse(JSON.stringify(twoPointData)); // deep copy to not affect other tests
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
      var d_original = normalizePath(linePath.attr("d"));

      function assertCorrectPathSplitting(msgPrefix: string) {
        var d = normalizePath(linePath.attr("d"));
        var pathSegements = d.split("M").filter((segment) => segment !== "");
        assert.lengthOf(pathSegements, 2, msgPrefix + " split path into two segments");
        var firstSegmentContained = d_original.indexOf(pathSegements[0]) >= 0;
        assert.isTrue(firstSegmentContained, "first path segment is a subpath of the original path");
        var secondSegmentContained = d_original.indexOf(pathSegements[1]) >= 0;
        assert.isTrue(firstSegmentContained, "second path segment is a subpath of the original path");
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

    it("_getClosestWithinRange", () => {
      var dataset2 = [
        { foo: 0, bar: 1 },
        { foo: 1, bar: 0.95 }
      ];
      linePlot.addDataset(dataset2);

      var closestData = (<any> linePlot)._getClosestWithinRange({ x: 500, y: 0 }, 5);
      assert.strictEqual(closestData.closestValue, twoPointData[1], "got closest point from first dataset");

      closestData = (<any> linePlot)._getClosestWithinRange({ x: 500, y: 25 }, 5);
      assert.strictEqual(closestData.closestValue, dataset2[1], "got closest point from second dataset");

      closestData = (<any> linePlot)._getClosestWithinRange({ x: 500, y: 10 }, 5);
      assert.isUndefined(closestData.closestValue, "returns nothing if no points are within range");

      closestData = (<any> linePlot)._getClosestWithinRange({ x: 500, y: 10 }, 25);
      assert.strictEqual(closestData.closestValue, twoPointData[1], "returns the closest point within range");

      closestData = (<any> linePlot)._getClosestWithinRange({ x: 500, y: 20 }, 25);
      assert.strictEqual(closestData.closestValue, dataset2[1], "returns the closest point within range");

      svg.remove();
    });

    it("_doHover()", () => {
      var dataset2 = [
        { foo: 0, bar: 1 },
        { foo: 1, bar: 0.95 }
      ];
      linePlot.addDataset(dataset2);

      var hoverData = linePlot._doHover({ x: 495, y: 0 });
      var expectedDatum = twoPointData[1];
      assert.strictEqual(hoverData.data[0], expectedDatum, "returned the closest point within range");
      var hoverTarget = hoverData.selection;
      assert.strictEqual(parseFloat(hoverTarget.attr("cx")), xScale.scale(expectedDatum.foo), "hover target was positioned correctly (x)");
      assert.strictEqual(parseFloat(hoverTarget.attr("cy")), yScale.scale(expectedDatum.bar), "hover target was positioned correctly (y)");

      hoverData = linePlot._doHover({ x: 0, y: 0 });
      expectedDatum = dataset2[0];
      assert.strictEqual(hoverData.data[0], expectedDatum, "returned the closest point within range");
      hoverTarget = hoverData.selection;
      assert.strictEqual(parseFloat(hoverTarget.attr("cx")), xScale.scale(expectedDatum.foo), "hover target was positioned correctly (x)");
      assert.strictEqual(parseFloat(hoverTarget.attr("cy")), yScale.scale(expectedDatum.bar), "hover target was positioned correctly (y)");

      svg.remove();
    });

    describe("getAllSelections()",() => {

      it("retrieves all dataset selections with no args", () => {
        var dataset3 = [
          { foo: 0, bar: 1 },
          { foo: 1, bar: 0.95 }
        ];
        linePlot.addDataset("d3", dataset3);

        var allLines = linePlot.getAllSelections();
        var allLines2 = linePlot.getAllSelections((<any> linePlot)._datasetKeysInOrder);
        assert.deepEqual(allLines, allLines2, "all lines retrieved");

        svg.remove();
      });

      it("retrieves correct selections (string arg)", () => {
        var dataset3 = [
          { foo: 0, bar: 1 },
          { foo: 1, bar: 0.95 }
        ];
        linePlot.addDataset("d3", dataset3);

        var allLines = linePlot.getAllSelections("d3");
        assert.strictEqual(allLines.size(), 1, "all lines retrieved");
        var selectionData = allLines.data();
        assert.include(selectionData, dataset3, "third dataset data in selection data");

        svg.remove();
      });

      it("retrieves correct selections (array arg)", () => {
        var dataset3 = [
          { foo: 0, bar: 1 },
          { foo: 1, bar: 0.95 }
        ];
        linePlot.addDataset("d3", dataset3);

        var allLines = linePlot.getAllSelections(["d3"]);
        assert.strictEqual(allLines.size(), 1, "all lines retrieved");
        var selectionData = allLines.data();
        assert.include(selectionData, dataset3, "third dataset data in selection data");

        svg.remove();
      });

      it("skips invalid keys",() => {
        var dataset3 = [
          { foo: 0, bar: 1 },
          { foo: 1, bar: 0.95 }
        ];
        linePlot.addDataset("d3", dataset3);

        var allLines = linePlot.getAllSelections(["d3", "test"]);
        assert.strictEqual(allLines.size(), 1, "all lines retrieved");
        var selectionData = allLines.data();
        assert.include(selectionData, dataset3, "third dataset data in selection data");

        svg.remove();
      });

    });

    describe("getAllPlotData()", () => {

      it("retrieves correct data", () => {
        var dataset3 = [
          { foo: 0, bar: 1 },
          { foo: 1, bar: 0.95 }
        ];
        linePlot.addDataset("d3", dataset3);

        var allLines = linePlot.getAllPlotData().selection;
        assert.strictEqual(allLines.size(), linePlot.datasets().length, "single line per dataset");
        svg.remove();
      });
    });

    describe("getClosestPlotData()", () => {

      it("retrieves correct data", () => {
        var dataset3 = [
          { foo: 0, bar: 1 },
          { foo: 1, bar: 0.95 }
        ];
        linePlot.addDataset("d3", dataset3);

        var lineData = linePlot.getClosestPlotData({x: 490, y: 300});
        assert.strictEqual(lineData.selection.size(), 1, "only 1 line retreieved");
        assert.strictEqual(lineData.data[0], dataset3[1], "correct datum retrieved");

        svg.remove();
      });

    });

    it("retains original classes when class is projected", () => {
      var newClassProjector = () => "pink";
      linePlot.project("class", newClassProjector);
      linePlot.renderTo(svg);
      var linePath = renderArea.select("." + Plottable._Drawer.Line.LINE_CLASS);
      assert.isTrue(linePath.classed("pink"));
      assert.isTrue(linePath.classed(Plottable._Drawer.Line.LINE_CLASS));
      svg.remove();
    });
  });
});
