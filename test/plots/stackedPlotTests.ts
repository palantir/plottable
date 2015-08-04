///<reference path="../testReference.ts" />

describe("Plots", () => {

  describe("StackedBar Plot Stacking", () => {
    var stackedPlot: Plottable.Plots.StackedBar<number, number>;

    beforeEach(() => {
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();
      stackedPlot = new Plottable.Plots.StackedBar<number, number>();
      stackedPlot.x((d) => d.x, xScale);
      stackedPlot.y((d) => d.y, yScale);
    });

    it("uses positive offset on stacking the 0 value", () => {
      var data0 = [
        {x: 1, y: 1},
        {x: 3, y: 1}
      ];
      var data1 = [
        {x: 1, y: 0},
        {x: 3, y: 1}
      ];
      var data2 = [
        {x: 1, y: -1},
        {x: 3, y: 1}
      ];
      var data3 = [
        {x: 1, y: 1},
        {x: 3, y: 1}
      ];
      var data4 = [
        {x: 1, y: 0},
        {x: 3, y: 1}
      ];

      var ds0 = new Plottable.Dataset(data0);
      var ds1 = new Plottable.Dataset(data1);
      var ds2 = new Plottable.Dataset(data2);
      var ds3 = new Plottable.Dataset(data3);
      var ds4 = new Plottable.Dataset(data4);
      stackedPlot.addDataset(ds0);
      stackedPlot.addDataset(ds1);
      stackedPlot.addDataset(ds2);
      stackedPlot.addDataset(ds3);
      stackedPlot.addDataset(ds4);

      var stackOffset1 = (<any> stackedPlot)._stackingResult.get(ds1);
      var stackOffset4 = (<any> stackedPlot)._stackingResult.get(ds4);
      assert.strictEqual(stackOffset1.get("1").offset, 1, "positive offset was used");
      assert.strictEqual(stackOffset4.get("1").offset, 2, "positive offset was used");
    });

    it("strings are coerced to numbers for stacking", () => {
      var data0 = [
        { x: 1, y: "-2" }
      ];
      var data1 = [
        { x: 1, y: "3" }
      ];
      var data2 = [
        { x: 1, y: "-1" }
      ];
      var data3 = [
        { x: 1, y: "5" }
      ];
      var data4 = [
        { x: 1, y: "1" }
      ];
      var data5 = [
        { x: 1, y: "-1" }
      ];

      var ds0 = new Plottable.Dataset(data0);
      var ds1 = new Plottable.Dataset(data1);
      var ds2 = new Plottable.Dataset(data2);
      var ds3 = new Plottable.Dataset(data3);
      var ds4 = new Plottable.Dataset(data4);
      var ds5 = new Plottable.Dataset(data5);
      stackedPlot.addDataset(ds0);
      stackedPlot.addDataset(ds1);
      stackedPlot.addDataset(ds2);
      stackedPlot.addDataset(ds3);
      stackedPlot.addDataset(ds4);
      stackedPlot.addDataset(ds5);

      var stackOffset2 = (<any> stackedPlot)._stackingResult.get(ds2);
      var stackOffset3 = (<any> stackedPlot)._stackingResult.get(ds3);
      var stackOffset4 = (<any> stackedPlot)._stackingResult.get(ds4);
      var stackOffset5 = (<any> stackedPlot)._stackingResult.get(ds5);

      assert.strictEqual(stackOffset2.get("1").offset, -2, "stacking on data1 numerical y value");
      assert.strictEqual(stackOffset3.get("1").offset, 3, "stacking on data2 numerical y value");
      assert.strictEqual(stackOffset4.get("1").offset, 8, "stacking on data1 + data3 numerical y values");
      assert.strictEqual(stackOffset5.get("1").offset, -3, "stacking on data2 + data4 numerical y values");

      assert.deepEqual((<any> stackedPlot)._stackedExtent, [-4, 9], "stacked extent is as normal");
    });

    it("stacks correctly on empty data", () => {
      var dataset1 = new Plottable.Dataset([]);
      var dataset2 = new Plottable.Dataset([]);

      assert.doesNotThrow(() => stackedPlot.addDataset(dataset1), Error);
      assert.doesNotThrow(() => stackedPlot.addDataset(dataset2), Error);
    });

    it("does not crash on stacking no datasets", () => {
      var dataset1 = new Plottable.Dataset([
        {x: 1, y: -2}
      ]);

      stackedPlot.addDataset(dataset1);
      assert.doesNotThrow(() => stackedPlot.removeDataset(dataset1), Error);
    });
  });

  describe("StackedArea Plot Stacking", () => {
    var stackedPlot: Plottable.Plots.StackedArea<number>;

    beforeEach(() => {
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();
      stackedPlot = new Plottable.Plots.StackedArea<number>();
      stackedPlot.x((d: any) => d.x, xScale);
      stackedPlot.y((d: any) => d.y, yScale);
    });

    it("uses positive offset on stacking the 0 value", () => {
      var data0 = [
        { x: 1, y: 1 },
        { x: 3, y: 1 }
      ];
      var data1 = [
        { x: 1, y: 0 },
        { x: 3, y: 1 }
      ];
      var data2 = [
        { x: 1, y: -1 },
        { x: 3, y: 1 }
      ];
      var data3 = [
        { x: 1, y: 1 },
        { x: 3, y: 1 }
      ];
      var data4 = [
        { x: 1, y: 0 },
        { x: 3, y: 1 }
      ];

      var ds0 = new Plottable.Dataset(data0);
      var ds1 = new Plottable.Dataset(data1);
      var ds2 = new Plottable.Dataset(data2);
      var ds3 = new Plottable.Dataset(data3);
      var ds4 = new Plottable.Dataset(data4);
      stackedPlot.addDataset(ds0);
      stackedPlot.addDataset(ds1);
      stackedPlot.addDataset(ds2);
      stackedPlot.addDataset(ds3);
      stackedPlot.addDataset(ds4);

      var stackOffset1 = (<any> stackedPlot)._stackingResult.get(ds1);
      var stackOffset4 = (<any> stackedPlot)._stackingResult.get(ds4);
      assert.strictEqual(stackOffset1.get("1").offset, 1, "positive offset was used");
      assert.strictEqual(stackOffset4.get("1").offset, 2, "positive offset was used");
    });

    it("strings are coerced to numbers for stacking", () => {
      var data0 = [
        { x: 1, y: "-2" }
      ];
      var data1 = [
        { x: 1, y: "3" }
      ];
      var data2 = [
        { x: 1, y: "-1" }
      ];
      var data3 = [
        { x: 1, y: "5" }
      ];
      var data4 = [
        { x: 1, y: "1" }
      ];
      var data5 = [
        { x: 1, y: "-1" }
      ];

      var ds0 = new Plottable.Dataset(data0);
      var ds1 = new Plottable.Dataset(data1);
      var ds2 = new Plottable.Dataset(data2);
      var ds3 = new Plottable.Dataset(data3);
      var ds4 = new Plottable.Dataset(data4);
      var ds5 = new Plottable.Dataset(data5);
      stackedPlot.addDataset(ds0);
      stackedPlot.addDataset(ds1);
      stackedPlot.addDataset(ds2);
      stackedPlot.addDataset(ds3);
      stackedPlot.addDataset(ds4);
      stackedPlot.addDataset(ds5);

      var stackOffset2 = (<any> stackedPlot)._stackingResult.get(ds2);
      var stackOffset3 = (<any> stackedPlot)._stackingResult.get(ds3);
      var stackOffset4 = (<any> stackedPlot)._stackingResult.get(ds4);
      var stackOffset5 = (<any> stackedPlot)._stackingResult.get(ds5);

      assert.strictEqual(stackOffset2.get("1").offset, -2, "stacking on data1 numerical y value");
      assert.strictEqual(stackOffset3.get("1").offset, 3, "stacking on data2 numerical y value");
      assert.strictEqual(stackOffset4.get("1").offset, 8, "stacking on data1 + data3 numerical y values");
      assert.strictEqual(stackOffset5.get("1").offset, -3, "stacking on data2 + data4 numerical y values");

      assert.deepEqual((<any> stackedPlot)._stackedExtent, [-4, 9], "stacked extent is as normal");
    });

    it("stacks correctly on empty data", () => {
      var dataset1 = new Plottable.Dataset([]);
      var dataset2 = new Plottable.Dataset([]);

      assert.doesNotThrow(() => stackedPlot.addDataset(dataset1), Error);
      assert.doesNotThrow(() => stackedPlot.addDataset(dataset2), Error);
    });

    it("does not crash on stacking no datasets", () => {
      var dataset1 = new Plottable.Dataset([
        { x: 1, y: -2 }
      ]);

      stackedPlot.addDataset(dataset1);
      assert.doesNotThrow(() => stackedPlot.removeDataset(dataset1), Error);
    });
  });

  describe("auto scale domain on numeric", () => {
    var svg: d3.Selection<void>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;
    var yScale: Plottable.Scales.Linear;
    var xScale: Plottable.Scales.Linear;
    var dataset1: Plottable.Dataset;
    var dataset2: Plottable.Dataset;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scales.Linear();
      xScale.domain([1, 2]);
      yScale = new Plottable.Scales.Linear();

      dataset1 = new Plottable.Dataset([
        {x: 1, y: 1},
        {x: 2, y: 2},
        {x: 3, y: 8}
      ]);

      dataset2 = new Plottable.Dataset([
        {x: 1, y: 2},
        {x: 2, y: 2},
        {x: 3, y: 3}
      ]);
    });

    it("auto scales correctly on stacked area", () => {
      var plot = new Plottable.Plots.StackedArea();
      plot.addDataset(dataset1)
          .addDataset(dataset2);
      plot.x((d: any) => d.x, xScale)
          .y((d: any) => d.y, yScale)
          .autorangeMode("y");
      plot.renderTo(svg);
      assert.deepEqual(yScale.domain(), [0, 4.5], "auto scales takes stacking into account");
      svg.remove();
    });

    it("auto scales correctly on stacked bar", () => {
      var plot = new Plottable.Plots.StackedBar();
      plot.addDataset(dataset1)
          .addDataset(dataset2);
      plot.x((d: any) => d.x, xScale)
          .y((d: any) => d.y, yScale)
          .autorangeMode("y");
      plot.renderTo(svg);
      assert.deepEqual(yScale.domain(), [0, 4.5], "auto scales takes stacking into account");
      svg.remove();
    });
  });

  describe("auto scale domain on Category", () => {
    var svg: d3.Selection<void>;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;
    var yScale: Plottable.Scales.Linear;
    var xScale: Plottable.Scales.Category;
    var dataset1: Plottable.Dataset;
    var dataset2: Plottable.Dataset;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scales.Category().domain(["a", "b"]);
      yScale = new Plottable.Scales.Linear();

      dataset1 = new Plottable.Dataset([
        {x: "a", y: 1},
        {x: "b", y: 2},
        {x: "c", y: 8}
      ]);

      dataset2 = new Plottable.Dataset([
        {x: "a", y: 2},
        {x: "b", y: 2},
        {x: "c", y: 3}
      ]);
    });

    it("auto scales correctly on stacked bar", () => {
      var plot = new Plottable.Plots.StackedBar();
      plot.addDataset(dataset1)
          .addDataset(dataset2);
      plot.x((d: any) => d.x, xScale)
          .y((d: any) => d.y, yScale)
          .autorangeMode("y");
      plot.renderTo(svg);
      assert.deepEqual(yScale.domain(), [0, 4.5], "auto scales takes stacking into account");
      svg.remove();
    });

    it("auto scales correctly on stacked area", () => {
      var plot = new Plottable.Plots.StackedArea();
      plot.addDataset(dataset1)
          .addDataset(dataset2);
      plot.x((d: any) => d.x, xScale)
          .y((d: any) => d.y, yScale)
          .autorangeMode("y");
      plot.renderTo(svg);
      assert.deepEqual(yScale.domain(), [0, 4.5], "auto scales takes stacking into account");
      svg.remove();
    });
  });

  describe("scale extent updates", () => {
    var svg: d3.Selection<void>;
    var xScale: Plottable.Scales.Category;
    var yScale: Plottable.Scales.Linear;
    var stackedBarPlot: Plottable.Plots.StackedBar<string, number>;

    beforeEach(() => {
      svg = TestMethods.generateSVG(600, 400);

      xScale = new Plottable.Scales.Category();
      yScale = new Plottable.Scales.Linear();

      stackedBarPlot = new Plottable.Plots.StackedBar<string, number>();
      stackedBarPlot.x((d) => d.key, xScale);
      stackedBarPlot.y((d) => d.value, yScale);

      stackedBarPlot.renderTo(svg);
    });

    afterEach(() => {
      svg.remove();
    });

    it("extents are updated as datasets are updated", () => {
      var data1 = [
        { key: "a", value: 1 },
        { key: "b", value: -2 }
      ];
      var data2 = [
        { key: "a", value: 3 },
        { key: "b", value: -4 }
      ];
      var data2B = [
        { key: "a", value: 1 },
        { key: "b", value: -2 }
      ];

      var dataset1 = new Plottable.Dataset(data1);
      var dataset2 = new Plottable.Dataset(data2);
      stackedBarPlot.addDataset(dataset1);
      stackedBarPlot.addDataset(dataset2);

      assert.closeTo(yScale.domain()[0], -6, 1, "min stacked extent is as normal");
      assert.closeTo(yScale.domain()[1], 4, 1, "max stacked extent is as normal");

      dataset2.data(data2B);

      assert.closeTo(yScale.domain()[0], -4, 1, "min stacked extent decreases in magnitude");
      assert.closeTo(yScale.domain()[1], 2, 1, "max stacked extent decreases in magnitude");
    });
  });

});
