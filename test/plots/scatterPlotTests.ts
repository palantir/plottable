///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("ScatterPlot", () => {
    describe("Basic Rendering", () => {
      const SVG_WIDTH = 400;
      const SVG_HEIGHT = 400;
      let svg: d3.Selection<void>;
      let plot: Plottable.Plots.Scatter<number, number>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.Plots.Scatter<number, number>();
        plot.x((d: any) => d.x, xScale)
            .y((d: any) => d.y, yScale);
      });

      it("renders correctly with no data", () => {
        assert.doesNotThrow(() => plot.renderTo(svg), Error);
        assert.strictEqual(plot.width(), SVG_WIDTH, "was allocated width");
        assert.strictEqual(plot.height(), SVG_HEIGHT, "was allocated height");
        svg.remove();
      });

      it("is initialized correctly", () => {
        let dataset = new Plottable.Dataset([{ x: 0, y: 0 }]);
        plot.addDataset(dataset);

        assert.isDefined(plot.attr("fill"), "default color is defined");
        assert.isDefined(plot.animator(Plottable.Plots.Animator.MAIN), "main animator is defined");
        assert.isDefined(plot.size(), "size() is defined");
        assert.isDefined(plot.symbol(), "symbol() is defined");

        svg.remove();
      });
    });

    describe("The Accessors properly access data, index and Dataset", () => {
      let svg: d3.Selection<void>;
      let plot: Plottable.Plots.Scatter<number, number>;
      let dataset: Plottable.Dataset;
      let data: any[];

      beforeEach(() => {
        const SVG_WIDTH = 400;
        const SVG_HEIGHT = 400;
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let xScale = new Plottable.Scales.Linear().domain([0, SVG_WIDTH]);
        let yScale = new Plottable.Scales.Linear().domain([SVG_HEIGHT, 0]);
        let metadata = { foo: 10, bar: 20 };
        data = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
        dataset = new Plottable.Dataset(data, metadata);
        plot = new Plottable.Plots.Scatter<number, number>();
        plot.x((d, i, dataset) => d.x + i * dataset.metadata().foo, xScale);
        plot.y((d, i, dataset) => dataset.metadata().bar, yScale);
        plot.addDataset(dataset);
      });

      it("renders symbols correctly", () => {
        plot.renderTo(svg);
        let symbols = plot.selections();
        assert.strictEqual(symbols.size(), 2, "exactly 2 symbols are rendered");

        let c1 = d3.select(symbols[0][0]);
        let c2 = d3.select(symbols[0][1]);
        let c1Position = d3.transform(c1.attr("transform")).translate;
        let c2Position = d3.transform(c2.attr("transform")).translate;
        assert.closeTo(c1Position[0], 0, 0.01, "first symbol cx is correct");
        assert.closeTo(c1Position[1], 20, 0.01, "first symbol cy is correct");
        assert.closeTo(c2Position[0], 11, 0.01, "second symbol cx is correct");
        assert.closeTo(c2Position[1], 20, 0.01, "second symbol cy is correct");

        svg.remove();
      });

      it("renders symbols correctly after data change", () => {
        plot.renderTo(svg);
        let changedData = [{ x: 2, y: 2 }, { x: 4, y: 4 }];
        dataset.data(changedData);

        let symbols = plot.selections();
        assert.strictEqual(symbols.size(), 2, "exactly 2 symbols are rendered");

        let c1 = d3.select(symbols[0][0]);
        let c2 = d3.select(symbols[0][1]);
        let c1Position = d3.transform(c1.attr("transform")).translate;
        let c2Position = d3.transform(c2.attr("transform")).translate;
        assert.closeTo(c1Position[0], 2, 0.01, "first symbol cx is correct after data change");
        assert.closeTo(c1Position[1], 20, 0.01, "first symbol cy is correct after data change");
        assert.closeTo(c2Position[0], 14, 0.01, "second symbol cx is correct after data change");
        assert.closeTo(c2Position[1], 20, 0.01, "second symbol cy is correct after data change");

        svg.remove();
      });

      it("renders symbols correctly after metadata change", () => {
        plot.renderTo(svg);
        let changedMetadata = { foo: 0, bar: 0 };
        dataset.metadata(changedMetadata);

        let symbols = plot.selections();
        assert.strictEqual(symbols.size(), 2, "exactly 2 symbols are rendered");

        let c1 = d3.select(symbols[0][0]);
        let c2 = d3.select(symbols[0][1]);
        let c1Position = d3.transform(c1.attr("transform")).translate;
        let c2Position = d3.transform(c2.attr("transform")).translate;
        assert.closeTo(c1Position[0], 0, 0.01, "first symbol cx is correct after metadata change");
        assert.closeTo(c1Position[1], 0, 0.01, "first symbol cy is correct after metadata change");
        assert.closeTo(c2Position[0], 1, 0.01, "second symbol cx is correct after metadata change");
        assert.closeTo(c2Position[1], 0, 0.01, "second symbol cy is correct after metadata change");

        svg.remove();
      });

      it("sets size() correctly", () => {
        assert.strictEqual(plot.size().accessor(data[0], 0, dataset), 6, "first symbol size is initialized");
        assert.strictEqual(plot.size().accessor(data[1], 1, dataset), 6, "second symbol size is initialized");

        assert.strictEqual(plot.size(10), plot, "setting size() returns calling Plot.Scatter");
        assert.strictEqual(plot.size().accessor(data[0], 0, dataset), 10, "first symbol size is set to a constant");
        assert.strictEqual(plot.size().accessor(data[1], 1, dataset), 10, "second symbol size is set to a constant");

        assert.strictEqual(plot.size((d, i) => i + d.x * d.y), plot, "setting size() returns calling Plot.Scatter");
        assert.strictEqual(plot.size().accessor(data[0], 0, dataset), 0, "first symbol size is calculated correctly");
        assert.strictEqual(plot.size().accessor(data[1], 1, dataset), 2, "second symbol size is calculated correctly");

        svg.remove();
      });

      it("sets symbol() correctly", () => {
        let circleSymbolFactory = Plottable.SymbolFactories.circle();
        let squareSymbolFactory = Plottable.SymbolFactories.square();

        assert.strictEqual(plot.symbol(() => circleSymbolFactory), plot, "setting symbol() returns calling Plot.Scatter");
        assert.deepEqual(plot.symbol().accessor(data[0], 0, dataset), circleSymbolFactory, "first symbol SymbolFactory is set correctly");
        assert.deepEqual(plot.symbol().accessor(data[1], 1, dataset), circleSymbolFactory, "second symbol SymbolFactory is set correctly");

        assert.strictEqual(plot.symbol((d, i) => i === 0 ? squareSymbolFactory : circleSymbolFactory), plot,
          "setting symbol() returns calling Plot.Scatter");
        assert.deepEqual(plot.symbol().accessor(data[0], 0, dataset), squareSymbolFactory, "first symbol SymbolFactory is set correctly");
        assert.deepEqual(plot.symbol().accessor(data[1], 1, dataset), circleSymbolFactory, "second symbol SymbolFactory is set correctly");

        svg.remove();
      });

    });

    describe("Selections", () => {
      let svg: d3.Selection<void>;
      let plot: Plottable.Plots.Scatter<number, number>;
      let dataset: Plottable.Dataset;
      let dataset2: Plottable.Dataset;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let data: any[];
      let data2: any[];
      beforeEach(() => {
        svg = TestMethods.generateSVG();
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        data = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
        data2 = [{ x: 1, y: 2 }, { x: 3, y: 4 }];
        dataset = new Plottable.Dataset(data);
        dataset2 = new Plottable.Dataset(data2);
        plot = new Plottable.Plots.Scatter<number, number>();
        plot.x((d: any) => d.x, xScale)
            .y((d: any) => d.y, yScale)
            .addDataset(dataset);
      });

      it("selects all points in all datasets", () => {
        plot.addDataset(dataset2);
        plot.renderTo(svg);
        let allCircles = plot.selections();
        assert.strictEqual(allCircles.size(), 4, "all circles retrieved");
        let selectionData = allCircles.data();
        assert.includeMembers(selectionData, data, "first dataset data in selection data");
        assert.includeMembers(selectionData, data2, "second dataset data in selection data");

        svg.remove();
      });

      it("selects the closest data point", () => {
        plot.addDataset(dataset2);
        plot.renderTo(svg);
        let closest = plot.entityNearest({
          x: xScale.scale(0) + 1,
          y: yScale.scale(0) + 1
        });

        assert.deepEqual(closest.datum, dataset.data()[0], "correct datum has been retrieved");

        svg.remove();
      });

      it("ignores off-plot data points when retrieving the nearest Entity", () => {
        plot.addDataset(dataset2);
        plot.renderTo(svg);
        yScale.domain([0, 1.9]);

        let closest = plot.entityNearest({
          x: xScale.scale(1),
          y: xScale.scale(2)
        });
        assert.deepEqual(closest.datum, dataset.data()[1], "correct datum has been retrieved");

        svg.remove();
      });

      it("can retrieve Entities in a certain range", () => {
        plot.addDataset(dataset2);
        plot.renderTo(svg);

        let entities = plot.entitiesIn({
          min: xScale.scale(1),
          max: xScale.scale(1)
        }, {
          min: yScale.scale(1),
          max: yScale.scale(1)
        });

        assert.lengthOf(entities, 1, "only one Entity has been retrieved");
        assert.deepEqual(entities[0].datum, { x: 1, y: 1 }, "correct datum has been retrieved");

        svg.remove();
      });

      it("does not return Entities whose center lies outside the range", () => {
        plot.addDataset(dataset2);
        plot.renderTo(svg);

        let entities = plot.entitiesIn({
          min: xScale.scale(1.001),
          max: xScale.scale(1.001)
        }, {
          min: yScale.scale(1.001),
          max: yScale.scale(1.001)
        });

        assert.lengthOf(entities, 0, "no Entities retrieved");

        svg.remove();
      });

      it("can retrieve Entities in a certain bounds", () => {
        plot.addDataset(dataset2);
        plot.renderTo(svg);
        let entities = plot.entitiesIn({
          topLeft: {
            x: xScale.scale(1),
            y: yScale.scale(1)
          },
          bottomRight: {
            x: xScale.scale(1),
            y: yScale.scale(1)
          }});

        assert.lengthOf(entities, 1, "only one Entity has been retrieved");
        assert.deepEqual(entities[0].datum, { x: 1, y: 1 }, "correct datum has been retrieved");

        svg.remove();
      });

      it("can retrieve Entities centered at a given Point", () => {
        plot.renderTo(svg);

        let entities = plot.entitiesAt({ x: xScale.scale(1), y: yScale.scale(1) });
        assert.lengthOf(entities, 1, "only one Entity has been retrieved");
        assert.deepEqual(entities[0].datum, { x: 1, y: 1 }, "correct datum has been retrieved");

        svg.remove();
      });

      it("determines whether an Entity contains a given Point by its position and size", () => {
        plot.size(10);
        plot.renderTo(svg);

        let entities = plot.entitiesAt({ x: xScale.scale(1) + 5, y: yScale.scale(1) - 5});
        assert.lengthOf(entities, 1, "only one Entity has been retrieved");
        assert.deepEqual(entities[0].datum, { x: 1, y: 1 }, "correct datum has been retrieved");

        plot.size(6);
        entities = plot.entitiesAt({ x: xScale.scale(1) + 5, y: yScale.scale(1) - 5});
        assert.lengthOf(entities, 0, "none of the Entities is retrieved");
        svg.remove();
      });

      it("returns all Entities containing a given Point across all Datasets", () => {
        plot.addDataset(new Plottable.Dataset([{ x: 0, y: 1 }, { x: 200, y: 200 }]));
        plot.renderTo(svg);

        let entities = plot.entitiesAt({ x: xScale.scale(0.5), y: yScale.scale(0.5) });
        assert.lengthOf(entities, 3, "all 3 Entities containing the Point have been retrieved");
        assert.deepEqual(entities[0].datum, { x: 0, y: 0 }, "correct datum has been retrieved");
        assert.deepEqual(entities[1].datum, { x: 1, y: 1 }, "correct datum has been retrieved");
        assert.deepEqual(entities[2].datum, { x: 0, y: 1 }, "correct datum has been retrieved");

        svg.remove();
      });
    });

    describe("Invalid data and deprecated method", () => {
      let svg: d3.Selection<void>;
      let plot: Plottable.Plots.Scatter<number, number>;
      beforeEach(() => {
        svg = TestMethods.generateSVG();
        plot = new Plottable.Plots.Scatter<number, number>();
        plot.x((d: any) => d.x)
            .y((d: any) => d.y);
      });

      it.skip("correctly handles NaN, undefined, Infinity, and non-number x and y values", () => {
        let data = [
          { x: 0.0, y: 0.0 },
          { x: 0.2, y: 0.2 },
          { x: 0.4, y: 0.4 },
          { x: 0.6, y: 0.6 },
          { x: 0.8, y: 0.8 }
        ];
        let dataset = new Plottable.Dataset(data);
        plot.addDataset(dataset);
        plot.renderTo(svg);

        assert.strictEqual(plot.selections().size(), 5, "all 5 data points are drawn");

        let dataWithError = data.slice();
        dataWithError[2] = { x: 0.4, y: NaN };
        dataset.data(dataWithError);
        assert.strictEqual(plot.selections().size(), 4, "only 4 data points are drawn when one of the y values is NaN");
        assert.lengthOf(plot.entities(), 4, "only 4 Entities returned  when one of the y values is NaN");

        dataWithError = data.slice();
        dataWithError[2] = { x: NaN, y: 0.4 };
        dataset.data(dataWithError);
        assert.strictEqual(plot.selections().size(), 4, "only 4 data points are drawn when one of the x values is NaN");
        assert.lengthOf(plot.entities(), 4, "only 4 Entities returned when one of the x values is NaN");

        dataWithError = data.slice();
        dataWithError[2] = { x: 0.4, y: undefined };
        dataset.data(dataWithError);
        assert.strictEqual(plot.selections().size(), 4, "only 4 data points are drawn when one of the y values is undefined");
        assert.lengthOf(plot.entities(), 4, "only 4 Entities returned when one of the y values is undefined");

        dataWithError = data.slice();
        dataWithError[2] = { x: undefined, y: 0.4 };
        dataset.data(dataWithError);
        assert.strictEqual(plot.selections().size(), 4, "only 4 data points are drawn when one of the x values is undefined");
        assert.lengthOf(plot.entities(), 4, "only 4 Entities returned when one of the x values is undefined");

        dataWithError = data.slice();
        dataWithError[2] = { x: 0.4, y: Infinity };
        dataset.data(dataWithError);
        assert.strictEqual(plot.selections().size(), 4, "only 4 data points are drawn when one of the y values is Infinity");
        assert.lengthOf(plot.entities(), 4, "only 4 Entities returned when one of the y values is Infinity");

        dataWithError = data.slice();
        dataWithError[2] = { x: -Infinity, y: 0.4 };
        dataset.data(dataWithError);
        assert.strictEqual(plot.selections().size(), 4, "only 4 data points are drawn when one of the x values is -Infinity");
        assert.lengthOf(plot.entities(), 4, "only 4 Entities returned when one of the x values is -Infinity");

        dataWithError = data.slice();
        (<any> dataWithError)[2] = { x: 0.4, y: "12" };
        dataset.data(dataWithError);
        assert.strictEqual(plot.selections().size(), 4, "only 4 data points are drawn when one of the y values is \"12\"");
        assert.lengthOf(plot.entities(), 4, "only 4 Entities returned when one of the y values is \"12\"");

        dataWithError = data.slice();
        (<any> dataWithError)[2] = { x: "abc", y: 0.4 };
        dataset.data(dataWithError);
        assert.strictEqual(plot.selections().size(), 4, "only 4 data points are drawn when one of the x values is \"abc\"");
        assert.lengthOf(plot.entities(), 4, "only 4 Entities returned when one of the x values is \"abc\"");
        svg.remove();
      });

      it("shows warning when deprecated method is called", () => {
        let callingMethod = "Scatter._visibleOnPlot()";
        let version = "v1.1.0";

        let warningTriggered = false;
        let oldWarn = Plottable.Utils.Window.warn;
        Plottable.Utils.Window.warn = (msg: string) => {
          let expectedMessage = `Method ${callingMethod} has been deprecated in version ${version}`;
          assert.notStrictEqual(msg.indexOf(expectedMessage), -1, "The method name and version number exist in the message");
          warningTriggered = true;
        };

        (<any> plot)._visibleOnPlot(null, null, svg);
        assert.isTrue(warningTriggered, "the deprecated warning has been triggered");

        Plottable.Utils.Window.warn = oldWarn;
        svg.remove();
      });
    });
  });
});
