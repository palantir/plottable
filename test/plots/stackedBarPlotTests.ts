///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("Vertical Stacked Bar Plot", () => {
    describe("rendering using positive data", () => {
      let svg: d3.Selection<void>;
      let xScale: Plottable.Scales.Category;
      let yScale: Plottable.Scales.Linear;
      let stackedBarPlot: Plottable.Plots.StackedBar<string, number>;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        xScale = new Plottable.Scales.Category();
        yScale = new Plottable.Scales.Linear();

        let data1 = [
          {x: "A", y: 1},
          {x: "B", y: 2},
        ];
        let data2 = [
          {x: "A", y: 2},
          {x: "B", y: 1},
        ];
        let dataset1 = new Plottable.Dataset(data1);
        let dataset2 = new Plottable.Dataset(data2);

        stackedBarPlot = new Plottable.Plots.StackedBar<string, number>();
        stackedBarPlot.addDataset(dataset1);
        stackedBarPlot.addDataset(dataset2);
        stackedBarPlot.x((d) => d.x, xScale);
        stackedBarPlot.y((d) => d.y, yScale);
        stackedBarPlot.renderTo(svg);
      });

      it("renders rects offset by previous values", () => {
        let bars = stackedBarPlot.content().selectAll("rect");

        let dataLength = stackedBarPlot.datasets()[0].data().length;
        let dataCount = stackedBarPlot.datasets().length * dataLength;
        assert.strictEqual(bars.size(), dataCount, "same number of bars as data");

        let calculateStackedYs = (yAccessor: Plottable.Accessor<number>) => {
          let stackedYDataArray: number[][] = [];
          stackedBarPlot.datasets().forEach((dataset, datasetIndex) => {
            let yData = dataset.data().map((d, i) => yAccessor(d, i, dataset));
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

        let stackedYs = calculateStackedYs((d) => d.y);
        bars.each(function(d, i) {
          let bar = d3.select(this);
          let datasetIndex = Math.floor(i / dataLength);
          let datumIndex = i % dataLength;
          assert.closeTo(TestMethods.numAttr(bar, "y"), yScale.scale(stackedYs[datasetIndex][datumIndex]),
            window.Pixel_CloseTo_Requirement, "y attribute offset set correctly");
        });

        stackedBarPlot.destroy();
        svg.remove();
      });

      // HACKHACK #2795: correct off-bar label logic to be implemented
      it("doesn't show any off-bar labels", () => {
        stackedBarPlot.labelsEnabled(true);
        yScale.domain([0, 30]);
        let offBarLabels = stackedBarPlot.content().selectAll(".off-bar-label");
        assert.operator(offBarLabels.size(), ">", 0, "some off-bar labels are drawn");
        offBarLabels.each(function(d, i) {
          assert.isTrue(d3.select(this).style("visibility") === "hidden", `off-bar label ${i} is hidden`);
        });

        stackedBarPlot.destroy();
        svg.remove();
      });

      it("considers lying within a bar's y-range to mean it is closest", () => {
        let d0 = stackedBarPlot.datasets()[0].data()[0];
        let d1 = stackedBarPlot.datasets()[1].data()[0];

        let closestEntity = stackedBarPlot.entityNearest({ x: 0, y: yScale.scale(d0.y) + 1 });
        assert.strictEqual(closestEntity.datum, d0, "bottom bar is closest when within its range");

        closestEntity = stackedBarPlot.entityNearest({ x: 0, y: yScale.scale(d0.y) - 1 });
        assert.strictEqual(closestEntity.datum, d1, "top bar is closest when within its range");

        svg.remove();
      });
    });

    describe("rendering using negative data", () => {
      let svg: d3.Selection<void>;
      let xScale: Plottable.Scales.Category;
      let yScale: Plottable.Scales.Linear;
      let stackedBarPlot: Plottable.Plots.StackedBar<string, number>;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        xScale = new Plottable.Scales.Category();
        yScale = new Plottable.Scales.Linear();

        let data1 = [
          {x: "A", y: -1},
          {x: "B", y: -2},
        ];
        let data2 = [
          {x: "A", y: -2},
          {x: "B", y: -1},
        ];
        let dataset1 = new Plottable.Dataset(data1);
        let dataset2 = new Plottable.Dataset(data2);

        stackedBarPlot = new Plottable.Plots.StackedBar<string, number>();
        stackedBarPlot.addDataset(dataset1);
        stackedBarPlot.addDataset(dataset2);
        stackedBarPlot.x((d) => d.x, xScale);
        stackedBarPlot.y((d) => d.y, yScale);
        stackedBarPlot.renderTo(svg);
      });

      it("renders rects offset by previous values", () => {
        let bars = stackedBarPlot.content().selectAll("rect");

        let dataLength = stackedBarPlot.datasets()[0].data().length;
        let dataCount = stackedBarPlot.datasets().length * dataLength;
        assert.strictEqual(bars.size(), dataCount, "same number of bars as data");

        let calculateStackedYs = (yAccessor: Plottable.Accessor<number>) => {
          let stackedYDataArray: number[][] = [];
          stackedBarPlot.datasets().forEach((dataset, datasetIndex) => {
            let yData = dataset.data().map((d, i) => yAccessor(d, i, dataset));
            if (datasetIndex === 0) {
              stackedYDataArray[datasetIndex] = dataset.data().map(() => 0);
            }
            stackedYDataArray[datasetIndex + 1] = dataset.data().map((d, i) => {
              return yData[i] + stackedYDataArray[datasetIndex][i];
            });
          });
          return stackedYDataArray;
        };

        let stackedYs = calculateStackedYs((d) => d.y);
        bars.each(function(d, i) {
          let bar = d3.select(this);
          let datasetIndex = Math.floor(i / dataLength);
          let datumIndex = i % dataLength;
          assert.closeTo(TestMethods.numAttr(bar, "y"), yScale.scale(stackedYs[datasetIndex][datumIndex]),
            window.Pixel_CloseTo_Requirement, "y attribute offset set correctly");
        });

        stackedBarPlot.destroy();
        svg.remove();
      });
    });

    describe("non-overlapping datasets", () => {
      let svg: d3.Selection<void>;
      let xScale: Plottable.Scales.Category;
      let stackedBarPlot: Plottable.Plots.StackedBar<string, number>;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        xScale = new Plottable.Scales.Category();
        let yScale = new Plottable.Scales.Linear();

        let data1 = [
          {x: "A", y: 1},
          {x: "B", y: 2},
          {x: "C", y: 1},
        ];
        let data2 = [
          {x: "A", y: 2},
          {x: "B", y: 3},
        ];
        let data3 = [
          {x: "B", y: 1},
          {x: "C", y: 7},
        ];

        stackedBarPlot = new Plottable.Plots.StackedBar<string, number>();
        stackedBarPlot.addDataset(new Plottable.Dataset(data1));
        stackedBarPlot.addDataset(new Plottable.Dataset(data2));
        stackedBarPlot.addDataset(new Plottable.Dataset(data3));
        stackedBarPlot.x((d) => d.x, xScale);
        stackedBarPlot.y((d) => d.y, yScale);
        stackedBarPlot.renderTo(svg);
      });

      it("draws bars at specified x location and stacks in order of datasets", () => {
        let bars = stackedBarPlot.content().selectAll("rect");

        let datumCount = stackedBarPlot.datasets().reduce((prev, curr) => prev + curr.data().length, 0);
        assert.strictEqual(bars.size(), datumCount, "draws a bar for each datum");

        let domain = xScale.domain();
        domain.forEach((value) => {
          let domainBarPairs = d3.pairs(bars.filter((d) => d.x === value)[0]);
          domainBarPairs.forEach((aBarPair) => {
            assert.closeTo(TestMethods.numAttr(d3.select(aBarPair[0]), "x"), TestMethods.numAttr(d3.select(aBarPair[1]), "x"),
              window.Pixel_CloseTo_Requirement, "bars at same x position");
            assert.operator(TestMethods.numAttr(d3.select(aBarPair[0]), "y"), ">",
              TestMethods.numAttr(d3.select(aBarPair[1]), "y"), "previous dataset bar under second");
          });
        });
        stackedBarPlot.destroy();
        svg.remove();
      });
    });

    describe("fail safe tests", () => {

      it("should default to 0 when calculating stack offsets with non-numbers", () => {
        let svg = TestMethods.generateSVG();
        let stringData = [
          { x: "A", y: "s"},
        ];
        let nullData: {x: string, y: number}[] = [
          { x: "A", y: null},
        ];
        let undefinedData: {x: string, y: number}[] = [
          { x: "A", y: undefined},
        ];
        let naNData = [
          { x: "A", y: NaN},
        ];
        let validData = [
          { x: "A", y: 1},
        ];
        let xScale = new Plottable.Scales.Category();
        let yScale = new Plottable.Scales.Linear();

        let stackedBarPlot = new Plottable.Plots.StackedBar<string, number>();
        let ds1 = new Plottable.Dataset(stringData);
        let ds2 = new Plottable.Dataset(nullData);
        let ds3 = new Plottable.Dataset(undefinedData);
        let ds4 = new Plottable.Dataset(naNData);
        let ds5 = new Plottable.Dataset(validData);
        stackedBarPlot.addDataset(ds1);
        stackedBarPlot.addDataset(ds2);
        stackedBarPlot.addDataset(ds3);
        stackedBarPlot.addDataset(ds4);
        stackedBarPlot.addDataset(ds5);
        stackedBarPlot.x((d: any) => d.x, xScale).y((d: any) => d.y, yScale);
        stackedBarPlot.renderTo(svg);

        let validBar = stackedBarPlot.content().selectAll("rect").filter((d) => d.y === 1);
        assert.closeTo(TestMethods.numAttr(validBar, "y"), yScale.scale(1),
          window.Pixel_CloseTo_Requirement, "bar stacks from 0");

        stackedBarPlot.destroy();
        svg.remove();
      });
    });
  });

  describe("Horizontal Stacked Bar Plot", () => {
    describe("rendering using positive data", () => {
      let svg: d3.Selection<void>;
      let xScale: Plottable.Scales.Linear;
      let yScale: Plottable.Scales.Category;
      let stackedBarPlot: Plottable.Plots.StackedBar<number, string>;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Category();

        let data1 = [
          {x: 1, y: "A"},
          {x: 2, y: "B"},
        ];
        let data2 = [
          {x: 2, y: "A"},
          {x: 1, y: "B"},
        ];
        let dataset1 = new Plottable.Dataset(data1);
        let dataset2 = new Plottable.Dataset(data2);

        stackedBarPlot = new Plottable.Plots.StackedBar<number, string>(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL);
        stackedBarPlot.addDataset(dataset1);
        stackedBarPlot.addDataset(dataset2);
        stackedBarPlot.x((d) => d.x, xScale);
        stackedBarPlot.y((d) => d.y, yScale);
        stackedBarPlot.renderTo(svg);
      });

      it("renders rects offset by previous values", () => {
        let bars = stackedBarPlot.content().selectAll("rect");

        let dataLength = stackedBarPlot.datasets()[0].data().length;
        let dataCount = stackedBarPlot.datasets().length * dataLength;
        assert.strictEqual(bars.size(), dataCount, "same number of bars as data");

        let calculateStackedXs = (xAccessor: Plottable.Accessor<number>) => {
          let stackedXDataArray: number[][] = [];
          stackedBarPlot.datasets().forEach((dataset, datasetIndex) => {
            let xData = dataset.data().map((d, i) => xAccessor(d, i, dataset));
            if (datasetIndex === 0) {
              stackedXDataArray[datasetIndex] = dataset.data().map(() => 0);
            }
            stackedXDataArray[datasetIndex + 1] = dataset.data().map((d, i) => {
              return xData[i] + stackedXDataArray[datasetIndex][i];
            });
          });
          return stackedXDataArray;
        };

        let stackedXs = calculateStackedXs((d) => d.x);
        bars.each(function(d, i) {
          let bar = d3.select(this);
          let datasetIndex = Math.floor(i / dataLength);
          let datumIndex = i % dataLength;
          assert.closeTo(TestMethods.numAttr(bar, "x"), xScale.scale(stackedXs[datasetIndex][datumIndex]),
            window.Pixel_CloseTo_Requirement, "x attribute offset correctly");
        });

        stackedBarPlot.destroy();
        svg.remove();
      });

      // HACKHACK #2795: correct off-bar label logic to be implemented
      it("doesn't show any off-bar labels", () => {
        stackedBarPlot.labelsEnabled(true);
        xScale.domain([0, 50]);
        let offBarLabels = stackedBarPlot.content().selectAll(".off-bar-label");
        assert.operator(offBarLabels.size(), ">", 0, "some off-bar labels are drawn");
        offBarLabels.each(function(d, i) {
          assert.strictEqual(d3.select(this).style("visibility"), "hidden", `off-bar label ${i} is hidden`);
        });
        svg.remove();
      });
    });

    describe("non-overlapping datasets", () => {
      let svg: d3.Selection<void>;
      let yScale: Plottable.Scales.Category;
      let stackedBarPlot: Plottable.Plots.StackedBar<number, string>;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        let xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Category();

        let data1 = [
          {y: "A", x: 1},
          {y: "B", x: 2},
          {y: "C", x: 1},
        ];
        let data2 = [
          {y: "A", x: 2},
          {y: "B", x: 3},
        ];
        let data3 = [
          {y: "B", x: 1},
          {y: "C", x: 7},
        ];

        stackedBarPlot = new Plottable.Plots.StackedBar<number, string>(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL);
        stackedBarPlot.addDataset(new Plottable.Dataset(data1));
        stackedBarPlot.addDataset(new Plottable.Dataset(data2));
        stackedBarPlot.addDataset(new Plottable.Dataset(data3));
        stackedBarPlot.x((d) => d.x, xScale);
        stackedBarPlot.y((d) => d.y, yScale);
        stackedBarPlot.renderTo(svg);
      });

      it("draws bars at specified y location and stacks in order of datasets", () => {
        let bars = stackedBarPlot.content().selectAll("rect");

        let datumCount = stackedBarPlot.datasets().reduce((prev, curr) => prev + curr.data().length, 0);
        assert.strictEqual(bars.size(), datumCount, "draws a bar for each datum");

        let domain = yScale.domain();
        domain.forEach((value) => {
          let domainBarPairs = d3.pairs(bars.filter((d) => d.y === value)[0]);
          domainBarPairs.forEach((aBarPair) => {
            assert.closeTo(TestMethods.numAttr(d3.select(aBarPair[0]), "y"), TestMethods.numAttr(d3.select(aBarPair[1]), "y"),
              window.Pixel_CloseTo_Requirement, "bars at same x position");
            assert.operator(TestMethods.numAttr(d3.select(aBarPair[0]), "x"), "<",
              TestMethods.numAttr(d3.select(aBarPair[1]), "x"), "previous dataset bar under second");
          });
        });
        stackedBarPlot.destroy();
        svg.remove();
      });
    });

    describe("fail safe tests", () => {

      it("should default to 0 when calculating stack offsets with non-numbers", () => {
        let svg = TestMethods.generateSVG();
        let stringData = [
          { x: "s", y: "A"},
        ];
        let nullData: {x: number, y: string}[] = [
          { x: null, y: "A"},
        ];
        let undefinedData: {x: number, y: string}[] = [
          { x: undefined, y: "A"},
        ];
        let naNData = [
          { x: NaN, y: "A"},
        ];
        let validData = [
          { x: 1, y: "A"},
        ];
        let xScale = new Plottable.Scales.Linear();
        let yScale = new Plottable.Scales.Category();

        let stackedBarPlot = new Plottable.Plots.StackedBar<number, string>(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL);
        let ds1 = new Plottable.Dataset(stringData);
        let ds2 = new Plottable.Dataset(nullData);
        let ds3 = new Plottable.Dataset(undefinedData);
        let ds4 = new Plottable.Dataset(naNData);
        let ds5 = new Plottable.Dataset(validData);
        stackedBarPlot.addDataset(ds1);
        stackedBarPlot.addDataset(ds2);
        stackedBarPlot.addDataset(ds3);
        stackedBarPlot.addDataset(ds4);
        stackedBarPlot.addDataset(ds5);
        stackedBarPlot.x((d: any) => d.x, xScale).y((d: any) => d.y, yScale);
        stackedBarPlot.renderTo(svg);

        let validBar = stackedBarPlot.content().selectAll("rect").filter((d) => d.x === 1);
        assert.closeTo(TestMethods.numAttr(validBar, "x"), xScale.scale(0),
          window.Pixel_CloseTo_Requirement, "bar stacks from 0");

        stackedBarPlot.destroy();
        svg.remove();
      });
    });
  });
});
