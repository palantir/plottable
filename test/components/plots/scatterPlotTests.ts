///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {
  describe("ScatterPlot", () => {
    it("renders correctly with no data", () => {
      var svg = generateSVG(400, 400);
      var xScale = new Plottable.Scale.Linear();
      var yScale = new Plottable.Scale.Linear();
      var plot = new Plottable.Plot.Scatter(xScale, yScale);
      plot.project("x", (d: any) => d.x, xScale);
      plot.project("y", (d: any) => d.y, yScale);
      assert.doesNotThrow(() => plot.renderTo(svg), Error);
      assert.strictEqual(plot.width(), 400, "was allocated width");
      assert.strictEqual(plot.height(), 400, "was allocated height");
      svg.remove();
    });

    it("the accessors properly access data, index, and metadata", () => {
      var svg = generateSVG(400, 400);
      var xScale = new Plottable.Scale.Linear();
      var yScale = new Plottable.Scale.Linear();
      xScale.domain([0, 400]);
      yScale.domain([400, 0]);
      var data = [{x: 0, y: 0}, {x: 1, y: 1}];
      var metadata = {foo: 10, bar: 20};
      var xAccessor = (d: any, i?: number, m?: any) => d.x + i * m.foo;
      var yAccessor = (d: any, i?: number, m?: any) => m.bar;
      var dataset = new Plottable.Dataset(data, metadata);
      var plot = new Plottable.Plot.Scatter(xScale, yScale)
                                  .project("x", xAccessor)
                                  .project("y", yAccessor);
      plot.addDataset(dataset);
      plot.renderTo(svg);
      var symbols = plot.getAllSelections();
      var c1 = d3.select(symbols[0][0]);
      var c2 = d3.select(symbols[0][1]);
      var c1Position = d3.transform(c1.attr("transform")).translate;
      var c2Position = d3.transform(c2.attr("transform")).translate;
      assert.closeTo(parseFloat(c1Position[0]), 0, 0.01, "first symbol cx is correct");
      assert.closeTo(parseFloat(c1Position[1]), 20, 0.01, "first symbol cy is correct");
      assert.closeTo(parseFloat(c2Position[0]), 11, 0.01, "second symbol cx is correct");
      assert.closeTo(parseFloat(c2Position[1]), 20, 0.01, "second symbol cy is correct");

      data = [{x: 2, y: 2}, {x: 4, y: 4}];
      dataset.data(data);
      c1Position = d3.transform(c1.attr("transform")).translate;
      c2Position = d3.transform(c2.attr("transform")).translate;
      assert.closeTo(parseFloat(c1Position[0]), 2, 0.01, "first symbol cx is correct after data change");
      assert.closeTo(parseFloat(c1Position[1]), 20, 0.01, "first symbol cy is correct after data change");
      assert.closeTo(parseFloat(c2Position[0]), 14, 0.01, "second symbol cx is correct after data change");
      assert.closeTo(parseFloat(c2Position[1]), 20, 0.01, "second symbol cy is correct after data change");

      metadata = {foo: 0, bar: 0};
      dataset.metadata(metadata);
      c1Position = d3.transform(c1.attr("transform")).translate;
      c2Position = d3.transform(c2.attr("transform")).translate;

      assert.closeTo(parseFloat(c1Position[0]), 2, 0.01, "first symbol cx is correct after metadata change");
      assert.closeTo(parseFloat(c1Position[1]), 0, 0.01, "first symbol cy is correct after metadata change");
      assert.closeTo(parseFloat(c2Position[0]), 4, 0.01, "second symbol cx is correct after metadata change");
      assert.closeTo(parseFloat(c2Position[1]), 0, 0.01, "second symbol cy is correct after metadata change");

      svg.remove();
    });

    it("getAllSelections()", () => {
      var svg = generateSVG(400, 400);
      var xScale = new Plottable.Scale.Linear();
      var yScale = new Plottable.Scale.Linear();
      var data = [{x: 0, y: 0}, {x: 1, y: 1}];
      var data2 = [{x: 1, y: 2}, {x: 3, y: 4}];
      var plot = new Plottable.Plot.Scatter(xScale, yScale)
                                   .project("x", "x", xScale)
                                   .project("y", "y", yScale)
                                   .addDataset(data)
                                   .addDataset(data2);
      plot.renderTo(svg);
      var allCircles = plot.getAllSelections();
      assert.strictEqual(allCircles.size(), 4, "all circles retrieved");
      var selectionData = allCircles.data();
      assert.includeMembers(selectionData, data, "first dataset data in selection data");
      assert.includeMembers(selectionData, data2, "second dataset data in selection data");

      svg.remove();
    });

    it("getClosestPlotData()", () => {
      function assertPlotDataEqual(expected: Plottable.Plot.PlotData, actual: Plottable.Plot.PlotData,
        msg: string) {
        assert.deepEqual(expected.data, actual.data, msg);
        assert.closeTo(expected.pixelPoints[0].x, actual.pixelPoints[0].x, 0.01, msg);
        assert.closeTo(expected.pixelPoints[0].y, actual.pixelPoints[0].y, 0.01, msg);
        assert.deepEqual(expected.selection, actual.selection, msg);
      }

      var svg = generateSVG(400, 400);
      var xScale = new Plottable.Scale.Linear();
      var yScale = new Plottable.Scale.Linear();
      var data = [{x: 0, y: 0}, {x: 1, y: 1}];
      var data2 = [{x: 1, y: 2}, {x: 3, y: 4}];
      var plot = new Plottable.Plot.Scatter(xScale, yScale)
                                   .project("x", "x", xScale)
                                   .project("y", "y", yScale)
                                   .addDataset(data)
                                   .addDataset(data2);
      plot.renderTo(svg);

      var points = d3.selectAll(".scatter-plot path");
      var d0 = data[0];
      var d0Px = {
        x: xScale.scale(d0.x),
        y: yScale.scale(d0.y)
      };

      var expected = {
        data: [d0],
        pixelPoints: [d0Px],
        selection: d3.select(points[0][0])
      };

      var closest = plot.getClosestPlotData({ x: d0Px.x + 1, y: d0Px.y + 1 });
      assertPlotDataEqual(expected, closest, "it selects the closest data point");

      yScale.domain([0, 1.9]);

      var d1 = data[1];
      var d1Px = {
        x: xScale.scale(d1.x),
        y: yScale.scale(d1.y)
      };

      expected = {
        data: [d1],
        pixelPoints: [d1Px],
        selection: d3.select(points[0][1])
      };

      closest = plot.getClosestPlotData({ x: d1Px.x, y: 0 });
      assertPlotDataEqual(expected, closest, "it ignores off-plot data points");

      svg.remove();
    });

    it("_getClosestStruckPoint()", () => {
      var svg = generateSVG(400, 400);
      var xScale = new Plottable.Scale.Linear();
      var yScale = new Plottable.Scale.Linear();
      xScale.domain([0, 400]);
      yScale.domain([400, 0]);

      var data1 = [
        { x: 80, y: 200, size: 40 },
        { x: 100, y: 200, size: 40 },
        { x: 125, y: 200, size: 10 },
        { x: 138, y: 200, size: 10 }
      ];

      var plot = new Plottable.Plot.Scatter(xScale, yScale);
      plot.addDataset(data1);
      plot.project("x", "x").project("y", "y").project("size", "size");
      plot.renderTo(svg);

      var twoOverlappingCirclesResult = (<any> plot)._getClosestStruckPoint({ x: 85, y: 200 }, 10);
      assert.strictEqual(twoOverlappingCirclesResult.data[0], data1[0],
        "returns closest circle among circles that the test point touches");

      var overlapAndCloseToPointResult = (<any> plot)._getClosestStruckPoint({ x: 118, y: 200 }, 10);
      assert.strictEqual(overlapAndCloseToPointResult.data[0], data1[1],
        "returns closest circle that test point touches, even if non-touched circles are closer");

      var twoPointsInRangeResult = (<any> plot)._getClosestStruckPoint({ x: 130, y: 200 }, 10);
      assert.strictEqual(twoPointsInRangeResult.data[0], data1[2],
        "returns closest circle within range if test point does not touch any circles");

      var farFromAnyPointsResult = (<any> plot)._getClosestStruckPoint({ x: 400, y: 400 }, 10);
      assert.isNull(farFromAnyPointsResult.data,
        "returns no data if no circle were within range and test point does not touch any circles");

      svg.remove();
    });

    it("correctly handles NaN and undefined x and y values", () => {
      var svg = generateSVG(400, 400);
      var data = [
        { foo: 0.0, bar: 0.0 },
        { foo: 0.2, bar: 0.2 },
        { foo: 0.4, bar: 0.4 },
        { foo: 0.6, bar: 0.6 },
        { foo: 0.8, bar: 0.8 }
      ];
      var dataset = new Plottable.Dataset(data);
      var xScale = new Plottable.Scale.Linear();
      var yScale = new Plottable.Scale.Linear();
      var plot = new Plottable.Plot.Scatter(xScale, yScale);
      plot.addDataset(dataset)
          .project("x", "foo", xScale)
          .project("y", "bar", yScale);
      plot.renderTo(svg);

      var dataWithNaN = data.slice();
      dataWithNaN[2] = { foo: 0.4, bar: NaN };
      dataset.data(dataWithNaN);
      assert.strictEqual(plot.getAllSelections().size(), 4, "does not draw NaN point");

      var dataWithUndefined = data.slice();
      dataWithUndefined[2] = { foo: 0.4, bar: undefined };
      dataset.data(dataWithUndefined);
      assert.strictEqual(plot.getAllSelections().size(), 4, "does not draw undefined point");
      dataWithUndefined[2] = { foo: undefined, bar: 0.4 };
      dataset.data(dataWithUndefined);
      assert.strictEqual(plot.getAllSelections().size(), 4, "does not draw undefined point");

      svg.remove();
    });

    describe("Example ScatterPlot with quadratic series", () => {
      var svg: D3.Selection;
      var xScale: Plottable.Scale.Linear;
      var yScale: Plottable.Scale.Linear;
      var circlePlot: Plottable.Plot.Scatter<number, number>;
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 300;
      var pixelAreaFull = {xMin: 0, xMax: SVG_WIDTH, yMin: 0, yMax: SVG_HEIGHT};
      var pixelAreaPart = {xMin: 200, xMax: 600, yMin: 100, yMax: 200};
      var dataAreaFull = {xMin: 0, xMax: 9, yMin: 81, yMax: 0};
      var dataAreaPart = {xMin: 3, xMax: 9, yMin: 54, yMax: 27};
      var colorAccessor = (d: any, i: number, m: any) => d3.rgb(d.x, d.y, i).toString();
      var circlesInArea: number;
      var quadraticDataset = makeQuadraticSeries(10);

      function getCirclePlotVerifier() {
        // creates a function that verifies that circles are drawn properly after accounting for svg transform
        // and then modifies circlesInArea to contain the number of circles that were discovered in the plot area
        circlesInArea = 0;
        var renderArea = (<any> circlePlot)._renderArea;
        var renderAreaTransform = d3.transform(renderArea.attr("transform"));
        var translate = renderAreaTransform.translate;
        var scale     = renderAreaTransform.scale;
        return function (datum: any, index: number) {
          // This function takes special care to compute the position of circles after taking svg transformation
          // into account.
          var selection = d3.select(this);

          var circlePosition = d3.transform(selection.attr("transform")).translate;
          var x = +circlePosition[0] * scale[0] + translate[0];
          var y = +circlePosition[1] * scale[1] + translate[1];
          if (0 <= x && x <= SVG_WIDTH && 0 <= y && y <= SVG_HEIGHT) {
            circlesInArea++;
            assert.closeTo(x, xScale.scale(datum.x), 0.01, "the scaled/translated x is correct");
            assert.closeTo(y, yScale.scale(datum.y), 0.01, "the scaled/translated y is correct");
            assert.equal(selection.attr("fill"), colorAccessor(datum, index, null), "fill is correct");
          };
        };
      };

      beforeEach(() => {
        svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.Scale.Linear().domain([0, 9]);
        yScale = new Plottable.Scale.Linear().domain([0, 81]);
        circlePlot = new Plottable.Plot.Scatter(xScale, yScale);
        circlePlot.addDataset(quadraticDataset);
        circlePlot.project("fill", colorAccessor);
        circlePlot.project("x", "x", xScale);
        circlePlot.project("y", "y", yScale);
        circlePlot.renderTo(svg);
      });

      it("setup is handled properly", () => {
        assert.deepEqual(xScale.range(), [0, SVG_WIDTH], "xScale range was set by the renderer");
        assert.deepEqual(yScale.range(), [SVG_HEIGHT, 0], "yScale range was set by the renderer");
        circlePlot.getAllSelections().each(getCirclePlotVerifier());
        assert.equal(circlesInArea, 10, "10 circles were drawn");
        svg.remove();
      });

      it("rendering is idempotent", () => {
        circlePlot._render();
        circlePlot._render();
        circlePlot.getAllSelections().each(getCirclePlotVerifier());
        assert.equal(circlesInArea, 10, "10 circles were drawn");
        svg.remove();
      });

      describe("after the scale has changed", () => {
        beforeEach(() => {
          xScale.domain([0, 3]);
          yScale.domain([0, 9]);
          dataAreaFull = {xMin: 0, xMax: 3, yMin: 9, yMax: 0};
          dataAreaPart = {xMin: 1, xMax: 3, yMin: 6, yMax: 3};
        });

        it("the circles re-rendered properly", () => {
          var circles = circlePlot.getAllSelections();
          circles.each(getCirclePlotVerifier());
          assert.equal(circlesInArea, 4, "four circles were found in the render area");
          svg.remove();
        });
      });
    });
  });
});
