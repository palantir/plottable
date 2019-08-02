import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Plots", () => {
  describe("StackedAreaPlot", () => {
    describe("setting the x property", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let stackedAreaPlot: Plottable.Plots.StackedArea<number>;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        const data1 = [
          {x: 1},
          {x: 3},
        ];
        const dataset1 = new Plottable.Dataset(data1);
        dataset1.metadata({ bar: 7 });
        const data2 = [
          {x: 1},
          {x: 3},
        ];
        const dataset2 = new Plottable.Dataset(data2);
        dataset2.metadata({ bar: 10 });
        stackedAreaPlot = new Plottable.Plots.StackedArea<number>();
        stackedAreaPlot.addDataset(dataset1);
        stackedAreaPlot.addDataset(dataset2);
        stackedAreaPlot.y(0, new Plottable.Scales.Linear());
      });

      it("can set the x property accessor to a constant value", () => {
        const constantValue = 10;
        assert.strictEqual(stackedAreaPlot.x(constantValue), stackedAreaPlot, "setter returns calling object");
        stackedAreaPlot.renderTo(div);

        const stackedAreas = stackedAreaPlot.content().selectAll<Element, any>("path");
        assert.strictEqual(stackedAreas.size(),
          stackedAreaPlot.datasets().length, "same number of area selections as datasets");

        stackedAreas.each(function(data, i) {
          const stackedAreaSelection = d3.select(this);
          const areaVertices = TestMethods.areaVertices(stackedAreaSelection);
          const areaXs = areaVertices.map((areaVertex) => areaVertex.x).slice(0, -2);
          data.forEach((datum: any, index: number) => {
            assert.closeTo(areaXs[index], constantValue, window.Pixel_CloseTo_Requirement, `x pixel value at index ${i} correctly set`);
          });
          const areaEdgeXs = areaVertices.map((areaVertex) => areaVertex.x).slice(-2).reverse();
          assert.closeTo(areaEdgeXs[0], constantValue, window.Pixel_CloseTo_Requirement, "left edge x pixel value correctly set");
          assert.closeTo(areaEdgeXs[1], constantValue, window.Pixel_CloseTo_Requirement, "right edge x pixel value correctly set");
        });
        stackedAreaPlot.destroy();
        div.remove();
      });

      it("can set the x property accessor to be dependent on the input data", () => {
        const accessor = (d: {x: number}, i: number, ds: Plottable.Dataset) => d.x * 100 + i * 10 + ds.metadata().bar;
        assert.strictEqual(stackedAreaPlot.x(accessor), stackedAreaPlot, "setter returns calling object");
        assert.strictEqual(stackedAreaPlot.x().accessor, accessor, `property set for datum`);
        stackedAreaPlot.renderTo(div);

        const stackedAreas = stackedAreaPlot.content().selectAll<Element, any>("path");
        assert.strictEqual(stackedAreas.size(),
          stackedAreaPlot.datasets().length, "same number of area selections as datasets");

        stackedAreas.each(function(data, i) {
          const stackedAreaSelection = d3.select(this);
          const areaVertices = TestMethods.areaVertices(stackedAreaSelection);
          const areaXs = areaVertices.map((areaVertex) => areaVertex.x).slice(0, -2);
          data.forEach((datum: any, datumIndex: number) => {
            const x = accessor(datum, datumIndex, stackedAreaPlot.datasets()[i]);
            assert.closeTo(areaXs[datumIndex], x, window.Pixel_CloseTo_Requirement, `x pixel value at index ${i} correctly set`);
          });
          const areaEdgeXs = areaVertices.map((areaVertex) => areaVertex.x).slice(-2).reverse();
          assert.closeTo(areaEdgeXs[0], accessor(data[0], 0, stackedAreaPlot.datasets()[i]),
            window.Pixel_CloseTo_Requirement, "left edge x pixel value correctly set");
          assert.closeTo(areaEdgeXs[1], accessor(data[data.length - 1], data.length - 1, stackedAreaPlot.datasets()[i]),
            window.Pixel_CloseTo_Requirement, "right edge x pixel value correctly set");
        });
        stackedAreaPlot.destroy();
        div.remove();
      });

      it("can set the x property scale", () => {
        const accessor = (d: {x: number}) => d.x;
        const linearScale = new Plottable.Scales.Linear();
        assert.strictEqual(stackedAreaPlot.x(accessor, linearScale), stackedAreaPlot, "setter returns calling object");
        assert.strictEqual(stackedAreaPlot.x().accessor, accessor, `property set for datum`);
        stackedAreaPlot.renderTo(div);

        const stackedAreas = stackedAreaPlot.content().selectAll<Element, any>("path");
        assert.strictEqual(stackedAreas.size(),
          stackedAreaPlot.datasets().length, "same number of area selections as datasets");

        stackedAreas.each(function(data, i) {
          const stackedAreaSelection = d3.select(this);
          const areaVertices = TestMethods.areaVertices(stackedAreaSelection);
          const areaXs = areaVertices.map((areaVertex) => areaVertex.x).slice(0, -2);
          data.forEach((datum: any, index: number) => {
            const x = linearScale.scale(accessor(datum));
            assert.closeTo(areaXs[index], x, window.Pixel_CloseTo_Requirement, `x pixel value at index ${i} correctly set`);
          });
          const areaEdgeXs = areaVertices.map((areaVertex) => areaVertex.x).slice(-2).reverse();
          assert.closeTo(areaEdgeXs[0], linearScale.scale(accessor(data[0])),
            window.Pixel_CloseTo_Requirement, "left edge x pixel value correctly set");
          assert.closeTo(areaEdgeXs[1], linearScale.scale(accessor(data[data.length - 1])),
            window.Pixel_CloseTo_Requirement, "right edge x pixel value correctly set");
        });
        stackedAreaPlot.destroy();
        div.remove();
      });
    });

    describe("setting the y property", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let stackedAreaPlot: Plottable.Plots.StackedArea<number>;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        const data1 = [
          {y: 1},
          {y: 3},
        ];
        const dataset1 = new Plottable.Dataset(data1);
        dataset1.metadata({ bar: 7 });
        const data2 = [
          {y: 5},
          {y: 3},
        ];
        const dataset2 = new Plottable.Dataset(data2);
        dataset2.metadata({ bar: 10 });
        stackedAreaPlot = new Plottable.Plots.StackedArea<number>();
        stackedAreaPlot.addDataset(dataset1);
        stackedAreaPlot.addDataset(dataset2);
        stackedAreaPlot.x((d, i) => i);
      });

      function calculateStackedYs(yAccessor: Plottable.IAccessor<number>) {
        const stackedYDataArray: number[][] = [];
        stackedAreaPlot.datasets().forEach((dataset, datasetIndex, datasets) => {
          const stackedYData = dataset.data().map((d, i) => yAccessor(d, i, dataset));
          if (datasetIndex === 0) {
            stackedYDataArray[datasetIndex] = stackedYData;
            return;
          }
          stackedYDataArray[datasetIndex] = dataset.data().map((d, i) => {
            return yAccessor(d, i, dataset) + stackedYDataArray[datasetIndex - 1][i];
          });
        });
        return stackedYDataArray;
      }

      it("can set to a constant value", () => {
        const constantValue = 10;
        assert.strictEqual(stackedAreaPlot.y(constantValue), stackedAreaPlot, "setter returns calling object");
        stackedAreaPlot.destroy();
        div.remove();
      });

      it("can set to be dependent on the input data", () => {
        const accessor = (d: {y: number}, i: number, ds: Plottable.Dataset) => d.y * 100 + i * 10 + ds.metadata().bar;
        assert.strictEqual(stackedAreaPlot.y(accessor), stackedAreaPlot, "setter returns calling object");
        assert.strictEqual(stackedAreaPlot.y().accessor, accessor, "accessor set");
        stackedAreaPlot.destroy();
        div.remove();
      });

      it("can set the property scale", () => {
        const accessor = (d: {y: number}) => d.y;
        const linearScale = new Plottable.Scales.Linear();
        assert.strictEqual(stackedAreaPlot.y(accessor, linearScale), stackedAreaPlot, "setter returns calling object");
        assert.strictEqual(stackedAreaPlot.y().accessor, accessor, "accessor set");
        stackedAreaPlot.renderTo(div);

        const stackedAreas = stackedAreaPlot.content().selectAll<Element, any>("path");
        assert.strictEqual(stackedAreas.size(),
          stackedAreaPlot.datasets().length, "same number of area selections as datasets");

        const stackedYs = calculateStackedYs(accessor);
        stackedAreas.each(function(data, i) {
          const stackedAreaSelection = d3.select(this);
          const areaVertices = TestMethods.areaVertices(stackedAreaSelection);
          const areaYs = areaVertices.map((areaVertex) => areaVertex.y).slice(0, -2);
          data.forEach((datum: any, datumIndex: number) => {
            const y = linearScale.scale(stackedYs[i][datumIndex]);
            assert.closeTo(areaYs[datumIndex], y, window.Pixel_CloseTo_Requirement, `y pixel value at index ${i} correctly set`);
          });
          const areaEdgeYs = areaVertices.map((areaVertex) => areaVertex.y).slice(-2).reverse();
          if (i === 0) {
            assert.closeTo(areaEdgeYs[0], linearScale.scale(0),
              window.Pixel_CloseTo_Requirement, "left edge y pixel value correctly set");
            assert.closeTo(areaEdgeYs[1], linearScale.scale(0),
              window.Pixel_CloseTo_Requirement, "right edge y pixel value correctly set");
          } else {
            assert.closeTo(areaEdgeYs[0], linearScale.scale(stackedYs[i - 1][0]),
              window.Pixel_CloseTo_Requirement, "left edge y pixel value correctly set");
            assert.closeTo(areaEdgeYs[1], linearScale.scale(stackedYs[i - 1][data.length - 1]),
              window.Pixel_CloseTo_Requirement, "right edge y pixel value correctly set");
          }

        });
        stackedAreaPlot.destroy();
        div.remove();
      });
    });

    describe("setting the y0 property", () => {
      let stackedAreaPlot: Plottable.Plots.StackedArea<number>;

      beforeEach(() => {
        const data1 = [
          {foo: 1},
          {foo: 3},
        ];
        const dataset1 = new Plottable.Dataset(data1);
        dataset1.metadata({ bar: 7 });
        const data2 = [
          {foo: 1},
          {foo: 3},
        ];
        const dataset2 = new Plottable.Dataset(data2);
        dataset2.metadata({ bar: 10 });
        stackedAreaPlot = new Plottable.Plots.StackedArea<number>();
        stackedAreaPlot.addDataset(dataset1);
        stackedAreaPlot.addDataset(dataset2);
        stackedAreaPlot.x((d, i) => i);
        stackedAreaPlot.y((d, i) => i);
      });

      it("defaults to the 0 constant value", () => {
        assert.strictEqual(stackedAreaPlot.y0().accessor(null, 0, null), 0, "property set to 0");
        stackedAreaPlot.destroy();
      });

      it("can set the y0 property accessor to a constant value", () => {
        const constantValue = 10;
        stackedAreaPlot.y0(constantValue);
        assert.strictEqual(stackedAreaPlot.y0().accessor(null, 0, null), constantValue, "property set to constant value");
        stackedAreaPlot.destroy();
      });

      it("can set the y0 property accessor to be dependent on the input data", () => {
        const accessor = (d: {foo: number}, i: number, ds: Plottable.Dataset) => d.foo * 100 + i * 10 + ds.metadata().bar;
        stackedAreaPlot.y0(accessor);
        assert.strictEqual(stackedAreaPlot.y0().accessor, accessor, `property set for datum`);
        stackedAreaPlot.destroy();
      });
    });

    describe("rendering on edge case scenarios", () => {
      it("renders nothing when no data", () => {
        const div = TestMethods.generateDiv();
        const stackedAreaPlot = new Plottable.Plots.StackedArea();
        stackedAreaPlot.x(() => null);
        // HACKHACK https://github.com/palantir/plottable/issues/2712 y scale must be set.
        stackedAreaPlot.y(() => null, new Plottable.Scales.Linear());
        stackedAreaPlot.renderTo(div);
        assert.strictEqual(stackedAreaPlot.selections().size(), 0, "no areas rendered");
        stackedAreaPlot.destroy();
        div.remove();
      });

      it("coerces strings to numbers for calculating offsets", () => {
        const div = TestMethods.generateDiv();
        const data0 = [
          { x: 2, y: "2" },
          { x: 3, y: 2 },
        ];
        const data1 = [
          { x: 2, y: "0" },
          { x: 3, y: "2" },
        ];
        const data2 = [
          { x: 2, y: 2 },
          { x: 3, y: 2 },
        ];
        const xScale = new Plottable.Scales.Linear();
        const yScale = new Plottable.Scales.Linear();

        const plot = new Plottable.Plots.StackedArea<number>();
        const dataset0 = new Plottable.Dataset(data0);
        plot.addDataset(dataset0);
        const dataset1 = new Plottable.Dataset(data1);
        plot.addDataset(dataset1);
        const dataset2 = new Plottable.Dataset(data2);
        plot.addDataset(dataset2);
        plot.x((d: any) => d.x, xScale).y((d: any) => d.y, yScale);
        plot.renderTo(div);

        const stackedAreaSelections = plot.content().selectAll<Element, any>("path");
        const stackedAreaSelection0 = d3.select(stackedAreaSelections.node());
        const stackedAreaSelection1 = d3.select(stackedAreaSelections.nodes()[1]);
        const stackedAreaSelection2 = d3.select(stackedAreaSelections.nodes()[2]);

        const areaVertices0 = TestMethods.areaVertices(stackedAreaSelection0);
        const areaYs0 = areaVertices0.map((areaVertex) => areaVertex.y).slice(0, -2);
        const areaVertices1 = TestMethods.areaVertices(stackedAreaSelection1);
        const areaYs1 = areaVertices1.map((areaVertex) => areaVertex.y).slice(0, -2);
        const areaVertices2 = TestMethods.areaVertices(stackedAreaSelection2);
        const areaYs2 = areaVertices2.map((areaVertex) => areaVertex.y).slice(0, -2);

        assert.closeTo(areaYs0[0], yScale.scale(<any> data0[0].y), window.Pixel_CloseTo_Requirement,
          "dataset0 should have no offset");
        assert.closeTo(areaYs1[0], yScale.scale(<any> data0[0].y), window.Pixel_CloseTo_Requirement,
          "dataset1 should be offset with previous datasets");
        assert.closeTo(areaYs2[0], yScale.scale(data2[0].y + parseFloat(<any> data1[0].y) + parseFloat(<any> data0[0].y)),
          window.Pixel_CloseTo_Requirement, "dataset2 should be offset with previous datasets");
        plot.destroy();
        div.remove();
      });

      it("coerces null to 0 for calculating offsets", () => {
        const div = TestMethods.generateDiv();
        const data0 = [
          { x: 2, y: 2 },
          { x: 3, y: 2 },
        ];
        const data1 = [
          { x: 2, y: null },
          { x: 3, y: 2 },
        ];
        const data2 = [
          { x: 2, y: 2 },
          { x: 3, y: 2 },
        ];
        const xScale = new Plottable.Scales.Linear();
        const yScale = new Plottable.Scales.Linear();

        const plot = new Plottable.Plots.StackedArea<number>();
        const dataset0 = new Plottable.Dataset(data0);
        plot.addDataset(dataset0);
        const dataset1 = new Plottable.Dataset(data1);
        plot.addDataset(dataset1);
        const dataset2 = new Plottable.Dataset(data2);
        plot.addDataset(dataset2);
        plot.x((d: any) => d.x, xScale).y((d: any) => d.y, yScale);
        plot.renderTo(div);

        const stackedAreaSelections = plot.content().selectAll<Element, any>("path");
        const stackedAreaSelection0 = d3.select(stackedAreaSelections.node());
        const stackedAreaSelection1 = d3.select(stackedAreaSelections.nodes()[1]);
        const stackedAreaSelection2 = d3.select(stackedAreaSelections.nodes()[2]);

        const areaVertices0 = TestMethods.areaVertices(stackedAreaSelection0);
        const areaYs0 = areaVertices0.map((areaVertex) => areaVertex.y).slice(0, -2);
        const areaVertices1 = TestMethods.areaVertices(stackedAreaSelection1);
        const areaYs1 = areaVertices1.map((areaVertex) => areaVertex.y).slice(0, -2);
        const areaVertices2 = TestMethods.areaVertices(stackedAreaSelection2);
        const areaYs2 = areaVertices2.map((areaVertex) => areaVertex.y).slice(0, -2);

        assert.closeTo(areaYs0[0], yScale.scale(data0[0].y), window.Pixel_CloseTo_Requirement,
          "dataset0 should have no offset");
        assert.closeTo(areaYs1[0], yScale.scale(data0[0].y), window.Pixel_CloseTo_Requirement,
          "dataset1 should be offset with dataset0");
        assert.closeTo(areaYs2[0], yScale.scale(data2[0].y + data0[0].y), window.Pixel_CloseTo_Requirement,
          "dataset2 should be offset with only dataset0");
        plot.destroy();
        div.remove();
      });
    });

    describe("downsampling", () => {
      let stackedAreaPlot: Plottable.Plots.StackedArea<any>;

      beforeEach(() => {
        stackedAreaPlot = new Plottable.Plots.StackedArea();
      });

      it("disables downsampling", () => {
        assert.strictEqual(stackedAreaPlot.downsamplingEnabled(), false, "downsampling is disabled by default");
        stackedAreaPlot.downsamplingEnabled(true);
        assert.strictEqual(stackedAreaPlot.downsamplingEnabled(), false, "downsampling will not be enabled by user");
      });
    });

    describe("stacking order", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let xScale: Plottable.Scales.Category;
      let stackedAreaPlot: Plottable.Plots.StackedArea<string>;
      const datas = [
        [1, 2, 3],
        [17, 13, 11],
      ];

      beforeEach(() => {
        div = TestMethods.generateDiv();
        xScale = new Plottable.Scales.Category();
        stackedAreaPlot = new Plottable.Plots.StackedArea<string>()
          .addDataset(new Plottable.Dataset(datas[0]))
          .addDataset(new Plottable.Dataset(datas[1]))
          .x((d, i) => `${i}`, xScale)
          .y((d) => d, new Plottable.Scales.Linear())
          .renderTo(div);
      });

      it("stacks bottomup by default", () => {
        const areas = stackedAreaPlot.content().selectAll<Element, any>("path");
        const area0 = areas.filter((d) => d === datas[0]);
        const area1 = areas.filter((d) => d === datas[1]);
        const areaYs0 = TestMethods.areaVertices(area0).map((areaVertex) => areaVertex.y);
        const areaYs1 = TestMethods.areaVertices(area1).map((areaVertex) => areaVertex.y);

        // note that higher y value means toward bottom of screen
        assert.operator(areaYs0[0], ">", areaYs1[0], "first series below second");
      });

      it("stacks topdown", () => {
        stackedAreaPlot.stackingOrder("topdown");

        const areas = stackedAreaPlot.content().selectAll<Element, any>("path");
        const area0 = areas.filter((d) => d === datas[0]);
        const area1 = areas.filter((d) => d === datas[1]);
        const areaYs0 = TestMethods.areaVertices(area0).map((areaVertex) => areaVertex.y);
        const areaYs1 = TestMethods.areaVertices(area1).map((areaVertex) => areaVertex.y);

        // note that higher y value means toward bottom of screen
        assert.operator(areaYs0[0], "<", areaYs1[0], "first series atop second");
      });

      afterEach(() => {
        stackedAreaPlot.destroy();
        div.remove();
      });
    });
  });
});
