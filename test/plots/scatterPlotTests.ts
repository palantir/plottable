import { SimpleSelection } from "../../src/core/interfaces";
import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as Mocks from "../mocks";
import * as TestMethods from "../testMethods";
import { getTranslateValues } from "../../src/utils/domUtils";

describe("Plots", () => {
  describe("ScatterPlot", () => {
    describe("Basic Rendering", () => {
      const SVG_WIDTH = 400;
      const SVG_HEIGHT = 400;
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let plot: Plottable.Plots.Scatter<number, number>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;

      beforeEach(() => {
        div = TestMethods.generateDiv(SVG_WIDTH, SVG_HEIGHT);
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.Plots.Scatter<number, number>();
        plot.x((d: any) => d.x, xScale)
            .y((d: any) => d.y, yScale);
      });

      afterEach(function() {
        if (this.currentTest.state === "passed") {
          plot.destroy();
          div.remove();
        }
      });

      it("renders correctly with no data", () => {
        assert.doesNotThrow(() => plot.renderTo(div), Error);
        assert.strictEqual(plot.width(), SVG_WIDTH, "was allocated width");
        assert.strictEqual(plot.height(), SVG_HEIGHT, "was allocated height");
      });

      it("is initialized correctly", () => {
        let dataset = new Plottable.Dataset([{ x: 0, y: 0 }]);
        plot.addDataset(dataset);

        assert.isDefined(plot.attr("fill"), "default color is defined");
        assert.isDefined(plot.animator(Plottable.Plots.Animator.MAIN), "main animator is defined");
        assert.isDefined(plot.size(), "size() is defined");
        assert.isDefined(plot.symbol(), "symbol() is defined");
      });

      it("initially draws the points with a size of 0 when resetting", () => {
        const data = [
          { x: 0, y: 0 },
        ];
        const dataset = new Plottable.Dataset(data);
        plot.addDataset(dataset);

        const symbolFactory = Plottable.SymbolFactories.square();
        plot.symbol(() => symbolFactory);

        plot.animator(Plottable.Plots.Animator.MAIN, new Mocks.NoOpAnimator());
        plot.animated(true);

        plot.renderTo(div);

        const pathString = plot.content().select("path").attr("d");
        const zeroSizePathString = symbolFactory(0);
        const normalizingPath = div.append("path"); // generated and normalized paths don't align on all browsers
        const expectedPathString = normalizingPath.attr("d", zeroSizePathString).attr("d");
        assert.strictEqual(pathString, expectedPathString, "path string is initialized with the correct symbol and a size of 0");
      });

      it.skip("correctly handles NaN, undefined, Infinity, and non-number x and y values", () => {
        let data = [
          { x: 0.0, y: 0.0 },
          { x: 0.2, y: 0.2 },
          { x: 0.4, y: 0.4 },
          { x: 0.6, y: 0.6 },
          { x: 0.8, y: 0.8 },
        ];
        let dataset = new Plottable.Dataset(data);
        plot.addDataset(dataset);
        plot.renderTo(div);

        assert.strictEqual(plot.selections().size(), 5, "all 5 data points are drawn");

        let dataWithError: any[] = data.slice();
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
        dataWithError[2] = { x: 0.4, y: "12" };
        dataset.data(dataWithError);
        assert.strictEqual(plot.selections().size(), 4, "only 4 data points are drawn when one of the y values is \"12\"");
        assert.lengthOf(plot.entities(), 4, "only 4 Entities returned when one of the y values is \"12\"");

        dataWithError = data.slice();
        dataWithError[2] = { x: "abc", y: 0.4 };
        dataset.data(dataWithError);
        assert.strictEqual(plot.selections().size(), 4, "only 4 data points are drawn when one of the x values is \"abc\"");
        assert.lengthOf(plot.entities(), 4, "only 4 Entities returned when one of the x values is \"abc\"");
      });
    });

    describe("The Accessors properly access data, index and Dataset", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let plot: Plottable.Plots.Scatter<number, number>;
      let dataset: Plottable.Dataset;
      let data: any[];

      beforeEach(() => {
        const SVG_WIDTH = 400;
        const SVG_HEIGHT = 400;
        div = TestMethods.generateDiv(SVG_WIDTH, SVG_HEIGHT);
        let xScale = new Plottable.Scales.Linear().domain([0, SVG_WIDTH]);
        let yScale = new Plottable.Scales.Linear().domain([0, SVG_HEIGHT]);
        let metadata = { foo: 10, bar: 20 };
        data = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
        dataset = new Plottable.Dataset(data, metadata);
        plot = new Plottable.Plots.Scatter<number, number>();
        plot.x((d, i, _dataset) => d.x + i * dataset.metadata().foo, xScale);
        plot.y((d, i, _dataset) => dataset.metadata().bar, yScale);
        plot.addDataset(dataset);
      });

      it("renders symbols correctly", () => {
        plot.renderTo(div);
        let symbols = plot.selections();
        assert.strictEqual(symbols.size(), data.length, "exactly 2 symbols are rendered");

        let c1 = d3.select(symbols.node());
        let c2 = d3.select(symbols.nodes()[1]);
        let c1Position = getTranslateValues(c1);
        let c2Position = getTranslateValues(c2);
        assert.closeTo(c1Position[0], 0, 0.01, "first symbol cx is correct");
        assert.closeTo(c1Position[1], 380, 0.01, "first symbol cy is correct");
        assert.closeTo(c2Position[0], 11, 0.01, "second symbol cx is correct");
        assert.closeTo(c2Position[1], 380, 0.01, "second symbol cy is correct");

        div.remove();
      });

      it("renders symbols correctly after data change", () => {
        plot.renderTo(div);
        let changedData = [{ x: 2, y: 2 }, { x: 4, y: 4 }];
        dataset.data(changedData);

        let symbols = plot.selections();
        assert.strictEqual(symbols.size(), data.length, "exactly 2 symbols are rendered");

        let c1 = d3.select(symbols.node());
        let c2 = d3.select(symbols.nodes()[1]);
        let c1Position = getTranslateValues(c1);
        let c2Position = getTranslateValues(c2);
        assert.closeTo(c1Position[0], 2, 0.01, "first symbol cx is correct after data change");
        assert.closeTo(c1Position[1], 380, 0.01, "first symbol cy is correct after data change");
        assert.closeTo(c2Position[0], 14, 0.01, "second symbol cx is correct after data change");
        assert.closeTo(c2Position[1], 380, 0.01, "second symbol cy is correct after data change");

        div.remove();
      });

      it("renders symbols correctly after metadata change", () => {
        plot.renderTo(div);
        let changedMetadata = { foo: 0, bar: 0 };
        dataset.metadata(changedMetadata);

        let symbols = plot.selections();
        assert.strictEqual(symbols.size(), 2, "exactly 2 symbols are rendered");

        let c1 = d3.select(symbols.node());
        let c2 = d3.select(symbols.nodes()[1]);
        let c1Position = getTranslateValues(c1);
        let c2Position = getTranslateValues(c2);
        assert.closeTo(c1Position[0], 0, 0.01, "first symbol cx is correct after metadata change");
        assert.closeTo(c1Position[1], 400, 0.01, "first symbol cy is correct after metadata change");
        assert.closeTo(c2Position[0], 1, 0.01, "second symbol cx is correct after metadata change");
        assert.closeTo(c2Position[1], 400, 0.01, "second symbol cy is correct after metadata change");

        div.remove();
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

        div.remove();
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

        div.remove();
      });

    });

    describe("Selections", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let plot: Plottable.Plots.Scatter<number, number>;
      let dataset: Plottable.Dataset;
      let dataset2: Plottable.Dataset;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Linear;
      let data: any[];
      let data2: any[];
      beforeEach(() => {
        div = TestMethods.generateDiv();
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        data = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
        data2 = [{ x: 1, y: 2 }, { x: 3, y: 4 }];
        dataset = new Plottable.Dataset(data);
        dataset2 = new Plottable.Dataset(data2);
        plot = new Plottable.Plots.Scatter<number, number>();
        plot.x((d: any) => d.x, xScale)
            .y((d: any) => d.y, yScale)
            .addDataset(dataset)
            .addDataset(dataset2);
      });

      it("selects all points in all datasets", () => {
        plot.renderTo(div);
        let allCircles = plot.selections();
        assert.strictEqual(allCircles.size(), 4, "all circles retrieved");
        let selectionData = allCircles.data();
        assert.includeMembers(selectionData, data, "first dataset data in selection data");
        assert.includeMembers(selectionData, data2, "second dataset data in selection data");

        div.remove();
      });

      it("selects the closest data point", () => {
        plot.renderTo(div);
        let diff = 10;
        let closest = plot.entityNearest({
          x: xScale.scale(0) + diff,
          y: yScale.scale(0) + diff,
        });

        assert.deepEqual(closest.datum, dataset.data()[0], "correct datum has been retrieved");

        div.remove();
      });

      it("ignores off-plot data points when retrieving the nearest Entity", () => {
        plot.renderTo(div);
        yScale.domain([0, 1.9]);

        let closest = plot.entityNearest({
          x: xScale.scale(1),
          y: xScale.scale(2),
        });
        assert.deepEqual(closest.datum, dataset.data()[1], "correct datum has been retrieved");

        div.remove();
      });

      it("retrieves undefined from entityNearest when no scatter points are in view", () => {
        yScale.domain([-2, -1]);
        xScale.domain([-2, -1]);
        plot.renderTo(div);

        let closest = plot.entityNearest({
          x: plot.width() / 2,
          y: plot.height() / 2,
        });
        assert.strictEqual(closest, undefined, "no datum has been retrieved");
        div.remove();
      });

      it("can retrieve Entities in a certain range", () => {
        plot.renderTo(div);

        let entities = plot.entitiesIn({
          min: xScale.scale(1),
          max: xScale.scale(1),
        }, {
          min: yScale.scale(1),
          max: yScale.scale(1),
        });

        assert.lengthOf(entities, 1, "only one Entity has been retrieved");
        assert.deepEqual(entities[0].datum, { x: 1, y: 1 }, "correct datum has been retrieved");

        div.remove();
      });

      it("does not return Entities whose center lies outside the range", () => {
        plot.renderTo(div);

        let entities = plot.entitiesIn({
          min: xScale.scale(1.001),
          max: xScale.scale(1.001),
        }, {
          min: yScale.scale(1.001),
          max: yScale.scale(1.001),
        });

        assert.lengthOf(entities, 0, "no Entities retrieved");

        div.remove();
      });

      it("can retrieve Entities in a certain bounds", () => {
        plot.renderTo(div);
        let entities = plot.entitiesIn({
          topLeft: {
            x: xScale.scale(1),
            y: yScale.scale(1),
          },
          bottomRight: {
            x: xScale.scale(1),
            y: yScale.scale(1),
          },
        });

        assert.lengthOf(entities, 1, "only one Entity has been retrieved");
        assert.deepEqual(entities[0].datum, { x: 1, y: 1 }, "correct datum has been retrieved");

        div.remove();
      });

      it("can retrieve Entities centered at a given Point", () => {
        plot.renderTo(div);

        let entities = plot.entitiesAt({
          x: xScale.scale(1),
          y: yScale.scale(1),
        });
        assert.lengthOf(entities, 1, "only one Entity has been retrieved");
        assert.deepEqual(entities[0].datum, { x: 1, y: 1 }, "correct datum has been retrieved");

        div.remove();
      });

      it("determines whether an Entity contains a given Point by its position and size", () => {
        let initialSize = 10;
        let initialRadius = initialSize / 2;
        plot.size(initialSize);
        plot.renderTo(div);

        let entities = plot.entitiesAt({
          x: xScale.scale(1) + initialRadius,
          y: yScale.scale(1) - initialRadius,
        });
        assert.lengthOf(entities, 1, "only one Entity has been retrieved");
        assert.deepEqual(entities[0].datum, { x: 1, y: 1 }, "correct datum has been retrieved");

        plot.size(initialSize - 1);
        entities = plot.entitiesAt({
          x: xScale.scale(1) + initialRadius,
          y: yScale.scale(1) - initialRadius,
        });
        assert.lengthOf(entities, 0, "none of the Entities is retrieved");
        div.remove();
      });

      it("returns all Entities containing a given Point across all Datasets", () => {
        dataset2.data([{ x: 0, y: 1 }, { x: 200, y: 200 }]);
        plot.renderTo(div);

        let entities = plot.entitiesAt({
          x: xScale.scale(0.5),
          y: yScale.scale(0.5),
        });
        assert.lengthOf(entities, 3, "all 3 Entities containing the Point have been retrieved");
        assert.deepEqual(entities[0].datum, { x: 0, y: 0 }, "correct datum has been retrieved");
        assert.deepEqual(entities[1].datum, { x: 1, y: 1 }, "correct datum has been retrieved");
        assert.deepEqual(entities[2].datum, { x: 0, y: 1 }, "correct datum has been retrieved");

        div.remove();
      });
    });
  });
});
