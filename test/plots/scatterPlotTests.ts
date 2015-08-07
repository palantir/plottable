///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("ScatterPlot", () => {
    it("renders correctly with no data", () => {
      var svg = TestMethods.generateSVG(400, 400);
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();
      var plot = new Plottable.Plots.Scatter();
      plot.x((d: any) => d.x, xScale);
      plot.y((d: any) => d.y, yScale);
      assert.doesNotThrow(() => plot.renderTo(svg), Error);
      assert.strictEqual(plot.width(), 400, "was allocated width");
      assert.strictEqual(plot.height(), 400, "was allocated height");
      svg.remove();
    });

    it("the accessors properly access data, index and Dataset", () => {
      var svg = TestMethods.generateSVG(400, 400);
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();
      xScale.domain([0, 400]);
      yScale.domain([400, 0]);
      var data = [{x: 0, y: 0}, {x: 1, y: 1}];
      var metadata = {foo: 10, bar: 20};
      var xAccessor = (d: any, i: number, dataset: Plottable.Dataset) => d.x + i * dataset.metadata().foo;
      var yAccessor = (d: any, i: number, dataset: Plottable.Dataset) => dataset.metadata().bar;
      var dataset = new Plottable.Dataset(data, metadata);
      var plot = new Plottable.Plots.Scatter()
                                  .x(xAccessor)
                                  .y(yAccessor);
      plot.addDataset(dataset);
      plot.renderTo(svg);
      var symbols = plot.selections();
      var c1 = d3.select(symbols[0][0]);
      var c2 = d3.select(symbols[0][1]);
      var c1Position = d3.transform(c1.attr("transform")).translate;
      var c2Position = d3.transform(c2.attr("transform")).translate;
      assert.closeTo(c1Position[0], 0, 0.01, "first symbol cx is correct");
      assert.closeTo(c1Position[1], 20, 0.01, "first symbol cy is correct");
      assert.closeTo(c2Position[0], 11, 0.01, "second symbol cx is correct");
      assert.closeTo(c2Position[1], 20, 0.01, "second symbol cy is correct");

      data = [{x: 2, y: 2}, {x: 4, y: 4}];
      dataset.data(data);
      c1Position = d3.transform(c1.attr("transform")).translate;
      c2Position = d3.transform(c2.attr("transform")).translate;
      assert.closeTo(c1Position[0], 2, 0.01, "first symbol cx is correct after data change");
      assert.closeTo(c1Position[1], 20, 0.01, "first symbol cy is correct after data change");
      assert.closeTo(c2Position[0], 14, 0.01, "second symbol cx is correct after data change");
      assert.closeTo(c2Position[1], 20, 0.01, "second symbol cy is correct after data change");

      metadata = {foo: 0, bar: 0};
      dataset.metadata(metadata);
      c1Position = d3.transform(c1.attr("transform")).translate;
      c2Position = d3.transform(c2.attr("transform")).translate;

      assert.closeTo(c1Position[0], 2, 0.01, "first symbol cx is correct after metadata change");
      assert.closeTo(c1Position[1], 0, 0.01, "first symbol cy is correct after metadata change");
      assert.closeTo(c2Position[0], 4, 0.01, "second symbol cx is correct after metadata change");
      assert.closeTo(c2Position[1], 0, 0.01, "second symbol cy is correct after metadata change");

      svg.remove();
    });

    it("selections()", () => {
      var svg = TestMethods.generateSVG(400, 400);
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();
      var data = [{x: 0, y: 0}, {x: 1, y: 1}];
      var data2 = [{x: 1, y: 2}, {x: 3, y: 4}];
      var plot = new Plottable.Plots.Scatter()
                                   .x((d: any) => d.x, xScale)
                                   .y((d: any) => d.y, yScale)
                                   .addDataset(new Plottable.Dataset(data))
                                   .addDataset(new Plottable.Dataset(data2));
      plot.renderTo(svg);
      var allCircles = plot.selections();
      assert.strictEqual(allCircles.size(), 4, "all circles retrieved");
      var selectionData = allCircles.data();
      assert.includeMembers(selectionData, data, "first dataset data in selection data");
      assert.includeMembers(selectionData, data2, "second dataset data in selection data");

      svg.remove();
    });

    it("entityNearest()", () => {
      var svg = TestMethods.generateSVG(400, 400);
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();

      var dataset = new Plottable.Dataset([{x: 0, y: 0}, {x: 1, y: 1}]);
      var dataset2 = new Plottable.Dataset([{x: 1, y: 2}, {x: 3, y: 4}]);
      var plot = new Plottable.Plots.Scatter()
                                   .x((d: any) => d.x, xScale)
                                   .y((d: any) => d.y, yScale)
                                   .addDataset(dataset)
                                   .addDataset(dataset2);
      plot.renderTo(svg);

      var points = d3.selectAll(".scatter-plot path");
      var d0 = dataset.data()[0];
      var d0Px = {
        x: xScale.scale(d0.x),
        y: yScale.scale(d0.y)
      };

      var expected: Plottable.Plots.PlotEntity = {
        datum: d0,
        index: 0,
        dataset: dataset,
        position: d0Px,
        selection: d3.selectAll([points[0][0]]),
        component: plot
      };

      var closest = plot.entityNearest({ x: d0Px.x + 1, y: d0Px.y + 1 });
      TestMethods.assertPlotEntitiesEqual(closest, expected, "it selects the closest data point");

      yScale.domain([0, 1.9]);

      var d1 = dataset.data()[1];
      var d1Px = {
        x: xScale.scale(d1.x),
        y: yScale.scale(d1.y)
      };

      expected = {
        datum: d1,
        index: 1,
        dataset: dataset,
        position: d1Px,
        selection: d3.selectAll([points[0][1]]),
        component: plot
      };

      closest = plot.entityNearest({ x: d1Px.x, y: 0 });
      TestMethods.assertPlotEntitiesEqual(closest, expected, "it ignores off-plot data points");

      svg.remove();
    });

    it("can retrieve entities in a certain range", () => {
      var svg = TestMethods.generateSVG(400, 400);
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();

      var dataset = new Plottable.Dataset([{x: 0, y: 0}, {x: 1, y: 1}]);
      var dataset2 = new Plottable.Dataset([{x: 1, y: 2}, {x: 3, y: 4}]);
      var plot = new Plottable.Plots.Scatter();
      plot.x((d: any) => d.x, xScale)
          .y((d: any) => d.y, yScale)
          .addDataset(dataset)
          .addDataset(dataset2);
      plot.renderTo(svg);

      var entities = plot.entitiesIn({ min: xScale.scale(1), max: xScale.scale(1) },
                                     { min: yScale.scale(1), max: yScale.scale(1) });

      assert.lengthOf(entities, 1, "only one entity has been retrieved");
      assert.deepEqual(entities[0].datum, {x: 1, y: 1}, "correct datum has been retrieved");

      svg.remove();
    });

    it("entities are not returned if their center lies outside the range", () => {
      var svg = TestMethods.generateSVG(400, 400);
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();

      var dataset = new Plottable.Dataset([{x: 0, y: 0}, {x: 1, y: 1}]);
      var dataset2 = new Plottable.Dataset([{x: 1, y: 2}, {x: 3, y: 4}]);
      var plot = new Plottable.Plots.Scatter();
      plot.x((d: any) => d.x, xScale)
          .y((d: any) => d.y, yScale)
          .addDataset(dataset)
          .addDataset(dataset2);
      plot.renderTo(svg);

      var entities = plot.entitiesIn({ min: xScale.scale(1.001), max: xScale.scale(1.001) },
                                     { min: yScale.scale(1.001), max: yScale.scale(1.001) });

      assert.lengthOf(entities, 0, "no entities retrieved");

      svg.remove();
    });

    it("can retrieve entities in a certain bounds", () => {
      var svg = TestMethods.generateSVG(400, 400);
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();

      var dataset = new Plottable.Dataset([{x: 0, y: 0}, {x: 1, y: 1}]);
      var dataset2 = new Plottable.Dataset([{x: 1, y: 2}, {x: 3, y: 4}]);
      var plot = new Plottable.Plots.Scatter();
      plot.x((d: any) => d.x, xScale)
          .y((d: any) => d.y, yScale)
          .addDataset(dataset)
          .addDataset(dataset2);
      plot.renderTo(svg);

      var entities = plot.entitiesIn({ topLeft: {
                                         x: xScale.scale(1),
                                         y: yScale.scale(1)
                                       },
                                       bottomRight: {
                                         x: xScale.scale(1),
                                         y: yScale.scale(1)
                                       }});

      assert.lengthOf(entities, 1, "only one entity has been retrieved");
      assert.deepEqual(entities[0].datum, {x: 1, y: 1}, "correct datum has been retrieved");

      svg.remove();
    });

    it("correctly handles NaN and undefined x and y values", () => {
      var svg = TestMethods.generateSVG(400, 400);
      var data = [
        { foo: 0.0, bar: 0.0 },
        { foo: 0.2, bar: 0.2 },
        { foo: 0.4, bar: 0.4 },
        { foo: 0.6, bar: 0.6 },
        { foo: 0.8, bar: 0.8 }
      ];
      var dataset = new Plottable.Dataset(data);
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();
      var plot = new Plottable.Plots.Scatter();
      plot.addDataset(dataset);
      plot.x((d: any) => d.foo, xScale)
          .y((d: any) => d.bar, yScale);
      plot.renderTo(svg);

      var dataWithNaN = data.slice();
      dataWithNaN[2] = { foo: 0.4, bar: NaN };
      dataset.data(dataWithNaN);
      assert.strictEqual(plot.selections().size(), 4, "does not draw NaN point");

      var dataWithUndefined = data.slice();
      dataWithUndefined[2] = { foo: 0.4, bar: undefined };
      dataset.data(dataWithUndefined);
      assert.strictEqual(plot.selections().size(), 4, "does not draw undefined point");
      dataWithUndefined[2] = { foo: undefined, bar: 0.4 };
      dataset.data(dataWithUndefined);
      assert.strictEqual(plot.selections().size(), 4, "does not draw undefined point");

      svg.remove();
    });

    describe("Example ScatterPlot with quadratic series", () => {
      var svg: d3.Selection<void>;
      var xScale: Plottable.Scales.Linear;
      var yScale: Plottable.Scales.Linear;
      var circlePlot: Plottable.Plots.Scatter<number, number>;
      var SVG_WIDTH = 600;
      var SVG_HEIGHT = 300;
      var dataAreaFull = {xMin: 0, xMax: 9, yMin: 81, yMax: 0};
      var dataAreaPart = {xMin: 3, xMax: 9, yMin: 54, yMax: 27};
      var colorAccessor = (d: any, i: number, m: any) => d3.rgb(d.x, d.y, i).toString();
      var circlesInArea: number;
      var quadraticDataset = new Plottable.Dataset(TestMethods.makeQuadraticSeries(10));

      function getCirclePlotVerifier() {
        // creates a function that verifies that circles are drawn properly after accounting for svg transform
        // and then modifies circlesInArea to contain the number of circles that were discovered in the plot area
        circlesInArea = 0;
        var renderArea = (<any> circlePlot)._renderArea;
        var renderAreaTransform = d3.transform(renderArea.attr("transform"));
        var translate = renderAreaTransform.translate;
        var scale = renderAreaTransform.scale;
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
            assert.strictEqual(selection.attr("fill"), colorAccessor(datum, index, null), "fill is correct");
          };
        };
      };

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.Scales.Linear();
        xScale.domain([0, 9]);
        yScale = new Plottable.Scales.Linear();
        yScale.domain([0, 81]);
        circlePlot = new Plottable.Plots.Scatter<number, number>();
        circlePlot.addDataset(quadraticDataset);
        circlePlot.attr("fill", colorAccessor);
        circlePlot.x((d: any) => d.x, xScale);
        circlePlot.y((d: any) => d.y, yScale);
        circlePlot.renderTo(svg);
      });

      it("setup is handled properly", () => {
        assert.deepEqual(xScale.range(), [0, SVG_WIDTH], "xScale range was set by the renderer");
        assert.deepEqual(yScale.range(), [SVG_HEIGHT, 0], "yScale range was set by the renderer");
        circlePlot.selections().each(getCirclePlotVerifier());
        assert.strictEqual(circlesInArea, 10, "10 circles were drawn");
        svg.remove();
      });

      it("rendering is idempotent", () => {
        circlePlot.render();
        circlePlot.render();
        circlePlot.selections().each(getCirclePlotVerifier());
        assert.strictEqual(circlesInArea, 10, "10 circles were drawn");
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
          var circles = circlePlot.selections();
          circles.each(getCirclePlotVerifier());
          assert.strictEqual(circlesInArea, 4, "four circles were found in the render area");
          svg.remove();
        });
      });
    });
  });
});
