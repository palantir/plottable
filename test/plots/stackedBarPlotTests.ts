import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";
import { BarOrientation } from "../../src/plots/barPlot";

import * as TestMethods from "../testMethods";

describe("Plots", () => {
  describe("Vertical Stacked Bar Plot", () => {
    describe("rendering using positive data", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let xScale: Plottable.Scales.Category;
      let yScale: Plottable.Scales.Linear;
      let stackedBarPlot: Plottable.Plots.StackedBar<string, number>;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        xScale = new Plottable.Scales.Category();
        yScale = new Plottable.Scales.Linear();

        const data1 = [
          {x: "A", y: 1},
          {x: "B", y: 2},
        ];
        const data2 = [
          {x: "A", y: 2},
          {x: "B", y: 1},
        ];
        const dataset1 = new Plottable.Dataset(data1);
        const dataset2 = new Plottable.Dataset(data2);

        stackedBarPlot = new Plottable.Plots.StackedBar<string, number>();
        stackedBarPlot.addDataset(dataset1);
        stackedBarPlot.addDataset(dataset2);
        stackedBarPlot.x((d) => d.x, xScale);
        stackedBarPlot.y((d) => d.y, yScale);
        stackedBarPlot.renderTo(div);
      });

      afterEach(() => {
        stackedBarPlot.destroy();
        div.remove();
      });

      it("renders rects offset by previous values", () => {
        const bars = stackedBarPlot.content().selectAll<Element, any>("rect");

        const dataLength = stackedBarPlot.datasets()[0].data().length;
        const dataCount = stackedBarPlot.datasets().length * dataLength;
        assert.strictEqual(bars.size(), dataCount, "same number of bars as data");

        const calculateStackedYs = (yAccessor: Plottable.IAccessor<number>) => {
          const stackedYDataArray: number[][] = [];
          stackedBarPlot.datasets().forEach((dataset, datasetIndex) => {
            const yData = dataset.data().map((d, i) => yAccessor(d, i, dataset));
            if (datasetIndex === 0) {
              stackedYDataArray[datasetIndex] = yData;
              return;
            }
            stackedYDataArray[datasetIndex] = dataset.data().map((d, i) => {
              return yData[i] + stackedYDataArray[datasetIndex - 1][i];
            });
          });
          return stackedYDataArray;
        };

        const stackedYs = calculateStackedYs((d) => d.y);
        bars.each(function(d, i) {
          const bar = d3.select(this);
          const datasetIndex = Math.floor(i / dataLength);
          const datumIndex = i % dataLength;
          assert.closeTo(TestMethods.numAttr(bar, "y"), yScale.scale(stackedYs[datasetIndex][datumIndex]),
            window.Pixel_CloseTo_Requirement, "y attribute offset set correctly");
        });
      });

      // HACKHACK #2795: correct off-bar label logic to be implemented
      it("doesn't show any off-bar labels", () => {
        stackedBarPlot.labelsEnabled(true);
        yScale.domain([0, 30]);
        const offBarLabels = stackedBarPlot.content().selectAll<Element, any>(".off-bar-label");
        assert.operator(offBarLabels.size(), ">", 0, "some off-bar labels are drawn");
        offBarLabels.each(function(d, i) {
          assert.isTrue(d3.select(this).style("visibility") === "hidden", `off-bar label ${i} is hidden`);
        });
      });

      it("shows stacked bar labels", () => {
        stackedBarPlot.labelsEnabled(true);
        yScale.domain([0, 30]);
        const stackedBarLabels = stackedBarPlot.content().selectAll<Element, any>(".stacked-bar-label");
        assert.strictEqual(stackedBarLabels.size(), 2);
        const text: string[] = [];
        stackedBarLabels.each(function (d) {
          text.push(d3.select(this).text());
        });
        assert.deepEqual(["3", "3"], text);
      });

      it("shows stacked bar labels for date axes", () => {
        // remove existing stacked bar plot
        stackedBarPlot.destroy();

        const dateString1 = "2013-09-02T00:00:00.000Z";
        const dateString2 = "2013-09-03T00:00:00.000Z";

        const data1 = [
          { x: new Date(dateString1) , y: 1 },
          { x: new Date(dateString2), y: 2 },
        ];

        const data2 = [
          { x: new Date(dateString1) , y: 2 },
          { x: new Date(dateString2), y: 1 },
        ];

        const dataset1 = new Plottable.Dataset(data1);
        const dataset2 = new Plottable.Dataset(data2);

        const stackedBar = new Plottable.Plots.StackedBar<Date, number>();

        stackedBar.addDataset(dataset1);
        stackedBar.addDataset(dataset2);

        const xScale = new Plottable.Scales.Time();

        stackedBar.x((d) => d.x, xScale);
        stackedBar.y((d) => d.y, yScale);
        stackedBar.renderTo(div);

        stackedBar.labelsEnabled(true);
        yScale.domain([0, 30]);
        const stackedBarLabels = stackedBar.content().selectAll<Element, any>(".stacked-bar-label");
        assert.strictEqual(stackedBarLabels.size(), 2);
        const text: string[] = [];
        stackedBarLabels.each(function (d) {
          text.push(d3.select(this).text());
        });
        assert.deepEqual(["3", "3"], text);

        stackedBar.destroy();
      });

      it("doesn't show stacked bar labels when columns are too narrow", () => {
        stackedBarPlot.labelsEnabled(true);
        xScale.range([0, 20]);
        // HACKHACK send a scale update to update the barPixelThickness
        xScale.domain(xScale.domain());
        // HACKHACK explicitly re-render with the new barPixelThickness
        stackedBarPlot.render();
        const stackedBarLabels = stackedBarPlot.content().selectAll<Element, any>(".stacked-bar-label");
        assert.strictEqual(stackedBarLabels.size(), 0);
      });

      it("considers lying within a bar's y-range to mean it is closest", () => {
        const d0 = stackedBarPlot.datasets()[0].data()[0];
        const d1 = stackedBarPlot.datasets()[1].data()[0];

        let closestEntity = stackedBarPlot.entityNearest({ x: 0, y: yScale.scale(d0.y) + 1 });
        assert.strictEqual(closestEntity.datum, d0, "bottom bar is closest when within its range");

        closestEntity = stackedBarPlot.entityNearest({ x: 0, y: yScale.scale(d0.y) - 1 });
        assert.strictEqual(closestEntity.datum, d1, "top bar is closest when within its range");
      });
    });

    describe("rendering using negative data", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let xScale: Plottable.Scales.Category;
      let yScale: Plottable.Scales.Linear;
      let stackedBarPlot: Plottable.Plots.StackedBar<string, number>;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        xScale = new Plottable.Scales.Category();
        yScale = new Plottable.Scales.Linear();

        const data1 = [
          {x: "A", y: -1},
          {x: "B", y: -2},
        ];
        const data2 = [
          {x: "A", y: -2},
          {x: "B", y: -1},
        ];
        const dataset1 = new Plottable.Dataset(data1);
        const dataset2 = new Plottable.Dataset(data2);

        stackedBarPlot = new Plottable.Plots.StackedBar<string, number>();
        stackedBarPlot.addDataset(dataset1);
        stackedBarPlot.addDataset(dataset2);
        stackedBarPlot.x((d) => d.x, xScale);
        stackedBarPlot.y((d) => d.y, yScale);
        stackedBarPlot.renderTo(div);
      });

      afterEach(() => {
        stackedBarPlot.destroy();
        div.remove();
      });

      it("shows stacked bar labels", () => {
        yScale.domain([3, -3]);
        stackedBarPlot.labelsEnabled(true);
        const stackedBarLabels = stackedBarPlot.content().selectAll<Element, any>(".stacked-bar-label");
        assert.strictEqual(stackedBarLabels.size(), 2);
        const text: string[] = [];
        stackedBarLabels.each(function (d) {
          text.push(d3.select(this).text());
        });
        assert.deepEqual(["-3", "-3"], text);
      });

      it("doesn't show stacked bar labels when columns are too narrow", () => {
        stackedBarPlot.labelsEnabled(true);
        xScale.range([0, 40]);
        // HACKHACK send a scale update to update the barPixelThickness
        xScale.domain(xScale.domain());
        // HACKHACK explicitly re-render to cause the barPixelThickness
        stackedBarPlot.render();
        const stackedBarLabels = stackedBarPlot.content().selectAll<Element, any>(".stacked-bar-label");
        assert.strictEqual(stackedBarLabels.size(), 0);
      });

      it("renders rects offset by previous values", () => {
        const bars = stackedBarPlot.content().selectAll<Element, any>("rect");

        const dataLength = stackedBarPlot.datasets()[0].data().length;
        const dataCount = stackedBarPlot.datasets().length * dataLength;
        assert.strictEqual(bars.size(), dataCount, "same number of bars as data");

        const calculateStackedYs = (yAccessor: Plottable.IAccessor<number>) => {
          const stackedYDataArray: number[][] = [];
          stackedBarPlot.datasets().forEach((dataset, datasetIndex) => {
            const yData = dataset.data().map((d, i) => yAccessor(d, i, dataset));
            if (datasetIndex === 0) {
              stackedYDataArray[datasetIndex] = dataset.data().map(() => 0);
            }
            stackedYDataArray[datasetIndex + 1] = dataset.data().map((d, i) => {
              return yData[i] + stackedYDataArray[datasetIndex][i];
            });
          });
          return stackedYDataArray;
        };

        const stackedYs = calculateStackedYs((d) => d.y);
        bars.each(function(d, i) {
          const bar = d3.select(this);
          const datasetIndex = Math.floor(i / dataLength);
          const datumIndex = i % dataLength;
          assert.closeTo(TestMethods.numAttr(bar, "y"), yScale.scale(stackedYs[datasetIndex][datumIndex]),
            window.Pixel_CloseTo_Requirement, "y attribute offset set correctly");
        });
      });
    });

    describe("non-overlapping datasets", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let xScale: Plottable.Scales.Category;
      let stackedBarPlot: Plottable.Plots.StackedBar<string, number>;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        xScale = new Plottable.Scales.Category();
        const yScale = new Plottable.Scales.Linear();

        const data1 = [
          {x: "A", y: 1},
          {x: "B", y: 2},
          {x: "C", y: 1},
        ];
        const data2 = [
          {x: "A", y: 2},
          {x: "B", y: 3},
        ];
        const data3 = [
          {x: "B", y: 1},
          {x: "C", y: 7},
        ];

        stackedBarPlot = new Plottable.Plots.StackedBar<string, number>();
        stackedBarPlot.addDataset(new Plottable.Dataset(data1));
        stackedBarPlot.addDataset(new Plottable.Dataset(data2));
        stackedBarPlot.addDataset(new Plottable.Dataset(data3));
        stackedBarPlot.x((d) => d.x, xScale);
        stackedBarPlot.y((d) => d.y, yScale);
        stackedBarPlot.renderTo(div);
      });

      afterEach(() => {
        stackedBarPlot.destroy();
        div.remove();
      });

      it("draws bars at specified x location and stacks in order of datasets", () => {
        const bars = stackedBarPlot.content().selectAll<Element, any>("rect");

        const datumCount = stackedBarPlot.datasets().reduce((prev, curr) => prev + curr.data().length, 0);
        assert.strictEqual(bars.size(), datumCount, "draws a bar for each datum");

        const domain = xScale.domain();
        domain.forEach((value) => {
          const domainBarPairs = d3.pairs(bars.filter((d) => d.x === value).nodes());
          domainBarPairs.forEach((aBarPair) => {
            assert.closeTo(TestMethods.numAttr(d3.select(aBarPair[0]), "x"), TestMethods.numAttr(d3.select(aBarPair[1]), "x"),
              window.Pixel_CloseTo_Requirement, "bars at same x position");
            assert.operator(TestMethods.numAttr(d3.select(aBarPair[0]), "y"), ">",
              TestMethods.numAttr(d3.select(aBarPair[1]), "y"), "previous dataset bar under second");
          });
        });
      });

      it("can be use reverse stacking order", () => {
        // change stacking order
        stackedBarPlot.stackingOrder("topdown");

        const bars = stackedBarPlot.content().selectAll<Element, any>("rect");

        const datumCount = stackedBarPlot.datasets().reduce((prev, curr) => prev + curr.data().length, 0);
        assert.strictEqual(bars.size(), datumCount, "draws a bar for each datum");

        const domain = xScale.domain();
        domain.forEach((value) => {
          const domainBarPairs = d3.pairs(bars.filter((d) => d.x === value).nodes());
          domainBarPairs.forEach((aBarPair) => {
            assert.closeTo(TestMethods.numAttr(d3.select(aBarPair[0]), "x"), TestMethods.numAttr(d3.select(aBarPair[1]), "x"),
              window.Pixel_CloseTo_Requirement, "bars at same x position");
            assert.operator(TestMethods.numAttr(d3.select(aBarPair[0]), "y"), "<",
              TestMethods.numAttr(d3.select(aBarPair[1]), "y"), "previous dataset bar above second");
          });
        });
      });
    });

    describe("fail safe tests", () => {

      it("should default to 0 when calculating stack offsets with non-numbers", () => {
        const div = TestMethods.generateDiv();
        const stringData = [
          { x: "A", y: "s"},
        ];
        const nullData: {x: string, y: number}[] = [
          { x: "A", y: null},
        ];
        const undefinedData: {x: string, y: number}[] = [
          { x: "A", y: undefined},
        ];
        const naNData = [
          { x: "A", y: NaN},
        ];
        const validData = [
          { x: "A", y: 1},
        ];
        const xScale = new Plottable.Scales.Category();
        const yScale = new Plottable.Scales.Linear();

        const stackedBarPlot = new Plottable.Plots.StackedBar<string, number>();
        const ds1 = new Plottable.Dataset(stringData);
        const ds2 = new Plottable.Dataset(nullData);
        const ds3 = new Plottable.Dataset(undefinedData);
        const ds4 = new Plottable.Dataset(naNData);
        const ds5 = new Plottable.Dataset(validData);
        stackedBarPlot.addDataset(ds1);
        stackedBarPlot.addDataset(ds2);
        stackedBarPlot.addDataset(ds3);
        stackedBarPlot.addDataset(ds4);
        stackedBarPlot.addDataset(ds5);
        stackedBarPlot.x((d: any) => d.x, xScale).y((d: any) => d.y, yScale);
        stackedBarPlot.renderTo(div);

        const validBar = stackedBarPlot.content().selectAll<Element, any>("rect").filter((d) => d.y === 1);
        assert.closeTo(TestMethods.numAttr(validBar, "y"), yScale.scale(1),
          window.Pixel_CloseTo_Requirement, "bar stacks from 0");

        stackedBarPlot.destroy();
        div.remove();
      });
    });
  });

  describe("Horizontal Stacked Bar Plot", () => {
    describe("rendering using positive data", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Category;
      let stackedBarPlot: Plottable.Plots.StackedBar<number, string>;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Category();

        const data1 = [
          {x: 1, y: "A"},
          {x: 2, y: "B"},
        ];
        const data2 = [
          {x: 2, y: "A"},
          {x: 1, y: "B"},
        ];
        const dataset1 = new Plottable.Dataset(data1);
        const dataset2 = new Plottable.Dataset(data2);

        stackedBarPlot = new Plottable.Plots.StackedBar<number, string>(BarOrientation.horizontal);
        stackedBarPlot.addDataset(dataset1);
        stackedBarPlot.addDataset(dataset2);
        stackedBarPlot.x((d) => d.x, xScale);
        stackedBarPlot.y((d) => d.y, yScale);
        stackedBarPlot.renderTo(div);
      });

      afterEach(() => {
        stackedBarPlot.destroy();
        div.remove();
      });

      it("shows stacked bar labels", () => {
        xScale.domain([0, 30]);
        stackedBarPlot.labelsEnabled(true);
        const stackedBarLabels = stackedBarPlot.content().selectAll<Element, any>(".stacked-bar-label");
        assert.strictEqual(stackedBarLabels.size(), 2);
        const text: string[] = [];
        stackedBarLabels.each(function (d) {
          text.push(d3.select(this).text());
        });
        assert.deepEqual(["3", "3"], text);
      });

      it("doesn't show stacked bar labels when columns are too narrow", () => {
        stackedBarPlot.labelsEnabled(true);
        yScale.range([0, 40]);
        // HACKHACK send a scale update to update the barPixelThickness
        yScale.domain(yScale.domain());
        // HACKHACK explicitly re-render to cause the barPixelThickness
        stackedBarPlot.render();
        const stackedBarLabels = stackedBarPlot.content().selectAll<Element, any>(".stacked-bar-label");
        assert.strictEqual(stackedBarLabels.size(), 0);
      });

      it("renders rects offset by previous values", () => {
        const bars = stackedBarPlot.content().selectAll<Element, any>("rect");

        const dataLength = stackedBarPlot.datasets()[0].data().length;
        const dataCount = stackedBarPlot.datasets().length * dataLength;
        assert.strictEqual(bars.size(), dataCount, "same number of bars as data");

        const calculateStackedXs = (xAccessor: Plottable.IAccessor<number>) => {
          const stackedXDataArray: number[][] = [];
          stackedBarPlot.datasets().forEach((dataset, datasetIndex) => {
            const xData = dataset.data().map((d, i) => xAccessor(d, i, dataset));
            if (datasetIndex === 0) {
              stackedXDataArray[datasetIndex] = dataset.data().map(() => 0);
            }
            stackedXDataArray[datasetIndex + 1] = dataset.data().map((d, i) => {
              return xData[i] + stackedXDataArray[datasetIndex][i];
            });
          });
          return stackedXDataArray;
        };

        const stackedXs = calculateStackedXs((d) => d.x);
        bars.each(function(d, i) {
          const bar = d3.select(this);
          const datasetIndex = Math.floor(i / dataLength);
          const datumIndex = i % dataLength;
          assert.closeTo(TestMethods.numAttr(bar, "x"), xScale.scale(stackedXs[datasetIndex][datumIndex]),
            window.Pixel_CloseTo_Requirement, "x attribute offset correctly");
        });
      });

      // HACKHACK #2795: correct off-bar label logic to be implemented
      it("doesn't show any off-bar labels", () => {
        stackedBarPlot.labelsEnabled(true);
        xScale.domain([0, 90]);
        const offBarLabels = stackedBarPlot.content().selectAll<Element, any>(".off-bar-label");
        assert.operator(offBarLabels.size(), ">", 0, "some off-bar labels are drawn");
        offBarLabels.each(function(d, i) {
          assert.strictEqual(d3.select(this).style("visibility"), "hidden", `off-bar label ${i} is hidden`);
        });
      });
    });

    describe("non-overlapping datasets", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let yScale: Plottable.Scales.Category;
      let stackedBarPlot: Plottable.Plots.StackedBar<number, string>;

      beforeEach(() => {
        div = TestMethods.generateDiv();
        const xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Category();

        const data1 = [
          {y: "A", x: 1},
          {y: "B", x: 2},
          {y: "C", x: 1},
        ];
        const data2 = [
          {y: "A", x: 2},
          {y: "B", x: 3},
        ];
        const data3 = [
          {y: "B", x: 1},
          {y: "C", x: 7},
        ];

        stackedBarPlot = new Plottable.Plots.StackedBar<number, string>(BarOrientation.horizontal);
        stackedBarPlot.addDataset(new Plottable.Dataset(data1));
        stackedBarPlot.addDataset(new Plottable.Dataset(data2));
        stackedBarPlot.addDataset(new Plottable.Dataset(data3));
        stackedBarPlot.x((d) => d.x, xScale);
        stackedBarPlot.y((d) => d.y, yScale);
        stackedBarPlot.renderTo(div);
      });

      afterEach(() => {
        stackedBarPlot.destroy();
        div.remove();
      });

      it("draws bars at specified y location and stacks in order of datasets", () => {
        const bars = stackedBarPlot.content().selectAll<Element, any>("rect");

        const datumCount = stackedBarPlot.datasets().reduce((prev, curr) => prev + curr.data().length, 0);
        assert.strictEqual(bars.size(), datumCount, "draws a bar for each datum");

        const domain = yScale.domain();
        domain.forEach((value) => {
          const domainBarPairs = d3.pairs(bars.filter((d) => d.y === value).nodes());
          domainBarPairs.forEach((aBarPair) => {
            assert.closeTo(TestMethods.numAttr(d3.select(aBarPair[0]), "y"), TestMethods.numAttr(d3.select(aBarPair[1]), "y"),
              window.Pixel_CloseTo_Requirement, "bars at same x position");
            assert.operator(TestMethods.numAttr(d3.select(aBarPair[0]), "x"), "<",
              TestMethods.numAttr(d3.select(aBarPair[1]), "x"), "previous dataset bar under second");
          });
        });
      });
    });

    describe("fail safe tests", () => {
      it("should default to 0 when calculating stack offsets with non-numbers", () => {
        const div = TestMethods.generateDiv();
        const stringData = [
          { x: "s", y: "A"},
        ];
        const nullData: {x: number, y: string}[] = [
          { x: null, y: "A"},
        ];
        const undefinedData: {x: number, y: string}[] = [
          { x: undefined, y: "A"},
        ];
        const naNData = [
          { x: NaN, y: "A"},
        ];
        const validData = [
          { x: 1, y: "A"},
        ];
        const xScale = new Plottable.Scales.Linear();
        const yScale = new Plottable.Scales.Category();

        const stackedBarPlot = new Plottable.Plots.StackedBar<number, string>(BarOrientation.horizontal);
        const ds1 = new Plottable.Dataset(stringData);
        const ds2 = new Plottable.Dataset(nullData);
        const ds3 = new Plottable.Dataset(undefinedData);
        const ds4 = new Plottable.Dataset(naNData);
        const ds5 = new Plottable.Dataset(validData);
        stackedBarPlot.addDataset(ds1);
        stackedBarPlot.addDataset(ds2);
        stackedBarPlot.addDataset(ds3);
        stackedBarPlot.addDataset(ds4);
        stackedBarPlot.addDataset(ds5);
        stackedBarPlot.x((d: any) => d.x, xScale).y((d: any) => d.y, yScale);
        stackedBarPlot.renderTo(div);

        const validBar = stackedBarPlot.content().selectAll<Element, any>("rect").filter((d) => d.x === 1);
        assert.closeTo(TestMethods.numAttr(validBar, "x"), xScale.scale(0),
          window.Pixel_CloseTo_Requirement, "bar stacks from 0");

        stackedBarPlot.destroy();
        div.remove();
      });
    });
  });
});
