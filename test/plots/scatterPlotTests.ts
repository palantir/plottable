///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("ScatterPlot", () => {
    it("renders correctly with no data", () => {
      let svg = TestMethods.generateSVG(400, 400);
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();
      let plot = new Plottable.Plots.Scatter();
      plot.x((d: any) => d.x, xScale);
      plot.y((d: any) => d.y, yScale);
      assert.doesNotThrow(() => plot.renderTo(svg), Error);
      assert.strictEqual(plot.width(), 400, "was allocated width");
      assert.strictEqual(plot.height(), 400, "was allocated height");
      svg.remove();
    });

    it("the accessors properly access data, index and Dataset", () => {
      let svg = TestMethods.generateSVG(400, 400);
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();
      xScale.domain([0, 400]);
      yScale.domain([400, 0]);
      let data = [{x: 0, y: 0}, {x: 1, y: 1}];
      let metadata = {foo: 10, bar: 20};
      let xAccessor = (d: any, i: number, dataset: Plottable.Dataset) => d.x + i * dataset.metadata().foo;
      let yAccessor = (d: any, i: number, dataset: Plottable.Dataset) => dataset.metadata().bar;
      let dataset = new Plottable.Dataset(data, metadata);
      let plot = new Plottable.Plots.Scatter()
                                  .x(xAccessor)
                                  .y(yAccessor);
      plot.addDataset(dataset);
      plot.renderTo(svg);
      let symbols = plot.selections();
      let c1 = d3.select(symbols[0][0]);
      let c2 = d3.select(symbols[0][1]);
      let c1Position = d3.transform(c1.attr("transform")).translate;
      let c2Position = d3.transform(c2.attr("transform")).translate;
      assert.closeTo(c1Position[0], 0, 0.01, "first symbol cx is correct");
      assert.closeTo(c1Position[1], 20, 0.01, "first symbol cy is correct");
      assert.closeTo(c2Position[0], 11, 0.01, "second symbol cx is correct");
      assert.closeTo(c2Position[1], 20, 0.01, "second symbol cy is correct");

      let changedData = [{x: 2, y: 2}, {x: 4, y: 4}];
      dataset.data(changedData);
      c1Position = d3.transform(c1.attr("transform")).translate;
      c2Position = d3.transform(c2.attr("transform")).translate;
      assert.closeTo(c1Position[0], 2, 0.01, "first symbol cx is correct after data change");
      assert.closeTo(c1Position[1], 20, 0.01, "first symbol cy is correct after data change");
      assert.closeTo(c2Position[0], 14, 0.01, "second symbol cx is correct after data change");
      assert.closeTo(c2Position[1], 20, 0.01, "second symbol cy is correct after data change");

      let changedMetadata = {foo: 0, bar: 0};
      dataset.metadata(changedMetadata);
      c1Position = d3.transform(c1.attr("transform")).translate;
      c2Position = d3.transform(c2.attr("transform")).translate;

      assert.closeTo(c1Position[0], 2, 0.01, "first symbol cx is correct after metadata change");
      assert.closeTo(c1Position[1], 0, 0.01, "first symbol cy is correct after metadata change");
      assert.closeTo(c2Position[0], 4, 0.01, "second symbol cx is correct after metadata change");
      assert.closeTo(c2Position[1], 0, 0.01, "second symbol cy is correct after metadata change");

      svg.remove();
    });

    it("selections()", () => {
      let svg = TestMethods.generateSVG(400, 400);
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();
      let data = [{x: 0, y: 0}, {x: 1, y: 1}];
      let data2 = [{x: 1, y: 2}, {x: 3, y: 4}];
      let plot = new Plottable.Plots.Scatter()
                                   .x((d: any) => d.x, xScale)
                                   .y((d: any) => d.y, yScale)
                                   .addDataset(new Plottable.Dataset(data))
                                   .addDataset(new Plottable.Dataset(data2));
      plot.renderTo(svg);
      let allCircles = plot.selections();
      assert.strictEqual(allCircles.size(), 4, "all circles retrieved");
      let selectionData = allCircles.data();
      assert.includeMembers(selectionData, data, "first dataset data in selection data");
      assert.includeMembers(selectionData, data2, "second dataset data in selection data");

      svg.remove();
    });

    it("entityNearest()", () => {
      let svg = TestMethods.generateSVG(400, 400);
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();

      let dataset = new Plottable.Dataset([{x: 0, y: 0}, {x: 1, y: 1}]);
      let dataset2 = new Plottable.Dataset([{x: 1, y: 2}, {x: 3, y: 4}]);
      let plot = new Plottable.Plots.Scatter()
                                   .x((d: any) => d.x, xScale)
                                   .y((d: any) => d.y, yScale)
                                   .addDataset(dataset)
                                   .addDataset(dataset2);
      plot.renderTo(svg);

      let points = d3.selectAll(".scatter-plot path");
      let d0 = dataset.data()[0];
      let d0Px = {
        x: xScale.scale(d0.x),
        y: yScale.scale(d0.y)
      };

      let expected: Plottable.Plots.PlotEntity = {
        datum: d0,
        index: 0,
        dataset: dataset,
        position: d0Px,
        selection: d3.selectAll([points[0][0]]),
        component: plot
      };

      let closest = plot.entityNearest({ x: d0Px.x + 1, y: d0Px.y + 1 });
      TestMethods.assertPlotEntitiesEqual(closest, expected, "it selects the closest data point");

      yScale.domain([0, 1.9]);

      let d1 = dataset.data()[1];
      let d1Px = {
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
      let svg = TestMethods.generateSVG(400, 400);
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();

      let dataset = new Plottable.Dataset([{x: 0, y: 0}, {x: 1, y: 1}]);
      let dataset2 = new Plottable.Dataset([{x: 1, y: 2}, {x: 3, y: 4}]);
      let plot = new Plottable.Plots.Scatter();
      plot.x((d: any) => d.x, xScale)
          .y((d: any) => d.y, yScale)
          .addDataset(dataset)
          .addDataset(dataset2);
      plot.renderTo(svg);

      let entities = plot.entitiesIn({ min: xScale.scale(1), max: xScale.scale(1) },
                                     { min: yScale.scale(1), max: yScale.scale(1) });

      assert.lengthOf(entities, 1, "only one entity has been retrieved");
      assert.deepEqual(entities[0].datum, {x: 1, y: 1}, "correct datum has been retrieved");

      svg.remove();
    });

    it("entities are not returned if their center lies outside the range", () => {
      let svg = TestMethods.generateSVG(400, 400);
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();

      let dataset = new Plottable.Dataset([{x: 0, y: 0}, {x: 1, y: 1}]);
      let dataset2 = new Plottable.Dataset([{x: 1, y: 2}, {x: 3, y: 4}]);
      let plot = new Plottable.Plots.Scatter();
      plot.x((d: any) => d.x, xScale)
          .y((d: any) => d.y, yScale)
          .addDataset(dataset)
          .addDataset(dataset2);
      plot.renderTo(svg);

      let entities = plot.entitiesIn({ min: xScale.scale(1.001), max: xScale.scale(1.001) },
                                     { min: yScale.scale(1.001), max: yScale.scale(1.001) });

      assert.lengthOf(entities, 0, "no entities retrieved");

      svg.remove();
    });

    it("can retrieve entities in a certain bounds", () => {
      let svg = TestMethods.generateSVG(400, 400);
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();

      let dataset = new Plottable.Dataset([{x: 0, y: 0}, {x: 1, y: 1}]);
      let dataset2 = new Plottable.Dataset([{x: 1, y: 2}, {x: 3, y: 4}]);
      let plot = new Plottable.Plots.Scatter();
      plot.x((d: any) => d.x, xScale)
          .y((d: any) => d.y, yScale)
          .addDataset(dataset)
          .addDataset(dataset2);
      plot.renderTo(svg);

      let entities = plot.entitiesIn({ topLeft: {
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

    it("can retrieve entities centered at a given point", () => {
      let svg = TestMethods.generateSVG(400, 400);
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();

      let dataset = new Plottable.Dataset([{x: 0, y: 0}, {x: 1, y: 1}]);
      let plot = new Plottable.Plots.Scatter();
      plot.x((d: any) => d.x, xScale)
          .y((d: any) => d.y, yScale)
          .addDataset(dataset);
      plot.renderTo(svg);

      let entities = plot.entitiesAt({ x: xScale.scale(1), y: yScale.scale(1) });
      assert.lengthOf(entities, 1, "only one entity has been retrieved");
      assert.deepEqual(entities[0].datum, {x: 1, y: 1}, "correct datum has been retrieved");

      svg.remove();
    });

    it("determines whether an entity contains a given point by its size", () => {
      let svg = TestMethods.generateSVG(400, 400);
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();

      let dataset = new Plottable.Dataset([{x: 0, y: 0}, {x: 1, y: 1}]);
      let plot = new Plottable.Plots.Scatter();
      plot.size(10)
          .x((d: any) => d.x, xScale)
          .y((d: any) => d.y, yScale)
          .addDataset(dataset);
      plot.renderTo(svg);

      let entities = plot.entitiesAt({ x: xScale.scale(1) + 5, y: yScale.scale(1) - 5});
      assert.lengthOf(entities, 1, "only one entity has been retrieved");
      assert.deepEqual(entities[0].datum, {x: 1, y: 1}, "correct datum has been retrieved");

      plot.size(6);
      entities = plot.entitiesAt({ x: xScale.scale(1) + 5, y: yScale.scale(1) - 5});
      assert.lengthOf(entities, 0, "none of the entities is retrieved");
      svg.remove();
    });

    it("returns all entities containing a given point across all datasets", () => {
      let svg = TestMethods.generateSVG(400, 400);
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();

      let dataset = new Plottable.Dataset([{x: 0, y: 0}, {x: 200, y: 200}]);
      let dataset2 = new Plottable.Dataset([{x: 0, y: 1}, {x: 1, y: 0}]);
      let plot = new Plottable.Plots.Scatter();

      plot.x((d: any) => d.x, xScale)
          .y((d: any) => d.y, yScale)
          .addDataset(dataset)
          .addDataset(dataset2);
      plot.renderTo(svg);

      let entities = plot.entitiesAt({ x: xScale.scale(0.5), y: yScale.scale(0.5)});
      assert.lengthOf(entities, 3, "all 3 entities containing the point have been retrieved");
      assert.deepEqual(entities[0].datum, {x: 0, y: 0}, "correct datum has been retrieved");
      assert.deepEqual(entities[1].datum, {x: 0, y: 1}, "correct datum has been retrieved");
      assert.deepEqual(entities[2].datum, {x: 1, y: 0}, "correct datum has been retrieved");
      svg.remove();
    });

    it("correctly handles NaN and undefined x and y values", () => {
      let svg = TestMethods.generateSVG(400, 400);
      let data = [
        { foo: 0.0, bar: 0.0 },
        { foo: 0.2, bar: 0.2 },
        { foo: 0.4, bar: 0.4 },
        { foo: 0.6, bar: 0.6 },
        { foo: 0.8, bar: 0.8 }
      ];
      let dataset = new Plottable.Dataset(data);
      let xScale = new Plottable.Scales.Linear();
      let yScale = new Plottable.Scales.Linear();
      let plot = new Plottable.Plots.Scatter();
      plot.addDataset(dataset);
      plot.x((d: any) => d.foo, xScale)
          .y((d: any) => d.bar, yScale);
      plot.renderTo(svg);

      let dataWithNaN = data.slice();
      dataWithNaN[2] = { foo: 0.4, bar: NaN };
      dataset.data(dataWithNaN);
      assert.strictEqual(plot.selections().size(), 4, "does not draw NaN point");

      let dataWithUndefined = data.slice();
      dataWithUndefined[2] = { foo: 0.4, bar: undefined };
      dataset.data(dataWithUndefined);
      assert.strictEqual(plot.selections().size(), 4, "does not draw undefined point");
      dataWithUndefined[2] = { foo: undefined, bar: 0.4 };
      dataset.data(dataWithUndefined);
      assert.strictEqual(plot.selections().size(), 4, "does not draw undefined point");

      svg.remove();
    });

    describe("Example ScatterPlot with quadratic series", () => {
      let svg: d3.Selection<void>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let circlePlot: Plottable.Plots.Scatter<number, number>;
      let SVG_WIDTH = 600;
      let SVG_HEIGHT = 300;
      let colorAccessor = (d: any, i: number, m: any) => d3.rgb(d.x, d.y, i).toString();
      let circlesInArea: number;
      let quadraticDataset = new Plottable.Dataset(TestMethods.makeQuadraticSeries(10));

      function getCirclePlotVerifier() {
        // creates a function that verifies that circles are drawn properly after accounting for svg transform
        // and then modifies circlesInArea to contain the number of circles that were discovered in the plot area
        circlesInArea = 0;
        let renderArea = (<any> circlePlot)._renderArea;
        let renderAreaTransform = d3.transform(renderArea.attr("transform"));
        let translate = renderAreaTransform.translate;
        let scale = renderAreaTransform.scale;
        return function (datum: any, index: number) {
          // This function takes special care to compute the position of circles after taking svg transformation
          // into account.
          let selection = d3.select(this);

          let circlePosition = d3.transform(selection.attr("transform")).translate;
          let x = +circlePosition[0] * scale[0] + translate[0];
          let y = +circlePosition[1] * scale[1] + translate[1];
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
        });

        it("the circles re-rendered properly", () => {
          let circles = circlePlot.selections();
          circles.each(getCirclePlotVerifier());
          assert.strictEqual(circlesInArea, 4, "four circles were found in the render area");
          svg.remove();
        });
      });
    });
  });
});
