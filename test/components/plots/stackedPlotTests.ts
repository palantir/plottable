///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Plots", () => {

  describe("Stacked Plot Stacking", () => {
    var stackedPlot: Plottable.Stacked<number, number>;

    beforeEach(() => {
      var xScale = new Plottable.Scales.Linear();
      var yScale = new Plottable.Scales.Linear();
      stackedPlot = new Plottable.Stacked(xScale, yScale);
      stackedPlot.project("x", "x", xScale);
      stackedPlot.project("y", "y", yScale);

      (<any> stackedPlot)._getDrawer = (key: string) => new Plottable.Drawers.AbstractDrawer(key);
      (<any> stackedPlot)._isVertical = true;
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

      stackedPlot.addDataset(new Plottable.Dataset(data0));
      stackedPlot.addDataset(new Plottable.Dataset(data1));
      stackedPlot.addDataset(new Plottable.Dataset(data2));
      stackedPlot.addDataset(new Plottable.Dataset(data3));
      stackedPlot.addDataset(new Plottable.Dataset(data4));

      var keys = (<any> stackedPlot)._key2PlotDatasetKey.keys(); // HACKHACK: Dataset keys are being removed, so these are internal keys
      var ds1PlotMetadata = <Plottable.Plots.StackedPlotMetadata>(<any> stackedPlot)._key2PlotDatasetKey.get(keys[1]).plotMetadata;
      var ds4PlotMetadata = <Plottable.Plots.StackedPlotMetadata>(<any> stackedPlot)._key2PlotDatasetKey.get(keys[4]).plotMetadata;
      assert.strictEqual(ds1PlotMetadata.offsets.get("1"), 1, "positive offset was used");
      assert.strictEqual(ds4PlotMetadata.offsets.get("1"), 2, "positive offset was used");
    });

    it("uses negative offset on stacking the 0 value on all negative/0 valued data", () => {
      var data0 = [
        {x: 1, y: -2}
      ];
      var data1 = [
        {x: 1, y: 0}
      ];
      var data2 = [
        {x: 1, y: -1}
      ];
      var data3 = [
        {x: 1, y: 0}
      ];

      stackedPlot.addDataset(new Plottable.Dataset(data0));
      stackedPlot.addDataset(new Plottable.Dataset(data1));
      stackedPlot.addDataset(new Plottable.Dataset(data2));
      stackedPlot.addDataset(new Plottable.Dataset(data3));

      var keys = (<any> stackedPlot)._key2PlotDatasetKey.keys(); // HACKHACK: Dataset keys are being removed, so these are internal keys
      var ds1PlotMetadata = <Plottable.Plots.StackedPlotMetadata>(<any> stackedPlot)._key2PlotDatasetKey.get(keys[1]).plotMetadata;
      var ds3PlotMetadata = <Plottable.Plots.StackedPlotMetadata>(<any> stackedPlot)._key2PlotDatasetKey.get(keys[3]).plotMetadata;
      assert.strictEqual(ds1PlotMetadata.offsets.get("1"), -2, "positive offset was used");
      assert.strictEqual(ds3PlotMetadata.offsets.get("1"), -3, "positive offset was used");
    });

    it("project can be called after addDataset", () => {
      var data0 = [
        { a: 1, b: 2 }
      ];
      var data1 = [
        { a: 1, b: 4 }
      ];

      stackedPlot.addDataset(new Plottable.Dataset(data0));
      stackedPlot.addDataset(new Plottable.Dataset(data1));

      var keys = (<any> stackedPlot)._key2PlotDatasetKey.keys(); // HACKHACK: Dataset keys are being removed, so these are internal keys
      var ds0PlotMetadata = <Plottable.Plots.StackedPlotMetadata>(<any> stackedPlot)._key2PlotDatasetKey.get(keys[0]).plotMetadata;
      var ds1PlotMetadata = <Plottable.Plots.StackedPlotMetadata>(<any> stackedPlot)._key2PlotDatasetKey.get(keys[1]).plotMetadata;

      assert.isTrue(isNaN(ds0PlotMetadata.offsets.get("1")), "stacking is initially incorrect");

      stackedPlot.project("x", "a");
      stackedPlot.project("y", "b");

      assert.strictEqual(ds1PlotMetadata.offsets.get("1"), 2, "stacking was done correctly");
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

      stackedPlot.addDataset(new Plottable.Dataset(data0));
      stackedPlot.addDataset(new Plottable.Dataset(data1));
      stackedPlot.addDataset(new Plottable.Dataset(data2));
      stackedPlot.addDataset(new Plottable.Dataset(data3));
      stackedPlot.addDataset(new Plottable.Dataset(data4));
      stackedPlot.addDataset(new Plottable.Dataset(data5));

      var keys = (<any> stackedPlot)._key2PlotDatasetKey.keys(); // HACKHACK: Dataset keys are being removed, so these are internal keys
      var ds2PlotMetadata = <Plottable.Plots.StackedPlotMetadata>(<any> stackedPlot)._key2PlotDatasetKey.get(keys[2]).plotMetadata;
      var ds3PlotMetadata = <Plottable.Plots.StackedPlotMetadata>(<any> stackedPlot)._key2PlotDatasetKey.get(keys[3]).plotMetadata;
      var ds4PlotMetadata = <Plottable.Plots.StackedPlotMetadata>(<any> stackedPlot)._key2PlotDatasetKey.get(keys[4]).plotMetadata;
      var ds5PlotMetadata = <Plottable.Plots.StackedPlotMetadata>(<any> stackedPlot)._key2PlotDatasetKey.get(keys[5]).plotMetadata;

      assert.strictEqual(ds2PlotMetadata.offsets.get("1"), -2, "stacking on data1 numerical y value");
      assert.strictEqual(ds3PlotMetadata.offsets.get("1"), 3, "stacking on data2 numerical y value");
      assert.strictEqual(ds4PlotMetadata.offsets.get("1"), 8, "stacking on data1 + data3 numerical y values");
      assert.strictEqual(ds5PlotMetadata.offsets.get("1"), -3, "stacking on data2 + data4 numerical y values");

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

  describe("auto scale domain on numeric", () => {
    var svg: D3.Selection;
    var SVG_WIDTH = 600;
    var SVG_HEIGHT = 400;
    var yScale: Plottable.Scales.Linear;
    var xScale: Plottable.Scales.Linear;
    var dataset1: Plottable.Dataset;
    var dataset2: Plottable.Dataset;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      xScale = new Plottable.Scales.Linear().domain([1, 2]);
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
      var plot = new Plottable.Plots.StackedArea(xScale, yScale)
                               .addDataset(dataset1)
                               .addDataset(dataset2)
                               .project("x", "x", xScale)
                               .project("y", "y", yScale);
      (<any>plot).automaticallyAdjustYScaleOverVisiblePoints(true);
      plot.renderTo(svg);
      assert.deepEqual(yScale.domain(), [0, 4.5], "auto scales takes stacking into account");
      svg.remove();
    });

    it("auto scales correctly on stacked bar", () => {
      var plot = new Plottable.Plots.StackedBar(xScale, yScale)
                               .addDataset(dataset1)
                               .addDataset(dataset2)
                               .project("x", "x", xScale)
                               .project("y", "y", yScale);
      (<any>plot).automaticallyAdjustYScaleOverVisiblePoints(true);
      plot.renderTo(svg);
      assert.deepEqual(yScale.domain(), [0, 4.5], "auto scales takes stacking into account");
      svg.remove();
    });
  });

  describe("auto scale domain on Category", () => {
    var svg: D3.Selection;
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

    it("auto scales correctly on stacked area", () => {
      var plot = new Plottable.Plots.StackedArea(yScale, yScale)
                               .addDataset(dataset1)
                               .addDataset(dataset2)
                               .project("x", "x", xScale)
                               .project("y", "y", yScale);
      (<any>plot).automaticallyAdjustYScaleOverVisiblePoints(true);
      plot.renderTo(svg);
      assert.deepEqual(yScale.domain(), [0, 4.5], "auto scales takes stacking into account");
      svg.remove();
    });

    it("auto scales correctly on stacked bar", () => {
      var plot = new Plottable.Plots.StackedBar(xScale, yScale)
                               .addDataset(dataset1)
                               .addDataset(dataset2)
                               .project("x", "x", xScale)
                               .project("y", "y", yScale);
      (<any>plot).automaticallyAdjustYScaleOverVisiblePoints(true);
      plot.renderTo(svg);
      assert.deepEqual(yScale.domain(), [0, 4.5], "auto scales takes stacking into account");
      svg.remove();
    });
  });

  describe("scale extent updates", () => {
    var svg: D3.Selection;
    var xScale: Plottable.Scales.Category;
    var yScale: Plottable.Scales.Linear;
    var stackedBarPlot: Plottable.Plots.StackedBar<string, number>;

    beforeEach(() => {
      svg = TestMethods.generateSVG(600, 400);

      xScale = new Plottable.Scales.Category();
      yScale = new Plottable.Scales.Linear();

      stackedBarPlot = new Plottable.Plots.StackedBar(xScale, yScale);
      stackedBarPlot.project("x", "key", xScale);
      stackedBarPlot.project("y", "value", yScale);

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
      var data2_b = [
        { key: "a", value: 1 },
        { key: "b", value: -2 }
      ];

      var dataset1 = new Plottable.Dataset(data1);
      var dataset2 = new Plottable.Dataset(data2);
      stackedBarPlot.addDataset(dataset1);
      stackedBarPlot.addDataset(dataset2);

      assert.closeTo(yScale.domain()[0], -6, 1, "min stacked extent is as normal");
      assert.closeTo(yScale.domain()[1], 4, 1, "max stacked extent is as normal");

      dataset2.data(data2_b);

      assert.closeTo(yScale.domain()[0], -4, 1, "min stacked extent decreases in magnitude");
      assert.closeTo(yScale.domain()[1], 2, 1, "max stacked extent decreases in magnitude");
    });
  });

});
